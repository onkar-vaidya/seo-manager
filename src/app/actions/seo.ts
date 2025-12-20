'use server'

import { createAdminClient } from '@/lib/supabase/server'

export async function toggleSeoDone(videoId: string, currentStatus: boolean, workedBy?: string) {
    const supabase = await createAdminClient()

    const newStatus = !currentStatus

    // Prepare update data
    const updateData: any = { is_seo_done: newStatus }

    // If marking as done and workedBy is provided, set it
    if (newStatus && workedBy) {
        updateData.worked_by = workedBy
    }

    const { data, error } = await supabase
        .from('video_seo')
        .update(updateData)
        .eq('id', videoId)
        .select(`
            id,
            channel_id,
            video_id,
            old_title,
            is_seo_done,
            assigned_to,
            worked_by,
            created_at,
            channels!inner (
                id,
                channel_name,
                channel_id
            )
        `)
        .single()

    if (error) {
        console.error('Error toggling SEO status:', error)
        return { success: false, error: error.message }
    }

    return {
        success: true,
        video: data,
        message: `SEO marked as ${newStatus ? 'done' : 'not done'}`
    }
}
