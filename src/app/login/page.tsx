'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            router.refresh()
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'An error occurred during login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-medium text-text-primary mb-2">
                        Welcome back
                    </h1>
                    <p className="text-text-secondary">
                        Sign in to your account
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="glass rounded-xl p-8 space-y-6">
                        {/* Email Input */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-text-secondary mb-2"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-background-elevated border border-border rounded-lg 
                         text-text-primary placeholder:text-text-tertiary
                         focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                         transition-smooth"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-text-secondary mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-background-elevated border border-border rounded-lg 
                         text-text-primary placeholder:text-text-tertiary
                         focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                         transition-smooth"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg">
                                <p className="text-sm text-danger">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-3 bg-accent hover:bg-accent-hover 
                       text-white font-medium rounded-lg
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-smooth"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
