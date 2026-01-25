'use client'

import { motion } from 'framer-motion'
import { Wallet, X, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useWallet } from '@/lib/store'
import {
    isConnected,
    isAllowed,
    setAllowed,
    getAddress,
    getNetworkDetails
} from '@stellar/freighter-api'

export function WalletButton() {
    const { isConnected: walletConnected, publicKey, setConnected, disconnect } = useWallet()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        checkConnection()
    }, [])

    const checkConnection = async () => {
        try {
            const connected = await isConnected()

            if (connected) {
                const allowed = await isAllowed()

                if (allowed) {
                    const { address } = await getAddress()
                    setConnected(true, address)
                }
            }
        } catch (error) {
            console.error('Error checking Freighter connection:', error)
        }
    }

    const connectWallet = async () => {
        setIsLoading(true)

        try {
            // Check if Freighter is installed
            const connected = await isConnected()

            if (!connected) {
                setIsLoading(false)
                const shouldDownload = window.confirm(
                    'Freighter wallet extension not found.\n\nWould you like to install it?'
                )
                if (shouldDownload) {
                    window.open('https://www.freighter.app/', '_blank')
                }
                return
            }

            // Request permission
            await setAllowed()

            // Get the public key
            const { address } = await getAddress()

            // Get network details
            const network = await getNetworkDetails()

            setConnected(true, address)

        } catch (error) {
            console.error('❌ Error connecting wallet:', error)
            alert(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsLoading(false)
        }
    }

    const disconnectWallet = () => {
        disconnect()
    }

    if (walletConnected && publicKey) {
        return (
            <div className="relative group">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={disconnectWallet}
                    className="flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-red-500/30 transition-all duration-200 group"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-sm font-mono font-medium text-zinc-300 group-hover:text-white transition-colors">
                            {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
                        </span>
                    </div>
                    <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-red-400 transition-colors" />
                </motion.button>

                {/* Tooltip */}
                <div className="absolute top-full mt-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-md text-xs text-white px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap">
                        Click to disconnect
                    </div>
                </div>
            </div>
        )
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={connectWallet}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gold-400 to-amber-600 text-black rounded-xl font-bold text-sm shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 hover:brightness-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Wallet className="w-4 h-4" />
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </motion.button>
    )
}
