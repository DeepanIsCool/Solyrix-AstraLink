import { WebcamPixelGrid } from "@/components/ui/webcam-pixel-grid";
import { EncryptedText } from "@/components/ui/encrypted-text";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
    Shield, Fingerprint, Coins, Users, ArrowRight,
    Zap, Globe, BarChart3,
    GitBranch, Layers, ChevronDown
} from "lucide-react";

// ============ ANIMATED COUNTER ============
function AnimatedCounter({ end, suffix = "", prefix = "", duration = 2000 }: {
    end: number; suffix?: string; prefix?: string; duration?: number;
}) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [isInView, end, duration]);

    return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ============ FEATURE DATA ============
const features = [
    {
        icon: Shield,
        title: "11-Point Compliance Engine",
        description: "Automated KYC, AML, accreditation checks, jurisdiction restrictions, holding periods, and ownership limits — all on-chain.",
        color: "from-blue-500/20 to-cyan-500/10",
        iconColor: "text-blue-400",
        borderColor: "border-blue-500/20",
    },
    {
        icon: Fingerprint,
        title: "Zero-Knowledge Identity",
        description: "Privacy-preserving KYC via Anon Aadhaar ZK Proofs. Verify humanity without revealing personal data on-chain.",
        color: "from-purple-500/20 to-pink-500/10",
        iconColor: "text-purple-400",
        borderColor: "border-purple-500/20",
    },
    {
        icon: Coins,
        title: "Yield Streaming",
        description: "Automated proportional yield distribution. Admin deposits USDC, holders claim their share in one click. Gas-efficient lazy claiming.",
        color: "from-emerald-500/20 to-green-500/10",
        iconColor: "text-emerald-400",
        borderColor: "border-emerald-500/20",
    },
    {
        icon: Users,
        title: "2-of-3 Multi-Sig Governance",
        description: "Every critical operation — mint, burn, freeze, KYC updates — requires approval from 2 of 3 governors. No single point of failure.",
        color: "from-amber-500/20 to-orange-500/10",
        iconColor: "text-amber-400",
        borderColor: "border-amber-500/20",
    },
];

// ============ HOW IT WORKS STEPS ============
const steps = [
    {
        number: "01",
        title: "Tokenize",
        description: "Deploy SEP-41 compliant tokens representing real estate, private equity, or commodities on Stellar.",
        icon: Layers,
        gradient: "from-gold-400 to-amber-500",
    },
    {
        number: "02",
        title: "Comply",
        description: "Automated 11-point compliance checks enforce KYC, AML, Reg D accreditation, and jurisdiction rules on every transfer.",
        icon: Shield,
        gradient: "from-blue-400 to-cyan-500",
    },
    {
        number: "03",
        title: "Trade & Earn",
        description: "Investors transfer tokens peer-to-peer with instant settlement. Yield from real assets streams directly to token holders.",
        icon: BarChart3,
        gradient: "from-emerald-400 to-green-500",
    },
];

// ============ ARCHITECTURE LAYERS ============
const architectureLayers = [
    {
        label: "Frontend Layer",
        items: ["Next.js 16 Dashboard", "Freighter Wallet", "Anon Aadhaar ZK"],
        color: "bg-purple-500/10 border-purple-500/30 text-purple-300",
        dotColor: "bg-purple-400",
    },
    {
        label: "Smart Contracts",
        items: ["RWA Token (SEP-41)", "Identity SBT", "Compliance Engine", "Multi-Sig Governance"],
        color: "bg-gold-400/10 border-gold-500/30 text-gold-400",
        dotColor: "bg-gold-400",
    },
    {
        label: "Stellar Network",
        items: ["Soroban Runtime", "Testnet/Mainnet", "USDC Integration"],
        color: "bg-blue-500/10 border-blue-500/30 text-blue-300",
        dotColor: "bg-blue-400",
    },
];

// ============ JURISDICTION DATA ============
const jurisdictions = [
    { code: "US", flag: "🇺🇸", name: "United States", regulation: "Reg D / Reg S" },
    { code: "SG", flag: "🇸🇬", name: "Singapore", regulation: "VCC Framework" },
    { code: "EU", flag: "🇪🇺", name: "European Union", regulation: "MiCA Compliant" },
    { code: "AE", flag: "🇦🇪", name: "UAE", regulation: "SCA Regulated" },
];

// ============ MAIN COMPONENT ============
export default function WebcamPixelGridDemo() {
    return (
        <div className="relative w-full bg-black">

            {/* ===== SECTION 1: HERO WITH WEBCAM ===== */}
            <section className="relative h-screen w-screen overflow-hidden">
                {/* Webcam pixel grid background */}
                <div className="absolute inset-0">
                    <WebcamPixelGrid
                        gridCols={60}
                        gridRows={40}
                        maxElevation={50}
                        motionSensitivity={0.25}
                        elevationSmoothing={0.2}
                        colorMode="webcam"
                        backgroundColor="#030303"
                        mirror={true}
                        gapRatio={0.05}
                        invertColors={false}
                        darken={0.6}
                        borderColor="#ffffff"
                        borderOpacity={0.06}
                        className="w-full h-full"
                        onWebcamError={(err) => console.error("Webcam error:", err)}
                    />
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

                {/* Hero content */}
                <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
                    <div className="max-w-4xl text-center">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-300 backdrop-blur-sm shadow-premium-sm"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live on Stellar Testnet
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl font-heading"
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500">
                                The Infrastructure for
                            </span>
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-500">
                                Real World Assets
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mx-auto mb-4 max-w-4xl text-base text-zinc-400 sm:text-lg font-light leading-relaxed flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3"
                        >
                            <span className="text-center sm:text-left">
                                <span className="text-xl font-bold bg-gradient-to-r from-black via-[#c89116] to-[#c89116] bg-clip-text text-transparent" style={{ fontFamily: 'Barbra, sans-serif' }}>AstraLink</span>{' '}
                                <EncryptedText
                                    text="enables institutions to issue, manage, and trade regulated digital assets."
                                    encryptedClassName="text-neutral-500"
                                    revealedClassName="text-zinc-400"
                                    revealDelayMs={30}
                                />
                            </span>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mx-auto mb-8 max-w-2xl text-base text-zinc-400 sm:text-lg font-light leading-relaxed -mt-4"
                        >
                            <EncryptedText
                                text="Featuring automated compliance, zero-knowledge identity, and instant settlement on Stellar."
                                encryptedClassName="text-neutral-600"
                                revealedClassName="text-zinc-400"
                                revealDelayMs={25}
                            />
                        </motion.p>

                        {/* Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                        >
                            <Link href="/dashboard">
                                <button className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-white to-zinc-200 px-8 text-base font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                    Launch Platform
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                </button>
                            </Link>
                            <a href="https://github.com/DeepanIsCool/Solyrix-AstraLink" target="_blank" rel="noopener noreferrer">
                                <button className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 text-base font-medium text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105">
                                    <GitBranch className="w-4 h-4" />
                                    Source Code
                                </button>
                            </a>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
                >
                    <ChevronDown className="w-6 h-6 text-white/30" />
                </motion.div>
            </section>

            {/* ===== SECTION 2: STATS TICKER ===== */}
            <section className="relative py-20 bg-gradient-to-b from-black via-obsidian-950 to-obsidian-950 border-t border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: 16, suffix: "T+", label: "Addressable Market", prefix: "$" },
                            { value: 11, suffix: "", label: "Point Compliance Engine" },
                            { value: 4, suffix: "", label: "Jurisdictions Supported" },
                            { value: 28, suffix: "", label: "Smart Contract Tests" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center group"
                            >
                                <p className="text-4xl md:text-5xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-2">
                                    <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                                </p>
                                <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== SECTION 3: PROBLEM STATEMENT ===== */}
            <section className="relative py-24 bg-obsidian-950">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-sm font-bold text-gold-400 uppercase tracking-widest mb-4">The Problem</p>
                        <h2 className="text-3xl md:text-5xl font-bold font-heading text-white mb-6 leading-tight">
                            $16 Trillion in assets are{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                                illiquid
                            </span>
                        </h2>
                        <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                            Real estate, private equity, and commodities are trapped behind outdated infrastructure. 
                            High minimums, manual compliance, and settlement delays keep these assets locked away from most investors.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="mt-12 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-400/10 border border-gold-500/20 text-gold-400 font-medium"
                    >
                        <Zap className="w-4 h-4" />
                        AstraLink makes asset tokenization as easy as Shopify makes e-commerce
                    </motion.div>
                </div>
            </section>

            {/* ===== SECTION 4: FEATURES ===== */}
            <section className="relative py-24 bg-obsidian-950">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <p className="text-sm font-bold text-gold-400 uppercase tracking-widest mb-4">Core Features</p>
                        <h2 className="text-3xl md:text-5xl font-bold font-heading text-white">
                            Institutional-Grade. <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-500">DeFi-Native.</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`group relative overflow-hidden rounded-2xl border ${feature.borderColor} bg-gradient-to-br ${feature.color} p-8 hover:scale-[1.02] transition-all duration-300`}
                            >
                                <div className={`w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-5`}>
                                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 font-heading">{feature.title}</h3>
                                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>

                                {/* Hover glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== SECTION 5: HOW IT WORKS ===== */}
            <section className="relative py-24 bg-gradient-to-b from-obsidian-950 to-black">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <p className="text-sm font-bold text-gold-400 uppercase tracking-widest mb-4">How It Works</p>
                        <h2 className="text-3xl md:text-5xl font-bold font-heading text-white">
                            Three steps to <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-500">tokenized assets</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="relative"
                            >
                                {/* Connector line (hidden on mobile & last item) */}
                                {i < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-white/20 to-transparent" />
                                )}

                                <div className="text-center">
                                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${step.gradient} mx-auto mb-6 flex items-center justify-center shadow-lg`}>
                                        <step.icon className="w-10 h-10 text-black" />
                                    </div>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Step {step.number}</p>
                                    <h3 className="text-2xl font-bold text-white mb-3 font-heading">{step.title}</h3>
                                    <p className="text-zinc-400 leading-relaxed max-w-sm mx-auto">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== SECTION 6: MULTI-JURISDICTION ===== */}
            <section className="relative py-24 bg-black">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <p className="text-sm font-bold text-gold-400 uppercase tracking-widest mb-4">Global Compliance</p>
                        <h2 className="text-3xl md:text-5xl font-bold font-heading text-white">
                            Pre-configured for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">4 jurisdictions</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {jurisdictions.map((j, i) => (
                            <motion.div
                                key={j.code}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
                            >
                                <p className="text-5xl mb-4">{j.flag}</p>
                                <h4 className="text-lg font-bold text-white mb-1 font-heading">{j.name}</h4>
                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{j.regulation}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== SECTION 7: ARCHITECTURE ===== */}
            <section className="relative py-24 bg-obsidian-950">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <p className="text-sm font-bold text-gold-400 uppercase tracking-widest mb-4">Technical Architecture</p>
                        <h2 className="text-3xl md:text-5xl font-bold font-heading text-white">
                            Built on <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-500">Stellar Soroban</span>
                        </h2>
                    </motion.div>

                    <div className="space-y-4">
                        {architectureLayers.map((layer, i) => (
                            <motion.div
                                key={layer.label}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className={`rounded-xl border p-6 ${layer.color}`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-3 h-3 rounded-full ${layer.dotColor}`} />
                                    <h4 className="font-bold text-lg font-heading">{layer.label}</h4>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {layer.items.map((item) => (
                                        <span key={item} className="px-3 py-1.5 rounded-lg bg-black/30 border border-white/5 text-sm text-zinc-300 font-medium">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}

                        {/* Connector lines between layers */}
                        <div className="flex justify-center -my-2">
                            <div className="w-px h-4 bg-white/20" />
                        </div>
                    </div>

                    {/* Smart Contract Modules */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-8"
                    >
                        <h4 className="font-bold text-white text-lg mb-6 font-heading text-center">Smart Contract Modules</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                                { name: "lib.rs", desc: "SEP-41 Token" },
                                { name: "compliance.rs", desc: "Policy Engine" },
                                { name: "governance.rs", desc: "Multi-Sig" },
                                { name: "storage.rs", desc: "Gas Optimized" },
                                { name: "identity.rs", desc: "SBT Verify" },
                            ].map((mod) => (
                                <div key={mod.name} className="text-center p-4 rounded-xl bg-gold-400/5 border border-gold-500/20">
                                    <p className="text-xs font-mono text-gold-400 mb-1">{mod.name}</p>
                                    <p className="text-xs text-zinc-500">{mod.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ===== SECTION 8: CTA ===== */}
            <section className="relative py-32 bg-gradient-to-b from-obsidian-950 via-obsidian-950 to-black overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-400/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold font-heading text-white mb-6 leading-tight">
                            Ready to tokenize{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-500">
                                real-world assets
                            </span>
                            ?
                        </h2>
                        <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
                            Deploy institutional-grade security tokens with automated compliance. Start on Stellar Testnet today.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/dashboard">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-gold-400 to-amber-500 px-10 text-lg font-bold text-black shadow-[0_0_40px_rgba(250,204,21,0.3)] hover:shadow-[0_0_60px_rgba(250,204,21,0.5)] transition-all"
                                >
                                    Launch Platform
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </Link>
                            <a href="https://github.com/DeepanIsCool/Solyrix-AstraLink" target="_blank" rel="noopener noreferrer">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-10 text-lg font-medium text-white backdrop-blur-md transition-all hover:bg-white/10"
                                >
                                    <GitBranch className="w-5 h-5" />
                                    View on GitHub
                                </motion.button>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="border-t border-white/5 py-12 bg-black">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-lg font-bold bg-gradient-to-r from-gold-400 to-amber-500 bg-clip-text text-transparent" style={{ fontFamily: 'Barbra, sans-serif' }}>
                                AstraLink
                            </span>
                            <span className="text-xs text-zinc-600">by Solyrix</span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-zinc-500">
                            <span className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Stellar Testnet
                            </span>
                            <span>Soroban v25</span>
                            <span>MIT License</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <a href="https://github.com/DeepanIsCool/Solyrix-AstraLink" target="_blank" rel="noopener noreferrer"
                                className="text-zinc-500 hover:text-white transition-colors">
                                <GitBranch className="w-5 h-5" />
                            </a>
                            <a href="https://stellar.org" target="_blank" rel="noopener noreferrer"
                                className="text-zinc-500 hover:text-white transition-colors">
                                <Globe className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
