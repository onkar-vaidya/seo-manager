'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * DEV ONLY: Seeds a sample channel for testing purposes.
 * Only works in development mode.
 */
export async function seedSampleChannel() {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('Dev only')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const channelId = `CHANNEL-${Math.floor(Math.random() * 1000)}`

    const { data: channel, error } = await supabase
        .from('channels')
        .insert({
            channel_id: channelId,
            channel_name: `Sample Channel ${channelId}`
        })
        .select()
        .single()

    if (error) {
        throw new Error(`Failed to seed channel: ${error.message}`)
    }

    revalidatePath('/dashboard/channels')
    return { success: true, channel }
}

/**
 * Update channel name
 * Admin only
 */
export async function updateChannelName(channelId: string, newName: string) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Check role - admin only for channel management
    // Check role - admin only for channel management
    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    const isDev = process.env.NODE_ENV === 'development'
    const role = roleData?.role || 'viewer'
    const isAdmin = role === 'admin'

    console.log('[updateChannelName] User:', user.id, 'Role:', role, 'IsDev:', isDev)

    if (!isDev && !isAdmin) {
        console.error('[updateChannelName] Forbidden. Role:', role)
        throw new Error('Forbidden: Only admins can rename channels')
    }

    if (!newName.trim()) {
        throw new Error('Channel name is required')
    }

    // Use admin client for DB operations to bypass RLS
    let dbClient = supabase
    try {
        dbClient = await createAdminClient()
        console.log('[updateChannelName] Admin client created successfully')
    } catch (e) {
        console.warn('[updateChannelName] Admin client unavailable, falling back to user client', e)
    }

    const { error } = await dbClient
        .from('channels')
        .update({ channel_name: newName.trim() })
        .eq('id', channelId)

    if (error) {
        console.error('[updateChannelName] Update failed:', error)
        throw new Error(`Failed to update channel: ${error.message}`)
    }

    revalidatePath('/dashboard/channels')
    revalidatePath(`/dashboard/channels/${channelId}`)
    return { success: true }
}
