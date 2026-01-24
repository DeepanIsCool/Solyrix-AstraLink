import { verify } from '@anon-aadhaar/core'
import * as StellarSDK from '@stellar/stellar-sdk'
import { NextRequest, NextResponse } from 'next/server'

// Stellar Configuration
const RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org'
const NETWORK_PASSPHRASE = StellarSDK.Networks.TESTNET
const IDENTITY_CONTRACT_ID = process.env.NEXT_PUBLIC_IDENTITY_CONTRACT_ID!

// Initialize Soroban RPC client
const server = new StellarSDK.rpc.Server(RPC_URL)

export async function POST(request: NextRequest) {
    try {
        const { proof, userAddress } = await request.json()

        // Validate input
        if (!proof || !userAddress) {
            return NextResponse.json(
                { error: 'Missing proof or userAddress' },
                { status: 400 }
            )
        }

        // Validate user address format
        if (typeof userAddress !== 'string' || userAddress.length !== 56 || !userAddress.startsWith('G')) {
            return NextResponse.json(
                { error: 'Invalid Stellar address format' },
                { status: 400 }
            )
        }

        // Step 1: Verify the Anon Aadhaar ZK Proof
        console.log('Verifying Anon Aadhaar proof...')

        const isValid = await verify(proof)

        if (!isValid) {
            console.error('ZK Proof verification failed')
            return NextResponse.json(
                { error: 'Invalid ZK proof - verification failed' },
                { status: 401 }
            )
        }

        console.log('ZK Proof verified successfully!')

        // Step 2: Get the relayer keypair from environment
        const relayerSecretKey = process.env.RELAYER_SECRET_KEY
        if (!relayerSecretKey) {
            console.error('RELAYER_SECRET_KEY not configured')
            return NextResponse.json(
                { error: 'Relayer not configured' },
                { status: 500 }
            )
        }

        const relayerKeypair = StellarSDK.Keypair.fromSecret(relayerSecretKey)
        const relayerPublicKey = relayerKeypair.publicKey()

        console.log('Relayer public key:', relayerPublicKey)

        // Step 3: Build the verify_user transaction
        const contract = new StellarSDK.Contract(IDENTITY_CONTRACT_ID)

        const operation = contract.call(
            'verify_user',
            StellarSDK.nativeToScVal(userAddress, { type: 'address' })
        )

        // Get the relayer account with current sequence number
        const sourceAccount = await server.getAccount(relayerPublicKey)

        const transaction = new StellarSDK.TransactionBuilder(sourceAccount, {
            fee: StellarSDK.BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(operation)
            .setTimeout(30)
            .build()

        // Step 4: Simulate and prepare the transaction
        const simulated = await server.simulateTransaction(transaction)

        if (!StellarSDK.rpc.Api.isSimulationSuccess(simulated)) {
            console.error('Transaction simulation failed:', simulated)
            return NextResponse.json(
                { error: 'Transaction simulation failed' },
                { status: 500 }
            )
        }

        const preparedTx = StellarSDK.rpc.assembleTransaction(
            transaction,
            simulated
        ).build()

        // Step 5: Sign with the relayer key
        preparedTx.sign(relayerKeypair)

        // Step 6: Submit the transaction
        console.log('Submitting transaction to Stellar network...')

        const sendResponse = await server.sendTransaction(preparedTx)

        if (sendResponse.status === 'PENDING') {
            // Wait for transaction to complete
            let txResponse = await server.getTransaction(sendResponse.hash)

            // Poll for completion (max 30 seconds)
            const maxWaitTime = 30000
            const pollInterval = 1000
            let waitedTime = 0

            while (txResponse.status === 'NOT_FOUND' && waitedTime < maxWaitTime) {
                await new Promise(resolve => setTimeout(resolve, pollInterval))
                waitedTime += pollInterval
                txResponse = await server.getTransaction(sendResponse.hash)
            }

            if (txResponse.status === 'SUCCESS') {
                console.log('Transaction successful! Hash:', sendResponse.hash)
                return NextResponse.json({
                    success: true,
                    message: 'SBT issued successfully',
                    transactionHash: sendResponse.hash,
                    userAddress: userAddress,
                })
            } else {
                console.error('Transaction failed:', txResponse)
                return NextResponse.json(
                    { error: 'Transaction failed', status: txResponse.status },
                    { status: 500 }
                )
            }
        } else if (sendResponse.status === 'ERROR') {
            console.error('Transaction error:', sendResponse)
            return NextResponse.json(
                { error: 'Transaction submission error' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Verification initiated',
            transactionHash: sendResponse.hash,
        })

    } catch (error) {
        console.error('Verification error:', error)
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Internal server error',
            },
            { status: 500 }
        )
    }
}
