'use client'

import { useState, useEffect, useCallback } from 'react'
import { contract } from '@/lib/contract'
import { useWallet } from '@/lib/store'

interface KYCStatus {
    kyc_verified: boolean
    investor_status: 'Retail' | 'Accredited' | 'Institutional'
    jurisdictions: string[]
    accreditation_expiry: number
    daily_limit_used: bigint
    last_reset_timestamp: number
}

export function useKycStatus() {
    const { publicKey } = useWallet()
    const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchKycStatus = useCallback(async () => {
        if (!publicKey) {
            setKycStatus(null)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const status = await contract.getKycStatus(publicKey)
            setKycStatus(status)
        } catch {
            // If no KYC record exists, return default unverified status
            // No KYC record found, using defaults
            setKycStatus({
                kyc_verified: false,
                investor_status: 'Retail',
                jurisdictions: [],
                accreditation_expiry: 0,
                daily_limit_used: BigInt(0),
                last_reset_timestamp: 0,
            })
            setError(null) // Not really an error, just no record
        } finally {
            setIsLoading(false)
        }
    }, [publicKey])

    useEffect(() => {
        fetchKycStatus()
    }, [fetchKycStatus])

    return { kycStatus, isLoading, error, refetch: fetchKycStatus }
}
