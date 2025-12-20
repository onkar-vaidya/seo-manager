'use client'

import { Task } from '@/lib/types'

interface TaskBadgeProps {
    status: Task['status']
}

export default function TaskBadge({ status }: TaskBadgeProps) {
    const variants = {
        pending: {
            bg: 'bg-background-elevated',
            text: 'text-text-secondary',
            border: 'border-border',
            label: 'Pending'
        },
        in_progress: {
            bg: 'bg-accent/10',
            text: 'text-accent',
            border: 'border-accent/30',
            label: 'In Progress'
        },
        completed: {
            bg: 'bg-success/10',
            text: 'text-success',
            border: 'border-success/30',
            label: 'Done'
        }
    }

    const current = variants[status] || variants.pending

    return (
        <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
            ${current.bg} ${current.text} ${current.border}
        `}>
            {current.label}
        </span>
    )
}
