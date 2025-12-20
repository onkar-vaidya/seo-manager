'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Channel } from '@/lib/types'

interface ChannelCardProps {
    channel: Channel
}

export default function ChannelCard({ channel }: ChannelCardProps) {
    return (
        <Link href={`/dashboard/channels/${channel.id}`}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
                className="glass rounded-xl p-6 transition-smooth
                 hover:bg-background-surface/80 hover:border-border-hover
                 cursor-pointer group"
            >
                {/* Channel Icon/Avatar Placeholder */}
                <div className="w-12 h-12 rounded-lg bg-accent/10 
                      flex items-center justify-center mb-4
                      transition-smooth group-hover:bg-accent/20">
                    <svg
                        className="w-6 h-6 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                        />
                    </svg>
                </div>

                {/* Channel Name */}
                <h3 className="text-lg font-medium text-text-primary mb-2 
                     transition-smooth group-hover:text-accent">
                    {channel.channel_name}
                </h3>

                {/* Channel ID */}
                <p className="text-sm text-text-tertiary font-mono">
                    {channel.channel_id}
                </p>

                {/* Arrow indicator */}
                <div className="mt-4 flex items-center gap-2 text-text-tertiary 
                      transition-smooth group-hover:text-accent group-hover:translate-x-1">
                    <span className="text-xs font-medium uppercase tracking-wide">
                        View details
                    </span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </motion.div>
        </Link>
    )
}
