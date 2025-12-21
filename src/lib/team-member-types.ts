export interface TeamMember {
    id: string
    name: string
    role: 'admin' | 'editor' | 'viewer'
    is_active: boolean
    avatar_url?: string
    created_at?: string
}
