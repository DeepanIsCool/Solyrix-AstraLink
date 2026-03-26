'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { History, ExternalLink, FileSearch, Loader2, RefreshCw, ArrowUpRight, ArrowDownLeft, Flame, Snowflake, Shield, Vote, Coins, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CONTRACT_ID } from '@/lib/contract'
import { useContractEvents, ContractEvent } from '@/lib/hooks/useContractEvents'
import { useState } from 'react'

type FilterTab = 'all' | 'transfers' | 'governance' | 'compliance'

const filterTabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All Events' },
    { id: 'transfers', label: 'Transfers' },
    { id: 'governance', label: 'Governance' },
    { id: 'compliance', label: 'Compliance' },
]

function getEventIcon(type: string) {
    switch (type) {
        case 'Transfer': return ArrowUpRight
        case 'Mint': return Coins
        case 'Burn': return Flame
        case 'Freeze': return Snowflake
        case 'Unfreeze': return Snowflake
        case 'KYC Update': return Shield
        case 'Governance': return Vote
        case 'Compliance': return AlertTriangle
        default: return History
    }
}

function matchesFilter(event: ContractEvent, filter: FilterTab): boolean {
    if (filter === 'all') return true
    if (filter === 'transfers') return ['Transfer', 'Mint', 'Burn', 'Approval'].includes(event.type)
    if (filter === 'governance') return ['Governance', 'Freeze', 'Unfreeze'].includes(event.type)
    if (filter === 'compliance') return ['KYC Update', 'Compliance', 'Verification'].includes(event.type)
    return true
}

function formatLedger(ledger: number): string {
    return ledger.toLocaleString()
}

function formatAddress(addr: string): string {
    if (!addr || addr.length < 10) return addr || '—'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function HistoryPage() {
    const { events, isLoading, error, refetch, getEventColor } = useContractEvents()
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
    const [isRefreshing, setIsRefreshing] = useState(false)

    const filteredEvents = events.filter(e => matchesFilter(e, activeFilter))

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await refetch()
        setTimeout(() => setIsRefreshing(false), 500)
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 font-heading">Transaction History</h1>
                    <p className="text-zinc-400">Live on-chain event feed from Soroban RPC</p>
                </div>
                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRefresh}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </motion.button>
                    <a
                        href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="primary" icon={ExternalLink} className="bg-white text-black hover:bg-zinc-200 text-sm">
                            Stellar Expert
                        </Button>
                    </a>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 mb-6 p-1 bg-white/5 rounded-xl w-fit border border-white/5">
                {filterTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id)}
                        className={`
                            relative px-5 py-2 font-medium text-sm rounded-lg transition-all duration-300
                            ${activeFilter === tab.id
                                ? 'text-black font-bold'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                            }
                        `}
                    >
                        {activeFilter === tab.id && (
                            <motion.div
                                layoutId="historyActiveTab"
                                className="absolute inset-0 bg-gold-400 rounded-lg shadow-lg shadow-gold-500/20"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="glass-card rounded-2xl p-12 border-white/5 text-center">
                    <Loader2 className="w-8 h-8 text-gold-400 animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400">Fetching events from Soroban RPC...</p>
                </div>
            ) : error ? (
                /* Error State */
                <div className="glass-card rounded-2xl p-12 border-white/5 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="text-zinc-300 font-medium mb-2">Failed to fetch events</p>
                    <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">{error}</p>
                    <Button variant="primary" onClick={handleRefresh} className="bg-white text-black hover:bg-zinc-200">
                        Retry
                    </Button>
                </div>
            ) : filteredEvents.length === 0 ? (
                /* Empty State */
                <div className="glass-card rounded-2xl p-12 border-white/5 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="w-8 h-8 text-zinc-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 font-heading">
                        {activeFilter === 'all' ? 'No Events Found' : `No ${activeFilter} events`}
                    </h3>
                    <p className="text-zinc-400 max-w-md mx-auto mb-6">
                        {events.length === 0
                            ? "No recent events found on the contract. Events will appear here as transactions occur on the Stellar testnet."
                            : "Try a different filter or check back later."}
                    </p>

                    {/* Technical note */}
                    <div className="max-w-2xl mx-auto text-left mt-8">
                        <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 flex gap-4">
                            <div className="p-2 rounded-lg bg-indigo-500/20 shrink-0 h-fit">
                                <FileSearch className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-indigo-200 mb-1">Live Event Indexing</p>
                                <p className="text-xs text-indigo-300/70 leading-relaxed">
                                    This page fetches events directly from Soroban RPC&apos;s{' '}
                                    <code className="px-1.5 py-0.5 bg-black/30 rounded text-indigo-200 font-mono border border-indigo-500/20">getEvents</code>{' '}
                                    endpoint. Events from transfers, governance proposals, compliance violations, and more will appear here automatically.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Event List */
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {filteredEvents.map((event, i) => {
                            const Icon = getEventIcon(event.type)
                            const colorClasses = getEventColor(event.type)

                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="glass-card rounded-xl p-5 border-white/10 hover:border-white/20 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Icon */}
                                        <div className={`p-2.5 rounded-xl border ${colorClasses}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-white text-sm">{event.type}</span>
                                                <Badge variant="neutral" className="text-[10px] px-2 py-0.5 bg-white/5 border-white/10 text-zinc-500">
                                                    Ledger #{formatLedger(event.ledger)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                                                {event.topic.slice(1).map((t, idx) => (
                                                    <span key={idx} className="truncate max-w-[120px]">
                                                        {formatAddress(String(t))}
                                                    </span>
                                                ))}
                                                {event.data !== null && event.data !== undefined && (
                                                    <span className="text-zinc-400 font-sans">
                                                        {typeof event.data === 'object'
                                                            ? JSON.stringify(event.data).slice(0, 50)
                                                            : String(event.data).slice(0, 30)
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tx link */}
                                        {event.txHash && (
                                            <a
                                                href={`https://stellar.expert/explorer/testnet/tx/${event.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg text-zinc-600 hover:text-white hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>

                    {/* Summary */}
                    <div className="text-center py-4">
                        <p className="text-xs text-zinc-600">
                            Showing {filteredEvents.length} of {events.length} events • Auto-refreshes every 30s
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
