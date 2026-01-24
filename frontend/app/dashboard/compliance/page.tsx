'use client'

import { motion } from 'framer-motion'
import { Shield, CheckCircle, Globe, TrendingUp, DollarSign, Clock, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useKycStatus } from '@/lib/hooks/useKycStatus'
import { useWallet } from '@/lib/store'

const jurisdictionMap: { [key: string]: { name: string; flag: string } } = {
    'US': { name: 'United States', flag: '🇺🇸' },
    'SG': { name: 'Singapore', flag: '🇸🇬' },
    'EU': { name: 'European Union', flag: '🇪🇺' },
    'AE': { name: 'UAE', flag: '🇦🇪' },
}

export default function CompliancePage() {
    const { publicKey } = useWallet()
    const { kycStatus, isLoading } = useKycStatus()

    if (!publicKey) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                    <Shield className="w-16 h-16 text-brown-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-brown-800 mb-2">Connect Your Wallet</h2>
                    <p className="text-brown-400">Connect wallet to view compliance status</p>
                </div>
            </div>
        )
    }

    const verified = kycStatus?.kyc_verified || false
    const investorType = kycStatus?.investor_status || 'Retail'
    const jurisdictions = kycStatus?.jurisdictions || []

    return (
        <div className="max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-brown-800 mb-2">Compliance Dashboard</h1>
                <p className="text-brown-400">Your KYC status and transfer restrictions</p>
            </div>

            {/* KYC Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Card variant="gradient" padding="lg">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                            <span className="ml-3 text-white">Loading KYC status...</span>
                        </div>
                    ) : (
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                                    <Shield className="w-4 h-4" />
                                    <span>KYC Status</span>
                                </div>
                                <h2 className="text-3xl font-bold mb-2">
                                    {verified ? 'Verified ✓' : 'Not Verified'}
                                </h2>
                                <Badge variant={verified ? "success" : "warning"} className="bg-white/20 border-white/30 text-white">
                                    {investorType} Investor
                                </Badge>
                            </div>
                            <div className="text-right">
                                <p className="text-white/70 text-sm mb-1">Jurisdiction</p>
                                <div className="flex items-center gap-2 text-white text-lg">
                                    <Globe className="w-5 h-5" />
                                    <span className="font-semibold">
                                        {jurisdictions.length > 0
                                            ? jurisdictionMap[jurisdictions[0]]?.name || 'Unknown'
                                            : 'Not Set'
                                        }
                                    </span>
                                </div>
                                <p className="text-white/60 text-xs mt-2">
                                    {kycStatus?.accreditation_expiry
                                        ? `Expires: ${new Date(kycStatus.accreditation_expiry * 1000).toLocaleDateString()}`
                                        : 'No expiry set'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Restrictions Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Holding Period */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-warning/10">
                                <Clock className="w-5 h-5 text-warning" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-brown-800">Holding Period</h3>
                                <p className="text-xs text-brown-400">Reg D Compliance (90 days)</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-bold text-brown-800">0 / 90 days</span>
                            <div className="text-right">
                                <p className="text-xs text-brown-400">Demo Mode</p>
                                <p className="text-sm text-success font-medium">Transfers Allowed</p>
                            </div>
                        </div>

                        <div className="h-2 bg-brown-100 rounded-full overflow-hidden">
                            <div className="h-full w-0 bg-gradient-to-r from-warning to-success" />
                        </div>
                    </Card>
                </motion.div>

                {/* Ownership Limit */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-success/10">
                                <TrendingUp className="w-5 h-5 text-success" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-brown-800">Ownership Limit</h3>
                                <p className="text-xs text-brown-400">Maximum 10% per wallet</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-bold text-brown-800">--%</span>
                            <div className="text-right">
                                <p className="text-xs text-brown-400">Calculating...</p>
                                <p className="text-sm text-success font-medium">Within Limits</p>
                            </div>
                        </div>

                        <div className="h-2 bg-brown-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '0%' }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="h-full bg-gradient-to-r from-success to-success/80"
                            />
                        </div>
                    </Card>
                </motion.div>

                {/* Daily Transfer Limit */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-brown-600/10">
                                <DollarSign className="w-5 h-5 text-brown-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-brown-800">Daily Transfer Limit</h3>
                                <p className="text-xs text-brown-400">Resets at midnight UTC</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-bold text-brown-800">
                                {kycStatus ? `$${(Number(kycStatus.daily_limit_used) / 1000000).toFixed(0)}k` : '$0'}
                            </span>
                            <div className="text-right">
                                <p className="text-xs text-brown-400">of $100k limit</p>
                                <p className="text-sm text-brown-600 font-medium">
                                    ${100 - (kycStatus ? Number(kycStatus.daily_limit_used) / 1000000 : 0)}k Remaining
                                </p>
                            </div>
                        </div>

                        <div className="h-2 bg-brown-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${kycStatus ? (Number(kycStatus.daily_limit_used) / 100000000) * 100 : 0}%` }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="h-full bg-gradient-to-r from-brown-600 to-brown-500"
                            />
                        </div>
                    </Card>
                </motion.div>

                {/* Allowed Jurisdictions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-success/10">
                                <Globe className="w-5 h-5 text-success" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-brown-800">Allowed Jurisdictions</h3>
                                <p className="text-xs text-brown-400">Multi-jurisdiction support</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(jurisdictionMap).map(([code, info]) => {
                                const isAllowed = jurisdictions.includes(code)
                                return (
                                    <div
                                        key={code}
                                        className={`flex items-center gap-2 p-2 rounded-lg ${isAllowed
                                                ? 'bg-success/5 border border-success/20'
                                                : 'bg-brown-50 border border-brown-100 opacity-50'
                                            }`}
                                    >
                                        <span className="text-xl">{info.flag}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-brown-800 truncate">
                                                {info.name}
                                            </p>
                                            <p className="text-xs text-brown-400">{code}</p>
                                        </div>
                                        {isAllowed && <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />}
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Status Message */}
            {!verified && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-4 rounded-lg bg-warning/10 border border-warning/20"
                >
                    <p className="text-sm text-warning font-medium">
                        ⚠️ Your account is not KYC verified. Contact a governor to update your compliance status.
                    </p>
                </motion.div>
            )}
        </div>
    )
}
