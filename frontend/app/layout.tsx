'use client'

import { ToastContainer } from '@/components/ui/Toast'
import { AnonAadhaarProvider } from '@anon-aadhaar/react'
import { Unbounded, Inter } from 'next/font/google'
import './globals.css'

const unbounded = Unbounded({
  subsets: ['latin'],
  variable: '--font-unbounded',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${unbounded.variable} ${inter.variable}`}>
      <body className="antialiased bg-obsidian-950 font-sans">
        <AnonAadhaarProvider
          _useTestAadhaar={true}
          _appName="AstraLink"
          _artifactslinks={{
            zkey_url: "https://anon-aadhaar-artifacts.s3.eu-central-1.amazonaws.com/v2.0.0/circuit_final.zkey",
            vkey_url: "https://anon-aadhaar-artifacts.s3.eu-central-1.amazonaws.com/v2.0.0/vkey.json",
            wasm_url: "https://anon-aadhaar-artifacts.s3.eu-central-1.amazonaws.com/v2.0.0/aadhaar-verifier.wasm",
          }}
        >
          {children}
          <ToastContainer />
        </AnonAadhaarProvider>
      </body>
    </html>
  )
}
