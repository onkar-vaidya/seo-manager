'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { VideoSeo } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import EditVideoModal from './EditVideoModal'

interface VideoRowProps {
    video: VideoSeo
}

export default function VideoRow({ video }: VideoRowProps) {
    const [isEditOpen, setIsEditOpen] = useState(false)

    return (
        <>
            <Link href={`/dashboard/videos/${video.id}`}>
                <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
                    className="glass rounded-lg p-5 transition-smooth
                     hover:bg-background-surface/80 hover:border-border-hover
                     cursor-pointer group relative"
                >
                    <div className="flex items-start justify-between gap-6">
                        {/* Left: Video Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                            {/* Video Title */}
                            <h3 className="text-base font-medium text-text-primary 
                             transition-smooth group-hover:text-accent
                             truncate pr-8">
                                {video.old_title}
                            </h3>

                            {/* Metadata Row */}
                            <div className="flex items-center gap-4 text-sm">
                                {/* Video ID */}
                                <span className="text-text-tertiary font-mono">
                                    {video.video_id}
                                </span>

                                {/* Separator */}
                                <span className="text-border">•</span>

                                {/* Created Date */}
                                <span className="text-text-tertiary">
                                    {formatDate(video.created_at)}
                                </span>
                            </div>

                            {/* Title Variants Indicator */}
                            {(video.title_v1 || video.title_v2 || video.title_v3) && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 px-2 py-1 
                                  bg-accent/10 rounded-md border border-accent/20">
                                        <span className="text-xs font-medium text-accent">
                                            {[video.title_v1, video.title_v2, video.title_v3].filter(Boolean).length} variants
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 sm:gap-4 pl-2 sm:pl-0">
                            {/* Edit Button - Visible on mobile, hover on desktop */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault() // Prevent navigation
                                    e.stopPropagation()
                                    setIsEditOpen(true)
                                }}
                                className="p-2 text-text-tertiary hover:text-accent bg-background-elevated/50 sm:bg-transparent rounded-lg transition-all 
                                opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100
                                active:scale-95 touch-manipulation"
                                title="Edit Video Details"
                                aria-label="Edit Video Details"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>

                            {/* Arrow */}
                            <div className="hidden sm:block flex-shrink-0 text-text-tertiary 
                            transition-smooth group-hover:text-accent 
                            group-hover:translate-x-1">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Link>

            <EditVideoModal
                video={video}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
            />
        </>
    )
}
