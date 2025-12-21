
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function run() {
    console.log('Updating avatar_url for team members...')

    const updates = [
        { name: 'Onkar', url: '/avatars/Onkar.jpg' },
        { name: 'Akash', url: '/avatars/Akash.png' },
        { name: 'Akshay', url: '/avatars/Akshay.jpg' },
        { name: 'Mahesh', url: '/avatars/Mahesh.jpg' },
    ]

    for (const u of updates) {
        console.log(`Updating ${u.name}...`)

        // Check if member exists
        const { data: members, error: searchError } = await supabase
            .from('team_members')
            .select('*')
            .ilike('name', `%${u.name}%`)

        if (searchError) {
            console.error(`Error searching for ${u.name}:`, searchError.message)
            continue
        }

        if (members && members.length > 0) {
            const member = members[0]
            console.log(`Found member: ${member.name} (${member.id})`)

            const { error: updateError } = await supabase
                .from('team_members')
                .update({ avatar_url: u.url })
                .eq('id', member.id)

            if (updateError) {
                console.error(`Failed to update ${u.name}:`, updateError.message)
            } else {
                console.log(`Successfully updated ${u.name}`)
            }
        } else {
            console.warn(`Member not found for name: ${u.name}`)
        }
    }
}

run().catch(console.error)
