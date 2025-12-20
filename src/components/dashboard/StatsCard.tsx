import { ReactNode } from 'react'

interface StatsCardProps {
    title: string
    value: string | number
    icon: ReactNode
    trend?: string
    color?: 'primary' | 'success' | 'warning' | 'info'
}

export default function StatsCard({ title, value, icon, trend, color = 'primary' }: StatsCardProps) {
    const colorStyles = {
        primary: 'bg-accent/10 text-accent',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        info: 'bg-blue-500/10 text-blue-500'
    }

    return (
        <div className="glass p-6 rounded-xl flex items-start justify-between">
            <div>
                <p className="text-text-tertiary text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-text-primary">{value}</h3>
                {trend && (
                    <p className="text-xs text-text-secondary mt-2">
                        {trend}
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
                {icon}
            </div>
        </div>
    )
}
