'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { parseTokenAmount, writeContract } from '@/lib/contract'
import { useIsGovernor } from '@/lib/hooks/useIsGovernor'
import { useToast, useWallet } from '@/lib/store'
import { signTransaction } from '@stellar/freighter-api'
import * as StellarSDK from '@stellar/stellar-sdk'
import { motion } from 'framer-motion'
import { Banknote, Coins, Flame, Settings, Shield, ShieldX, Snowflake, UserCheck } from 'lucide-react'
import { type ComponentType, useState } from 'react'

// Known USDC testnet address (Stellar testnet)
const USDC_TESTNET_ADDRESS = 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA'

type ActionTab = 'mint' | 'burn' | 'freeze' | 'kyc' | 'yield'
type TabDefinition = {
    id: ActionTab
    label: string
    icon: ComponentType<{ className?: string }>
    color: string
}

export default function AdminPage() {
    const { publicKey, isConnected } = useWallet()
    const { addToast } = useToast()
    const { isGovernor, isLoading: governorLoading } = useIsGovernor()
    const [activeTab, setActiveTab] = useState<ActionTab>('mint')

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="text-center max-w-md p-8 glass-card rounded-2xl">
                    <ShieldX className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2 font-heading">Connect Your Wallet</h2>
                    <p className="text-zinc-400">Please connect your Freighter wallet to access admin controls</p>
                </div>
            </div>
        )
    }

    if (governorLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="text-center max-w-md">
                    <Shield className="w-16 h-16 text-gold-500 mx-auto mb-4 animate-pulse" />
                    <h2 className="text-2xl font-bold text-white mb-2 font-heading">Checking Permissions</h2>
                    <p className="text-zinc-400">Verifying governor status...</p>
                </div>
            </div>
        )
    }

    if (!isGovernor) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="max-w-md text-center p-8 glass-card rounded-2xl border-red-500/20">
                    <Settings className="w-16 h-16 text-red-500/50 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2 font-heading">Access Restricted</h2>
                    <p className="text-zinc-400 mb-6">
                        This panel is only accessible to governors with multi-sig authority
                    </p>
                    <div className="inline-block px-3 py-1 rounded bg-red-500/20 text-red-400 text-sm font-medium border border-red-500/30">
                        Non-Governor Account
                    </div>
                </div>
            </div>
        )
    }

    const tabs: TabDefinition[] = [
        { id: 'mint', label: 'Mint Tokens', icon: Coins, color: 'text-gold-400' },
        { id: 'burn', label: 'Burn Tokens', icon: Flame, color: 'text-red-400' },
        { id: 'freeze', label: 'Freeze Actions', icon: Snowflake, color: 'text-blue-400' },
        { id: 'kyc', label: 'Update KYC', icon: UserCheck, color: 'text-purple-400' },
        { id: 'yield', label: 'Distribute Yield', icon: Banknote, color: 'text-emerald-400' },
    ]

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 font-heading">Admin Panel</h1>
                <p className="text-zinc-400">Critical operations requiring 2-of-3 multi-sig approval</p>
            </div>

            {/* Warning Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center gap-3"
            >
                <div className="p-2 rounded-lg bg-gold-500/20 text-gold-400">
                    <Shield className="w-5 h-5" />
                </div>
                <p className="text-sm text-gold-200/80 font-medium">
                    All actions create proposals that require 2-of-3 governor approval before execution.
                </p>
            </motion.div>

            {/* Action Tabs */}
            <div className="grid grid-cols-5 gap-4 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            group relative p-4 rounded-xl transition-all border
                            ${activeTab === tab.id
                                ? 'bg-white/10 border-white/20 shadow-lg'
                                : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                            }
                        `}
                    >
                        <div className={`
                            w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center transition-all
                            ${activeTab === tab.id ? 'bg-white/10 scale-110' : 'bg-white/5 group-hover:bg-white/10'}
                        `}>
                            <tab.icon className={`w-6 h-6 ${tab.color}`} />
                        </div>
                        <p className={`text-sm font-medium text-center ${activeTab === tab.id ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                            {tab.label}
                        </p>

                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabGlow"
                                className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Action Forms */}
            <div className="glass-card rounded-2xl p-8 border-white/10">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {activeTab === 'mint' && <MintForm publicKey={publicKey!} addToast={addToast} />}
                    {activeTab === 'burn' && <BurnForm publicKey={publicKey!} addToast={addToast} />}
                    {activeTab === 'freeze' && <FreezeForm publicKey={publicKey!} addToast={addToast} />}
                    {activeTab === 'kyc' && <KYCForm publicKey={publicKey!} addToast={addToast} />}
                    {activeTab === 'yield' && <YieldForm publicKey={publicKey!} addToast={addToast} />}
                </motion.div>
            </div>
        </div>
    )
}

// ============ MINT FORM (already working) ============
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
                100000
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
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2 font-heading">Mint New Tokens</h3>
                <p className="text-zinc-400">Create new tokens and allocate them to a recipient address.</p>
            </div>

            <div className="space-y-4">
                <Input
                    label="Recipient Address"
                    placeholder="GXXXXXXXXXXXXXXXXXXXXXXX..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="bg-black/20 border-white/10 text-white placeholder:text-zinc-700"
                />

                <Input
                    label="Amount"
                    type="number"
                    placeholder="0.000000"
                    suffix="MTT"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-black/20 border-white/10 text-white placeholder:text-zinc-700"
                />

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Reason (Audit Trail)</label>
                    <textarea
                        className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder:text-zinc-700 focus:outline-none focus:border-gold-500/50 transition-colors"
                        rows={3}
                        placeholder="e.g., Series B funding allocation..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
            </div>

            <div className="pt-4">
                <Button
                    variant="primary"
                    className="w-full h-12 bg-gradient-to-r from-gold-400 to-amber-600 text-black font-bold hover:brightness-110"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                >
                    Create Mint Proposal
                </Button>
            </div>
        </div>
    )
}

// ============ BURN FORM (now functional) ============
function BurnForm({ publicKey, addToast }: { publicKey: string; addToast: any }) {
    const [fromAddress, setFromAddress] = useState('')
    const [amount, setAmount] = useState('')
    const [reason, setReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!fromAddress || !amount || !reason) {
            addToast('Please fill all fields', 'warning')
            return
        }

        setIsSubmitting(true)
        try {
            const amountBigInt = parseTokenAmount(amount, 6)
            const params = [
                StellarSDK.nativeToScVal(fromAddress, { type: 'address' }),
                StellarSDK.nativeToScVal(amountBigInt, { type: 'i128' }),
            ]

            const xdr = await writeContract.propose(
                publicKey,
                'burn',
                params,
                100000
            )

            await signTransaction(xdr, {
                networkPassphrase: StellarSDK.Networks.TESTNET,
            })

            addToast('Burn proposal created successfully!', 'success')
            setFromAddress('')
            setAmount('')
            setReason('')
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Failed to create burn proposal', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2 font-heading">Burn Tokens</h3>
                <p className="text-zinc-400">Permanently remove tokens from circulation.</p>
            </div>

            <div className="space-y-4">
                <Input
                    label="From Address"
                    placeholder="GXXXXXXXXXXXXXXXXXXXXXXX..."
                    value={fromAddress}
                    onChange={(e) => setFromAddress(e.target.value)}
                    className="bg-black/20 border-white/10 text-white"
                />
                <Input
                    label="Amount"
                    type="number"
                    placeholder="0.000000"
                    suffix="MTT"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-black/20 border-white/10 text-white"
                />
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Reason</label>
                    <textarea
                        className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-500/50 transition-colors"
                        rows={3}
                        placeholder="e.g., Asset redemption..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
            </div>

            <div className="pt-4">
                <Button
                    className="w-full h-12 bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                >
                    {isSubmitting ? 'Creating Proposal...' : 'Create Burn Proposal'}
                </Button>
            </div>
        </div>
    )
}

// ============ FREEZE FORM (now functional) ============
function FreezeForm({ publicKey, addToast }: { publicKey: string; addToast: any }) {
    const [accountAddress, setAccountAddress] = useState('')
    const [action, setAction] = useState<'freeze' | 'unfreeze'>('freeze')
    const [reason, setReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!accountAddress || !reason) {
            addToast('Please fill all fields', 'warning')
            return
        }

        setIsSubmitting(true)
        try {
            const params = [
                StellarSDK.nativeToScVal(accountAddress, { type: 'address' }),
            ]

            const xdr = await writeContract.propose(
                publicKey,
                action,
                params,
                100000
            )

            await signTransaction(xdr, {
                networkPassphrase: StellarSDK.Networks.TESTNET,
            })

            addToast(`${action === 'freeze' ? 'Freeze' : 'Unfreeze'} proposal created successfully!`, 'success')
            setAccountAddress('')
            setReason('')
        } catch (err) {
            addToast(err instanceof Error ? err.message : `Failed to create ${action} proposal`, 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2 font-heading">Freeze / Unfreeze Account</h3>
                <p className="text-zinc-400">Suspend or restore token transfer capabilities for an address.</p>
            </div>

            <div className="space-y-4">
                <Input
                    label="Account Address"
                    placeholder="GXXXXXXXXXXXXXXXXXXXXXXX..."
                    value={accountAddress}
                    onChange={(e) => setAccountAddress(e.target.value)}
                    className="bg-black/20 border-white/10 text-white"
                />

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Action</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setAction('freeze')}
                            className={`p-4 rounded-xl border font-bold transition-all ${
                                action === 'freeze'
                                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-400 shadow-lg shadow-blue-500/10'
                                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                            }`}
                        >
                            ❄️ Freeze
                        </button>
                        <button
                            onClick={() => setAction('unfreeze')}
                            className={`p-4 rounded-xl border font-bold transition-all ${
                                action === 'unfreeze'
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10'
                                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                            }`}
                        >
                            🔥 Unfreeze
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Reason</label>
                    <textarea
                        className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 transition-colors"
                        rows={3}
                        placeholder="e.g., Suspicious activity..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
            </div>

            <div className="pt-4">
                <Button
                    className={`w-full h-12 font-bold ${
                        action === 'freeze'
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-emerald-500 text-white hover:bg-emerald-600'
                    }`}
                    onClick={handleSubmit}
                    loading={isSubmitting}
                >
                    {isSubmitting ? 'Creating Proposal...' : `Create ${action === 'freeze' ? 'Freeze' : 'Unfreeze'} Proposal`}
                </Button>
            </div>
        </div>
    )
}

// ============ KYC FORM (now functional) ============
function KYCForm({ publicKey, addToast }: { publicKey: string; addToast: any }) {
    const [mode, setMode] = useState<'manual' | 'zk-identity'>('zk-identity')
    const [identityContractId, setIdentityContractId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [investorAddress, setInvestorAddress] = useState('')
    const [investorType, setInvestorType] = useState('Accredited')
    const [jurisdiction, setJurisdiction] = useState('US')

    const handleLinkIdentityContract = async () => {
        if (!identityContractId) {
            addToast('Please enter an Identity Contract ID', 'warning')
            return
        }

        setIsSubmitting(true)
        try {
            const xdr = await writeContract.setIdentityContract(publicKey, identityContractId)
            await signTransaction(xdr, {
                networkPassphrase: StellarSDK.Networks.TESTNET,
            })

            addToast('Identity contract linked successfully!', 'success')
            setIdentityContractId('')
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Failed to link identity contract', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleManualKYCProposal = async () => {
        if (!investorAddress) {
            addToast('Please enter investor address', 'warning')
            return
        }

        setIsSubmitting(true)
        try {
            const params = [
                StellarSDK.nativeToScVal(investorAddress, { type: 'address' }),
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

            addToast('KYC update proposal created!', 'success')
            setInvestorAddress('')
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Failed to create KYC proposal', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2 font-heading">Identity Management</h3>
                <p className="text-zinc-400">Manage KYC providers and participant status.</p>
            </div>

            {/* Mode Toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-xl border border-white/5 mb-8">
                <button
                    onClick={() => setMode('zk-identity')}
                    className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'zk-identity'
                            ? 'bg-purple-500 text-white shadow-lg'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    🔐 ZK-Identity Connect
                </button>
                <button
                    onClick={() => setMode('manual')}
                    className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'manual'
                            ? 'bg-purple-500 text-white shadow-lg'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    📋 Manual Override
                </button>
            </div>

            {mode === 'zk-identity' ? (
                <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <div className="flex gap-4">
                            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-300 h-fit">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-purple-200 mb-2">Decoupled Identity Architecture</h4>
                                <p className="text-sm text-purple-200/60 leading-relaxed">
                                    Link an external Identity SBT contract. The RWA token will query this contract
                                    to verify KYC status, enabling privacy-preserving ZK proofs without storing
                                    personal data on-chain.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Input
                        label="Identity Contract ID"
                        placeholder="CXXXXXXXXXXXXXXXX..."
                        value={identityContractId}
                        onChange={(e) => setIdentityContractId(e.target.value)}
                        className="bg-black/20 border-white/10 text-white"
                    />

                    <Button
                        className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold"
                        onClick={handleLinkIdentityContract}
                        loading={isSubmitting}
                    >
                        {isSubmitting ? 'Linking...' : 'Link Identity Contract'}
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <Input
                        label="Investor Address"
                        placeholder="GXXXXXXXXXXXXXXXX..."
                        value={investorAddress}
                        onChange={(e) => setInvestorAddress(e.target.value)}
                        className="bg-black/20 border-white/10 text-white"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Type</label>
                            <select
                                value={investorType}
                                onChange={(e) => setInvestorType(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                            >
                                <option value="Accredited">Accredited</option>
                                <option value="Retail">Retail</option>
                                <option value="Institutional">Institutional</option>
                                <option value="Qualified">Qualified</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Jurisdiction</label>
                            <select
                                value={jurisdiction}
                                onChange={(e) => setJurisdiction(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                            >
                                <option value="US">US 🇺🇸</option>
                                <option value="SG">Singapore 🇸🇬</option>
                                <option value="EU">European Union 🇪🇺</option>
                                <option value="AE">UAE 🇦🇪</option>
                            </select>
                        </div>
                    </div>

                    <Button
                        className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold mt-4"
                        onClick={handleManualKYCProposal}
                        loading={isSubmitting}
                    >
                        {isSubmitting ? 'Creating Proposal...' : 'Create KYC Update Proposal'}
                    </Button>
                </div>
            )}
        </div>
    )
}

// ============ YIELD FORM (now functional) ============
function YieldForm({ publicKey, addToast }: { publicKey: string; addToast: any }) {
    const [tokenAddress, setTokenAddress] = useState(USDC_TESTNET_ADDRESS)
    const [amount, setAmount] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!tokenAddress || !amount) {
            addToast('Please fill all fields', 'warning')
            return
        }

        setIsSubmitting(true)
        try {
            const amountBigInt = parseTokenAmount(amount, 6)

            const xdr = await writeContract.depositYield(publicKey, tokenAddress, amountBigInt)

            await signTransaction(xdr, {
                networkPassphrase: StellarSDK.Networks.TESTNET,
            })

            addToast('Yield deposited successfully! Token holders can now claim.', 'success')
            setAmount('')
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Failed to deposit yield', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2 font-heading">Distribute Yield</h3>
                <p className="text-zinc-400">Stream income to all token holders instantly.</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <p className="text-sm text-emerald-400/80 text-center">
                    💰 Yield is distributed proportionally based on token holdings at the time of deposit.
                </p>
            </div>

            <div className="space-y-4">
                <Input
                    label="Token Address"
                    placeholder="USDC Address..."
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    className="bg-black/20 border-white/10 text-white"
                />
                <Input
                    label="Amount"
                    type="number"
                    placeholder="0.00"
                    suffix="USDC"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-black/20 border-white/10 text-white"
                />
            </div>

            <div className="pt-4">
                <Button
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                >
                    {isSubmitting ? 'Depositing...' : 'Deposit Yield'}
                </Button>
            </div>
        </div>
    )
}
