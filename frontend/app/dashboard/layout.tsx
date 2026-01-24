'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Send,
    Vote,
    Shield,
    Settings,
    History
} from 'lucide-react'
import { WalletButton } from '@/components/WalletButton'
import { useWallet } from '@/lib/store'

const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transfer', href: '/dashboard/transfer', icon: Send },
    { name: 'Governance', href: '/dashboard/governance', icon: Vote },
    { name: 'Compliance', href: '/dashboard/compliance', icon: Shield },
    { name: 'History', href: '/dashboard/history', icon: History },
]

const adminNavigation = [
    { name: 'Admin', href: '/dashboard/admin', icon: Settings },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const { isConnected } = useWallet()

    // For now, assume non-governor (will implement proper check later)
    const isGovernor = false

    return (
        <div className="min-h-screen bg-cream-100">
            {/* Header */}
            <header className="h-16 border-b border-brown-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="h-full px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brown-600 to-brown-500" />
                        <span className="text-xl font-semibold text-brown-800">AstraLink</span>
                    </Link>

                    {/* Wallet */}
                    <WalletButton />
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex">
                {/* Sidebar Navigation */}
                <aside className="w-60 min-h-[calc(100vh-4rem)] border-r border-brown-200 bg-white/50 p-6">
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block"
                                >
                                    <motion.div
                                        whileHover={{ x: 4 }}
                                        className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                                                ? 'bg-brown-100 text-brown-800'
                                                : 'text-brown-400 hover:text-brown-700 hover:bg-brown-50'
                                            }
                    `}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.name}
                                    </motion.div>
                                </Link>
                            )
                        })}

                        {/* Admin Section (Governors Only) */}
                        {isGovernor && (
                            <>
                                <div className="pt-6 mt-6 border-t border-brown-200">
                                    <p className="px-3 text-xs font-medium text-brown-300 uppercase tracking-wider mb-2">
                                        Administration
                                    </p>
                                    {adminNavigation.map((item) => {
                                        const isActive = pathname === item.href
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className="block"
                                            >
                                                <motion.div
                                                    whileHover={{ x: 4 }}
                                                    className={`
                            flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                            ${isActive
                                                            ? 'bg-brown-100 text-brown-800'
                                                            : 'text-brown-400 hover:text-brown-700 hover:bg-brown-50'
                                                        }
                          `}
                                                >
                                                    <item.icon className="w-5 h-5" />
                                                    {item.name}
                                                </motion.div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </nav>

                    {/* Contract Info */}
                    <div className="mt-auto pt-6">
                        <div className="p-3 rounded-lg bg-brown-50 border border-brown-100">
                            <p className="text-xs text-brown-300 mb-1">Network</p>
                            <p className="text-sm font-medium text-brown-600">Stellar Testnet</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-12">
                    {children}
                </main>
            </div>
        </div>
    )
}
