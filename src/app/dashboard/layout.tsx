import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayoutClient from '@/components/layout/DashboardLayoutClient'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user role from database
    const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    // Default to 'admin' in development for easy testing, otherwise 'viewer'
    const defaultRole = process.env.NODE_ENV === 'development' ? 'admin' : 'viewer'
    const finalRole = userRole?.role || defaultRole

    return (
        <DashboardLayoutClient user={user} role={finalRole}>
            {children}
            <div className="hidden">
                {/* Only load syncer when authenticated */}
            </div>
        </DashboardLayoutClient>
    )
}
