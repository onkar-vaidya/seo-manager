'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import Toast, { ToastMessage, ToastType } from '@/components/ui/Toast'

interface BackgroundAction {
    id: string
    action: () => Promise<any>
    onSuccess?: (result: any) => void
    onError?: (error: any) => void
    successMessage?: string
    errorMessage?: string
}

interface BackgroundActionContextType {
    addBackgroundAction: (action: BackgroundAction) => void
}

const BackgroundActionContext = createContext<BackgroundActionContextType | undefined>(undefined)

export function useBackgroundAction() {
    const context = useContext(BackgroundActionContext)
    if (!context) {
        throw new Error('useBackgroundAction must be used within a BackgroundActionProvider')
    }
    return context
}

export default function BackgroundActionProvider({ children }: { children: ReactNode }) {
    const [queue, setQueue] = useState<BackgroundAction[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [toasts, setToasts] = useState<ToastMessage[]>([])

    // Toast Management
    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(7)
        setToasts(prev => [...prev, { id, message, type }])
        // Auto remove
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000)
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const addBackgroundAction = useCallback((action: BackgroundAction) => {
        setQueue(prev => [...prev, action])
    }, [])

    // Queue Processor
    useEffect(() => {
        if (queue.length === 0 || isProcessing) return

        const processQueue = async () => {
            setIsProcessing(true)
            const currentAction = queue[0]

            try {
                const result = await currentAction.action()
                
                if (currentAction.onSuccess) {
                    currentAction.onSuccess(result)
                }
                
                if (currentAction.successMessage) {
                    addToast(currentAction.successMessage, 'success')
                }
            } catch (error) {
                console.error(`Background action ${currentAction.id} failed:`, error)
                
                if (currentAction.onError) {
                    currentAction.onError(error)
                }
                
                if (currentAction.errorMessage) {
                    addToast(currentAction.errorMessage, 'error')
                } else {
                    addToast('Action failed', 'error')
                }
            } finally {
                // Remove processed item and continue
                setQueue(prev => prev.slice(1))
                setIsProcessing(false)
            }
        }

        processQueue()
    }, [queue, isProcessing, addToast])

    return (
        <BackgroundActionContext.Provider value={{ addBackgroundAction }}>
            {children}
            <Toast toasts={toasts} removeToast={removeToast} />
        </BackgroundActionContext.Provider>
    )
}
