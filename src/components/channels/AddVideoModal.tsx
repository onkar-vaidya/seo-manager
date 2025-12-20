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
            <div className="relative glass rounded-xl p-6 max-w-2xl w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
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
                        label="Original Title (Old Title)"
                        name="old_title"
                        placeholder="Enter the original video title"
                        error={fieldErrors.video_title?.[0]}
                        required
                    />

                    <div className="space-y-4 pt-2 border-t border-border">
                        <p className="text-sm font-medium text-text-secondary">SEO Data (Optional)</p>

                        <Input
                            label="Title Variant 1"
                            name="title_v1"
                            placeholder="Optimized title option 1"
                        />
                        <Input
                            label="Title Variant 2"
                            name="title_v2"
                            placeholder="Optimized title option 2"
                        />
                        <Input
                            label="Title Variant 3"
                            name="title_v3"
                            placeholder="Optimized title option 3"
                        />

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text-secondary block">
                                Description
                            </label>
                            <textarea
                                name="description"
                                rows={4}
                                className="w-full px-3 py-2 bg-background-surface border border-border rounded-lg 
                                         text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 
                                         focus:ring-accent/50 transition-smooth resize-y"
                                placeholder="Video description..."
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text-secondary block">
                                Tags
                            </label>
                            <textarea
                                name="tags"
                                rows={2}
                                className="w-full px-3 py-2 bg-background-surface border border-border rounded-lg 
                                         text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 
                                         focus:ring-accent/50 transition-smooth resize-y"
                                placeholder="Tag 1, Tag 2, Tag 3 (comma separated)"
                            />
                        </div>
                    </div>

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
