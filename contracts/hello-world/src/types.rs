//! Custom data types for RWA token compliance and governance

use soroban_sdk::{contracttype, Address, String, Vec, Symbol, Val};

// ============ JURISDICTION & INVESTOR STATUS ============

/// Supported jurisdictions for multi-regulatory compliance
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Jurisdiction {
    US,    // USA (Reg D/S) - Priority 1: Largest market, accredited investor framework
    SG,    // Singapore (VCC) - Priority 2: Crypto-friendly Variable Capital Company
    EU,    // EU (MiCA) - Priority 3: Markets in Crypto-Assets regulation
    UAE,   // UAE (SCA) - Priority 4: Securities and Commodities Authority
}

/// Investor classification for compliance checks
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum InvestorStatus {
    Unverified,        // Not KYC'd - cannot transact
    KYCPending,        // KYC submitted, awaiting approval
    Accredited,        // US Reg D accredited investor
    Institutional,     // Banks, funds, qualified institutions
    Qualified,         // Singapore VCC qualified investor
    Restricted,        // Blacklisted or compliance hold
}

// ============ COMPLIANCE RECORDS ============

/// Complete compliance record for an address
#[contracttype]
#[derive(Clone, Debug)]
pub struct ComplianceRecord {
    pub kyc_verified: bool,
    pub investor_status: InvestorStatus,
    pub jurisdictions: Vec<Jurisdiction>,
    pub accreditation_expiry: u64,      // Unix timestamp - 0 means no expiry
    pub daily_limit_used: i128,         // Amount used today
    pub last_reset_timestamp: u64,      // Last daily limit reset
}

/// Global transfer restrictions (policy-level controls)
#[contracttype]
#[derive(Clone, Debug)]
pub struct TransferRestrictions {
    pub min_holding_period: u64,         // 7776000 (90 days in seconds)
    pub max_ownership_percent: i128,     // 1000 (10% in basis points, 10000 = 100%)
    pub allowed_jurisdictions: Vec<Jurisdiction>,
    pub require_accreditation: bool,     // true for Reg D compliance
    pub daily_transfer_limit: i128,      // 100_000_000000 ($100k with 6 decimals)
}

/// Transaction log entry for audit trail
#[contracttype]
#[derive(Clone, Debug)]
pub struct TransactionRecord {
    pub timestamp: u64,
    pub from: Address,
    pub to: Address,
    pub amount: i128,
    pub tx_type: Symbol,  // "transfer", "mint", "burn", "freeze", etc.
}

// ============ GOVERNANCE STRUCTURES ============

/// Multi-signature governance configuration
#[contracttype]
#[derive(Clone, Debug)]
pub struct Governors {
    pub addresses: Vec<Address>,    // 3 governor addresses
    pub required_sigs: u32,          // 2 required for execution
}

/// Governance proposal for multi-sig approval
#[contracttype]
#[derive(Clone, Debug)]
pub struct Proposal {
    pub id: u32,
    pub proposer: Address,
    pub action: Symbol,              // "mint", "freeze", "update_kyc", etc.
    pub parameters: Vec<Val>,        // Action-specific parameters
    pub approvals: Vec<Address>,     // Addresses that have approved
    pub expiry: u64,                 // Ledger sequence when proposal expires
    pub executed: bool,              // Whether proposal has been executed
}

// ============ TOKEN METADATA ============

/// Token metadata (SEP-41 compliant)
#[contracttype]
#[derive(Clone, Debug)]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub decimals: u32,
    pub total_supply: i128,
    pub asset_type: String,          // "REAL_ESTATE", "PRIVATE_EQUITY", etc.
}

// ============ DEFAULT CONFIGURATIONS ============
// Note: Default implementations moved inline to avoid Env parameter issues
