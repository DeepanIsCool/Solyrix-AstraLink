'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { contract, parseTokenAmount, writeContract } from '@/lib/contract'
import { useToast, useWallet } from '@/lib/store'
import { signTransaction } from '@stellar/freighter-api'
import * as StellarSDK from '@stellar/stellar-sdk'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Loader2, Send, Shield, XCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface ComplianceCheck {
    name: string
    status: 'pass' | 'fail' | 'pending' | 'loading'
    detail: string
}

export default function TransferPage() {
    const { publicKey } = useWallet()
    const { addToast } = useToast()

    const [recipient, setRecipient] = useState('')
    const [amount, setAmount] = useState('')
    const [isPreview, setIsPreview] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Real KYC status from blockchain
    const [senderKyc, setSenderKyc] = useState<Awaited<ReturnType<typeof contract.getKycStatus>>>(null)
    const [recipientKyc, setRecipientKyc] = useState<Awaited<ReturnType<typeof contract.getKycStatus>>>(null)
    const [senderBalance, setSenderBalance] = useState<bigint>(BigInt(0))
    const [isLoadingKyc, setIsLoadingKyc] = useState(false)

    // Validate sender KYC on mount and when wallet changes
    useEffect(() => {
        async function checkSenderKyc() {
            if (!publicKey) {
                setSenderKyc(null)
                setSenderBalance(BigInt(0))
                return
            }
            try {
                const [kyc, balance] = await Promise.all([
                    contract.getKycStatus(publicKey),
                    contract.balance(publicKey)
                ])
                setSenderKyc(kyc)
                setSenderBalance(balance)
            } catch (err) {
                console.error('Failed to fetch sender status:', err)
                setSenderKyc(null)
            }
        }
        checkSenderKyc()
    }, [publicKey])

    // Validate recipient KYC when address changes (debounced)
    const checkRecipientKyc = useCallback(async (address: string) => {
        if (address.length !== 56) {
            setRecipientKyc(null)
            return
        }
        setIsLoadingKyc(true)
        try {
            const kyc = await contract.getKycStatus(address)
            setRecipientKyc(kyc)
        } catch (err) {
            console.error('Failed to fetch recipient KYC:', err)
            setRecipientKyc(null)
        } finally {
            setIsLoadingKyc(false)
        }
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (recipient.length === 56) {
                checkRecipientKyc(recipient)
            } else {
                setRecipientKyc(null)
            }
        }, 500) // Debounce 500ms
        return () => clearTimeout(timer)
    }, [recipient, checkRecipientKyc])

    // Build real compliance checks based on blockchain data
    const complianceChecks: ComplianceCheck[] = [
        {
            name: 'Wallet Connected',
            status: publicKey ? 'pass' : 'fail',
            detail: publicKey ? 'Freighter wallet connected' : 'Connect wallet first'
        },
        {
            name: 'Sender KYC Verified',
            status: senderKyc?.kyc_verified ? 'pass' : (publicKey ? 'fail' : 'pending'),
            detail: senderKyc?.kyc_verified ? `Status: ${senderKyc.investor_status}` : 'Your account requires KYC verification'
        },
        {
            name: 'Valid Recipient Address',
            status: recipient.length === 56 ? 'pass' : 'pending',
            detail: recipient ? (recipient.length === 56 ? 'Stellar address valid' : 'Invalid address length') : 'Enter recipient address'
        },
        {
            name: 'Recipient KYC Verified',
            status: isLoadingKyc ? 'loading' : (recipientKyc?.kyc_verified ? 'pass' : (recipient.length === 56 ? 'fail' : 'pending')),
            detail: isLoadingKyc ? 'Checking...' : (recipientKyc?.kyc_verified ? `Status: ${recipientKyc.investor_status}` : (recipient.length === 56 ? 'Recipient requires KYC verification' : 'Enter recipient address'))
        },
        {
            name: 'Amount Validation',
            status: amount && parseFloat(amount) > 0 ? 'pass' : 'pending',
            detail: amount ? `${amount} MTT` : 'Enter amount'
        },
        {
            name: 'Sufficient Balance',
            status: amount && parseFloat(amount) > 0 && senderBalance >= parseTokenAmount(amount || '0', 6) ? 'pass' : (amount ? 'fail' : 'pending'),
            detail: `Balance: ${Number(senderBalance) / 1_000_000} MTT`
        },
    ]

    const allChecksPassed = complianceChecks.every(check => check.status === 'pass')

    const handlePreview = () => {
        if (!recipient || !amount) {
            addToast('Please fill in all fields', 'warning')
            return
        }
        if (!senderKyc?.kyc_verified) {
            addToast('Your account requires KYC verification', 'error')
            return
        }
        if (recipient.length === 56 && !recipientKyc?.kyc_verified) {
            addToast('Recipient requires KYC verification before receiving tokens', 'error')
            return
        }
        setIsPreview(true)
    }

    const handleTransfer = async () => {
        if (!publicKey) {
            addToast('Please connect your wallet', 'error')
            return
        }

        if (!allChecksPassed) {
            addToast('Compliance checks failed', 'error')
            return
        }

        setIsSubmitting(true)

        try {
            // Parse amount to bigint (6 decimals)
            const amountBigInt = parseTokenAmount(amount, 6)

            // Build transaction XDR
            const xdr = await writeContract.transfer(publicKey, recipient, amountBigInt)

            // Sign with Freighter
            await signTransaction(xdr, {
                networkPassphrase: StellarSDK.Networks.TESTNET,
            })

            addToast('Transfer initiated! (Transaction signing successful)', 'success')

            // Reset form
            setRecipient('')
            setAmount('')
            setIsPreview(false)

        } catch (err) {
            console.error('Transfer failed:', err)
            addToast(
                err instanceof Error ? err.message : 'Transfer failed',
                'error'
            )
        } finally {
            setIsSubmitting(false)
        }
    }


    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 font-heading">Transfer Tokens</h1>
                <p className="text-zinc-400">Send MTT tokens with automated compliance verification</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Transfer Form - Left 3 columns */}
                <div className="lg:col-span-3">
                    <div className="glass-card rounded-2xl p-8 border-white/10">
                        <div className="space-y-8">
                            <Input
                                label="Recipient Address"
                                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                className="font-mono text-sm"
                            />

                            <Input
                                label="Amount"
                                type="number"
                                placeholder="0.000000"
                                suffix="MTT"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />

                            <div className="pt-4">
                                <Button
                                    variant="primary"
                                    icon={Send}
                                    onClick={handlePreview}
                                    disabled={!recipient || !amount}
                                    className="w-full h-12 bg-gradient-to-r from-gold-400 to-amber-600 text-black font-bold hover:brightness-110 shadow-lg shadow-gold-500/20"
                                >
                                    Preview Transfer
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compliance Preview - Right 2 columns */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {!isPreview ? (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full"
                            >
                                <div className="h-full glass-card rounded-2xl p-8 border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center">
                                    <div className="p-4 rounded-full bg-white/5 mb-4">
                                        <AlertCircle className="w-8 h-8 text-zinc-600" />
                                    </div>
                                    <p className="text-zinc-500 max-w-[200px]">Enter recipient and amount to verify compliance</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="glass-card rounded-2xl p-6 border-white/10 bg-black/40">
                                    <h3 className="text-lg font-bold text-white mb-6 font-heading flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-gold-400" />
                                        Compliance Check
                                    </h3>

                                    <div className="space-y-3 mb-8">
                                        {complianceChecks.map((check, i) => (
                                            <motion.div
                                                key={check.name}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={`
                                                    flex items-start gap-3 p-3 rounded-xl border
                                                    ${check.status === 'pass' ? 'bg-green-500/10 border-green-500/20' :
                                                        check.status === 'fail' ? 'bg-red-500/10 border-red-500/20' :
                                                            'bg-white/5 border-white/5'}
                                                `}
                                            >
                                                {check.status === 'pass' ? (
                                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                                ) : check.status === 'fail' ? (
                                                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                                ) : check.status === 'loading' ? (
                                                    <Loader2 className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5 animate-spin" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium ${check.status === 'pass' ? 'text-green-200' : 'text-zinc-300'}`}>{check.name}</p>
                                                    <p className="text-xs text-zinc-500 mt-0.5">{check.detail}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <Button
                                        variant="primary"
                                        onClick={handleTransfer}
                                        loading={isSubmitting}
                                        disabled={!allChecksPassed}
                                        className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Processing...' : 'Confirm Transfer'}
                                    </Button>

                                    <p className="text-xs text-zinc-600 text-center mt-4">
                                        Transaction requires Freighter wallet signature
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
