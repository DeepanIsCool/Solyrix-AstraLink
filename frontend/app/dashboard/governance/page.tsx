'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Vote, CheckCircle2, Loader2, Plus, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useProposals } from '@/lib/hooks/useProposals'
import { useWallet, useToast } from '@/lib/store'
import { useIsGovernor } from '@/lib/hooks/useIsGovernor'
import { writeContract } from '@/lib/contract'
import { signTransaction } from '@stellar/freighter-api'

export default function GovernancePage() {
    const { publicKey } = useWallet()
    const { addToast } = useToast()
    const { proposals, isLoading, refetch } = useProposals()
    const { isGovernor, isLoading: governorLoading } = useIsGovernor()
    const [activeTab, setActiveTab] = useState<'active' | 'approved' | 'expired'>('active')
    const [approvingId, setApprovingId] = useState<number | null>(null)

    const filteredProposals = proposals.filter(p => {
        if (activeTab === 'active') return !p.executed && !p.expired
        if (activeTab === 'approved') return p.executed
        return p.expired
    })

    const handleApprove = async (proposalId: number) => {
        if (!publicKey) {
            addToast('Please connect your wallet', 'error')
            return
        }

        setApprovingId(proposalId)

        try {
            const xdr = await writeContract.approveProposal(publicKey, proposalId)
            await signTransaction(xdr, {
                networkPassphrase: 'Test SDF Network ; September 2015',
            })

            addToast('Proposal approved successfully!', 'success')
            refetch()
        } catch (err) {
            console.error('Approval failed:', err)
            addToast(
                err instanceof Error ? err.message : 'Failed to approve proposal',
                'error'
            )
        } finally {
            setApprovingId(null)
        }
    }

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-brown-800 mb-2">Governance</h1>
                    <p className="text-brown-400">2-of-3 Multi-signature proposal system</p>
                </div>
                {isGovernor && (
                    <Button variant="primary" icon={Plus}>
                        Create Proposal
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-brown-200">
                {(['active', 'approved', 'expired'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
              px-4 py-2 font-medium text-sm capitalize transition-colors relative
              ${activeTab === tab
                                ? 'text-brown-800'
                                : 'text-brown-400 hover:text-brown-600'
                            }
            `}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brown-600"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {isLoading || governorLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-brown-400 animate-spin mr-3" />
                    <span className="text-brown-400">
                        {governorLoading ? 'Checking permissions...' : 'Loading proposals...'}
                    </span>
                </div>
            ) : filteredProposals.length === 0 ? (
                <div className="text-center py-12">
                    <Vote className="w-12 h-12 text-brown-300 mx-auto mb-3" />
                    <p className="text-brown-400">No {activeTab} proposals</p>
                    <p className="text-sm text-brown-300 mt-2">
                        {activeTab === 'active'
                            ? 'Governors can create proposals for mint, burn, freeze, or KYC updates'
                            : 'Check back later for updates'
                        }
                    </p>
                </div>
            ) : (
                /* Proposals Grid */
                <div className="grid gap-4">
                    {filteredProposals.map((proposal, i) => (
                        <motion.div
                            key={proposal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card hover>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-brown-800">
                                                #{proposal.id} {proposal.action}
                                            </h3>
                                            <Badge variant={
                                                !proposal.executed && !proposal.expired ? 'warning' :
                                                    proposal.executed ? 'success' : 'neutral'
                                            }>
                                                {proposal.executed ? 'Executed' : proposal.expired ? 'Expired' : 'Active'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-brown-300">
                                            Proposed by {proposal.proposer.slice(0, 8)}... •
                                            {proposal.expired ? ' Expired' : proposal.executed ? ' Executed' : ` Expires at ledger ${proposal.expiry_ledger}`}
                                        </p>
                                    </div>
                                </div>

                                {/* Approvals Tracker */}
                                <div className="mb-4 p-4 rounded-lg bg-brown-50/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-brown-600">
                                            Approvals: {proposal.approvals}/{proposal.threshold}
                                        </span>
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map((index) => {
                                                const hasApproval = index < proposal.approvals
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`
                              w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                              ${hasApproval
                                                                ? 'bg-success text-white'
                                                                : 'bg-brown-200 text-brown-400'
                                                            }
                            `}
                                                    >
                                                        {hasApproval ? '✓' : '○'}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-2 bg-brown-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(proposal.approvals / proposal.threshold) * 100}%` }}
                                            transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                                            className="h-full bg-gradient-to-r from-success to-success/80"
                                        />
                                    </div>
                                </div>

                                {!proposal.executed && !proposal.expired && isGovernor && (
                                    <div className="flex gap-3">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleApprove(proposal.id)}
                                            loading={approvingId === proposal.id}
                                        >
                                            {approvingId === proposal.id ? 'Approving...' : 'Approve'}
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            View Details
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Info Banner for Non-Governors */}
            {!isGovernor && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-lg bg-brown-50 border border-brown-200"
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-brown-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-brown-700 mb-1">Read-Only Access</p>
                            <p className="text-xs text-brown-500">
                                Only governors can create and approve proposals. You can view proposal status here.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
