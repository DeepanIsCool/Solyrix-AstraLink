'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@/lib/store'

// Use Horizon API for native XLM balance (Soroban RPC doesn't have balance info)
const HORIZON_URL = 'https://horizon-testnet.stellar.org'

export function useBalance() {
    const { publicKey } = useWallet()
    const [balance, setBalance] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchBalance = useCallback(async () => {
        if (!publicKey) {
            setBalance(null)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            // Fetch native XLM balance from Horizon API
            const response = await fetch(`${HORIZON_URL}/accounts/${publicKey}`)

            if (!response.ok) {
                throw new Error('Account not found')
            }

            const account = await response.json()

            // Find native XLM balance
            const xlmBalance = account.balances.find(
                (b: { asset_type: string; balance: string }) => b.asset_type === 'native'
            )

            if (xlmBalance) {
                // Format to 2 decimal places for display
                const formatted = parseFloat(xlmBalance.balance).toFixed(2)
                setBalance(formatted)
            } else {
                setBalance('0.00')
            }
        } catch (err) {
            console.error('Failed to fetch XLM balance:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch balance')
            setBalance(null)
        } finally {
            setIsLoading(false)
        }
    }, [publicKey])

    useEffect(() => {
        fetchBalance()

        // Poll every 10 seconds
        const interval = setInterval(fetchBalance, 10000)
        return () => clearInterval(interval)
    }, [fetchBalance])

    return { balance, isLoading, error, refetch: fetchBalance }
}
