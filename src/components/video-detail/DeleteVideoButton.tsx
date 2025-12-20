'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteVideo } from '@/app/actions/videos'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface DeleteVideoButtonProps {
    videoId: string
    channelId: string
}

export default function DeleteVideoButton({ videoId, channelId }: DeleteVideoButtonProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        setIsDeleting(true)
        setError(null)

        try {
            await deleteVideo(videoId, channelId)
            // Close dialog and redirect
            setIsOpen(false)
            router.push(`/dashboard/channels/${channelId}`)
        } catch (err: any) {
            setError(err.message || 'Failed to delete video')
            setIsDeleting(false)
        }
    }

    return (
        <>
            <Button
                variant="ghost"
                onClick={() => setIsOpen(true)}
                className="text-danger hover:bg-danger/10 hover:text-danger px-5 py-2.5 
                         text-sm font-medium min-w-[120px] whitespace-nowrap"
            >
                Delete Video
            </Button>

            <ConfirmDialog
                isOpen={isOpen}
                title="Delete Video"
                message="Are you sure you want to delete this video? This will also delete all SEO versions, tasks, and comments. This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDelete}
                onCancel={() => {
                    setIsOpen(false)
                    setError(null)
                }}
                isLoading={isDeleting}
            />

            {error && (
                <div className="mt-4 p-4 bg-danger/10 border border-danger/20 rounded-lg">
                    <p className="text-sm text-danger">{error}</p>
                </div>
            )}
        </>
    )
}
