'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type AssignableUser = {
    user_id: string
    role: 'admin' | 'editor'
}

export async function getAssignableUsers(): Promise<AssignableUser[]> {
    const supabase = await createClient()

    // Fetch users with admin or editor roles
    // Note: RLS must allow this read for the current user (likely admin/editor)
    const { data: users, error } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['admin', 'editor'])

    if (error) {
        console.error('Error fetching assignable users:', error)
        return []
    }

    // Cast as AssignableUser[] because user_roles.role is typed broadly in DB but filtered here
    return (users || []) as AssignableUser[]
}

export async function updateTaskStatus(
    taskId: string,
    videoId: string,
    status: 'pending' | 'in_progress' | 'completed'
) {
    const supabase = await createClient()

    // check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // check role
    const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (!userRole || userRole.role === 'viewer') {
        throw new Error('Forbidden')
    }

    // Use admin client for DB operations to bypass RLS
    let dbClient = supabase
    try {
        dbClient = await createAdminClient()
    } catch (e) {
        console.warn('Admin client unavailable, falling back to user client', e)
    }

    const { error } = await dbClient
        .from('tasks')
        .update({ status })
        .eq('id', taskId)

    if (error) {
        throw new Error(`Failed to update status: ${error.message}`)
    }

    revalidatePath(`/dashboard/videos/${videoId}`)
    return { success: true }
}

export async function assignTask(
    taskId: string,
    videoId: string,
    assigneeId: string | null
) {
    const supabase = await createClient()

    // check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // check role
    const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (!userRole || userRole.role === 'viewer') {
        throw new Error('Forbidden')
    }

    // Use admin client for DB operations to bypass RLS
    let dbClient = supabase
    try {
        dbClient = await createAdminClient()
    } catch (e) {
        console.warn('Admin client unavailable, falling back to user client', e)
    }

    const { error } = await dbClient
        .from('tasks')
        .update({ assigned_to: assigneeId })
        .eq('id', taskId)

    if (error) {
        throw new Error(`Failed to assign task: ${error.message}`)
    }

    revalidatePath(`/dashboard/videos/${videoId}`)
    return { success: true }
}

export async function createTask(videoId: string) {
    const supabase = await createClient()

    // check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // check role
    const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (!userRole || userRole.role === 'viewer') {
        throw new Error('Forbidden')
    }

    // Use admin client for DB operations to bypass RLS
    let dbClient = supabase
    try {
        dbClient = await createAdminClient()
    } catch (e) {
        console.warn('Admin client unavailable, falling back to user client', e)
    }

    // Create task
    const { error } = await dbClient
        .from('tasks')
        .insert({
            video_id: videoId,
            status: 'pending',
            assigned_to: null, // Unassigned initially
        })

    if (error) {
        // Handle constraint violation (task already exists) gracefully
        if (error.code === '23505') { // specific valid code for unique violation often used
            // Or just check message content if code varies
            console.log('Task already exists, ignoring.')
            revalidatePath(`/dashboard/videos/${videoId}`)
            return { success: true }
        }
        throw new Error(`Failed to create task: ${error.message}`)
    }

    revalidatePath(`/dashboard/videos/${videoId}`)
    return { success: true }
}
