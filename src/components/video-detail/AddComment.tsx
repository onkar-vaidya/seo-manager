'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { addComment } from '@/app/actions/comments'

interface AddCommentProps {
    videoId: string
    canEdit: boolean
}

export default function AddComment({ videoId, canEdit }: AddCommentProps) {
    const [content, setContent] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    if (!canEdit) return null

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!content.trim()) return

        setIsLoading(true)
        try {
            await addComment(videoId, content)
            setContent('')
        } catch (error) {
            console.error('Failed to add comment:', error)
            alert('Failed to add comment')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a comment..."
                disabled={isLoading}
                rows={3}
                className="
                    w-full px-4 py-3 rounded-lg border border-border bg-background-surface
                    text-text-primary placeholder:text-text-tertiary
                    focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
                    disabled:opacity-50 resize-none
                "
            />
            <div className="flex justify-end">
                <Button
                    type="submit"
                    variant="primary"
                    disabled={!content.trim() || isLoading}
                >
                    {isLoading ? 'Posting...' : 'Post Comment'}
                </Button>
            </div>
        </form>
    )
}
