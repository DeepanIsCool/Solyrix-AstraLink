import { create } from 'zustand'

interface WalletState {
    isConnected: boolean
    publicKey: string | null
    setConnected: (connected: boolean, publicKey?: string) => void
    disconnect: () => void
}

export const useWallet = create<WalletState>((set) => ({
    isConnected: false,
    publicKey: null,
    setConnected: (connected, publicKey) => set({ isConnected: connected, publicKey: publicKey || null }),
    disconnect: () => set({ isConnected: false, publicKey: null }),
}))
