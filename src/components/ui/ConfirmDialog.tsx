'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface ConfirmDialogProps {
    isOpen: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
    isLoading?: boolean
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    isLoading = false,
}: ConfirmDialogProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative glass rounded-xl p-6 max-w-md w-full space-y-6 shadow-2xl">
                {/* Title */}
                <h3 className="text-lg font-medium text-text-primary">
                    {title}
                </h3>

                {/* Message */}
                <p className="text-sm text-text-secondary leading-relaxed">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    )
}
