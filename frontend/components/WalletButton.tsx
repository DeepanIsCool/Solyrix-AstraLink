'use client'

import { motion } from 'framer-motion'
import { Wallet, X } from 'lucide-react'
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
            console.log('Freighter isConnected:', connected)

            if (connected) {
                const allowed = await isAllowed()
                console.log('Freighter isAllowed:', allowed)

                if (allowed) {
                    const { address } = await getAddress()
                    console.log('Got public key:', address)
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
            console.log('Freighter installed:', connected)

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
            console.log('Requesting wallet access...')
            await setAllowed()

            // Get the public key
            console.log('Getting address...')
            const { address } = await getAddress()

            // Get network details
            const network = await getNetworkDetails()
            console.log('Connected to network:', network)

            console.log('✅ Wallet connected! Public key:', address)
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
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={disconnectWallet}
                className="flex items-center gap-3 px-4 py-2 bg-white rounded-button shadow-premium-md border border-brown-200 group"
            >
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-sm font-mono text-brown-600">
                        {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
                    </span>
                </div>
                <X className="w-4 h-4 text-brown-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
        )
    }

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={connectWallet}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-brown-600 text-cream-50 rounded-button font-medium shadow-premium-md hover:shadow-premium-lg transition-all duration-300 disabled:opacity-50"
        >
            <Wallet className="w-5 h-5" />
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </motion.button>
    )
}
