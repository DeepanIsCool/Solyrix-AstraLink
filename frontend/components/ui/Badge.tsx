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
        success: 'bg-green-500/10 text-green-400 border-green-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        error: 'bg-red-500/10 text-red-400 border-red-500/20',
        neutral: 'bg-white/5 text-zinc-400 border-white/10',
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
