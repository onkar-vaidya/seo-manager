export interface TeamMember {
    id: string
    name: string
    role: 'admin' | 'editor' | 'viewer'
    is_active: boolean
    created_at?: string
}
