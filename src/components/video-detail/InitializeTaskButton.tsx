'use client'

import { useState, useTransition } from 'react'
import { createTask } from '@/app/actions/tasks'
import { toast } from 'react-hot-toast'

export default function InitializeTaskButton({ videoId }: { videoId: string }) {
    const [isPending, startTransition] = useTransition()

    const handleInitialize = () => {
        startTransition(async () => {
            try {
                await createTask(videoId)
                toast.success('Task initialized successfully')
            } catch (error) {
                console.error(error)
                toast.error('Failed to initialize task')
            }
        })
    }

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <button
                onClick={handleInitialize}
                disabled={isPending}
                className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg 
                         hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
            >
                {isPending ? 'Initializing...' : 'Initialize Task Assignment'}
            </button>
            <p className="mt-2 text-xs text-text-tertiary">
                Create a task to assign this video to a team member.
            </p>
        </div>
    )
}
