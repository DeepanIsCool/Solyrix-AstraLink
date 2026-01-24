import { create } from 'zustand'

interface WalletState {
    isConnected: boolean
    publicKey: string | null
    setConnected: (connected: boolean, publicKey: string) => void
    disconnect: () => void
}

export const useWallet = create<WalletState>((set) => ({
    isConnected: false,
    publicKey: null,
    setConnected: (connected, publicKey) => set({ isConnected: connected, publicKey }),
    disconnect: () => set({ isConnected: false, publicKey: null }),
}))

// Toast notification store
interface ToastState {
    toasts: Array<{
        id: string
        message: string
        type: 'success' | 'error' | 'warning' | 'info'
    }>
    addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void
    removeToast: (id: string) => void
}

export const useToast = create<ToastState>((set) => ({
    toasts: [],
    addToast: (message, type) => {
        const id = Math.random().toString(36).slice(2)
        set((state) => ({
            toasts: [...state.toasts, { id, message, type }],
        }))
        // Auto-remove after 5 seconds
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            }))
        }, 5000)
    },
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}))
