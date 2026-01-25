'use client'

import { motion } from 'framer-motion'
import { History, ExternalLink, AlertCircle, FileSearch } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CONTRACT_ID } from '@/lib/contract'

export default function HistoryPage() {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 font-heading">Transaction History</h1>
                <p className="text-zinc-400">Complete audit trail of all on-chain activity</p>
            </div>

            {/* Info Card */}
            <div className="glass-card rounded-2xl p-12 border-white/10 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <History className="w-10 h-10 text-zinc-400" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 font-heading">
                    Transaction History Requires Indexing
                </h3>

                <p className="text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                    To display transaction history effectively, an event indexer is required to parse and store blockchain events.
                    All transactions are publicly verifiable on the Stellar network.
                </p>

                <div className="flex justify-center mb-12">
                    <a
                        href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                    >
                        <Button variant="primary" icon={ExternalLink} className="bg-white text-black hover:bg-zinc-200">
                            View on Stellar Expert
                        </Button>
                    </a>
                </div>

                <div className="max-w-2xl mx-auto text-left">
                    <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 flex gap-4">
                        <div className="p-2 rounded-lg bg-indigo-500/20 shrink-0 h-fit">
                            <FileSearch className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-indigo-200 mb-1">
                                Technical Implementation Note
                            </p>
                            <p className="text-xs text-indigo-300/70 leading-relaxed">
                                Production environments should implement event parsing using Soroban RPC's <code className="px-1.5 py-0.5 bg-black/30 rounded text-indigo-200 font-mono border border-indigo-500/20">getEvents</code> method
                                or integrate with a Mercury indexer to display historical transactions directly in this dashboard.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
