'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Vote, CheckCircle2, Loader2, Plus, AlertCircle, Check } from 'lucide-react'
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
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 font-heading">Governance</h1>
                    <p className="text-zinc-400">2-of-3 Multi-signature proposal system</p>
                </div>
                {isGovernor && (
                    <Button variant="primary" icon={Plus} className="bg-gradient-to-r from-gold-400 to-amber-600 text-black border-none hover:brightness-110">
                        Create Proposal
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 p-1 bg-white/5 rounded-xl w-fit border border-white/5">
                {(['active', 'approved', 'expired'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                          relative px-6 py-2.5 font-medium text-sm capitalize rounded-lg transition-all duration-300
                          ${activeTab === tab
                                ? 'text-black font-bold'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                            }
                        `}
                    >
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-gold-400 rounded-lg shadow-lg shadow-gold-500/20"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{tab}</span>
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {isLoading || governorLoading ? (
                <div className="flex items-center justify-center py-20 glass-card rounded-2xl border-white/5">
                    <Loader2 className="w-8 h-8 text-gold-400 animate-spin mr-3" />
                    <span className="text-zinc-400">
                        {governorLoading ? 'Checking permissions...' : 'Loading proposals...'}
                    </span>
                </div>
            ) : filteredProposals.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-2xl border-white/5 bg-black/20">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Vote className="w-8 h-8 text-zinc-500" />
                    </div>
                    <p className="text-zinc-300 font-medium text-lg">No {activeTab} proposals</p>
                    <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto">
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
                            <div className="glass-card rounded-xl p-6 border-white/10 hover:border-gold-500/30 transition-colors group">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-white font-heading group-hover:text-gold-400 transition-colors">
                                                #{proposal.id} {proposal.action}
                                            </h3>
                                            <Badge variant={
                                                !proposal.executed && !proposal.expired ? 'warning' :
                                                    proposal.executed ? 'success' : 'neutral'
                                            } className="glass-card border-white/20">
                                                {proposal.executed ? 'Executed' : proposal.expired ? 'Expired' : 'Active'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-zinc-500 font-mono">
                                            Proposed by {proposal.proposer.slice(0, 8)}... •
                                            {proposal.expired ? ' Expired' : proposal.executed ? ' Executed' : ` Expires at ledger ${proposal.expiry_ledger}`}
                                        </p>
                                    </div>
                                </div>

                                {/* Approvals Tracker */}
                                <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-zinc-300">
                                            Approvals: <span className="text-white">{proposal.approvals}</span>/<span className="text-zinc-500">{proposal.threshold}</span>
                                        </span>
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map((index) => {
                                                const hasApproval = index < proposal.approvals
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`
                                                          w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
                                                          ${hasApproval
                                                                ? 'bg-green-500 text-black shadow-lg shadow-green-500/20'
                                                                : 'bg-white/5 text-zinc-600 border border-white/5'
                                                            }
                                                        `}
                                                    >
                                                        {hasApproval ? <Check className="w-4 h-4" /> : '○'}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(proposal.approvals / proposal.threshold) * 100}%` }}
                                            transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                                        />
                                    </div>
                                </div>

                                {!proposal.executed && !proposal.expired && isGovernor && (
                                    <div className="flex gap-4">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="flex-1 bg-white text-black hover:bg-zinc-200 font-bold"
                                            onClick={() => handleApprove(proposal.id)}
                                            loading={approvingId === proposal.id}
                                        >
                                            {approvingId === proposal.id ? 'Approving...' : 'Approve Proposal'}
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                                            View Details
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Info Banner for Non-Governors */}
            {!isGovernor && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
                >
                    <div className="flex items-start gap-4">
                        <AlertCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-indigo-200 mb-1">Read-Only Access</p>
                            <p className="text-xs text-indigo-300/70">
                                Only governors can create and approve proposals. You can view proposal status here.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
