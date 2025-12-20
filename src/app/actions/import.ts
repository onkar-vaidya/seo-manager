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
    content: string,
    format: 'json' | 'csv' = 'json'
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
        let videos: any[] = []

        if (format === 'json') {
            const parsed = JSON.parse(content)
            videos = Array.isArray(parsed) ? parsed : (parsed.results || [])
        } else if (format === 'csv') {
            // Simple CSV Parser
            const lines = content.split(/\r?\n/).filter(line => line.trim())
            if (lines.length < 2) {
                return {
                    total: 0,
                    created: 0,
                    skipped: 0,
                    errors: [],
                    message: 'Invalid CSV: No data rows found'
                }
            }

            // Parse Headers (remove carriage returns and quotes)
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))

            // Expected headers mapping helper
            const normalizeHeader = (h: string) => h.toLowerCase().replace(/\s+/g, '_').replace(/['"]/g, '')

            videos = lines.slice(1).map((line) => {
                // Handle comma within quotes for CSV standard-ish parsing
                // Logic: split by comma but ignore commas inside quotes
                const values: string[] = []
                let inQuote = false
                let val = ''
                for (let i = 0; i < line.length; i++) {
                    const char = line[i]
                    if (char === '"' && line[i + 1] === '"') {
                        val += '"'; i++; // escape quote
                    } else if (char === '"') {
                        inQuote = !inQuote
                    } else if (char === ',' && !inQuote) {
                        values.push(val.trim()); val = ''
                    } else {
                        val += char
                    }
                }
                values.push(val.trim())

                const row: any = {}
                headers.forEach((header, index) => {
                    if (values[index] !== undefined) {
                        row[header] = values[index].replace(/^"|"$/g, '')
                        // Try mapped key
                        const normalized = normalizeHeader(header)
                        row[normalized] = values[index].replace(/^"|"$/g, '')
                    }
                })
                return row
            })
        }

        if (!Array.isArray(videos)) {
            return {
                total: 0,
                created: 0,
                skipped: 0,
                errors: [],
                message: 'Invalid Data Format'
            }
        }

        let createdCount = 0
        let skippedCount = 0
        const errors: { row: number; reason: string }[] = []

        // Process sequentially
        for (let i = 0; i < videos.length; i++) {
            const row = videos[i]
            const rowIndex = i + 1

            // Loose input matching for CSV headers
            const videoId = row['video_id'] || row['Video ID'] || row['id']
            const oldTitle = row['old_title'] || row['Old Title'] || row['title'] || row['Title'] || row['original_title']
            const titleV1 = row['title_v1'] || row['Title Variant 1'] || row['title_variant_1'] || row['title 1']
            const titleV2 = row['title_v2'] || row['Title Variant 2'] || row['title_variant_2'] || row['title 2']
            const titleV3 = row['title_v3'] || row['Title Variant 3'] || row['title_variant_3'] || row['title 3']
            const description = row['description'] || row['Description'] || row['desc']
            const tags = row['tags'] || row['Tags'] || row['keywords'] || row['Keywords']

            // Validate required fields
            if (!videoId || !oldTitle) {
                skippedCount++
                errors.push({ row: rowIndex, reason: 'Missing Video ID or Old Title' })
                continue
            }

            // Parse tags
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
