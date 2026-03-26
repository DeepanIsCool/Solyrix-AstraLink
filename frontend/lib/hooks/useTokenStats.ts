import { useState, useEffect, useCallback } from 'react'
import { contract } from '@/lib/contract'

interface TokenStats {
    totalSupply: string
    name: string
    symbol: string
    decimals: number
}

export function useTokenStats() {
    const [stats, setStats] = useState<TokenStats>({
        totalSupply: '0',
        name: '',
        symbol: '',
        decimals: 6,
    })
    const [isLoading, setIsLoading] = useState(true)

    const fetchStats = useCallback(async () => {
        try {
            const [totalSupply, name, symbol, decimals] = await Promise.all([
                contract.totalSupply(),
                contract.name(),
                contract.symbol(),
                contract.decimals(),
            ])

            setStats({
                totalSupply: (Number(totalSupply) / 1_000_000).toFixed(2),
                name: name,
                symbol: symbol,
                decimals: decimals,
            })
        } catch (err) {
            console.error('Failed to fetch token stats:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStats()
        const interval = setInterval(fetchStats, 30_000) // Refresh every 30s
        return () => clearInterval(interval)
    }, [fetchStats])

    return { stats, isLoading, refetch: fetchStats }
}
