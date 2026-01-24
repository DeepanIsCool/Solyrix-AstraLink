'use client'

import { useState, useEffect } from 'react'
import { contract } from '@/lib/contract'

interface Proposal {
    id: number
    action: string
    proposer: string
    approvals: number
    threshold: number
    approved_by: string[]
    executed: boolean
    expired: boolean
    expiry_ledger: number
}

export function useProposals() {
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProposals = async () => {
        setIsLoading(true)
        setError(null)

        try {
            // Try to fetch proposals by ID (0-20)
            // In production, you'd have a better way to track proposal IDs
            const proposalPromises = []
            for (let i = 0; i < 20; i++) {
                proposalPromises.push(
                    contract.getProposal(i).catch(() => null) // Return null if doesn't exist
                )
            }

            const results = await Promise.all(proposalPromises)
            const validProposals = results
                .filter((p): p is Proposal => p !== null)
                .map((p, index) => ({ ...p, id: index }))

            setProposals(validProposals)
        } catch (err) {
            console.error('Failed to fetch proposals:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch proposals')
            setProposals([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProposals()
    }, [])

    return { proposals, isLoading, error, refetch: fetchProposals }
}
