'use client'

import { useState } from 'react'

interface VideoIdBadgeProps {
    videoId: string
}

export default function VideoIdBadge({ videoId }: VideoIdBadgeProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(videoId)
            } else {
                const textArea = document.createElement('textarea')
                textArea.value = videoId
                textArea.style.position = 'fixed'
                textArea.style.left = '-999999px'
                document.body.appendChild(textArea)
                textArea.select()
                document.execCommand('copy')
                document.body.removeChild(textArea)
            }
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-background-elevated 
                      border border-border rounded-lg">
            <span className="text-xs text-text-tertiary uppercase tracking-wide">Video ID:</span>
            <span className="text-sm text-text-primary font-mono">{videoId}</span>
            <button
                onClick={handleCopy}
                className="p-1 hover:bg-accent/10 text-text-tertiary hover:text-accent 
                         rounded transition-smooth"
                title="Copy Video ID"
            >
                {copied ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                )}
            </button>
        </div>
    )
}
