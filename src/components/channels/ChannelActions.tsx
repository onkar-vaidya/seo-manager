'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import AddVideoModal from './AddVideoModal'
import ImportJsonModal from './ImportJsonModal'

interface ChannelActionsProps {
    channelId: string
    userRole: 'admin' | 'editor' | 'viewer'
}

export default function ChannelActions({ channelId, userRole }: ChannelActionsProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)

    if (userRole === 'viewer') {
        return null
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                onClick={() => setIsImportModalOpen(true)}
            >
                Import JSON
            </Button>

            <Button
                variant="primary"
                onClick={() => setIsAddModalOpen(true)}
            >
                Add Video
            </Button>

            <AddVideoModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                channelId={channelId}
            />

            <ImportJsonModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                channelId={channelId}
            />
        </div>
    )
}
