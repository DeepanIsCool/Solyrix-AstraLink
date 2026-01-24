import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AstraLink - RWA Token Platform',
  description: 'Shopify for Asset Tokenization on Stellar',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
