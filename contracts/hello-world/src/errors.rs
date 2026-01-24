//! Error codes for RWA token operations

use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum RWAError {
    // ============ COMPLIANCE ERRORS (1000-1099) ============
    TradingSuspended = 1001,           // Contract-wide trading halt
    AccountFrozen = 1002,              // Specific account frozen
    KYCRequired = 1003,                // KYC verification not complete
    AccreditationRequired = 1004,      // Accredited investor status required
    HoldingPeriodNotMet = 1005,        // Min holding period not elapsed
    OwnershipLimitExceeded = 1006,     // Would exceed max ownership %
    DailyLimitExceeded = 1007,         // Daily transfer limit reached
    JurisdictionRestricted = 1008,     // Jurisdiction not allowed
    KYCExpired = 1009,                 // Accreditation expired
    InvestorStatusInvalid = 1010,      // Investor status doesn't allow action
    
    // ============ GOVERNANCE ERRORS (2000-2099) ============
    Unauthorized = 2001,               // Caller not authorized
    NotGovernor = 2002,                // Caller is not a governor
    InsufficientApprovals = 2003,      // Not enough signatures
    ProposalExpired = 2004,            // Proposal deadline passed
    ProposalNotFound = 2005,           // Proposal ID doesn't exist
    ProposalAlreadyExecuted = 2006,    // Proposal already executed
    AlreadyApproved = 2007,            // Governor already approved
    InvalidGovernorCount = 2008,       // Must have exactly 3 governors
    
    // ============ TOKEN ERRORS (3000-3099) ============
    InsufficientBalance = 3001,        // Not enough tokens
    InvalidAmount = 3002,              // Amount must be positive
    InvalidRecipient = 3003,           // Invalid recipient address
    AllowanceExceeded = 3004,          // Spending more than allowed
    TransferFailed = 3005,             // Transfer operation failed
    MintFailed = 3006,                 // Mint operation failed
    BurnFailed = 3007,                 // Burn operation failed
    
    // ============ INITIALIZATION ERRORS (4000-4099) ============
    AlreadyInitialized = 4001,         // Contract already initialized
    InvalidInitialization = 4002,      // Invalid initialization parameters
    InvalidDecimals = 4003,            // Decimals must be <= 18
    InvalidSupply = 4004,              // Initial supply must be positive
}
