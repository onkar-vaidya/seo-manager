'use client'

import { useState } from 'react'
import { updateChannelName } from '@/app/actions/channels'

interface EditableChannelNameProps {
    channelId: string
    initialName: string
    userRole: string
}

export default function EditableChannelName({
    channelId,
    initialName,
    userRole
}: EditableChannelNameProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(initialName)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isAdmin = userRole === 'admin'

    const handleSave = async () => {
        if (!name.trim() || name === initialName) {
            setIsEditing(false)
            setName(initialName)
            return
        }

        setIsSaving(true)
        setError(null)

        try {
            await updateChannelName(channelId, name)
            setIsEditing(false)
        } catch (err: any) {
            setError(err.message || 'Failed to update channel name')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setName(initialName)
        setIsEditing(false)
        setError(null)
    }

    if (!isAdmin) {
        return (
            <h1 className="text-3xl font-medium text-text-primary mb-2">
                {initialName}
            </h1>
        )
    }

    if (isEditing) {
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="text-3xl font-medium text-text-primary bg-background-surface 
                                 border border-border rounded-lg px-3 py-1 focus:outline-none 
                                 focus:border-accent transition-smooth"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave()
                            if (e.key === 'Escape') handleCancel()
                        }}
                    />
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-3 py-1.5 text-sm bg-accent text-white rounded-md 
                                 hover:bg-accent/90 transition-smooth disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="px-3 py-1.5 text-sm bg-background-surface text-text-secondary 
                                 border border-border rounded-md hover:bg-background-elevated 
                                 transition-smooth disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
                {error && (
                    <p className="text-sm text-danger">{error}</p>
                )}
            </div>
        )
    }

    return (
        <h1
            className="text-3xl font-medium text-text-primary mb-2 cursor-pointer 
                     hover:text-accent transition-smooth group inline-flex items-center gap-2"
            onClick={() => setIsEditing(true)}
        >
            {initialName}
            <svg
                className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-smooth"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
        </h1>
    )
}
