'use client'

import { useState, useEffect } from 'react'
import { contract } from '@/lib/contract'

interface TokenMetadata {
    name: string
    symbol: string
    decimals: number
    totalSupply: string
}

export function useTokenMetadata() {
    const [metadata, setMetadata] = useState<TokenMetadata | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchMetadata() {
            try {
                const [name, symbol, decimals, totalSupply] = await Promise.all([
                    contract.name(),
                    contract.symbol(),
                    contract.decimals(),
                    contract.totalSupply(),
                ])

                setMetadata({
                    name,
                    symbol,
                    decimals,
                    totalSupply: (totalSupply / BigInt(10 ** decimals)).toString(),
                })
            } catch (err) {
                console.error('Failed to fetch token metadata:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMetadata()
    }, [])

    return { metadata, isLoading }
}
