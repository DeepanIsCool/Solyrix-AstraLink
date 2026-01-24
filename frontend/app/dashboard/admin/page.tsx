'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Coins, Flame, Snowflake, UserCheck, Shield, ShieldX, Banknote } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useWallet, useToast } from '@/lib/store'
import { useIsGovernor } from '@/lib/hooks/useIsGovernor'
import { writeContract, parseTokenAmount } from '@/lib/contract'
import { signTransaction } from '@stellar/freighter-api'
import * as StellarSDK from '@stellar/stellar-sdk'

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
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-brown-600/10">
                    <UserCheck className="w-6 h-6 text-brown-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-brown-800">Update KYC Record</h3>
                    <p className="text-sm text-brown-400">Modify investor compliance status</p>
                </div>
            </div>

            <Input label="Investor Address" placeholder="GXXXXXXXXXXXXXXXXXXXXXXX..." />

            <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">Verification Status</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-brown-200 focus:outline-none focus:ring-2 focus:ring-brown-500">
                    <option>Verified</option>
                    <option>Pending</option>
                    <option>Rejected</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">Investor Type</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-brown-200 focus:outline-none focus:ring-2 focus:ring-brown-500">
                    <option>Accredited</option>
                    <option>Retail</option>
                    <option>Institutional</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">Jurisdiction</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-brown-200 focus:outline-none focus:ring-2 focus:ring-brown-500">
                    <option>United States (US)</option>
                    <option>Singapore (SG)</option>
                    <option>European Union (EU)</option>
                    <option>United Arab Emirates (AE)</option>
                </select>
            </div>

            <Button variant="primary" icon={UserCheck} className="w-full">
                Create KYC Update Proposal
            </Button>
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
