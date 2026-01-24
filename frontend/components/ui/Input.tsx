'use client'

import { forwardRef } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps {
    label?: string
    error?: string
    prefix?: string | LucideIcon
    suffix?: string
    className?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    type?: string
    disabled?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, prefix, suffix, className, ...props }, ref) => {
        const PrefixIcon = typeof prefix === 'function' ? prefix : null

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-brown-700 mb-2">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {prefix && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-400">
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
                            'w-full px-4 py-2.5 rounded-lg border text-brown-800 placeholder:text-brown-300',
                            'focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent',
                            'transition-all',
                            error ? 'border-error focus:ring-error' : 'border-brown-200',
                            prefix && 'pl-10',
                            suffix && 'pr-16',
                            className
                        )}
                        {...props}
                    />

                    {suffix && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <span className="text-sm font-medium text-brown-400">{suffix}</span>
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
