
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { createClient } from '@supabase/supabase-js'

// --- 1. Load Environment Variables ---
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8')
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/)
            if (match) {
                const key = match[1].trim()
                const value = match[2].trim().replace(/^["']|["']$/g, '')
                process.env[key] = value
            }
        })
    }
}
loadEnv()

// --- 2. Setup Supabase ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        persistSession: false
    }
})

// --- 3. Helpers ---

async function fetchAllExistingVideos() {
    console.log('Fetching existing videos map...')
    const dataMap = new Map<string, { id: string, is_seo_done: boolean }>()

    let from = 0
    const step = 1000
    let more = true

    while (more) {
        process.stdout.write(`Fetched ${from}...\r`)
        const { data, error } = await supabase
            .from('video_seo')
            .select('id, video_id, is_seo_done')
            .range(from, from + step - 1)

        if (error) {
            console.error('Fetch error:', error)
            throw error
        }

        if (data && data.length > 0) {
            data.forEach((row: any) => {
                dataMap.set(row.video_id, { id: row.id, is_seo_done: row.is_seo_done })
            })
            from += step
            if (data.length < step) more = false
        } else {
            more = false
        }
    }
    console.log(`\nFetched total ${dataMap.size} existing videos.`)
    return dataMap
}

async function getOrCreateChannel(channelName: string) {
    const { data: existing } = await supabase
        .from('channels')
        .select('id')
        .eq('channel_name', channelName)
        .single()

    if (existing) return existing.id

    console.log(`Creating channel: ${channelName}`)
    const { data: newChannel, error } = await supabase
        .from('channels')
        .insert({
            channel_name: channelName,
            channel_id: 'UC_EXCEL_EDU_INSTITUTE_' + Date.now()
        })
        .select()
        .single()

    if (error) {
        console.error('Failed to create channel', error)
        throw error
    }
    return newChannel.id
}

// --- 4. Main Process ---
async function run() {
    const channelId = await getOrCreateChannel('Excel Educational Institute')
    const existingMap = await fetchAllExistingVideos()

    const csvPath = path.resolve(process.cwd(), 'All_Categories_Final_Output_Merged.csv')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')

    console.log('Parsing CSV...')
    // Increase relax_column_count to true if needed, but let's try just debugging first
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        trim: true
    })
    console.log(`Parsed ${records.length} records.`)

    const batchSize = 500
    let upsertBuffer: any[] = []
    let processed = 0
    let skippedDone = 0
    let lastVideoId = ''

    for (const record of records) {
        const videoId = record.video_id
        if (!videoId) continue
        lastVideoId = videoId

        // DEBUG: Check for merge
        if (record.description && record.description.length > 5000) {
            console.warn(`\nWARNING: Huge description detected for ${videoId}. Len: ${record.description.length}`)
            console.warn('Snippet end:', record.description.slice(-100))
        }

        const existing = existingMap.get(videoId)

        if (existing && existing.is_seo_done) {
            skippedDone++
            continue
        }

        const tags = record.tags ? record.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []

        const payload: any = {
            video_id: videoId,
            channel_id: channelId,
            old_title: record.old_title || '',
            title_v1: record.title_v1 || null,
            title_v2: record.title_v2 || null,
            title_v3: record.title_v3 || null,
            description: record.description || '',
            tags: tags,
            is_seo_done: false,
        }

        if (existing) {
            payload.id = existing.id
        }

        upsertBuffer.push(payload)

        // Flush Buffer
        if (upsertBuffer.length >= batchSize) {
            await flushBatch(upsertBuffer)
            processed += upsertBuffer.length
            upsertBuffer = []
            process.stdout.write(`Processed: ${processed}, Skipped (Done): ${skippedDone}, LastID: ${lastVideoId}\r`)
        }
    }

    if (upsertBuffer.length > 0) {
        await flushBatch(upsertBuffer)
        processed += upsertBuffer.length
    }

    console.log(`\n\n--- Finished ---`)
    console.log(`Total Records in CSV: ${records.length}`)
    console.log(`Upserted (Inserted/Updated): ${processed}`)
    console.log(`Skipped (Already Done): ${skippedDone}`)
    console.log(`Last Processed Video ID: ${lastVideoId}`)
}

async function flushBatch(batch: any[]) {
    const { error } = await supabase
        .from('video_seo')
        .upsert(batch, { onConflict: 'video_id', ignoreDuplicates: false })

    if (error) {
        console.error('\nBatch Upsert Error:', error.message)
    }
}

run().catch(console.error)
