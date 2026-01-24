'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { parseTokenAmount, writeContract } from '@/lib/contract'
import { useIsGovernor } from '@/lib/hooks/useIsGovernor'
import { useToast, useWallet } from '@/lib/store'
import { signTransaction } from '@stellar/freighter-api'
import * as StellarSDK from '@stellar/stellar-sdk'
import { motion } from 'framer-motion'
import { Banknote, Coins, Flame, Settings, Shield, ShieldX, Snowflake, UserCheck } from 'lucide-react'
import { useState } from 'react'

// Known USDC testnet address (Stellar testnet)
const USDC_TESTNET_ADDRESS = 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA'

type ActionTab = 'mint' | 'burn' | 'freeze' | 'kyc' | 'yield'

export default function AdminPage() {
    const { publicKey, isConnected } = useWallet()
    const { addToast } = useToast()
    const { isGovernor, isLoading: governorLoading } = useIsGovernor()
    const [activeTab, setActiveTab] = useState<ActionTab>('mint')

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                    <ShieldX className="w-16 h-16 text-brown-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-brown-800 mb-2">Connect Your Wallet</h2>
                    <p className="text-brown-400">Please connect your Freighter wallet to access admin controls</p>
                </div>
            </div>
        )
    }

    if (governorLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                    <Shield className="w-16 h-16 text-brown-400 mx-auto mb-4 animate-pulse" />
                    <h2 className="text-2xl font-semibold text-brown-800 mb-2">Checking Permissions</h2>
                    <p className="text-brown-400">Verifying governor status...</p>
                </div>
            </div>
        )
    }

    if (!isGovernor) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card padding="lg" className="max-w-md text-center">
                    <Settings className="w-16 h-16 text-brown-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-brown-800 mb-2">Access Restricted</h2>
                    <p className="text-brown-400 mb-4">
                        This panel is only accessible to governors with multi-sig authority
                    </p>
                    <Badge variant="neutral">Non-Governor Account</Badge>
                </Card>
            </div>
        )
    }

    const tabs: { id: ActionTab; label: string; icon: any; color: string }[] = [
        { id: 'mint', label: 'Mint Tokens', icon: Coins, color: 'text-success' },
        { id: 'burn', label: 'Burn Tokens', icon: Flame, color: 'text-error' },
        { id: 'freeze', label: 'Freeze Account', icon: Snowflake, color: 'text-warning' },
        { id: 'kyc', label: 'Update KYC', icon: UserCheck, color: 'text-brown-600' },
        { id: 'yield', label: 'Distribute Yield', icon: Banknote, color: 'text-emerald-600' },
    ]

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-brown-800 mb-2">Admin Panel</h1>
                <p className="text-brown-400">Critical operations requiring 2-of-3 multi-sig approval</p>
            </div>

            {/* Warning Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-warning/10 border border-warning/20"
            >
                <p className="text-sm text-warning font-medium">
                    ⚠️ All actions create proposals that require 2-of-3 governor approval
                </p>
            </motion.div>

            {/* Action Tabs */}
            <div className="grid grid-cols-5 gap-2 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
              p-4 rounded-lg transition-all
              ${activeTab === tab.id
                                ? 'bg-white border-2 border-brown-600 shadow-md'
                                : 'bg-white/50 border border-brown-200 hover:bg-white'
                            }
            `}
                    >
                        <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? tab.color : 'text-brown-400'} mx-auto mb-2`} />
                        <p className={`text-sm font-medium ${activeTab === tab.id ? 'text-brown-800' : 'text-brown-400'}`}>
                            {tab.label}
                        </p>
                    </button>
                ))}
            </div>

            {/* Action Forms */}
            <Card>
                {activeTab === 'mint' && <MintForm publicKey={publicKey!} addToast={addToast} />}
                {activeTab === 'burn' && <BurnForm publicKey={publicKey!} addToast={addToast} />}
                {activeTab === 'freeze' && <FreezeForm publicKey={publicKey!} addToast={addToast} />}
                {activeTab === 'kyc' && <KYCForm publicKey={publicKey!} addToast={addToast} />}
                {activeTab === 'yield' && <YieldForm publicKey={publicKey!} addToast={addToast} />}
            </Card>
        </div>
    )
}

function MintForm({ publicKey, addToast }: { publicKey: string; addToast: any }) {
    const [recipient, setRecipient] = useState('')
    const [amount, setAmount] = useState('')
    const [reason, setReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!recipient || !amount || !reason) {
            addToast('Please fill all fields', 'warning')
            return
        }

        setIsSubmitting(true)
        try {
            const amountBigInt = parseTokenAmount(amount, 6)
            const params = [
                StellarSDK.nativeToScVal(recipient, { type: 'address' }),
                StellarSDK.nativeToScVal(amountBigInt, { type: 'i128' }),
            ]

            const xdr = await writeContract.propose(
                publicKey,
                'mint',
                params,
                100000 // ~7 days expiry
            )

            await signTransaction(xdr, {
                networkPassphrase: StellarSDK.Networks.TESTNET,
            })

            addToast('Mint proposal created successfully!', 'success')
            setRecipient('')
            setAmount('')
            setReason('')
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Failed to create proposal', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-success/10">
                    <Coins className="w-6 h-6 text-success" />
                </div>
                <div>
                    <h3 className="font-semibold text-brown-800">Mint New Tokens</h3>
                    <p className="text-sm text-brown-400">Increase total supply and allocate to recipient</p>
                </div>
            </div>

            <Input label="Recipient Address" placeholder="GXXXXXXXXXXXXXXXXXXXXXXX..." value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            <Input label="Amount" type="number" placeholder="0.000000" suffix="MTT" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">Reason (Audit Trail)</label>
                <textarea
                    className="w-full px-4 py-2.5 rounded-lg border border-brown-200 focus:outline-none focus:ring-2 focus:ring-brown-500"
                    rows={3}
                    placeholder="e.g., Series B funding allocation..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
            </div>

            <Button variant="primary" icon={Coins} className="w-full" onClick={handleSubmit} loading={isSubmitting}>
                Create Mint Proposal
            </Button>
        </div>
    )
}

function BurnForm({ publicKey, addToast }: { publicKey: string; addToast: any }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-error/10">
                    <Flame className="w-6 h-6 text-error" />
                </div>
                <div>
                    <h3 className="font-semibold text-brown-800">Burn Tokens</h3>
                    <p className="text-sm text-brown-400">Permanently destroy tokens from an address</p>
                </div>
            </div>

            <Input label="From Address" placeholder="GXXXXXXXXXXXXXXXXXXXXXXX..." />
            <Input label="Amount" type="number" placeholder="0.000000" suffix="MTT" />
            <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">Reason (Required)</label>
                <textarea
                    className="w-full px-4 py-2.5 rounded-lg border border-brown-200 focus:outline-none focus:ring-2 focus:ring-brown-500"
                    rows={3}
                    placeholder="e.g., Asset redemption..."
                />
            </div>

            <Button variant="danger" icon={Flame} className="w-full">
                Create Burn Proposal
            </Button>
        </div>
    )
}

function FreezeForm({ publicKey, addToast }: { publicKey: string; addToast: any }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-warning/10">
                    <Snowflake className="w-6 h-6 text-warning" />
                </div>
                <div>
                    <h3 className="font-semibold text-brown-800">Freeze/Unfreeze Account</h3>
                    <p className="text-sm text-brown-400">Prevent or restore transfer capability</p>
                </div>
            </div>

            <Input label="Account Address" placeholder="GXXXXXXXXXXXXXXXXXXXXXXX..." />

            <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">Action</label>
                <div className="grid grid-cols-2 gap-3">
                    <button className="p-3 rounded-lg bg-warning/10 border-2 border-warning/20 text-warning font-medium">
                        Freeze
                    </button>
                    <button className="p-3 rounded-lg bg-success/10 border border-success/20 text-success font-medium">
                        Unfreeze
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">Reason</label>
                <textarea
                    className="w-full px-4 py-2.5 rounded-lg border border-brown-200 focus:outline-none focus:ring-2 focus:ring-brown-500"
                    rows={3}
                    placeholder="e.g., Suspicious activity detected..."
                />
            </div>

            <Button variant="primary" icon={Snowflake} className="w-full">
                Create Freeze Proposal
            </Button>
        </div>
    )
}

function KYCForm({ publicKey, addToast }: { publicKey: string; addToast: any }) {
    const [mode, setMode] = useState<'manual' | 'zk-identity'>('zk-identity')
    const [identityContractId, setIdentityContractId] = useState(
        process.env.NEXT_PUBLIC_IDENTITY_CONTRACT_ID || ''
    )
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Manual KYC fields
    const [investorAddress, setInvestorAddress] = useState('')
    const [verificationStatus, setVerificationStatus] = useState('Verified')
    const [investorType, setInvestorType] = useState('Accredited')
    const [jurisdiction, setJurisdiction] = useState('US')

    const handleLinkIdentityContract = async () => {
        if (!identityContractId) {
            addToast('Please enter the Identity Contract ID', 'warning')
            return
        }

        // Validate Stellar contract address format
        if (identityContractId.length !== 56 || !identityContractId.startsWith('C')) {
            addToast('Invalid contract address format', 'warning')
            return
        }

        setIsSubmitting(true)
        try {
            const xdr = await writeContract.setIdentityContract(
                publicKey,
                identityContractId
            )

            await signTransaction(xdr, {
                networkPassphrase: StellarSDK.Networks.TESTNET,
            })

            addToast('✅ Identity Contract linked successfully! ZK-Identity is now active.', 'success')
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Failed to link identity contract', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleManualKYCProposal = async () => {
        if (!investorAddress) {
            addToast('Please enter the investor address', 'warning')
            return
        }

        setIsSubmitting(true)
        try {
            const params = [
                StellarSDK.nativeToScVal(investorAddress, { type: 'address' }),
                StellarSDK.nativeToScVal(verificationStatus === 'Verified', { type: 'bool' }),
                StellarSDK.nativeToScVal(investorType, { type: 'symbol' }),
                StellarSDK.nativeToScVal([jurisdiction], { type: 'vec' }),
            ]

            const xdr = await writeContract.propose(
                publicKey,
                'update_kyc',
                params,
                100000
            )

            await signTransaction(xdr, {
                networkPassphrase: StellarSDK.Networks.TESTNET,
            })

            addToast('KYC update proposal created successfully!', 'success')
            setInvestorAddress('')
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Failed to create proposal', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-brown-600/10">
                    <UserCheck className="w-6 h-6 text-brown-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-brown-800">Identity & KYC Management</h3>
                    <p className="text-sm text-brown-400">Link ZK-Identity or manage manual KYC</p>
                </div>
            </div>

            {/* Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-brown-100 rounded-lg">
                <button
                    onClick={() => setMode('zk-identity')}
                    className={`py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                        mode === 'zk-identity'
                            ? 'bg-white text-brown-800 shadow-sm'
                            : 'text-brown-500 hover:text-brown-700'
                    }`}
                >
                    🔐 Link ZK-Identity
                </button>
                <button
                    onClick={() => setMode('manual')}
                    className={`py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                        mode === 'manual'
                            ? 'bg-white text-brown-800 shadow-sm'
                            : 'text-brown-500 hover:text-brown-700'
                    }`}
                >
                    📋 Manual KYC
                </button>
            </div>

            {mode === 'zk-identity' ? (
                /* ZK-Identity Linking Mode */
                <div className="space-y-4">
                    {/* Feature Banner */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-indigo-100">
                                <Shield className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-indigo-900 mb-1">Decoupled Identity Architecture</h4>
                                <p className="text-sm text-indigo-700">
                                    Link an external Identity SBT contract. The RWA token will query this contract 
                                    to verify KYC status, enabling privacy-preserving ZK proofs without storing 
                                    personal data on-chain.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Input 
                        label="Identity Contract ID" 
                        placeholder="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..." 
                        value={identityContractId}
                        onChange={(e) => setIdentityContractId(e.target.value)}
                    />
                    <p className="text-xs text-brown-400 -mt-2">
                        The deployed IdentitySBT contract address that handles Anon Aadhaar verification
                    </p>

                    {/* Contract Info */}
                    {identityContractId && (
                        <div className="p-3 rounded-lg bg-brown-50 border border-brown-200">
                            <p className="text-xs text-brown-600 font-mono break-all">
                                {identityContractId}
                            </p>
                        </div>
                    )}

                    <Button 
                        variant="primary" 
                        icon={Shield} 
                        className="w-full bg-indigo-600 hover:bg-indigo-700" 
                        onClick={handleLinkIdentityContract}
                        loading={isSubmitting}
                    >
                        Link Identity Contract
                    </Button>
                </div>
            ) : (
                /* Manual KYC Mode (Legacy) */
                <div className="space-y-4">
                    {/* Legacy Warning */}
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                        <p className="text-xs text-warning">
                            ⚠️ Manual KYC is for legacy compatibility. Use ZK-Identity for privacy-preserving verification.
                        </p>
                    </div>

                    <Input 
                        label="Investor Address" 
                        placeholder="GXXXXXXXXXXXXXXXXXXXXXXX..." 
                        value={investorAddress}
                        onChange={(e) => setInvestorAddress(e.target.value)}
                    />

                    <div>
                        <label className="block text-sm font-medium text-brown-700 mb-2">Verification Status</label>
                        <select 
                            className="w-full px-4 py-2.5 rounded-lg border border-brown-200 focus:outline-none focus:ring-2 focus:ring-brown-500"
                            value={verificationStatus}
                            onChange={(e) => setVerificationStatus(e.target.value)}
                        >
                            <option value="Verified">Verified</option>
                            <option value="Pending">Pending</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brown-700 mb-2">Investor Type</label>
                        <select 
                            className="w-full px-4 py-2.5 rounded-lg border border-brown-200 focus:outline-none focus:ring-2 focus:ring-brown-500"
                            value={investorType}
                            onChange={(e) => setInvestorType(e.target.value)}
                        >
                            <option value="Accredited">Accredited</option>
                            <option value="Retail">Retail</option>
                            <option value="Institutional">Institutional</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brown-700 mb-2">Jurisdiction</label>
                        <select 
                            className="w-full px-4 py-2.5 rounded-lg border border-brown-200 focus:outline-none focus:ring-2 focus:ring-brown-500"
                            value={jurisdiction}
                            onChange={(e) => setJurisdiction(e.target.value)}
                        >
                            <option value="US">United States (US)</option>
                            <option value="SG">Singapore (SG)</option>
                            <option value="EU">European Union (EU)</option>
                            <option value="AE">United Arab Emirates (AE)</option>
                        </select>
                    </div>

                    <Button 
                        variant="primary" 
                        icon={UserCheck} 
                        className="w-full"
                        onClick={handleManualKYCProposal}
                        loading={isSubmitting}
                    >
                        Create KYC Update Proposal
                    </Button>
                </div>
            )}
        </div>
    )
}

function YieldForm({ publicKey, addToast }: { publicKey: string; addToast: any }) {
    const [tokenAddress, setTokenAddress] = useState(USDC_TESTNET_ADDRESS)
    const [amount, setAmount] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!tokenAddress || !amount) {
            addToast('Please fill all fields', 'warning')
            return
        }

        const amountNum = parseFloat(amount)
        if (amountNum <= 0) {
            addToast('Amount must be greater than 0', 'warning')
            return
        }

        setIsSubmitting(true)
        try {
            const amountBigInt = parseTokenAmount(amount, 6)

            const xdr = await writeContract.depositYield(
                publicKey,
                tokenAddress,
                amountBigInt
            )

            await signTransaction(xdr, {
                networkPassphrase: StellarSDK.Networks.TESTNET,
            })

            addToast('Yield distributed to holders!', 'success')
            setAmount('')
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Failed to deposit yield', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Banknote className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-brown-800">Distribute Yield</h3>
                    <p className="text-sm text-brown-400">Deposit USDC for token holders to claim</p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-sm text-emerald-800">
                    💰 Yield is distributed proportionally based on token holdings.
                    Users can claim their share from their dashboard.
                </p>
            </div>

            <div>
                <Input
                    label="Yield Token Address"
                    placeholder="CXXXXXXXXXXXXXXXXXXXXXXX..."
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                />
                <p className="text-xs text-brown-400 mt-1">Default: USDC Testnet</p>
            </div>

            <Input
                label="Amount"
                type="number"
                placeholder="0.000000"
                suffix="USDC"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />

            <div className="p-3 rounded-lg bg-brown-50">
                <p className="text-xs text-brown-500">
                    <strong>Formula:</strong> yield_per_token = amount ÷ total_supply
                </p>
            </div>

            <Button
                variant="primary"
                icon={Banknote}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSubmit}
                loading={isSubmitting}
            >
                Deposit Yield for Distribution
            </Button>
        </div>
    )
}
