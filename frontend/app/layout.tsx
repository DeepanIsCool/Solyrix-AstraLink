import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import type { Metadata } from 'next'
import './globals.css'
import { ToastContainer } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'AstraLink - RWA Token Platform',
  description: 'Institutional-grade asset tokenization on Stellar',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased bg-cream-100">
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}
