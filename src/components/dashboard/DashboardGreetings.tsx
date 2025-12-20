'use client'

import { useState, useEffect } from 'react'

const GREETINGS = [
    // Standard Welcomes
    "Welcome back! Ready to achieve great things today? ✨",
    "Hello! Hope you're having a productive day. 💼",
    "Great to see you again. Let's make today count! �",
    "Welcome aboard. Your dashboard is ready. 📊",
    "Good, better, best. Never let it rest. 🌟",
    "Focus on being productive instead of busy. 🎯",
    "Small progress is still progress. Keep going. 🐢",
    "Quality means doing it right when no one is looking. �",
    "Success is the sum of small efforts, repeated day in and day out. �",
    "The only way to do great work is to love what you do. ❤️",
    "Don't count the days, make the days count. �️",
    "Excellence is not an act, but a habit. 🏆",
    "Believe you can and you're halfway there. �",
    "Your limitation—it's only your imagination. 🌈",
    "Push yourself, because no one else is going to do it for you. �",
    "Great things never come from comfort zones. 🏔️",
    "Dream it. Wish it. Do it. ✨",
    "Success doesn't just find you. You have to go out and get it. �‍♂️",
    "The harder you work for something, the greater you'll feel when you achieve it. 😌",
    "Dream bigger. Do bigger. 🔭",
    "Don't stop when you're tired. Stop when you're done. �",
    "Wake up with determination. Go to bed with satisfaction. 🛌",
    "Do something today that your future self will thank you for. �",
    "Little things make big days. 🌻",
    "It's going to be hard, but hard does not mean impossible. 🧱",
    "Don't wait for opportunity. Create it. �",
    "Sometimes later becomes never. Do it now. ⏰",
    "The key to success is to start before you are ready. �️",
    "Dreaming, after all, is a form of planning. 📝",
    "You don't have to be great to start, but you have to start to be great. �"
]

export default function DashboardGreetings() {
    const [greeting, setGreeting] = useState('')
    const [fade, setFade] = useState(true)

    useEffect(() => {
        // Initial pick
        const pickRandom = () => GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
        setGreeting(pickRandom())

        const interval = setInterval(() => {
            // Fade out
            setFade(false)

            // Wait for fade out, then change text and fade in
            setTimeout(() => {
                setGreeting(pickRandom())
                setFade(true)
            }, 500) // 500ms match css transition

        }, 10000) // Every 10 seconds

        return () => clearInterval(interval)
    }, [])

    if (!greeting) return null

    return (
        <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent inline-block">
                Welcome Back 👋
            </h1>
            <div className="h-8 mt-2 overflow-hidden">
                <p
                    className={`text-text-secondary text-lg font-medium italic transition-opacity duration-500 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    "{greeting}"
                </p>
            </div>
        </div>
    )
}
