'use client'

import { motion } from 'framer-motion'
import { Coins, Shield, Clock, Loader2, Gift, TrendingUp, BarChart3, Layers, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useWallet } from '@/lib/store'
import { useBalance } from '@/lib/hooks/useBalance'
import { useTokenMetadata } from '@/lib/hooks/useTokenMetadata'
import { useKycStatus } from '@/lib/hooks/useKycStatus'
import { usePendingYield } from '@/lib/hooks/usePendingYield'
import { useTokenStats } from '@/lib/hooks/useTokenStats'
import { useEffect, useState, useRef } from 'react'

// ============ ANIMATED NUMBER ============
function AnimatedValue({ value, duration = 1500 }: { value: string; duration?: number }) {
    const [displayed, setDisplayed] = useState('0.00')
    const ref = useRef<HTMLSpanElement>(null)
    const hasAnimated = useRef(false)

    useEffect(() => {
        if (hasAnimated.current || !value || value === '0.00') {
            setDisplayed(value)
            return
        }
        hasAnimated.current = true
        const target = parseFloat(value)
        if (isNaN(target)) { setDisplayed(value); return }

        let start = 0
        const step = target / (duration / 16)
        const timer = setInterval(() => {
            start += step
            if (start >= target) {
                setDisplayed(value)
                clearInterval(timer)
            } else {
                setDisplayed(start.toFixed(2))
            }
        }, 16)
        return () => clearInterval(timer)
    }, [value, duration])

    return <span ref={ref}>{displayed}</span>
}

// ============ SKELETON ============
function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
}

export default function DashboardOverview() {
    const { isConnected, publicKey } = useWallet()
    const { balance, isLoading: balanceLoading } = useBalance()
    const { metadata, isLoading: metadataLoading } = useTokenMetadata()
    const { kycStatus, isLoading: kycLoading } = useKycStatus()
    const { yieldAmount, hasYield, isLoading: yieldLoading, isClaiming, claim } = usePendingYield()
    const { stats, isLoading: statsLoading } = useTokenStats()

    const [showConfetti, setShowConfetti] = useState(false)

    const handleClaim = async () => {
        await claim()
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
    }

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center max-w-md p-8 glass-card rounded-2xl border-white/5">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-10 h-10 text-white/50" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-heading">Connect Wallet</h2>
                    <p className="text-zinc-400 mb-6">Connect your Freighter wallet to access the AstraLink RWA platform.</p>
                </div>
            </div>
        )
    }

    const symbol = 'XLM'
    const displayBalance = balance || '0.00'

    // KYC display helpers
    const getKycStatusDisplay = () => {
        if (kycLoading) return 'Checking...'
        if (!kycStatus) return 'Not Verified'
        if (!kycStatus.kyc_verified) return 'Not Verified'
        const statusMap: Record<string, string> = {
            'Retail': 'Verified (Retail)',
            'Accredited': 'Verified (Accredited)',
            'Institutional': 'Verified (Institutional)'
        }
        return statusMap[kycStatus.investor_status] || 'Verified'
    }

    const kycStatusDisplay = getKycStatusDisplay()
    const isVerified = kycStatus?.kyc_verified
    const kycStatusColor = isVerified ? 'text-success' : 'text-zinc-500'

    // Ownership percentage
    const ownershipPercent = (stats.totalSupply && displayBalance && parseFloat(stats.totalSupply) > 0)
        ? ((parseFloat(displayBalance) / parseFloat(stats.totalSupply)) * 100).toFixed(4)
        : '0.00'

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-6"
        >
            {/* Confetti overlay */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 3, opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="text-6xl"
                    >
                        🎉
                    </motion.div>
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                            animate={{
                                x: (Math.random() - 0.5) * 400,
                                y: (Math.random() - 0.5) * 400,
                                opacity: 0,
                                scale: 0,
                                rotate: Math.random() * 360,
                            }}
                            transition={{ duration: 1.5, delay: Math.random() * 0.3 }}
                            className="absolute text-2xl"
                        >
                            {['💰', '✨', '🪙', '⭐'][i % 4]}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Header Greeting */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-heading">Overview</h1>
                    <p className="text-zinc-400 mt-1">Welcome back, Investor.</p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Portfolio Value</p>
                    <p className="text-2xl font-bold text-white">${displayBalance}</p>
                </div>
            </div>

            {/* ===== NETWORK STATS ROW ===== */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                {[
                    {
                        label: 'Token Name',
                        value: statsLoading ? null : stats.name,
                        icon: Layers,
                        color: 'text-purple-400',
                        bgColor: 'bg-purple-500/10',
                    },
                    {
                        label: 'Symbol',
                        value: statsLoading ? null : stats.symbol,
                        icon: Sparkles,
                        color: 'text-blue-400',
                        bgColor: 'bg-blue-500/10',
                    },
                    {
                        label: 'Total Supply',
                        value: statsLoading ? null : `${parseFloat(stats.totalSupply).toLocaleString()}`,
                        icon: BarChart3,
                        color: 'text-gold-400',
                        bgColor: 'bg-gold-400/10',
                    },
                    {
                        label: 'Your Ownership',
                        value: statsLoading || balanceLoading ? null : `${ownershipPercent}%`,
                        icon: TrendingUp,
                        color: 'text-emerald-400',
                        bgColor: 'bg-emerald-500/10',
                    },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + i * 0.05 }}
                        className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex items-center gap-3"
                    >
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">{stat.label}</p>
                            {stat.value !== null ? (
                                <p className="text-sm font-bold text-white truncate">{stat.value}</p>
                            ) : (
                                <Skeleton className="h-4 w-16 mt-1" />
                            )}
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Hero Card - Glass + Gradient */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl p-8 lg:p-10 group"
            >
                {/* Glow Effects */}
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-gold-400/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-gold-400/30 transition-all duration-700" />
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div>
                        <div className="flex items-center gap-2 text-gold-400 mb-2 font-medium">
                            <Coins className="w-5 h-5" />
                            <span>Total Balance</span>
                        </div>

                        {balanceLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-16 w-64" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-6xl lg:text-7xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-400 tracking-tight">
                                    <AnimatedValue value={displayBalance} />
                                </h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-lg text-zinc-400 font-medium tracking-wide">
                                        {symbol} Tokens
                                    </span>
                                    {metadataLoading && <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Link href="/dashboard/transfer">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 rounded-xl bg-gold-500 text-obsidian-950 font-bold shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all flex items-center gap-2"
                            >
                                <Coins className="w-4 h-4" />
                                Transfer
                            </motion.button>
                        </Link>
                        <Link href="/dashboard/governance">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                                <Shield className="w-4 h-4" />
                                Governance
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Yield Card - Special Glow */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-2xl border border-gold-500/20 bg-gradient-to-br from-gold-500/5 to-transparent p-6 group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-gold-500/10 text-gold-400">
                            <Gift className="w-6 h-6" />
                        </div>
                        {hasYield && (
                            <div className="px-2 py-1 rounded text-xs font-bold bg-gold-500 text-black animate-pulse">
                                READY TO CLAIM
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-zinc-400 font-medium mb-1">Unclaimed Yield</p>
                    {yieldLoading ? (
                        <Skeleton className="h-8 w-32" />
                    ) : (
                        <p className="text-3xl font-bold text-white font-heading">
                            ${parseFloat(yieldAmount).toFixed(2)} <span className="text-sm text-zinc-500 font-sans font-normal">USDC</span>
                        </p>
                    )}

                    <div className="mt-6">
                        <motion.button
                            onClick={handleClaim}
                            disabled={!hasYield || isClaiming || yieldLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                                w-full py-3 rounded-lg font-semibold text-sm transition-all
                                ${hasYield && !isClaiming
                                    ? 'bg-gradient-to-r from-gold-400 to-amber-500 text-black shadow-lg shadow-gold-500/20'
                                    : 'bg-white/5 text-zinc-500 cursor-not-allowed'
                                }
                            `}
                        >
                            {isClaiming ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Claiming...
                                </span>
                            ) : (
                                "Claim Yield"
                            )}
                        </motion.button>
                    </div>
                </motion.div>

                {/* KYC Status Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="glass-card rounded-2xl p-6"
                >
                    <div className="flex justify-between items-start mb-8">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div className={`w-2 h-2 rounded-full ${isVerified ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-zinc-700'}`} />
                    </div>
                    <p className="text-sm text-zinc-400 font-medium mb-1">Identity Status</p>
                    {kycLoading ? (
                        <Skeleton className="h-6 w-40" />
                    ) : (
                        <p className={`text-xl font-bold ${kycStatusColor} font-heading`}>{kycStatusDisplay}</p>
                    )}
                    {isVerified && <p className="text-xs text-zinc-500 mt-2">Access Level: Level 3</p>}
                </motion.div>

                {/* Holding Period Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-2xl p-6"
                >
                    <div className="flex justify-between items-start mb-8">
                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm text-zinc-400 font-medium mb-1">Holding Period</p>
                    <p className="text-xl font-bold text-white font-heading">0 Days</p>
                    <p className="text-xs text-zinc-500 mt-2">Next Unlock: Instant</p>
                </motion.div>
            </div>

            {/* Recent Activity Mini Section */}
            <div className="pt-8 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                    <Link href="/dashboard/history" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">
                        View All →
                    </Link>
                </div>
                <div className="glass-card rounded-xl p-8 text-center">
                    <p className="text-zinc-500">No recent transactions found.</p>
                </div>
            </div>

        </motion.div>
    )
}
