'use client'

import { useState, useEffect, useRef } from 'react'
import { generateResearch } from '@/app/actions/ai'
import { motion, AnimatePresence } from 'framer-motion'

type Message = {
    id: string
    role: 'user' | 'ai'
    content: string
    timestamp: number
}

export default function ResearchConsole() {
    const [prompt, setPrompt] = useState('')
    const [messages, setMessages] = useState<Message[]>([])
    const [isThinking, setIsThinking] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Load history on mount
    useEffect(() => {
        const saved = localStorage.getItem('research_chat_history')
        if (saved) {
            try {
                setMessages(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to load chat history')
            }
        }
    }, [])

    // Save history on update
    useEffect(() => {
        localStorage.setItem('research_chat_history', JSON.stringify(messages))
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleResearch = async () => {
        if (!prompt.trim() || isThinking) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: prompt,
            timestamp: Date.now()
        }

        setMessages(prev => [...prev, userMsg])
        setPrompt('')
        setIsThinking(true)

        try {
            const response = await generateResearch(userMsg.content)

            setIsThinking(false)
            setIsTyping(true) // Start typing animation

            if (response.error) {
                const errorMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'ai',
                    content: `Error: ${response.error}`,
                    timestamp: Date.now()
                }
                setMessages(prev => [...prev, errorMsg])
                setIsTyping(false)
            } else if (response.result) {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'ai',
                    content: response.result,
                    timestamp: Date.now()
                }
                setMessages(prev => [...prev, aiMsg])
            }
        } catch (e) {
            setIsThinking(false)
            setIsTyping(false)
        }
    }

    const handleClearHistory = () => {
        setMessages([])
        localStorage.removeItem('research_chat_history')
        setShowClearConfirm(false)
    }

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
            {/* Header */}
            <div className="p-4 border-b border-border bg-background-elevated/50 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                    <span className="text-sm font-medium text-text-secondary">Gemini 2.5 Flash Online</span>
                </div>
                <button
                    onClick={() => setShowClearConfirm(true)}
                    className="text-xs text-text-tertiary hover:text-warning transition-colors px-3 py-1 rounded-full hover:bg-white/5"
                >
                    Clear History
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                <AnimatePresence>
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-4 text-accent">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Deep Research Assistant</h3>
                            <p className="max-w-md">Ready to analyze topics, find trends, and think deeply about your content strategy.</p>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            key={msg.id}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                                max-w-[85%] rounded-2xl p-4 shadow-sm relative
                                ${msg.role === 'user'
                                    ? 'bg-accent text-white rounded-br-none'
                                    : 'bg-background-elevated border border-border text-text-primary rounded-bl-none'
                                }
                            `}>
                                <div className="text-xs opacity-50 mb-1 font-mono uppercase tracking-wider">
                                    {msg.role === 'user' ? 'You' : 'Gemini'}
                                </div>
                                {msg.role === 'ai' && index === messages.length - 1 && isTyping ? (
                                    <TypewriterEffect text={msg.content} onComplete={() => setIsTyping(false)} />
                                ) : (
                                    <div className="whitespace-pre-wrap leading-relaxed">
                                        {msg.content}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {isThinking && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="bg-background-elevated border border-border text-text-secondary rounded-2xl rounded-bl-none p-4 flex items-center gap-3">
                                <span className="text-xs font-medium">Analyzing web results</span>
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background-elevated/30 border-t border-border backdrop-blur-sm z-10">
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleResearch()
                            }
                        }}
                        placeholder="Ask anything... (Enter to send)"
                        className="w-full bg-background-surface/80 border border-border/50 rounded-xl pl-4 pr-14 py-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-none h-[60px] max-h-[120px]"
                    />
                    <button
                        onClick={handleResearch}
                        disabled={isThinking || !prompt.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-accent/25"
                    >
                        {isThinking ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-text-tertiary">
                        AI can make mistakes. Please verify important information.
                    </p>
                </div>
            </div>

            {/* Custom Clear Confirm Modal */}
            <AnimatePresence>
                {showClearConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            className="bg-background-elevated border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-4 text-warning">
                                <div className="p-2 bg-warning/10 rounded-lg">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-text-primary">Clear History?</h3>
                            </div>
                            <p className="text-text-secondary mb-6">
                                This will permanently delete your entire conversation history. This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    className="px-4 py-2 text-text-secondary hover:bg-background-surface rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearHistory}
                                    className="px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning/90 transition-colors font-medium shadow-lg shadow-warning/20"
                                >
                                    Delete Everything
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Helper Component for Typing Effect
function TypewriterEffect({ text, onComplete }: { text: string, onComplete: () => void }) {
    const [displayedText, setDisplayedText] = useState('')

    useEffect(() => {
        let index = 0
        const intervalId = setInterval(() => {
            setDisplayedText((prev) => prev + text.charAt(index))
            index++
            if (index === text.length) {
                clearInterval(intervalId)
                onComplete()
            }
        }, 10) // fast typing speed

        return () => clearInterval(intervalId)
    }, [text, onComplete])

    return <div className="whitespace-pre-wrap leading-relaxed">{displayedText}</div>
}
