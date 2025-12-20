import * as fs from 'fs'
import * as path from 'path'

// 1. Load Environment Variables
function loadEnv() {
    try {
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
    } catch (e) {
        console.error('Failed to load .env.local', e)
    }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or ANON KEY).')
    process.exit(1)
}

// 2. Define Video IDs
const videoIds = [
    'ykADcQ_BFvk', 'z0nm7NMlx8Y', 'ydMEfZD3urA', 'zEyviYJlVs4', 'xzTFs9tWy-I',
    'zDGU_o21ro8', 'yCtnT4cbJr8', 'zDb4plcoLL8', 'l7NLgBEf16o', 'yjjfq9jVSUs',
    'zy5zNkj2y-w', 'y_loG5iJdF0', 'zwdI5tKThUc', 'zvmAitOLjYo', 'z16Mj4qL8Fk',
    'xyrxNGVOkXU', 'yRkPlgk3OwU', 'yNene2d8DIM', 'yqSX83INmqA', 'yCmmlpE1Nm0',
    'rXnc6lftcvM', 'roi4Q_FEKZ4', 'GrcU0pkg6Z8', 's4b5pShVpxQ', 'ruD1IHNokSk',
    'IKDvhKCbcJY', 'rfouqXRgAEw', 'HCSxj-eeTXc', 'IZ8O463Hpk4', 'USuC8K3bt0k',
    'rpxTv4N6ats', 'HP7vQgn4iWo', 'GoG1SSVIkIE', 'HHaXgHlSjec', 'HJ6VrK-qCP0',
    'mxV2tzQNQ2k', 'lngxmu8YvL4', 'nccdncv2GTE', 'GPpQvwvDS4g', 'nYSOqQkEccI',
    'oQPSTwRomi0', 'HYRVnYpx4lU', 'Hwun4IJFibI', 'IBBb2JGnAiY', 'Hk7pmqGDq28',
    'I6IHhhBC5vY', 'HrdMrfBamrI', 'Hndu4TtqqWc', 'Hhq7NUAZpfk', 'Ho_4DUsLkEg',
    'JuwoyQ1tVZk', 'IniloZDwGAU'
]

// 3. Perform REST API Update
async function bulkUpdate() {
    console.log(`Preparing to update ${videoIds.length} videos...`)

    // Supabase PostgREST format for IN filter: video_id=in.("id1","id2")
    const idFilter = `in.("${videoIds.join('","')}")`

    const url = `${supabaseUrl}/rest/v1/video_seo?video_id=${idFilter}`

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey!,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation' // Return the updated records
            },
            body: JSON.stringify({
                is_seo_done: true
            })
        })

        if (!response.ok) {
            const text = await response.text()
            throw new Error(`API Request Failed: ${response.status} ${response.statusText} - ${text}`)
        }

        const data = await response.json()
        console.log(`✅ Successfully updated ${data.length} videos to is_seo_done=true.`)

        if (data.length !== videoIds.length) {
            console.warn(`⚠️ Warning: Requested ${videoIds.length} updates but only ${data.length} records were modified. Some IDs might differ or not exist.`)
        }

    } catch (error) {
        console.error('❌ Update failed:', error)
    }
}

bulkUpdate()
