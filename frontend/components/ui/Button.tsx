'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    icon?: LucideIcon
    iconPosition?: 'left' | 'right'
    loading?: boolean
    children: React.ReactNode
    className?: string
    disabled?: boolean
    onClick?: () => void
    type?: 'button' | 'submit' | 'reset'
}

export function Button({
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    children,
    className,
    disabled,
    onClick,
    type = 'button',
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2'

    const variants = {
        primary: 'bg-brown-600 text-white hover:bg-brown-700 focus:ring-brown-500 shadow-md hover:shadow-lg disabled:bg-brown-200',
        secondary: 'bg-white border-2 border-brown-600 text-brown-600 hover:bg-brown-50 focus:ring-brown-500',
        ghost: 'bg-transparent text-brown-600 hover:bg-brown-50',
        danger: 'bg-error text-white hover:bg-error/90 focus:ring-error shadow-md',
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    }

    return (
        <motion.div
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            className="inline-block"
        >
            <button
                type={type}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    (disabled || loading) && 'opacity-50 cursor-not-allowed',
                    className
                )}
                disabled={disabled || loading}
                onClick={onClick}
            >
                {loading && (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {!loading && Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
                {children}
                {!loading && Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
            </button>
        </motion.div>
    )
}
