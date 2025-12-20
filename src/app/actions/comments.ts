'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type CommentWithUser = {
    id: string
    comment: string
    created_at: string
    user_id: string
    // In a real app with profiles, we'd join here. 
    // For now we just return user_id.
}

export async function addComment(videoId: string, content: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Check role
    const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (!userRole || userRole.role === 'viewer') {
        throw new Error('Forbidden')
    }

    if (!content.trim()) {
        throw new Error('Content is required')
    }

    // Use admin client for DB operations to bypass RLS
    let dbClient = supabase
    try {
        dbClient = await createAdminClient()
    } catch (e) {
        console.warn('Admin client unavailable, falling back to user client', e)
    }

    const { error } = await dbClient
        .from('comments')
        .insert({
            video_id: videoId,
            user_id: user.id,
            comment: content.trim()
        })

    if (error) {
        throw new Error(`Failed to add comment: ${error.message}`)
    }

    revalidatePath(`/dashboard/videos/${videoId}`)
    return { success: true }
}

export async function getComments(videoId: string): Promise<CommentWithUser[]> {
    const supabase = await createClient()

    const { data: comments, error } = await supabase
        .from('comments')
        .select('id, comment, created_at, user_id')
        .eq('video_id', videoId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching comments:', error)
        return []
    }

    return comments as CommentWithUser[]
}
