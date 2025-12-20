# YouTube SEO Manager - Foundation

Production-ready Next.js foundation for YouTube SEO optimization platform.

## Features

- ✅ Next.js 15 App Router with TypeScript
- ✅ Supabase Authentication (email/password)
- ✅ Protected routes with middleware
- ✅ Role-based access control (admin/editor/viewer)
- ✅ Ambient dark theme design system
- ✅ Responsive layout with sidebar navigation
- ✅ Reusable UI components

## Tech Stack

- **Framework**: Next.js 15.1
- **Styling**: Tailwind CSS 3.4
- **Auth**: Supabase Auth
- **Database**: Supabase PostgreSQL (with RLS)
- **Animation**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project with:
  - Auth enabled
  - `user_roles` table configured
  - RLS policies enabled

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   
   Create `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**: http://localhost:3000

## Database Schema

Ensure your Supabase database has:

```sql
-- User roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own role
CREATE POLICY "Users can view own role" 
  ON user_roles FOR SELECT 
  USING (auth.uid() = user_id);
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Protected dashboard
│   └── login/              # Authentication
├── components/
│   ├── layout/             # Sidebar, Header
│   └── ui/                 # Button, Input, Card
├── lib/
│   └── supabase/           # Client utilities
└── middleware.ts           # Route protection
```

## Design System

### Colors

- Background: `#0B0E11` (near-black)
- Elevated: `#12161C` (soft dark gray)
- Accent: `#6B7AB8` (muted indigo)
- Text: `#E8EAED` (high contrast)

### Typography

- Font: Inter (300, 400, 500, 600)
- Relaxed line heights (1.5-1.6)
- Weight-based hierarchy

### Components

All components follow the calm, ambient aesthetic with:
- Subtle borders
- Soft transitions (250ms)
- Glass morphism effects
- Minimal shadows

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Authentication Flow

1. Visit root → redirects to `/login`
2. Enter credentials → Supabase Auth
3. Success → redirect to `/dashboard`
4. Session managed via middleware
5. Logout → return to `/login`

## Next Steps

Future features to implement:
- [ ] Channels management UI
- [ ] Videos listing and filtering
- [ ] SEO version editor
- [ ] Task assignment system
- [ ] Comments/collaboration

## License

Private - Internal Use Only
