'use client'

import { useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { createVideoWithDefaults } from '@/app/actions/videos'

interface AddVideoModalProps {
    isOpen: boolean
    onClose: () => void
    channelId: string // UUID
}

export default function AddVideoModal({
    isOpen,
    onClose,
    channelId,
}: AddVideoModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<{
        video_id?: string[]
        video_title?: string[]
        published_at?: string[]
    }>({})
    const formRef = useRef<HTMLFormElement>(null)

    if (!isOpen) return null

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError(null)
        setFieldErrors({})

        try {
            // We'll use a wrapper since server actions need state passed in react < 19
            // typically but here we'll just call it directly and handle result
            // Note: In Next.js 15 / React 19 we can use useActionState but let's keep it simple for now
            // or just call the async function.

            const result = await createVideoWithDefaults(channelId, {}, formData)

            if (result.success) {
                // Reset and close
                formRef.current?.reset()
                onClose()
            } else {
                if (result.errors) {
                    setFieldErrors(result.errors)
                }
                if (result.message) {
                    setError(result.message)
                }
            }
        } catch (e) {
            console.error(e)
            setError('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative glass rounded-xl p-6 max-w-md w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-1">
                    <h3 className="text-xl font-medium text-text-primary">
                        Add New Video
                    </h3>
                    <p className="text-sm text-text-secondary">
                        Enter video details to track SEO versions.
                    </p>
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger">
                        {error}
                    </div>
                )}

                <form
                    ref={formRef}
                    action={handleSubmit}
                    className="space-y-4"
                >
                    <Input
                        label="Video ID"
                        name="video_id"
                        placeholder="e.g. dQw4w9WgXcQ"
                        error={fieldErrors.video_id?.[0]}
                        required
                    />

                    <Input
                        label="Video Title"
                        name="video_title"
                        placeholder="Enter video title"
                        error={fieldErrors.video_title?.[0]}
                        required
                    />

                    <Input
                        label="Published Date"
                        name="published_at"
                        type="datetime-local"
                        error={fieldErrors.published_at?.[0]}
                    />

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Adding...' : 'Add Video'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
