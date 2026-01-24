'use client'

import { motion } from 'framer-motion'
import { Coins, Shield, Clock, Loader2, Gift } from 'lucide-react'
import Link from 'next/link'
import { useWallet } from '@/lib/store'
import { useBalance } from '@/lib/hooks/useBalance'
import { useTokenMetadata } from '@/lib/hooks/useTokenMetadata'
import { useKycStatus } from '@/lib/hooks/useKycStatus'
import { usePendingYield } from '@/lib/hooks/usePendingYield'

export default function DashboardOverview() {
    const { isConnected, publicKey } = useWallet()
    const { balance, isLoading: balanceLoading } = useBalance()
    const { metadata, isLoading: metadataLoading } = useTokenMetadata()
    const { kycStatus, isLoading: kycLoading } = useKycStatus()
    const { yieldAmount, hasYield, isLoading: yieldLoading, isClaiming, claim } = usePendingYield()

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                    <Shield className="w-16 h-16 text-brown-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-brown-800 mb-2">Connect Your Wallet</h2>
                    <p className="text-brown-400">Please connect your Freighter wallet to access the dashboard</p>
                </div>
            </div>
        )
    }

    const symbol = 'XLM'
    const displayBalance = balance || '0.00'

    // Format KYC status for display
    const getKycStatusDisplay = () => {
        if (kycLoading) return 'Checking...'
        if (!kycStatus) return 'Not Verified'
        if (!kycStatus.kyc_verified) return 'Not Verified'

        // Map investor status to readable format
        const statusMap: Record<string, string> = {
            'Retail': 'Verified (Retail)',
            'Accredited': 'Verified (Accredited)',
            'Institutional': 'Verified (Institutional)'
        }
        return statusMap[kycStatus.investor_status] || 'Verified'
    }

    const kycStatusDisplay = getKycStatusDisplay()
    const kycStatusColor = kycStatus?.kyc_verified ? 'text-success' : 'text-warning'

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl"
        >
            {/* Balance Hero */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-8 p-8 rounded-xl bg-gradient-to-br from-brown-600 to-brown-500 text-white shadow-xl"
            >
                <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                    <Coins className="w-4 h-4" />
                    <span>Total Balance</span>
                </div>

                {balanceLoading ? (
                    <div className="flex items-center gap-3 mb-1">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-2xl text-white/70">Loading balance...</span>
                    </div>
                ) : (
                    <>
                        <div className="text-5xl font-bold mb-1">{displayBalance}</div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl text-white/80">{symbol} Tokens</span>
                            {metadataLoading && (
                                <>
                                    <span className="text-white/50">•</span>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </>
                            )}
                        </div>
                    </>
                )}
            </motion.div>

            {/* Yield Claim Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-8 p-6 rounded-xl bg-gradient-to-br from-amber-50 via-emerald-50 to-amber-50 border-2 border-amber-200 shadow-lg"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-gradient-to-br from-amber-400 to-emerald-500">
                            <Gift className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-brown-500 font-medium">Unclaimed Yield</p>
                            {yieldLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                                    <span className="text-brown-400">Loading...</span>
                                </div>
                            ) : (
                                <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-emerald-600 bg-clip-text text-transparent">
                                    ${parseFloat(yieldAmount).toFixed(2)} USDC
                                </p>
                            )}
                        </div>
                    </div>

                    {hasYield && !yieldLoading && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={claim}
                            disabled={isClaiming}
                            className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-500 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {isClaiming ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Claiming...
                                </span>
                            ) : (
                                'Claim Now'
                            )}
                        </motion.button>
                    )}

                    {!hasYield && !yieldLoading && (
                        <p className="text-sm text-brown-400 italic">No yield available to claim</p>
                    )}
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Available', value: displayBalance, icon: Coins, color: 'text-brown-600', loading: balanceLoading },
                    { label: 'KYC Status', value: kycStatusDisplay, icon: Shield, color: kycStatusColor, loading: kycLoading },
                    { label: 'Holding Period', value: '0 days', icon: Clock, color: 'text-brown-400', loading: false },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="p-6 rounded-lg bg-white border border-brown-200 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            {stat.loading ? (
                                <Loader2 className="w-5 h-5 text-brown-400 animate-spin" />
                            ) : (
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            )}
                            <span className="text-sm text-brown-400">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-semibold text-brown-800">{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 rounded-lg bg-white border border-brown-200"
            >
                <h3 className="text-lg font-semibold text-brown-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/dashboard/transfer">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 px-4 rounded-lg bg-brown-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                        >
                            Transfer Tokens
                        </motion.button>
                    </Link>
                    <Link href="/dashboard/governance">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 px-4 rounded-lg bg-white border-2 border-brown-600 text-brown-600 font-medium hover:bg-brown-50 transition-all"
                        >
                            View Governance
                        </motion.button>
                    </Link>
                </div>
            </motion.div>

            {/* Contract Info */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 p-4 rounded-lg bg-brown-50/50 border border-brown-100"
            >
                <div className="text-xs text-brown-400 space-y-1">
                    <div className="flex justify-between">
                        <span>Contract ID:</span>
                        <span className="font-mono text-brown-600">CBYZE6XD6NXCS3SMRI...</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Your Address:</span>
                        <span className="font-mono text-brown-600">
                            {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
                        </span>
                    </div>
                    {metadata && !metadataLoading && (
                        <>
                            <div className="flex justify-between">
                                <span>Token Name:</span>
                                <span className="font-medium text-brown-600">{metadata.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total Supply:</span>
                                <span className="font-medium text-brown-600">{metadata.totalSupply} {symbol}</span>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}
