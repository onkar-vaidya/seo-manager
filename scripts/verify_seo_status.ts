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
    console.error('Missing credentials.')
    process.exit(1)
}

// Same IDs from the previous update
const videoIds = [
    'ykADcQ_BFvk', 'z0nm7NMlx8Y', 'ydMEfZD3urA', 'zEyviYJlVs4', 'xzTFs9tWy-I',
    'zDGU_o21ro8', 'yCtnT4cbJr8' // Checking a subset is enough
]

async function verifySeoStatus() {
    console.log(`Checking status for sample videos...`)

    const idFilter = `in.("${videoIds.join('","')}")`
    const url = `${supabaseUrl}/rest/v1/video_seo?video_id=${idFilter}&select=video_id,is_seo_done`

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey!,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(`API Request Failed: ${response.status}`)
        }

        const data = await response.json()
        console.log('Database Records:', JSON.stringify(data, null, 2))

        const allDone = data.every((r: any) => r.is_seo_done === true)
        if (allDone) {
            console.log('✅ All checked videos are marked as is_seo_done=true')
        } else {
            console.log('❌ SOME VIDEOS ARE NOT DONE!')
        }

    } catch (error) {
        console.error('Check failed:', error)
    }
}

verifySeoStatus()
