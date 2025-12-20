export interface Channel {
    id: string
    channel_id: string
    channel_name: string
    created_at?: string
    updated_at?: string
}

export interface VideoSeo {
    id: string
    channel_id: string
    video_id: string

    // Titles
    old_title: string
    title_v1?: string
    title_v2?: string
    title_v3?: string

    // Shared content
    description?: string
    tags?: string[]

    // Status
    is_seo_done?: boolean

    // Assignment tracking
    assigned_to?: string
    worked_by?: string

    // Metadata
    published_at?: string
    created_at?: string
    updated_at?: string

    // Joined data
    channels?: {
        id: string
        channel_name: string
        channel_id: string
    }
}

export interface UserRole {
    id: string
    user_id: string
    role: 'admin' | 'editor' | 'viewer'
    created_at?: string
}

export interface Task {
    id: string
    video_id: string
    assigned_to: string
    status: 'pending' | 'in_progress' | 'completed'
    created_at?: string
    updated_at?: string
}

export interface SeoVersion {
    id: string
    video_id: string
    title?: string
    description?: string
    tags?: string[]
    version_number: number
    is_active?: boolean
    created_at?: string
    updated_at?: string
}
