'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupabaseClient } from '@supabase/supabase-js'

export type CreateVideoState = {
    message?: string
    errors?: {
        video_id?: string[]
        video_title?: string[]
        published_at?: string[]
    }
    success?: boolean
}

export type VideoCreationResult = {
    success: boolean
    video?: any
    message?: string
    errorType?: 'duplicate' | 'validation' | 'database'
}

type CoreParams = {
    channelId: string
    videoId: string
    videoTitle: string
    publishedAt: string | null
    userId: string
    supabase: SupabaseClient
}

/**
 * Reusable core logic for creating a video, SEO v0, and default task.
 * Used by both the form action and bulk importer.
 */
export async function createVideoCore({
    channelId,
    videoId,
    videoTitle,
    publishedAt,
    userId,
    supabase,
    // Optional new fields
    titleV1,
    titleV2,
    titleV3,
    description,
    tags
}: CoreParams & {
    titleV1?: string,
    titleV2?: string,
    titleV3?: string,
    description?: string,
    tags?: string[]
}): Promise<VideoCreationResult> {
    // 1. Check duplicate
    const { data: existingVideo } = await supabase
        .from('video_seo')
        .select('id')
        .eq('video_id', videoId)
        .single()

    if (existingVideo) {
        return {
            success: false,
            message: 'Duplicate Video ID',
            errorType: 'duplicate'
        }
    }

    // 2. Insert Video into video_seo
    const { data: video, error: videoError } = await supabase
        .from('video_seo')
        .insert({
            video_id: videoId,
            old_title: videoTitle, // Mapping 'videoTitle' input to 'old_title'
            channel_id: channelId,
            published_at: publishedAt,
            // New fields
            title_v1: titleV1 || null,
            title_v2: titleV2 || null,
            title_v3: titleV3 || null,
            description: description || '',
            tags: tags || [],
            is_seo_done: false, // Default
            created_by: userId
        })
        .select()
        .single()

    if (videoError) {
        console.error('Error inserting video:', videoError)
        return {
            success: false,
            message: `Database Error: ${videoError.message}`,
            errorType: 'database'
        }
    }

    // 3. Create Default Task
    const { error: taskError } = await supabase
        .from('tasks')
        .insert({
            video_id: video.id,
            status: 'Pending',
            assigned_to: null
        })

    if (taskError) {
        console.error('Error creating default task:', taskError)
        // Non-critical
    }

    return { success: true, video }
}

export async function createVideoWithDefaults(
    channelId: string,
    prevState: CreateVideoState,
    formData: FormData
): Promise<CreateVideoState> {
    const supabase = await createClient()

    // 1. Validate User Role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { message: 'Unauthorized: Please sign in' }
    }

    const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (!userRole || userRole.role === 'viewer') {
        return { message: 'Forbidden: You do not have permission to add videos' }
    }

    // 2. Parse and Validate Input
    const videoId = formData.get('video_id') as string
    const videoTitle = formData.get('old_title') as string // Changed to match UI/DB intent
    const publishedAtStr = formData.get('published_at') as string

    // Parse new fields
    const titleV1 = formData.get('title_v1') as string
    const titleV2 = formData.get('title_v2') as string
    const titleV3 = formData.get('title_v3') as string
    const description = formData.get('description') as string
    const tagsStr = formData.get('tags') as string

    // Parse tags (comma separated)
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : []

    const errors: CreateVideoState['errors'] = {}

    if (!videoId) errors.video_id = ['Video ID is required']
    if (!videoTitle) errors.video_title = ['Original Title is required']

    if (Object.keys(errors).length > 0) {
        return { errors, message: 'Please correct the errors below' }
    }

    // Default published_at to now if not provided (though we removed the input, so it will be null)
    const publishedAt = publishedAtStr ? new Date(publishedAtStr).toISOString() : new Date().toISOString()

    try {
        // AnySupabaseClient cast needed because createClient returns a SupabaseClient<Database> 
        // but we want to pass it broadly. In this context simple cast or passing is fine.
        const result = await createVideoCore({
            channelId,
            videoId,
            videoTitle, // This maps to old_title in core
            publishedAt,
            userId: user.id,
            supabase: supabase as any,
            titleV1,
            titleV2,
            titleV3,
            description,
            tags
        })

        if (!result.success) {
            if (result.errorType === 'duplicate') {
                return {
                    errors: { video_id: [result.message || 'Duplicate'] },
                    message: result.message
                }
            }
            return { message: result.message }
        }

        revalidatePath(`/dashboard/channels/${channelId}`)
        return { success: true, message: 'Video added successfully' }

    } catch (error) {
        console.error('Unexpected error:', error)
        return { message: 'An unexpected error occurred' }
    }
}

/**
 * DEV ONLY: Seeds a sample video for testing purposes.
 * Only works in development mode.
 */
export async function seedSampleVideo(channelId: string) {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('Dev only')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const videoId = `SAMPLE-${Math.floor(Math.random() * 10000)}`

    // Reuse core logic
    const result = await createVideoCore({
        channelId,
        videoId,
        videoTitle: `Sample Video ${videoId}`,
        publishedAt: new Date().toISOString(),
        userId: user.id,
        supabase: supabase as any
    })

    if (!result.success) {
        throw new Error(result.message)
    }

    revalidatePath(`/dashboard/channels/${channelId}`)
    return { success: true, videoId }
}

/**
 * Delete a video
 * Admin/Editor only
 */
export async function deleteVideo(videoId: string, channelId: string) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Check role
    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    const isDev = process.env.NODE_ENV === 'development'
    const role = roleData?.role || 'viewer'
    const hasPermission = role === 'admin' || role === 'editor'

    if (!isDev && !hasPermission) {
        throw new Error('Forbidden: Only admins and editors can delete videos')
    }

    // Use admin client for DB operations to bypass RLS
    let dbClient = supabase
    try {
        dbClient = await createAdminClient()
    } catch (e) {
        console.warn('Admin client unavailable, falling back to user client', e)
    }

    // Delete from video_seo table (no cascading needed with new schema)
    const { error } = await dbClient.from('video_seo').delete().eq('id', videoId)

    if (error) {
        throw new Error(`Failed to delete video: ${error.message}`)
    }

    revalidatePath(`/dashboard/channels/${channelId}`)
    return { success: true }
}

export type UpdateVideoData = {
    title?: string
    description?: string
    is_seo_done?: boolean
}

/**
 * Update video details
 * Admin/Editor only
 */
export async function updateVideo(videoId: string, data: UpdateVideoData, channelId?: string) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    // Check role
    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    const isDev = process.env.NODE_ENV === 'development'
    const role = roleData?.role || 'viewer'
    const hasPermission = role === 'admin' || role === 'editor'

    if (!isDev && !hasPermission) {
        return { success: false, message: 'Forbidden: Only admins and editors can update videos' }
    }

    // Use admin client for DB operations to bypass RLS (Row Level Security)
    // This ensures edits work even if specific user policies normally restrict updates
    let dbClient = supabase
    try {
        dbClient = await createAdminClient()
    } catch (e) {
        console.warn('Admin client unavailable, falling back to user client', e)
    }

    // Mapping frontend fields to DB columns
    // VideoSeo type uses 'old_title' for the title. 
    const updatePayload: any = {}
    if (data.title !== undefined) updatePayload.old_title = data.title
    if (data.description !== undefined) updatePayload.description = data.description
    if (data.is_seo_done !== undefined) updatePayload.is_seo_done = data.is_seo_done

    updatePayload.updated_at = new Date().toISOString()

    const { error } = await dbClient
        .from('video_seo')
        .update(updatePayload)
        .eq('id', videoId)

    if (error) {
        console.error('Update Error:', error)
        return { success: false, message: `Failed to update: ${error.message}` }
    }

    if (channelId) {
        revalidatePath(`/dashboard/channels/${channelId}`)
    }
    revalidatePath('/dashboard/videos')

    return { success: true }
}
