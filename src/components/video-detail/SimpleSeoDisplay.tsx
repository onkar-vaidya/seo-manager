'use client'

import { VideoSeo } from '@/lib/types'
import { useState } from 'react'

interface SimpleSeoDisplayProps {
    video: VideoSeo
}

export default function SimpleSeoDisplay({ video }: SimpleSeoDisplayProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null)

    const copyToClipboard = async (text: string, fieldName: string) => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text)
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea')
                textArea.value = text
                textArea.style.position = 'fixed'
                textArea.style.left = '-999999px'
                document.body.appendChild(textArea)
                textArea.select()
                document.execCommand('copy')
                document.body.removeChild(textArea)
            }
            setCopiedField(fieldName)
            setTimeout(() => setCopiedField(null), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
            alert('Failed to copy to clipboard')
        }
    }

    const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => (
        <button
            onClick={() => copyToClipboard(text, fieldName)}
            className="ml-2 px-2 py-1 text-xs bg-background-elevated hover:bg-accent/10 
                     text-text-tertiary hover:text-accent border border-border rounded 
                     transition-smooth flex items-center gap-1"
        >
            {copiedField === fieldName ? (
                <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                </>
            ) : (
                <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                </>
            )}
        </button>
    )

    return (
        <div className="space-y-8">
            {/* Old Title */}
            <section className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium text-text-tertiary uppercase tracking-wide">
                        Original Title
                    </h2>
                    <CopyButton text={video.old_title} fieldName="old_title" />
                </div>
                <p className="text-lg text-text-primary leading-relaxed">
                    {video.old_title}
                </p>
            </section>

            {/* New Title Variants */}
            <section className="glass rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-medium text-text-tertiary uppercase tracking-wide mb-4">
                    New Title Variants
                </h2>

                <div className="space-y-4">
                    {video.title_v1 && (
                        <div className="border-l-2 border-accent/30 pl-4">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-text-tertiary">Variant 1</p>
                                <CopyButton text={video.title_v1} fieldName="title_v1" />
                            </div>
                            <p className="text-base text-text-primary leading-relaxed">
                                {video.title_v1}
                            </p>
                        </div>
                    )}

                    {video.title_v2 && (
                        <div className="border-l-2 border-accent/30 pl-4">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-text-tertiary">Variant 2</p>
                                <CopyButton text={video.title_v2} fieldName="title_v2" />
                            </div>
                            <p className="text-base text-text-primary leading-relaxed">
                                {video.title_v2}
                            </p>
                        </div>
                    )}

                    {video.title_v3 && (
                        <div className="border-l-2 border-accent/30 pl-4">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-text-tertiary">Variant 3</p>
                                <CopyButton text={video.title_v3} fieldName="title_v3" />
                            </div>
                            <p className="text-base text-text-primary leading-relaxed">
                                {video.title_v3}
                            </p>
                        </div>
                    )}

                    {!video.title_v1 && !video.title_v2 && !video.title_v3 && (
                        <p className="text-sm text-text-tertiary italic">
                            No new title variants available
                        </p>
                    )}
                </div>
            </section>

            {/* Description */}
            {video.description && (
                <section className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-text-tertiary uppercase tracking-wide">
                            Description
                        </h2>
                        <CopyButton text={video.description} fieldName="description" />
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                        {video.description}
                    </p>
                </section>
            )}

            {/* Tags */}
            <section className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium text-text-tertiary uppercase tracking-wide">
                        Tags
                    </h2>
                    {video.tags && video.tags.length > 0 && (
                        <CopyButton text={video.tags.join(', ')} fieldName="tags" />
                    )}
                </div>

                {video.tags && video.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {video.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 text-xs bg-background-elevated text-text-secondary 
                                         rounded-full border border-border"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-text-tertiary italic">
                        No tags available
                    </p>
                )}
            </section>
        </div>
    )
}
