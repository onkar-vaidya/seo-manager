'use server'

import { Task } from '@/lib/types'
import { getAssignableUsers } from '@/app/actions/tasks'
import { formatDate } from '@/lib/utils'
import AssignUser from './AssignUser'
import StatusSelector from './StatusSelector'

interface TaskPanelProps {
    task: Task
    currentUserInfo: { id: string; role: string }
}

export default async function TaskPanel({ task, currentUserInfo }: TaskPanelProps) {
    const assignableUsers = await getAssignableUsers()
    const canEdit = currentUserInfo.role === 'admin' || currentUserInfo.role === 'editor'

    return (
        <div className="glass rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-lg font-medium text-text-primary">
                        Task Status
                    </h3>
                    <p className="text-xs text-text-tertiary">
                        Created {formatDate(task.created_at)}
                    </p>
                </div>
                <StatusSelector task={task} canEdit={canEdit} />
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
                <AssignUser
                    task={task}
                    currentUserInfo={currentUserInfo}
                    assignableUsers={assignableUsers}
                    canEdit={canEdit}
                />
            </div>
        </div>
    )
}
