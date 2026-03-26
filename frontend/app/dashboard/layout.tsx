'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { SparklesCore } from "@/components/ui/sparkles"
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
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },

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
    const router = useRouter()
    const { isConnected } = useWallet()

    return (
        <div className="min-h-screen bg-obsidian-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-obsidian-950 to-obsidian-950 text-white selection:bg-gold-500/30">

            {/* Ambient Background Grid */}
            <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

            {/* Sparkles Effect */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <SparklesCore
                    id="dashboard-sparkles"
                    background="transparent"
                    minSize={0.6}
                    maxSize={1.4}
                    particleDensity={40}
                    className="w-full h-full"
                    particleColor="#FFFFFF"
                />
            </div>

            {/* Header */}
            <header className="h-24 border-b border-white/5 bg-obsidian-950/50 backdrop-blur-md sticky top-0 z-50">
                <div className="h-full px-8 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center relative">
                        <Image
                            src="/logo.png"
                            alt="AstraLink Logo"
                            width={240}
                            height={80}
                            priority
                            className="object-contain h-full w-auto"
                        />
                    </div>

                    {/* Wallet */}
                    <WalletButton />
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex relative z-10">
                {/* Sidebar Navigation - Floating Glass Dock */}
                <aside className="fixed right-6 top-24 w-64 h-[calc(100vh-8rem)] rounded-2xl glass-card border-white/5 p-4 hidden lg:block">
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block"
                                    prefetch={false}
                                    onClick={(e) => {
                                        if (item.name === 'Dashboard') {
                                            e.preventDefault()
                                            router.push('/dashboard')
                                        }
                                    }}
                                >
                                    <motion.div
                                        whileHover={{ x: 4 }}
                                        className={`
                                            relative overflow-hidden group
                                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                                            ${isActive
                                                ? 'text-gold-400 bg-gold-400/10 shadow-[0_0_15px_rgba(250,204,21,0.1)] border border-gold-400/20'
                                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        <item.icon className="w-5 h-5 relative z-10" />
                                        <span className="relative z-10">{item.name}</span>

                                        {/* Hover Glow Bar */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                                    </motion.div>
                                </Link>
                            )
                        })}

                        {/* Admin Section */}
                        <div className="mt-8 pt-8 border-t border-white/5">
                            <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
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
                                                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                                                ${isActive
                                                    ? 'text-purple-400 bg-purple-500/10 border border-purple-500/20'
                                                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
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
                    </nav>

                    {/* Network Status Pill */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between px-4 py-3 rounded-full bg-black/40 border border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-medium text-emerald-500">Testnet Live</span>
                            </div>
                            <span className="text-xs text-zinc-600">v1.2</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 lg:mr-72 p-6 lg:p-8 min-h-screen pb-24 lg:pb-8">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-obsidian-950/90 backdrop-blur-xl border-t border-white/10">
                <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex flex-col items-center justify-center gap-1 flex-1 py-2 relative"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="mobileNavIndicator"
                                        className="absolute -top-px left-3 right-3 h-0.5 bg-gold-400 rounded-b shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <item.icon className={`w-5 h-5 transition-colors ${
                                    isActive ? 'text-gold-400' : 'text-zinc-500'
                                }`} />
                                <span className={`text-[10px] font-medium transition-colors ${
                                    isActive ? 'text-gold-400' : 'text-zinc-600'
                                }`}>
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}
