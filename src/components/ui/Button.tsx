import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
        const baseStyles = 'font-medium rounded-lg transition-smooth disabled:opacity-50 disabled:cursor-not-allowed'

        const variants = {
            primary: 'bg-accent hover:bg-accent-hover text-white',
            secondary: 'bg-background-surface hover:bg-background-elevated text-text-primary border border-border',
            ghost: 'hover:bg-background-surface text-text-secondary hover:text-text-primary',
            danger: 'bg-danger hover:bg-danger-muted text-white',
        }

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
        }

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'

export default Button
