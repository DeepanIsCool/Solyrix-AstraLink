'use client'

import { useState, useEffect, useCallback } from 'react'
import { contract, formatTokenAmount, writeContract } from '@/lib/contract'
import { useWallet, useToast } from '@/lib/store'
import { signTransaction } from '@stellar/freighter-api'
import * as StellarSDK from '@stellar/stellar-sdk'

export function usePendingYield() {
    const { publicKey } = useWallet()
    const { addToast } = useToast()
    const [yieldAmount, setYieldAmount] = useState<string>('0.00')
    const [yieldRaw, setYieldRaw] = useState<bigint>(BigInt(0))
    const [hasYield, setHasYield] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isClaiming, setIsClaiming] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchPendingYield = useCallback(async () => {
        if (!publicKey) {
            setYieldAmount('0.00')
            setYieldRaw(BigInt(0))
            setHasYield(false)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const pendingBigInt = await contract.getPendingYield(publicKey)
            setYieldRaw(pendingBigInt)
            const formatted = formatTokenAmount(pendingBigInt, 6)
            setYieldAmount(formatted)
            setHasYield(pendingBigInt > BigInt(0))
        } catch (err) {
            console.error('Failed to fetch pending yield:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch pending yield')
            setYieldAmount('0.00')
            setYieldRaw(BigInt(0))
            setHasYield(false)
        } finally {
            setIsLoading(false)
        }
    }, [publicKey])

    const claim = useCallback(async () => {
        if (!publicKey || !hasYield) {
            return
        }

        setIsClaiming(true)

        try {
            const xdr = await writeContract.claimYield(publicKey)

            await signTransaction(xdr, {
                networkPassphrase: StellarSDK.Networks.TESTNET,
            })

            addToast(`Successfully claimed ${yieldAmount} USDC!`, 'success')

            // Refresh the yield amount
            await fetchPendingYield()
        } catch (err) {
            console.error('Failed to claim yield:', err)
            addToast(err instanceof Error ? err.message : 'Failed to claim yield', 'error')
        } finally {
            setIsClaiming(false)
        }
    }, [publicKey, hasYield, yieldAmount, addToast, fetchPendingYield])

    useEffect(() => {
        fetchPendingYield()

        // Poll every 10 seconds
        const interval = setInterval(fetchPendingYield, 10000)
        return () => clearInterval(interval)
    }, [fetchPendingYield])

    return {
        yieldAmount,
        yieldRaw,
        hasYield,
        isLoading,
        isClaiming,
        error,
        claim,
        refetch: fetchPendingYield
    }
}
