'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type BulkImportResult = {
    total: number
    created: number
    skipped: number
    errors: { row: number; reason: string }[]
    message: string
}

export async function importBulkVideos(
    channelId: string,
    jsonContent: string
): Promise<BulkImportResult> {
    const supabase = await createClient()

    // 1. Validate User Role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
    }

    // Try to get Admin Client for DB operations to bypass RLS
    let dbClient = supabase
    try {
        dbClient = await createAdminClient()
    } catch (e) {
        console.warn('Admin client unavailable, falling back to user client', e)
    }

    const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    const isDev = process.env.NODE_ENV === 'development'
    const hasRole = userRole && (userRole.role === 'admin' || userRole.role === 'editor')

    if (!isDev && !hasRole) {
        throw new Error('Forbidden: Only admins and editors can import videos')
    }

    try {
        const parsed = JSON.parse(jsonContent)

        // Handle { results: [...] } wrapper
        const videos = Array.isArray(parsed) ? parsed : (parsed.results || [])

        if (!Array.isArray(videos)) {
            return {
                total: 0,
                created: 0,
                skipped: 0,
                errors: [],
                message: 'Invalid JSON: Root must be an array or have a "results" array'
            }
        }

        let createdCount = 0
        let skippedCount = 0
        const errors: { row: number; reason: string }[] = []

        // Process sequentially to avoid race conditions
        for (let i = 0; i < videos.length; i++) {
            const row = videos[i]
            const rowIndex = i + 1

            // Extract fields - support both naming conventions
            const videoId = row['Video ID'] || row.video_id
            const oldTitle = row['Old Title'] || row.old_title
            const titleV1 = row['Title Variant 1'] || row.title_v1 || row.title_variant_1
            const titleV2 = row['Title Variant 2'] || row.title_v2 || row.title_variant_2
            const titleV3 = row['Title Variant 3'] || row.title_v3 || row.title_variant_3
            const description = row['Description'] || row.description
            const tags = row['Tags'] || row.tags

            // Validate required fields
            if (!videoId || !oldTitle) {
                skippedCount++
                errors.push({ row: rowIndex, reason: 'Missing Video ID or Old Title' })
                continue
            }

            // Parse tags if it's a string
            let tagsArray: string[] = []
            if (typeof tags === 'string') {
                tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean)
            } else if (Array.isArray(tags)) {
                tagsArray = tags
            }

            // Insert into video_seo table
            const { error: insertError } = await dbClient
                .from('video_seo')
                .insert({
                    channel_id: channelId,
                    video_id: videoId,
                    old_title: oldTitle,
                    title_v1: titleV1 || null,
                    title_v2: titleV2 || null,
                    title_v3: titleV3 || null,
                    description: description || null,
                    tags: tagsArray.length > 0 ? tagsArray : null,
                })

            if (insertError) {
                // Check if it's a duplicate
                if (insertError.code === '23505') {
                    skippedCount++
                    errors.push({ row: rowIndex, reason: 'Duplicate video_id' })
                } else {
                    skippedCount++
                    errors.push({ row: rowIndex, reason: insertError.message })
                }
                continue
            }

            createdCount++
        }

        revalidatePath(`/dashboard/channels/${channelId}`)

        return {
            total: videos.length,
            created: createdCount,
            skipped: skippedCount,
            errors,
            message: `Successfully imported ${createdCount} videos. Skipped ${skippedCount}.`
        }

    } catch (error: any) {
        console.error('Bulk import error:', error)
        return {
            total: 0,
            created: 0,
            skipped: 0,
            errors: [{ row: 0, reason: error.message }],
            message: `Import failed: ${error.message}`
        }
    }
}
