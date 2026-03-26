import { useState, useEffect, useCallback } from 'react'
import { server, CONTRACT_ID } from '@/lib/contract'
import * as StellarSDK from '@stellar/stellar-sdk'

export interface ContractEvent {
    id: string
    type: string
    topic: string[]
    data: any
    ledger: number
    timestamp: string
    txHash: string
}

// Map event topics to human-readable types
function getEventType(topics: string[]): string {
    if (!topics || topics.length === 0) return 'Unknown'
    const first = String(topics[0]).toLowerCase()
    if (first.includes('transfer')) return 'Transfer'
    if (first.includes('mint')) return 'Mint'
    if (first.includes('burn')) return 'Burn'
    if (first.includes('approve')) return 'Approval'
    if (first.includes('frozen') || first.includes('freeze')) return 'Freeze'
    if (first.includes('unfrozen') || first.includes('unfreeze')) return 'Unfreeze'
    if (first.includes('kyc')) return 'KYC Update'
    if (first.includes('proposal') || first.includes('prop')) return 'Governance'
    if (first.includes('compliance') || first.includes('violation')) return 'Compliance'
    if (first.includes('init')) return 'Initialize'
    if (first.includes('yield')) return 'Yield'
    if (first.includes('verified')) return 'Verification'
    return topics[0] || 'Unknown'
}

function getEventColor(type: string): string {
    switch (type) {
        case 'Transfer': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
        case 'Mint': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        case 'Burn': return 'text-red-400 bg-red-500/10 border-red-500/20'
        case 'Freeze': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
        case 'Unfreeze': return 'text-teal-400 bg-teal-500/10 border-teal-500/20'
        case 'KYC Update': return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
        case 'Governance': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
        case 'Compliance': return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
        case 'Yield': return 'text-green-400 bg-green-500/10 border-green-500/20'
        default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
    }
}

export function useContractEvents() {
    const [events, setEvents] = useState<ContractEvent[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchEvents = useCallback(async () => {
        try {
            // Get the latest ledger info
            const latestLedger = await server.getLatestLedger()
            
            // Fetch events from recent ledgers (last ~1000 ledgers ≈ ~1 hour)
            const startLedger = Math.max(1, latestLedger.sequence - 5000)
            
            const response = await server.getEvents({
                startLedger: startLedger,
                filters: [
                    {
                        type: 'contract',
                        contractIds: [CONTRACT_ID],
                    },
                ],
                limit: 50,
            })

            if (response.events && response.events.length > 0) {
                const parsed: ContractEvent[] = response.events.map((event: any, index: number) => {
                    // Parse topics
                    const topics = (event.topic || []).map((t: any) => {
                        try {
                            return StellarSDK.scValToNative(StellarSDK.xdr.ScVal.fromXDR(t, 'base64'))
                        } catch {
                            return String(t)
                        }
                    })

                    // Parse data
                    let data: any = null
                    if (event.value) {
                        try {
                            data = StellarSDK.scValToNative(StellarSDK.xdr.ScVal.fromXDR(event.value, 'base64'))
                        } catch {
                            data = event.value
                        }
                    }

                    return {
                        id: `${event.id || index}`,
                        type: getEventType(topics),
                        topic: topics.map(String),
                        data: data,
                        ledger: event.ledger || 0,
                        timestamp: event.createdAt || new Date().toISOString(),
                        txHash: event.txHash || '',
                    }
                }).reverse() // Most recent first

                setEvents(parsed)
            } else {
                setEvents([])
            }
            setError(null)
        } catch (err) {
            console.error('Failed to fetch contract events:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch events')
            setEvents([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchEvents()
        const interval = setInterval(fetchEvents, 30_000)
        return () => clearInterval(interval)
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents, getEventColor }
}
