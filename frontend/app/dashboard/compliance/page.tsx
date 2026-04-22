'use client'

import { Badge } from '@/components/ui/Badge'
import { identityContract } from '@/lib/contract'
import { useKycStatus } from '@/lib/hooks/useKycStatus'
import { useToast, useWallet } from '@/lib/store'
import { LogInWithAnonAadhaar, useAnonAadhaar } from '@anon-aadhaar/react'
import { motion } from 'framer-motion'
import { BadgeCheck, Clock, DollarSign, Fingerprint, Globe, Loader2, Shield, Sparkles, TrendingUp } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const jurisdictionMap: { [key: string]: { name: string; flag: string } } = {
    'US': { name: 'United States', flag: '🇺🇸' },
    'SG': { name: 'Singapore', flag: '🇸🇬' },
    'EU': { name: 'European Union', flag: '🇪🇺' },
    'AE': { name: 'UAE', flag: '🇦🇪' },
}

export default function CompliancePage() {
    const { publicKey } = useWallet()
    const { addToast } = useToast()
    const { kycStatus, isLoading } = useKycStatus()

    // Anon Aadhaar hook
    const [anonAadhaar] = useAnonAadhaar()

    // SBT verification state
    const [hasSBT, setHasSBT] = useState(false)
    const [isCheckingSBT, setIsCheckingSBT] = useState(false)
    const [isSubmittingToRelayer, setIsSubmittingToRelayer] = useState(false)
    const [relayerError, setRelayerError] = useState<string | null>(null)

    // Track if we've already submitted this proof to prevent duplicates
    const submittedProofRef = useRef<string | null>(null)

    // Check SBT status
    const checkSBTStatus = useCallback(async () => {
        if (!publicKey) {
            setHasSBT(false)
            return
        }
        setIsCheckingSBT(true)
        try {
            const status = await identityContract.checkSBT(publicKey)
            setHasSBT(status)
        } catch (err) {
            console.error('Failed to check SBT status:', err)
            setHasSBT(false)
        } finally {
            setIsCheckingSBT(false)
        }
    }, [publicKey])

    useEffect(() => {
        checkSBTStatus()

        // Clear corrupted Anon Aadhaar state if it exists
        try {
            const anonAadhaarState = localStorage.getItem('anonAadhaar')
            if (anonAadhaarState) {
                const parsed = JSON.parse(anonAadhaarState)
                if (parsed.status === 'logging-in') {
                    // Clear corrupted state
                    localStorage.removeItem('anonAadhaar')
                }
            }
        } catch {
            // If parsing fails, clear the storage
            localStorage.removeItem('anonAadhaar')
        }
    }, [checkSBTStatus])

    // Submit proof to relayer API for on-chain verification
    const submitToRelayer = useCallback(async (proof: unknown) => {
        if (!publicKey) {
            addToast('Please connect your wallet first', 'error')
            return
        }

        // Prevent duplicate submissions
        const proofHash = JSON.stringify(proof).slice(0, 100)
        if (submittedProofRef.current === proofHash) {
            console.log('Proof already submitted, skipping...')
            return
        }
        submittedProofRef.current = proofHash

        setIsSubmittingToRelayer(true)
        setRelayerError(null)

        try {
            console.log('Submitting proof to relayer...')

            const response = await fetch('/api/verify-aadhaar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    proof: proof,
                    userAddress: publicKey,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Relayer verification failed')
            }

            console.log('Relayer response:', data)
            addToast('🎉 ZK-Identity Verified! Your SBT has been minted on-chain.', 'success')

            // Refresh SBT status
            await checkSBTStatus()

        } catch (err) {
            console.error('Relayer submission failed:', err)
            const errorMessage = err instanceof Error ? err.message : 'Verification failed'
            setRelayerError(errorMessage)
            addToast(errorMessage, 'error')
            // Reset submission tracking so user can retry
            submittedProofRef.current = null
        } finally {
            setIsSubmittingToRelayer(false)
        }
    }, [publicKey, addToast, checkSBTStatus])

    // Listen for Anon Aadhaar login success and submit to relayer
    // Note: anonAadhaarProofs is keyed by nullifierSeed (1234567890 as used in LogInWithAnonAadhaar)
    const NULLIFIER_SEED = 1234567890
    const currentProof = anonAadhaar.status === 'logged-in' ? anonAadhaar.anonAadhaarProofs?.[NULLIFIER_SEED] : null

    useEffect(() => {
        if (
            anonAadhaar.status === 'logged-in' &&
            !hasSBT &&
            publicKey &&
            !isSubmittingToRelayer &&
            currentProof
        ) {
            addToast('ZK Proof generated! Submitting to relayer...', 'info')
            submitToRelayer(currentProof)
        }
    }, [anonAadhaar.status, currentProof, hasSBT, publicKey, isSubmittingToRelayer, addToast, submitToRelayer])

    // Reset error when user logs out
    useEffect(() => {
        if (anonAadhaar.status === 'logged-out') {
            setRelayerError(null)
            submittedProofRef.current = null
        }
    }, [anonAadhaar.status])

    if (!publicKey) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="text-center max-w-md p-8 glass-card rounded-2xl">
                    <Shield className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2 font-heading">Connect Your Wallet</h2>
                    <p className="text-zinc-400">Please connect your Freighter wallet to view compliance status</p>
                </div>
            </div>
        )
    }

    const verified = kycStatus?.kyc_verified || false
    const investorType = kycStatus?.investor_status || 'Retail'
    const jurisdictions = kycStatus?.jurisdictions || []

    // Determine UI state based on Anon Aadhaar status
    const isLoggingIn = anonAadhaar.status === 'logging-in'
    const isVerificationInProgress = isLoggingIn || isSubmittingToRelayer

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 font-heading">Compliance Dashboard</h1>
                    <p className="text-zinc-400">Your KYC status and transfer restrictions</p>
                </div>
                <div className="anon-aadhaar-wrapper">
                    <LogInWithAnonAadhaar nullifierSeed={1234567890} />
                </div>
            </div>

            {/* ZK Identity Verification Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className={`glass-card rounded-2xl p-8 border-white/10 ${hasSBT ? 'bg-green-900/10 border-green-500/20 shadow-lg shadow-green-500/10' : ''}`}>
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                        <div className="flex items-start gap-5">
                            <div className={`p-4 rounded-xl ${hasSBT ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-zinc-500'}`}>
                                {hasSBT ? (
                                    <BadgeCheck className="w-8 h-8" />
                                ) : isVerificationInProgress ? (
                                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                                ) : (
                                    <Fingerprint className="w-8 h-8" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-bold text-white font-heading">
                                        ZK-Identity Verification
                                    </h3>
                                    {isCheckingSBT && (
                                        <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                                    )}
                                </div>
                                <p className="text-sm text-zinc-400 mb-4 max-w-xl leading-relaxed">
                                    Privacy-preserving KYC via Anon Aadhaar ZK Proofs. Verify your identity without revealing personal data on-chain.
                                </p>

                                {hasSBT ? (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="success" className="text-base px-4 py-2 bg-green-500/20 text-green-300 border-green-500/30">
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            ZK-Identity Verified
                                        </Badge>
                                    </div>
                                ) : isVerificationInProgress ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-indigo-400">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-sm font-medium">
                                                {isLoggingIn
                                                    ? 'Generating ZK Proof...'
                                                    : 'Verifying Proof & Minting SBT...'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-500">
                                            {isLoggingIn
                                                ? 'Generating zero-knowledge proof from your Aadhaar QR'
                                                : 'Relayer is verifying your proof and minting your SBT on Stellar'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {relayerError && (
                                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                                <p className="text-xs text-red-400">{relayerError}</p>
                                            </div>
                                        )}
                                        <p className="text-sm text-zinc-500">
                                            Click the &quot;Login&quot; button at the top right to verify your identity with Anon Aadhaar.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Powered By Badge */}
                        <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/5">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold">A</span>
                            </div>
                            <span className="text-xs text-zinc-400 font-medium">Powered by Anon Aadhaar</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* KYC Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
            >
                <div className="relative overflow-hidden rounded-2xl glass-card border-white/10 p-8">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 opacity-50" />

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8 relative z-10">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                            <span className="ml-3 text-white">Loading KYC status...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row items-start justify-between relative z-10 gap-6">
                            <div>
                                <div className="flex items-center gap-2 text-indigo-300 text-sm mb-2 font-medium">
                                    <Shield className="w-4 h-4" />
                                    <span>Traditional KYC Status</span>
                                </div>
                                <h2 className="text-4xl font-bold mb-4 font-heading text-white">
                                    {verified ? 'Verified' : 'Not Verified'}
                                </h2>
                                <Badge variant={verified ? "success" : "warning"} className="text-sm py-1 px-3 glass-card border-white/20 text-white shadow-lg">
                                    {investorType} Investor
                                </Badge>
                            </div>
                            <div className="text-left md:text-right">
                                <p className="text-indigo-200/60 text-sm mb-1 uppercase tracking-wider font-semibold">Jurisdiction</p>
                                <div className="flex items-center gap-2 text-white text-2xl md:justify-end">
                                    <Globe className="w-6 h-6 text-indigo-400" />
                                    <span className="font-bold">
                                        {jurisdictions.length > 0
                                            ? jurisdictionMap[jurisdictions[0]]?.name || 'Unknown'
                                            : 'Not Set'
                                        }
                                    </span>
                                </div>
                                <p className="text-indigo-200/40 text-xs mt-2 font-mono">
                                    {kycStatus?.accreditation_expiry
                                        ? `EXP: ${new Date(kycStatus.accreditation_expiry * 1000).toLocaleDateString()}`
                                        : 'NO EXPIRY SET'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Restrictions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Holding Period */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="glass-card rounded-2xl p-6 border-white/10 h-full">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg font-heading">Holding Period</h3>
                                <p className="text-xs text-zinc-500">Reg D Compliance (90 days)</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl font-bold text-white">0 / 90 days</span>
                            <div className="text-right">
                                <p className="text-xs text-zinc-500">Demo Mode</p>
                                <p className="text-sm text-green-400 font-bold">Transfers Allowed</p>
                            </div>
                        </div>

                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-gradient-to-r from-amber-500 to-green-500 opacity-50" />
                        </div>
                    </div>
                </motion.div>

                {/* Ownership Limit */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="glass-card rounded-2xl p-6 border-white/10 h-full">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg font-heading">Ownership Limit</h3>
                                <p className="text-xs text-zinc-500">Maximum 10% per wallet</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl font-bold text-white">--%</span>
                            <div className="text-right">
                                <p className="text-xs text-zinc-500">Calculating...</p>
                                <p className="text-sm text-emerald-400 font-bold">Within Limits</p>
                            </div>
                        </div>

                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '0%' }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="h-full bg-emerald-500"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Daily Transfer Limit */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="glass-card rounded-2xl p-6 border-white/10 h-full">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg font-heading">Daily Transfer Limit</h3>
                                <p className="text-xs text-zinc-500">Resets at midnight UTC</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl font-bold text-white">
                                {kycStatus ? `$${(Number(kycStatus.daily_limit_used) / 1000000).toFixed(0)}k` : '$0'}
                            </span>
                            <div className="text-right">
                                <p className="text-xs text-zinc-500">of $100k limit</p>
                                <p className="text-sm text-blue-400 font-bold">
                                    ${100 - (kycStatus ? Number(kycStatus.daily_limit_used) / 1000000 : 0)}k Remaining
                                </p>
                            </div>
                        </div>

                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${kycStatus ? (Number(kycStatus.daily_limit_used) / 100000000) * 100 : 0}%` }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="h-full bg-blue-500"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Allowed Jurisdictions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="glass-card rounded-2xl p-6 border-white/10 h-full">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg font-heading">Allowed Jurisdictions</h3>
                                <p className="text-xs text-zinc-500">Multi-jurisdiction support</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(jurisdictionMap).map(([code, info]) => {
                                const isAllowed = jurisdictions.includes(code)
                                return (
                                    <div
                                        key={code}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isAllowed
                                            ? 'bg-green-500/10 border-green-500/20 shadow-lg shadow-green-500/5'
                                            : 'bg-white/5 border-white/5 opacity-40 grayscale'
                                            }`}
                                    >
                                        <span className="text-2xl">{info.flag}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-bold truncate ${isAllowed ? 'text-green-200' : 'text-zinc-400'}`}>
                                                {info.name}
                                            </p>
                                            <p className="text-[10px] text-zinc-500 font-mono">{code}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Status Message */}
            {!verified && !hasSBT && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3"
                >
                    <Shield className="w-5 h-5 text-amber-500" />
                    <p className="text-sm text-amber-200 font-medium">
                        Complete ZK-Identity verification above to unlock token transfers.
                    </p>
                </motion.div>
            )}
        </div>
    )
}
