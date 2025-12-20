'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { VideoSeo } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface VideoRowProps {
    video: VideoSeo
}

export default function VideoRow({ video }: VideoRowProps) {
    return (
        <Link href={`/dashboard/videos/${video.id}`}>
            <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
                className="glass rounded-lg p-5 transition-smooth
                 hover:bg-background-surface/80 hover:border-border-hover
                 cursor-pointer group"
            >
                <div className="flex items-start justify-between gap-6">
                    {/* Left: Video Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                        {/* Video Title */}
                        <h3 className="text-base font-medium text-text-primary 
                         transition-smooth group-hover:text-accent
                         truncate">
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

                    {/* Right: Arrow */}
                    <div className="flex-shrink-0 text-text-tertiary 
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
            </motion.div>
        </Link>
    )
}
