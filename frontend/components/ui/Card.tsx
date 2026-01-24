'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps {
    children: React.ReactNode
    variant?: 'default' | 'gradient' | 'outlined'
    padding?: 'sm' | 'md' | 'lg'
    hover?: boolean
    className?: string
}

export function Card({
    children,
    variant = 'default',
    padding = 'md',
    hover = false,
    className,
}: CardProps) {
    const variants = {
        default: 'bg-white border border-brown-200 shadow-sm',
        gradient: 'bg-gradient-to-br from-brown-600 to-brown-500 text-white shadow-lg',
        outlined: 'bg-transparent border-2 border-brown-200',
    }

    const paddings = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    }

    return (
        <motion.div
            whileHover={hover ? { scale: 1.01, boxShadow: '0 10px 15px rgba(122, 94, 69, 0.1)' } : undefined}
            transition={{ duration: 0.2 }}
            className={cn(
                'rounded-lg',
                variants[variant],
                paddings[padding],
                className
            )}
        >
            {children}
        </motion.div>
    )
}
