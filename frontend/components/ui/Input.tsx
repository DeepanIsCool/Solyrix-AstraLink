'use client'

import { forwardRef } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
    label?: string
    error?: string
    prefix?: string | LucideIcon
    suffix?: string
    className?: string
    // value and onChange are already included in InputHTMLAttributes
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, prefix, suffix, className, ...props }, ref) => {
        const PrefixIcon = typeof prefix === 'function' ? prefix : null

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {prefix && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                            {PrefixIcon ? (
                                <PrefixIcon className="w-5 h-5" />
                            ) : (
                                <span className="text-sm">{typeof prefix === 'string' ? prefix : ''}</span>
                            )}
                        </div>
                    )}

                    <input
                        ref={ref}
                        className={cn(
                            'w-full px-4 py-3 rounded-xl border bg-black/20 text-white placeholder:text-zinc-600',
                            'focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50',
                            'transition-all duration-200',
                            error ? 'border-red-500 focus:ring-red-500' : 'border-white/10',
                            prefix && 'pl-10',
                            suffix && 'pr-16',
                            className
                        )}
                        {...props}
                    />

                    {suffix && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <span className="text-sm font-medium text-zinc-500">{suffix}</span>
                        </div>
                    )}
                </div>

                {error && (
                    <p className="mt-1.5 text-sm text-error">{error}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
