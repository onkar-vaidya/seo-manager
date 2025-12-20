# Deploying the Supabase Edge Function

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Supabase project created
- Logged in to Supabase CLI

## Steps

### 1. Link to your Supabase project

```bash
cd /Users/onkar/youtube-seo-app
supabase link --project-ref your-project-ref
```

### 2. Deploy the Edge Function

```bash
supabase functions deploy activate-seo-version
```

### 3. Set Environment Variables (if needed)

The function uses these environment variables (auto-provided by Supabase):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### 4. Test the Function

You can test it locally first:

```bash
supabase functions serve activate-seo-version
```

Then make a test request:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/activate-seo-version' \
  --header 'Authorization: Bearer YOUR_SESSION_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"versionId":"version-uuid","videoId":"video-uuid"}'
```

### 5. Verify Deployment

Check function logs:

```bash
supabase functions logs activate-seo-version
```

## Required Database Setup

Ensure your `user_roles` table has:
- `user_id` column (UUID, references auth.users)
- `role` column (TEXT, values: 'admin', 'editor', 'viewer')

The function checks if the authenticated user has `role = 'admin'` before allowing activation.
