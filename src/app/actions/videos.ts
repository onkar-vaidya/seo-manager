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
    supabase
}: CoreParams): Promise<VideoCreationResult> {
    // 1. Check duplicate
    const { data: existingVideo } = await supabase
        .from('videos')
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

    // 2. Insert Video
    const { data: video, error: videoError } = await supabase
        .from('videos')
        .insert({
            video_id: videoId,
            video_title: videoTitle,
            channel_id: channelId,
            published_at: publishedAt,
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

    // 3. Create Initial SEO Version (v0)
    const { error: seoError } = await supabase
        .from('seo_versions')
        .insert({
            video_id: video.id,
            version_number: 0,
            title: videoTitle,
            description: '',
            tags: [],
            is_active: true,
            created_by: userId
        })

    if (seoError) {
        // Validation/Constraint error - manual rollback
        await supabase.from('videos').delete().eq('id', video.id)
        console.error('Error creating SEO version:', seoError)
        return {
            success: false,
            message: 'Failed to create initial SEO version',
            errorType: 'database'
        }
    }

    // 4. Create Default Task
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
    const videoTitle = formData.get('video_title') as string
    const publishedAtStr = formData.get('published_at') as string

    const errors: CreateVideoState['errors'] = {}

    if (!videoId) errors.video_id = ['Video ID is required']
    if (!videoTitle) errors.video_title = ['Title is required']

    if (Object.keys(errors).length > 0) {
        return { errors, message: 'Please correct the errors below' }
    }

    const publishedAt = publishedAtStr ? new Date(publishedAtStr).toISOString() : null

    try {
        // AnySupabaseClient cast needed because createClient returns a SupabaseClient<Database> 
        // but we want to pass it broadly. In this context simple cast or passing is fine.
        const result = await createVideoCore({
            channelId,
            videoId,
            videoTitle,
            publishedAt,
            userId: user.id,
            supabase: supabase as any
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
