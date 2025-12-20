'use server'

import { getComments } from '@/app/actions/comments'
import { formatDate } from '@/lib/utils'
import AddComment from './AddComment'

interface CommentsSectionProps {
    videoId: string
    currentUserInfo: { id: string; role: string }
}

export default async function CommentsSection({ videoId, currentUserInfo }: CommentsSectionProps) {
    const comments = await getComments(videoId)
    const canEdit = currentUserInfo.role === 'admin' || currentUserInfo.role === 'editor'

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-text-primary">
                Comments
            </h3>

            {/* List */}
            <div className="space-y-4">
                {comments.length > 0 ? (
                    comments.map(comment => {
                        const isMe = comment.user_id === currentUserInfo.id
                        return (
                            <div key={comment.id} className="glass p-4 rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-text-primary">
                                        {isMe ? 'Me' : `User ${comment.user_id.substring(0, 4)}...`}
                                    </span>
                                    <span className="text-xs text-text-tertiary">
                                        {formatDate(comment.created_at)}
                                    </span>
                                </div>
                                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                                    {comment.comment}
                                </p>
                            </div>
                        )
                    })
                ) : (
                    <p className="text-sm text-text-tertiary italic">
                        No comments yet.
                    </p>
                )}
            </div>

            {/* Add Form */}
            <AddComment videoId={videoId} canEdit={canEdit} />
        </div>
    )
}
