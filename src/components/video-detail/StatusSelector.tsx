'use client'

import { useState } from 'react'
import { Task } from '@/lib/types'
import { updateTaskStatus } from '@/app/actions/tasks'

interface StatusSelectorProps {
    task: Task
    canEdit: boolean
}

const STATUS_OPTIONS: { value: Task['status']; label: string; color: string }[] = [
    { value: 'pending', label: 'Pending', color: 'bg-background-elevated text-text-secondary border-border' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-accent/10 text-accent border-accent/20' },
    { value: 'completed', label: 'Done', color: 'bg-success/10 text-success border-success/20' },
]

export default function StatusSelector({ task, canEdit }: StatusSelectorProps) {
    const [isLoading, setIsLoading] = useState(false)

    async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const newStatus = e.target.value as Task['status']
        if (newStatus === task.status) return

        setIsLoading(true)
        try {
            await updateTaskStatus(task.id, task.video_id, newStatus)
        } catch (error) {
            console.error('Failed to update status:', error)
            alert('Failed to update status')
        } finally {
            setIsLoading(false)
        }
    }

    const currentOption = STATUS_OPTIONS.find(o => o.value === task.status)

    return (
        <div className="relative">
            <select
                value={task.status}
                onChange={handleStatusChange}
                disabled={!canEdit || isLoading}
                className={`
                    appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium border
                    cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20
                    ${currentOption?.color}
                    ${!canEdit ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}
                `}
            >
                {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    )
}
