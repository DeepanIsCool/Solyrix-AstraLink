'use client'

import { ToastContainer } from '@/components/ui/Toast'
import { AnonAadhaarProvider } from '@anon-aadhaar/react'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased bg-cream-100">
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
