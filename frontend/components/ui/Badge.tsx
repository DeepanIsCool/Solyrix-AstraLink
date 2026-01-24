'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BadgeProps {
    children: React.ReactNode
    variant?: 'success' | 'warning' | 'error' | 'neutral'
    size?: 'sm' | 'md'
    icon?: LucideIcon
    className?: string
}

export function Badge({
    children,
    variant = 'neutral',
    size = 'sm',
    icon: Icon,
    className,
}: BadgeProps) {
    const variants = {
        success: 'bg-success/10 text-success border-success/20',
        warning: 'bg-warning/10 text-warning border-warning/20',
        error: 'bg-error/10 text-error border-error/20',
        neutral: 'bg-brown-100 text-brown-600 border-brown-200',
    }

    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
    }

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border font-medium',
                variants[variant],
                sizes[size],
                className
            )}
        >
            {Icon && <Icon className="w-3 h-3" />}
            {children}
        </span>
    )
}
