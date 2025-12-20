'use server'

import { createAdminClient } from '@/lib/supabase/server'

export async function assignVideosToMember(videoIds: string[], memberName: string) {
    const supabase = await createAdminClient()

    const { error } = await supabase
        .from('video_seo')
        .update({ assigned_to: memberName })
        .in('id', videoIds)

    if (error) {
        console.error('Error assigning videos:', error)
        return { success: false, error: error.message }
    }

    return {
        success: true,
        message: `Assigned ${videoIds.length} video(s) to ${memberName}`
    }
}

export async function unassignVideos(videoIds: string[]) {
    const supabase = await createAdminClient()

    const { error } = await supabase
        .from('video_seo')
        .update({ assigned_to: null })
        .in('id', videoIds)

    if (error) {
        console.error('Error unassigning videos:', error)
        return { success: false, error: error.message }
    }

    return {
        success: true,
        message: `Unassigned ${videoIds.length} video(s)`
    }
}
