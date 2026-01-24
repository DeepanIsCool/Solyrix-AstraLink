'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Shield, Globe, Zap } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-brown-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brown-100/50 border border-brown-200 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-brown-600">Live on Stellar Testnet</span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-brown-800 leading-tight">
            Shopify for
            <br />
            <span className="bg-gradient-to-r from-brown-600 via-gold to-brown-500 bg-clip-text text-transparent">
              Asset Tokenization
            </span>
          </h1>

          <p className="text-xl text-brown-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Tokenize real-world assets in weeks, not months. Multi-jurisdiction compliance, 2-of-3 multi-sig, and institutional-grade security on Stellar.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group px-8 py-4 bg-brown-600 text-cream-50 rounded-button font-medium shadow-premium-lg hover:shadow-premium-xl transition-all duration-300 flex items-center gap-2"
              >
                Open Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <motion.a
              href="https://github.com/shinjinihehe/Solyrix-AstraLink"
              target="_blank"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-white text-brown-600 rounded-button font-medium shadow-premium-md hover:shadow-premium-lg border border-brown-200 transition-all duration-300"
            >
              View on GitHub
            </motion.a>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            {[
              { icon: Shield, label: '2-of-3 Multi-Sig', value: 'Day 1 Security' },
              { icon: Globe, label: '4 Jurisdictions', value: 'US, SG, EU, UAE' },
              { icon: Zap, label: '90% Cost Reduction', value: 'vs Traditional' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="card-premium text-center group hover:shadow-premium-lg transition-all duration-300"
              >
                <stat.icon className="w-8 h-8 text-gold mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-brown-800 mb-1">{stat.value}</div>
                <div className="text-sm text-brown-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="max-w-6xl mx-auto mt-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-brown-800 mb-4">Production-Ready Features</h2>
            <p className="text-lg text-brown-400">Everything you need for compliant asset tokenization</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'SEP-41 Compliant',
                description: 'Full Stellar token standard with compliance-gated transfers',
              },
              {
                title: 'Automated Compliance',
                description: '11-step verification: KYC, accreditation, holding periods, limits',
              },
              {
                title: 'Multi-Sig Governance',
                description: 'Proposal-based system with 2-of-3 threshold execution',
              },
              {
                title: 'Emergency Controls',
                description: 'Account freeze/unfreeze with multi-sig protection',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="card-premium group hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-gold mt-2 group-hover:scale-150 transition-transform" />
                  <div>
                    <h3 className="text-xl font-semibold text-brown-700 mb-2">{feature.title}</h3>
                    <p className="text-brown-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-32 text-brown-300 text-sm"
        >
          <p>Built on Stellar • Secured with Multi-Sig • Compliant across 4 Jurisdictions</p>
        </motion.div>
      </div>
    </main>
  )
}
