import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'elevated'
}

export default function Card({
    className = '',
    variant = 'default',
    children,
    ...props
}: CardProps) {
    const variants = {
        default: 'bg-background-elevated border border-border',
        glass: 'glass',
        elevated: 'bg-background-surface border border-border',
    }

    return (
        <div
            className={`rounded-xl ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}
