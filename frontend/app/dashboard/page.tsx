'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Coins, Send, Shield, Clock } from 'lucide-react'
import Link from 'next/link'
import { WalletButton } from '@/components/WalletButton'
import { useWallet } from '@/lib/store'
import { useState } from 'react'

export default function Dashboard() {
    const { isConnected, publicKey } = useWallet()
    const [amount, setAmount] = useState('')
    const [recipient, setRecipient] = useState('')

    // Mock data - in production, fetch from contract
    const balance = '10,000,000.000000'
    const symbol = 'MTT'

    if (!isConnected) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-brown-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card-premium max-w-md text-center"
                >
                    <Shield className="w-16 h-16 text-gold mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-brown-800 mb-2">Connect Your Wallet</h2>
                    <p className="text-brown-400 mb-6">Please connect your Freighter wallet to access the dashboard</p>
                    <WalletButton />
                </motion.div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-brown-50">
            {/* Header */}
            <div className="border-b border-brown-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-brown-600 hover:text-brown-700">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </Link>
                    <h1 className="text-xl font-bold text-brown-800">AstraLink Dashboard</h1>
                    <WalletButton />
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 max-w-6xl">
                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-premium mb-8 bg-gradient-to-br from-brown-600 to-brown-500 text-cream-50 border-none shadow-premium-xl"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Coins className="w-6 h-6 text-gold" />
                        <span className="text-sm font-medium opacity-90">Total Balance</span>
                    </div>
                    <div className="text-5xl font-bold mb-1">{balance}</div>
                    <div className="text-lg opacity-75">{symbol} Tokens</div>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {[
                        { label: 'Available', value: balance, icon: Coins },
                        { label: 'KYC Status', value: 'Verified', icon: Shield },
                        { label: 'Holding Period', value: '0 days', icon: Clock },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="card-premium"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <stat.icon className="w-5 h-5 text-brown-400" />
                                <span className="text-sm text-brown-400">{stat.label}</span>
                            </div>
                            <div className="text-2xl font-bold text-brown-800">{stat.value}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Transfer Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card-premium"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Send className="w-6 h-6 text-brown-600" />
                        <h2 className="text-2xl font-bold text-brown-800">Transfer Tokens</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-brown-600 mb-2">Recipient Address</label>
                            <input
                                type="text"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                                className="w-full px-4 py-3 rounded-input border border-brown-200 focus:border-brown-400 focus:ring-2 focus:ring-brown-400/20 outline-none transition-all font-mono text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brown-600 mb-2">Amount</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.000000"
                                    className="w-full px-4 py-3 rounded-input border border-brown-200 focus:border-brown-400 focus:ring-2 focus:ring-brown-400/20 outline-none transition-all"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brown-400 font-medium">{symbol}</div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={!amount || !recipient}
                            className="w-full py-4 bg-brown-600 text-cream-50 rounded-button font-medium shadow-premium-md hover:shadow-premium-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Send className="w-5 h-5" />
                            Transfer Tokens
                        </motion.button>

                        <p className="text-xs text-brown-400 text-center">
                            Transfer will be verified against compliance rules (KYC, accreditation, limits)
                        </p>
                    </div>
                </motion.div>

                {/* Contract Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 p-4 rounded-card bg-brown-50/50 border border-brown-100"
                >
                    <div className="text-xs text-brown-400 space-y-1">
                        <div className="flex justify-between">
                            <span>Network:</span>
                            <span className="font-mono text-brown-600">Stellar Testnet</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Contract ID:</span>
                            <span className="font-mono text-brown-600">CBYZE6XD6NXCS3SMRI...</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    )
}
