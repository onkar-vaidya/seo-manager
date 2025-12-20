'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VideoSeo } from '@/lib/types'
import { updateVideo } from '@/app/actions/videos'

interface EditVideoModalProps {
    video: VideoSeo
    isOpen: boolean
    onClose: () => void
}

export default function EditVideoModal({ video, isOpen, onClose }: EditVideoModalProps) {
    const [title, setTitle] = useState(video.old_title || '')
    const [description, setDescription] = useState(video.description || '')
    const [isSeoDone, setIsSeoDone] = useState(video.is_seo_done || false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const result = await updateVideo(video.id, {
                title,
                description,
                is_seo_done: isSeoDone
            }, video.channel_id)

            if (result.success) {
                onClose()
            } else {
                setError(result.message || 'Failed to update video')
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-background-elevated border border-border rounded-xl shadow-2xl overflow-hidden
                        max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-border bg-background-surface/50 flex justify-between items-center header-shrink">
                            <h3 className="text-lg font-semibold text-text-primary">Edit Video Details</h3>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-text-tertiary hover:text-text-primary active:bg-background-surface rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Form - Scrollable Content */}
                        <div className="overflow-y-auto p-6 space-y-4">
                            <form id="edit-video-form" onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg text-sm text-warning flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {error}
                                    </div>
                                )}

                                {/* Video ID (Read only) */}
                                <div>
                                    <label className="block text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1">
                                        Video ID
                                    </label>
                                    <input
                                        type="text"
                                        value={video.video_id}
                                        disabled
                                        className="w-full px-3 py-2 bg-background-surface/50 border border-border rounded-lg text-text-secondary cursor-not-allowed font-mono text-sm"
                                    />
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-3 py-2 bg-background-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                        placeholder="Video Title"
                                    />
                                </div>

                                {/* SEO Status */}
                                <div className="flex items-center gap-3 py-1">
                                    <input
                                        type="checkbox"
                                        id="seo-done"
                                        checked={isSeoDone}
                                        onChange={(e) => setIsSeoDone(e.target.checked)}
                                        className="w-4 h-4 rounded border-border bg-background-surface text-accent focus:ring-accent"
                                    />
                                    <label htmlFor="seo-done" className="text-sm text-text-secondary select-none cursor-pointer">
                                        Mark SEO as Done
                                    </label>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 bg-background-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
                                        placeholder="Video Description..."
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Footer Actions - Fixed at bottom */}
                        <div className="flex justify-end gap-3 p-4 border-t border-border bg-background-elevated/50 backdrop-blur-sm">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-background-surface rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="edit-video-form"
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-all shadow-lg shadow-accent/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
