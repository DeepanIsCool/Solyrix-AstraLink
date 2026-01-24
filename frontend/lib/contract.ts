import * as StellarSDK from '@stellar/stellar-sdk'

// Contract Configuration
export const CONTRACT_ID = 'CBEHEOVOYODO7D62TFMNMI6EVK6NOLH7MLLUHNKWRGDZATP356YSHQL3'
export const NETWORK_PASSPHRASE = StellarSDK.Networks.TESTNET
export const RPC_URL = 'https://soroban-testnet.stellar.org'

// Initialize Soroban RPC client
export const server = new StellarSDK.rpc.Server(RPC_URL)

// Dummy account for read-only simulations (any valid Stellar address works)
const SIMULATION_ACCOUNT = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'

// Helper to build transaction
export async function buildTransaction(
    sourceAccount: string,
    operation: any
) {
    // For read-only operations (simulations), we need an Account object
    // We'll create a dummy account since simulations don't need real account data
    const account = new StellarSDK.Account(sourceAccount, '0')

    const transaction = new StellarSDK.TransactionBuilder(account, {
        fee: StellarSDK.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
    })
        .addOperation(operation)
        .setTimeout(30)
        .build()

    return transaction
}

// Helper to simulate transaction
export async function simulateTransaction(transaction: any) {
    const simulated = await server.simulateTransaction(transaction)

    if (StellarSDK.rpc.Api.isSimulationSuccess(simulated)) {
        return StellarSDK.rpc.assembleTransaction(
            transaction,
            simulated
        ).build()
    } else {
        throw new Error('Simulation failed')
    }
}

// Contract methods - Read operations (no signature required)
export const contract = {
    // Token metadata
    name: async (): Promise<string> => {
        const contract = new StellarSDK.Contract(CONTRACT_ID)
        const operation = contract.call('name')

        const tx = await buildTransaction(SIMULATION_ACCOUNT, operation)
        const simulated = await server.simulateTransaction(tx)

        if (StellarSDK.rpc.Api.isSimulationSuccess(simulated)) {
            return StellarSDK.scValToNative(simulated.result!.retval)
        }
        throw new Error('Failed to fetch name')
    },

    symbol: async (): Promise<string> => {
        const contract = new StellarSDK.Contract(CONTRACT_ID)
        const operation = contract.call('symbol')

        const tx = await buildTransaction(SIMULATION_ACCOUNT, operation)
        const simulated = await server.simulateTransaction(tx)

        if (StellarSDK.rpc.Api.isSimulationSuccess(simulated)) {
            return StellarSDK.scValToNative(simulated.result!.retval)
        }
        throw new Error('Failed to fetch symbol')
    },

    decimals: async (): Promise<number> => {
        const contract = new StellarSDK.Contract(CONTRACT_ID)
        const operation = contract.call('decimals')

        const tx = await buildTransaction(SIMULATION_ACCOUNT, operation)
        const simulated = await server.simulateTransaction(tx)

        if (StellarSDK.rpc.Api.isSimulationSuccess(simulated)) {
            return StellarSDK.scValToNative(simulated.result!.retval)
        }
        throw new Error('Failed to fetch decimals')
    },

    totalSupply: async (): Promise<bigint> => {
        const contract = new StellarSDK.Contract(CONTRACT_ID)
        const operation = contract.call('total_supply')

        const tx = await buildTransaction(SIMULATION_ACCOUNT, operation)
        const simulated = await server.simulateTransaction(tx)

        if (StellarSDK.rpc.Api.isSimulationSuccess(simulated)) {
            return StellarSDK.scValToNative(simulated.result!.retval)
        }
        throw new Error('Failed to fetch total supply')
    },

    balance: async (address: string): Promise<bigint> => {
        const contract = new StellarSDK.Contract(CONTRACT_ID)
        const addressScVal = StellarSDK.nativeToScVal(address, { type: 'address' })
        const operation = contract.call('balance', addressScVal)

        const tx = await buildTransaction(SIMULATION_ACCOUNT, operation)
        const simulated = await server.simulateTransaction(tx)

        if (StellarSDK.rpc.Api.isSimulationSuccess(simulated)) {
            return StellarSDK.scValToNative(simulated.result!.retval)
        }
        throw new Error('Failed to fetch balance')
    },

    getKycStatus: async (address: string): Promise<any> => {
        const contract = new StellarSDK.Contract(CONTRACT_ID)
        const addressScVal = StellarSDK.nativeToScVal(address, { type: 'address' })
        const operation = contract.call('get_kyc_status', addressScVal)

        const tx = await buildTransaction(SIMULATION_ACCOUNT, operation)
        const simulated = await server.simulateTransaction(tx)

        if (StellarSDK.rpc.Api.isSimulationSuccess(simulated)) {
            return StellarSDK.scValToNative(simulated.result!.retval)
        }
        throw new Error('Failed to fetch KYC status')
    },

    isFrozen: async (address: string): Promise<boolean> => {
        const contract = new StellarSDK.Contract(CONTRACT_ID)
        const addressScVal = StellarSDK.nativeToScVal(address, { type: 'address' })
        const operation = contract.call('is_frozen', addressScVal)

        const tx = await buildTransaction(SIMULATION_ACCOUNT, operation)
        const simulated = await server.simulateTransaction(tx)

        if (StellarSDK.rpc.Api.isSimulationSuccess(simulated)) {
            return StellarSDK.scValToNative(simulated.result!.retval)
        }
        return false
    },

    getProposal: async (proposalId: number): Promise<any> => {
        const contract = new StellarSDK.Contract(CONTRACT_ID)
        const idScVal = StellarSDK.nativeToScVal(proposalId, { type: 'u32' })
        const operation = contract.call('get_proposal', idScVal)

        const tx = await buildTransaction(SIMULATION_ACCOUNT, operation)
        const simulated = await server.simulateTransaction(tx)

        if (StellarSDK.rpc.Api.isSimulationSuccess(simulated)) {
            return StellarSDK.scValToNative(simulated.result!.retval)
        }
        throw new Error('Failed to fetch proposal')
    },

    isGovernor: async (address: string): Promise<boolean> => {
        const contract = new StellarSDK.Contract(CONTRACT_ID)
        const addressScVal = StellarSDK.nativeToScVal(address, { type: 'address' })
        const operation = contract.call('is_governor', addressScVal)

        const tx = await buildTransaction(SIMULATION_ACCOUNT, operation)
        const simulated = await server.simulateTransaction(tx)

        if (StellarSDK.rpc.Api.isSimulationSuccess(simulated)) {
            return StellarSDK.scValToNative(simulated.result!.retval)
        }
        return false
    },

    // Yield streaming - get pending yield for a user
    getPendingYield: async (address: string): Promise<bigint> => {
        const contract = new StellarSDK.Contract(CONTRACT_ID)
        const addressScVal = StellarSDK.nativeToScVal(address, { type: 'address' })
        const operation = contract.call('pending_yield', addressScVal)

        const tx = await buildTransaction(SIMULATION_ACCOUNT, operation)
        const simulated = await server.simulateTransaction(tx)

        if (StellarSDK.rpc.Api.isSimulationSuccess(simulated)) {
            return StellarSDK.scValToNative(simulated.result!.retval)
        }
        return BigInt(0)
    },
}

// Write operations (require Freighter signature)
export const writeContract = {
    transfer: async (from: string, to: string, amount: bigint) => {
        const contract = new StellarSDK.Contract(CONTRACT_ID)

        const operation = contract.call(
            'transfer',
            StellarSDK.nativeToScVal(from, { type: 'address' }),
            StellarSDK.nativeToScVal(to, { type: 'address' }),
            StellarSDK.nativeToScVal(amount, { type: 'i128' })
        )

        // For write operations, we need the real account with correct sequence number
        const sourceAccount = await server.getAccount(from)
        const tx = new StellarSDK.TransactionBuilder(sourceAccount, {
            fee: StellarSDK.BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(operation)
            .setTimeout(30)
            .build()

        const prepared = await simulateTransaction(tx)

        return prepared.toXDR()
    },

    approve: async (from: string, spender: string, amount: bigint, expiration: number) => {
        const contract = new StellarSDK.Contract(CONTRACT_ID)

        const operation = contract.call(
            'approve',
            StellarSDK.nativeToScVal(from, { type: 'address' }),
            StellarSDK.nativeToScVal(spender, { type: 'address' }),
            StellarSDK.nativeToScVal(amount, { type: 'i128' }),
            StellarSDK.nativeToScVal(expiration, { type: 'u32' })
        )

        const sourceAccount = await server.getAccount(from)
        const tx = new StellarSDK.TransactionBuilder(sourceAccount, {
            fee: StellarSDK.BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(operation)
            .setTimeout(30)
            .build()

        const prepared = await simulateTransaction(tx)

        return prepared.toXDR()
    },

    propose: async (
        proposer: string,
        action: string,
        parameters: any[],
        expiryLedgers: number
    ) => {
        const contract = new StellarSDK.Contract(CONTRACT_ID)

        const operation = contract.call(
            'propose',
            StellarSDK.nativeToScVal(proposer, { type: 'address' }),
            StellarSDK.nativeToScVal(action, { type: 'symbol' }),
            StellarSDK.nativeToScVal(parameters, { type: 'vec' }),
            StellarSDK.nativeToScVal(expiryLedgers, { type: 'u32' })
        )

        const sourceAccount = await server.getAccount(proposer)
        const tx = new StellarSDK.TransactionBuilder(sourceAccount, {
            fee: StellarSDK.BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(operation)
            .setTimeout(30)
            .build()

        const prepared = await simulateTransaction(tx)

        return prepared.toXDR()
    },

    approveProposal: async (governor: string, proposalId: number) => {
        const contract = new StellarSDK.Contract(CONTRACT_ID)

        const operation = contract.call(
            'approve_proposal',
            StellarSDK.nativeToScVal(governor, { type: 'address' }),
            StellarSDK.nativeToScVal(proposalId, { type: 'u32' })
        )

        const sourceAccount = await server.getAccount(governor)
        const tx = new StellarSDK.TransactionBuilder(sourceAccount, {
            fee: StellarSDK.BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(operation)
            .setTimeout(30)
            .build()

        const prepared = await simulateTransaction(tx)

        return prepared.toXDR()
    },

    // Identity Configuration - set external SBT contract for KYC
    setIdentityContract: async (governor: string, identityContract: string) => {
        const contract = new StellarSDK.Contract(CONTRACT_ID)

        const operation = contract.call(
            'set_identity_contract',
            StellarSDK.nativeToScVal(governor, { type: 'address' }),
            StellarSDK.nativeToScVal(identityContract, { type: 'address' })
        )

        const sourceAccount = await server.getAccount(governor)
        const tx = new StellarSDK.TransactionBuilder(sourceAccount, {
            fee: StellarSDK.BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(operation)
            .setTimeout(30)
            .build()

        const prepared = await simulateTransaction(tx)

        return prepared.toXDR()
    },

    // Yield Streaming - deposit yield for token holders
    depositYield: async (admin: string, token: string, amount: bigint) => {
        const contract = new StellarSDK.Contract(CONTRACT_ID)

        const operation = contract.call(
            'deposit_yield',
            StellarSDK.nativeToScVal(admin, { type: 'address' }),
            StellarSDK.nativeToScVal(token, { type: 'address' }),
            StellarSDK.nativeToScVal(amount, { type: 'i128' })
        )

        const sourceAccount = await server.getAccount(admin)
        const tx = new StellarSDK.TransactionBuilder(sourceAccount, {
            fee: StellarSDK.BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(operation)
            .setTimeout(30)
            .build()

        const prepared = await simulateTransaction(tx)

        return prepared.toXDR()
    },

    // Yield Streaming - claim accumulated yield
    claimYield: async (user: string) => {
        const contract = new StellarSDK.Contract(CONTRACT_ID)

        const operation = contract.call(
            'claim_yield',
            StellarSDK.nativeToScVal(user, { type: 'address' })
        )

        const sourceAccount = await server.getAccount(user)
        const tx = new StellarSDK.TransactionBuilder(sourceAccount, {
            fee: StellarSDK.BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(operation)
            .setTimeout(30)
            .build()

        const prepared = await simulateTransaction(tx)

        return prepared.toXDR()
    },
}

// Helper to format token amount with decimals
export function formatTokenAmount(amount: bigint, decimals: number = 6): string {
    const divisor = BigInt(10 ** decimals)
    const whole = amount / divisor
    const fraction = amount % divisor

    const fractionStr = fraction.toString().padStart(decimals, '0')
    return `${whole}.${fractionStr}`
}

// Helper to parse token amount to bigint
export function parseTokenAmount(amount: string, decimals: number = 6): bigint {
    const [whole, fraction = '0'] = amount.split('.')
    const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals)
    const combined = whole + paddedFraction
    return BigInt(combined)
}
