'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { History, ExternalLink, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CONTRACT_ID } from '@/lib/contract'

export default function HistoryPage() {
    return (
        <div className="max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-brown-800 mb-2">Transaction History</h1>
                <p className="text-brown-400">Complete audit trail of all on-chain activity</p>
            </div>

            {/* Info Card */}
            <Card>
                <div className="text-center py-12">
                    <History className="w-16 h-16 text-brown-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-brown-800 mb-3">
                        Transaction History Requires Indexing
                    </h3>
                    <p className="text-brown-500 mb-6 max-w-2xl mx-auto">
                        To display transaction history, an event indexer is required to parse and store blockchain events.
                        You can view all contract transactions directly on Stellar Expert.
                    </p>

                    <a
                        href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="primary" icon={ExternalLink}>
                            View on Stellar Expert
                        </Button>
                    </a>

                    <div className="mt-8 p-4 rounded-lg bg-brown-50/50 border border-brown-200 max-w-2xl mx-auto">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-brown-400 flex-shrink-0 mt-0.5" />
                            <div className="text-left">
                                <p className="text-sm font-medium text-brown-700 mb-1">
                                    Future Enhancement
                                </p>
                                <p className="text-xs text-brown-500">
                                    Implement event parsing using Soroban RPC's <code className="px-1 py-0.5 bg-brown-100 rounded text-brown-700">getEvents</code> method
                                    or integrate with a third-party indexing service to display historical transactions directly in the dashboard.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
