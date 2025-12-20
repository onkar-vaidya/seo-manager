'use client'

import { useState } from 'react'
import { Task } from '@/lib/types'
import { assignTask, AssignableUser } from '@/app/actions/tasks'

interface AssignUserProps {
    task: Task
    currentUserInfo: { id: string; role: string }
    assignableUsers: AssignableUser[]
    canEdit: boolean
}

export default function AssignUser({
    task,
    currentUserInfo,
    assignableUsers,
    canEdit
}: AssignUserProps) {
    const [isLoading, setIsLoading] = useState(false)

    async function handleAssign(e: React.ChangeEvent<HTMLSelectElement>) {
        const userId = e.target.value || null
        if (userId === task.assigned_to) return

        setIsLoading(true)
        try {
            await assignTask(task.id, task.video_id, userId)
        } catch (error) {
            console.error('Failed to assign task:', error)
            alert('Failed to assign task')
        } finally {
            setIsLoading(false)
        }
    }

    // Helper to format user label (since we lack email/name)
    const formatUserLabel = (u: AssignableUser) => {
        if (u.user_id === currentUserInfo.id) return 'Me'
        return `User ${u.user_id.substring(0, 4)}... (${u.role})`
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary uppercase tracking-wide">
                Assignee
            </span>
            <div className="relative">
                <select
                    value={task.assigned_to || ''}
                    onChange={handleAssign}
                    disabled={!canEdit || isLoading}
                    className="
                        appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs border border-border bg-background-surface
                        text-text-primary cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20
                        hover:bg-background-elevated disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    <option value="">Unassigned</option>
                    {assignableUsers.map(user => (
                        <option key={user.user_id} value={user.user_id}>
                            {formatUserLabel(user)}
                        </option>
                    ))}
                </select>

                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    )
}
