import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-text-secondary mb-2"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`
            w-full px-4 py-3 bg-background-elevated border rounded-lg 
            text-text-primary placeholder:text-text-tertiary
            focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
            transition-smooth
            ${error ? 'border-danger' : 'border-border'}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-danger">{error}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input
