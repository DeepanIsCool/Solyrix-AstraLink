'use client'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { identityContract } from '@/lib/contract'
import { useKycStatus } from '@/lib/hooks/useKycStatus'
import { useToast, useWallet } from '@/lib/store'
import { LogInWithAnonAadhaar, useAnonAadhaar } from '@anon-aadhaar/react'
import { motion } from 'framer-motion'
import { BadgeCheck, CheckCircle, Clock, DollarSign, Fingerprint, Globe, Loader2, Shield, Sparkles, TrendingUp } from 'lucide-react'
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

    // Determine UI state based on Anon Aadhaar status
    const isLoggingIn = anonAadhaar.status === 'logging-in'
    const isVerificationInProgress = isLoggingIn || isSubmittingToRelayer

    return (
        <div className="max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-brown-800 mb-2">Compliance Dashboard</h1>
                <p className="text-brown-400">Your KYC status and transfer restrictions</p>
            </div>

            {/* ZK Identity Verification Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Card padding="lg" className={hasSBT ? 'border-2 border-success/30 bg-success/5' : ''}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${hasSBT ? 'bg-success/20' : 'bg-brown-100'}`}>
                                {hasSBT ? (
                                    <BadgeCheck className="w-8 h-8 text-success" />
                                ) : isVerificationInProgress ? (
                                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                ) : (
                                    <Fingerprint className="w-8 h-8 text-brown-400" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-semibold text-brown-800">
                                        ZK-Identity Verification
                                    </h3>
                                    {isCheckingSBT && (
                                        <Loader2 className="w-4 h-4 animate-spin text-brown-400" />
                                    )}
                                </div>
                                <p className="text-sm text-brown-400 mb-3">
                                    Privacy-preserving KYC via Anon Aadhaar ZK Proofs
                                </p>
                                
                                {hasSBT ? (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="success" className="text-base px-4 py-1.5">
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            ZK-Identity Verified ✅
                                        </Badge>
                                    </div>
                                ) : isVerificationInProgress ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-indigo-600">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-sm font-medium">
                                                {isLoggingIn 
                                                    ? 'Generating ZK Proof...' 
                                                    : 'Verifying Proof & Minting SBT...'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-brown-300">
                                            {isLoggingIn 
                                                ? 'Generating zero-knowledge proof from your Aadhaar QR'
                                                : 'Relayer is verifying your proof and minting your SBT on Stellar'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-xs text-brown-300">
                                            Scan your Aadhaar QR code to generate a ZK proof. The relayer will verify and mint your identity SBT.
                                        </p>
                                        
                                        {relayerError && (
                                            <div className="p-2 rounded bg-error/10 border border-error/20">
                                                <p className="text-xs text-error">{relayerError}</p>
                                            </div>
                                        )}
                                        
                                        {/* Real Anon Aadhaar Login Button */}
                                        <div className="anon-aadhaar-wrapper">
                                            <LogInWithAnonAadhaar nullifierSeed={1234567890} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Anon Aadhaar Branding */}
                        <div className="hidden md:flex items-center gap-2 bg-gradient-to-br from-orange-50 to-green-50 px-3 py-2 rounded-lg border border-orange-200">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">A</span>
                            </div>
                            <span className="text-xs text-brown-600 font-medium">Powered by<br/>Anon Aadhaar</span>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* KYC Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
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
                                    <span>Traditional KYC Status</span>
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
                    transition={{ delay: 0.2 }}
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
                    transition={{ delay: 0.3 }}
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
                    transition={{ delay: 0.4 }}
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
                    transition={{ delay: 0.5 }}
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
            {!verified && !hasSBT && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-4 rounded-lg bg-warning/10 border border-warning/20"
                >
                    <p className="text-sm text-warning font-medium">
                        ⚠️ Complete ZK-Identity verification above to unlock token transfers.
                    </p>
                </motion.div>
            )}
        </div>
    )
}
