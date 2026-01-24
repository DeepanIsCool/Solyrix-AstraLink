'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '../store'
import { contract } from '../contract'

/**
 * Custom hook to check if the connected wallet is a governor
 * Queries the contract's is_governor function
 */
export function useIsGovernor() {
    const { publicKey, isConnected } = useWallet()
    const [isGovernor, setIsGovernor] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function checkGovernor() {
            if (!publicKey || !isConnected) {
                setIsGovernor(false)
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            try {
                const result = await contract.isGovernor(publicKey)
                setIsGovernor(result)
            } catch (err) {
                console.error('Failed to check governor status:', err)
                setIsGovernor(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkGovernor()
    }, [publicKey, isConnected])

    return { isGovernor, isLoading }
}
