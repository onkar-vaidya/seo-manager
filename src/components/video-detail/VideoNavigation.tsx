'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface VideoNavigationProps {
    currentVideoId: string
}

export default function VideoNavigation({ currentVideoId }: VideoNavigationProps) {
    const [nextId, setNextId] = useState<string | null>(null)
    const [prevId, setPrevId] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        // Read queue from session storage
        try {
            const queueJson = sessionStorage.getItem('video_queue')
            if (queueJson) {
                const queue: string[] = JSON.parse(queueJson)
                const currentIndex = queue.indexOf(currentVideoId)

                if (currentIndex !== -1) {
                    if (currentIndex > 0) {
                        setPrevId(queue[currentIndex - 1])
                    }
                    if (currentIndex < queue.length - 1) {
                        setNextId(queue[currentIndex + 1])
                    }

                    // Aggressive Prefetching: Next 10 and Prev 10
                    const runPrefetch = () => {
                        const idsToPrefetch = new Set<string>()

                        // Next 10
                        for (let i = 1; i <= 10; i++) {
                            if (currentIndex + i < queue.length) {
                                idsToPrefetch.add(queue[currentIndex + i])
                            }
                        }
                        // Prev 10
                        for (let i = 1; i <= 10; i++) {
                            if (currentIndex - i >= 0) {
                                idsToPrefetch.add(queue[currentIndex - i])
                            }
                        }

                        idsToPrefetch.forEach(id => {
                            router.prefetch(`/dashboard/videos/${id}`)
                        })
                    }

                    // Use requestIdleCallback if available to avoid blocking main thread interaction
                    if ('requestIdleCallback' in window) {
                        (window as any).requestIdleCallback(runPrefetch)
                    } else {
                        setTimeout(runPrefetch, 2000)
                    }
                }
            }
        } catch (e) {
            console.error('Failed to parse video navigation queue', e)
        }
    }, [currentVideoId, router])

    if (!nextId && !prevId) return null

    return (
        <div className="flex items-center gap-2">
            {prevId ? (
                <Link
                    href={`/dashboard/videos/${prevId}`}
                    className="p-2 rounded-lg border border-border bg-background-elevated text-text-secondary 
                             hover:bg-background-surface hover:text-text-primary transition-smooth"
                    title="Previous Video"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
            ) : (
                <button
                    disabled
                    className="p-2 rounded-lg border border-border bg-background-elevated text-text-secondary/50 
                             cursor-not-allowed"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {nextId ? (
                <Link
                    href={`/dashboard/videos/${nextId}`}
                    className="p-2 rounded-lg border border-border bg-background-elevated text-text-secondary 
                             hover:bg-background-surface hover:text-text-primary transition-smooth"
                    title="Next Video"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            ) : (
                <button
                    disabled
                    className="p-2 rounded-lg border border-border bg-background-elevated text-text-secondary/50 
                             cursor-not-allowed"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}
        </div>
    )
}
