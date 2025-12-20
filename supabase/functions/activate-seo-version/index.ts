import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create Supabase client with auth context
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        // Verify user is authenticated
        const {
            data: { user },
            error: userError,
        } = await supabaseClient.auth.getUser()

        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // Check if user is admin
        const { data: userRole, error: roleError } = await supabaseClient
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single()

        if (roleError || userRole?.role !== 'admin') {
            return new Response(
                JSON.stringify({ error: 'Forbidden: Admin access required' }),
                {
                    status: 403,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // Get request body
        const { versionId, videoId } = await req.json()

        if (!versionId || !videoId) {
            return new Response(
                JSON.stringify({ error: 'Missing versionId or videoId' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // Transaction: Deactivate all versions for this video, then activate the selected one
        // Step 1: Deactivate all versions for this video
        const { error: deactivateError } = await supabaseClient
            .from('seo_versions')
            .update({ is_active: false })
            .eq('video_id', videoId)

        if (deactivateError) {
            throw deactivateError
        }

        // Step 2: Activate the selected version
        const { data: activatedVersion, error: activateError } = await supabaseClient
            .from('seo_versions')
            .update({ is_active: true })
            .eq('id', versionId)
            .eq('video_id', videoId)
            .select()
            .single()

        if (activateError) {
            throw activateError
        }

        return new Response(
            JSON.stringify({
                success: true,
                version: activatedVersion,
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    }
})
