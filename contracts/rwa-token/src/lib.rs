#![no_std]

//! AstraLink RWA Factory - Phase 1: Core Token & Compliance Engine
//! 
//! A production-ready Real World Asset tokenization platform on Stellar
//! with built-in multi-jurisdiction compliance and 2-of-3 multi-sig governance.
//! 
//! Features:
//! - SEP-41 compliant token standard
//! - Multi-jurisdiction compliance (US Reg D/S, Singapore VCC, EU MiCA, UAE SCA)
//! - 2-of-3 multi-signature governance
//! - KYC/AML verification engine
//! - Accredited investor checks (Reg D compliant)
//! - Transfer restrictions (holding periods, ownership limits, daily caps)
//! - Account freeze/unfreeze controls
//! - Comprehensive audit trail

mod types;
mod errors;
mod events;
mod compliance;
mod governance;
mod storage;

pub use types::*;
pub use errors::*;

use soroban_sdk::{contract, contractimpl, Env, Address, String, Vec, Symbol, Val, vec};

#[contract]
pub struct RWAToken;

#[contractimpl]
impl RWAToken {
    /// Initialize the RWA token with 2-of-3 multi-sig governance
    /// 
    /// # Arguments
    /// * `governors` - 3 addresses for multi-sig (issuer, compliance officer, tech admin)
    /// * `name` - Token name (e.g., "Manhattan Real Estate Token")
    /// * `symbol` - Token symbol (e.g., "MRE")
    /// * `decimals` - Decimal places (typically 6 for compatibility)
    /// * `asset_type` - Type of RWA ("REAL_ESTATE", "PRIVATE_EQUITY", etc.)
    /// * `initial_supply` - Initial token supply
    pub fn initialize(
        env: Env,
        governors: Vec<Address>,
        name: String,
        symbol: String,
        decimals: u32,
        asset_type: String,
        initial_supply: i128,
    ) -> Result<(), RWAError> {
        // Check if already initialized
        if env.storage().persistent().has(&storage::TOKEN_NAME) {
            return Err(RWAError::AlreadyInitialized);
        }
        
        // Validate inputs
        if decimals > 18 {
            return Err(RWAError::InvalidDecimals);
        }
        if initial_supply <= 0 {
            return Err(RWAError::InvalidSupply);
        }
        
        // Initialize governance (2-of-3 multi-sig)
        governance::initialize_governance(&env, governors.clone())?;
        
        // Store token metadata
        env.storage().persistent().set(&storage::TOKEN_NAME, &name);
        env.storage().persistent().set(&storage::TOKEN_SYMBOL, &symbol);
        env.storage().persistent().set(&storage::TOKEN_DECIMALS, &decimals);
        env.storage().persistent().set(&storage::TOTAL_SUPPLY, &initial_supply);
        env.storage().persistent().set(&storage::ASSET_TYPE, &asset_type);
        
        // Initialize default transfer restrictions (Reg D compliant)
        // NOTE: Holding period set to 0 for demo/testing - set to 7776000 (90 days) for production
        let restrictions = TransferRestrictions {
            min_holding_period: 0,                // DEMO: 0 seconds (PRODUCTION: 7776000 = 90 days)
            max_ownership_percent: 1000,          // 10%
            allowed_jurisdictions: vec![
                &env,
                Jurisdiction::US,
                Jurisdiction::SG,
                Jurisdiction::EU,
            ],
            require_accreditation: true,          // Reg D compliant
            daily_transfer_limit: 100_000_000000, // $100k
        };
        compliance::set_transfer_restrictions(&env, &restrictions);
        
        // Mint initial supply to first governor (issuer)
        let issuer = governors.get(0).unwrap();
        storage::set_balance(&env, &issuer, initial_supply);
        storage::set_first_acquisition(&env, &issuer, env.ledger().timestamp());
        
        // Mark issuer as KYC'd and accredited
        let issuer_compliance = ComplianceRecord {
            kyc_verified: true,
            investor_status: InvestorStatus::Institutional,
            jurisdictions: vec![&env, Jurisdiction::US],
            accreditation_expiry: 0,
            daily_limit_used: 0,
            last_reset_timestamp: 0,
        };
        compliance::set_compliance_record(&env, &issuer, &issuer_compliance);
        
        events::emit_initialized(&env, name.clone(), symbol.clone(), initial_supply);
        events::emit_mint(&env, issuer, initial_supply);
        
        Ok(())
    }
    
    // ============ SEP-41 TOKEN STANDARD ============
    
    /// Transfer tokens with compliance checks
    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
    ) -> Result<(), RWAError> {
        from.require_auth();
        
        if amount <= 0 {
            return Err(RWAError::InvalidAmount);
        }
        
        // COMPLIANCE: Full verification (KYC, accreditation, restrictions)
        compliance::verify_transfer(&env, &from, &to, amount)?;
        
        // Execute transfer
        let from_balance = storage::get_balance(&env, &from);
        if from_balance < amount {
            return Err(RWAError::InsufficientBalance);
        }
        
        storage::set_balance(&env, &from, from_balance - amount);
        
        let to_balance = storage::get_balance(&env, &to);
        storage::set_balance(&env, &to, to_balance + amount);
        
        // Track first acquisition for holding period
        storage::set_first_acquisition(&env, &to, env.ledger().timestamp());
        
        // Update daily transfer limit
        compliance::update_daily_transfer_amount(&env, &from, amount);
        
        events::emit_transfer(&env, from, to, amount);
        
        Ok(())
    }
    
    /// Get balance of an address
    pub fn balance(env: Env, address: Address) -> i128 {
        storage::get_balance(&env, &address)
    }
    
    /// Approve spender to transfer tokens
    pub fn approve(
        env: Env,
        from: Address,
        spender: Address,
        amount: i128,
        expiration_ledger: u32,
    ) -> Result<(), RWAError> {
        from.require_auth();
        
        storage::set_allowance(&env, &from, &spender, amount, expiration_ledger);
        events::emit_approve(&env, from, spender, amount, expiration_ledger);
        
        Ok(())
    }
    
    /// Get current allowance
    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        storage::get_allowance(&env, &from, &spender)
    }
    
    /// Transfer from allowance with compliance
    pub fn transfer_from(
        env: Env,
        spender: Address,
        from: Address,
        to: Address,
        amount: i128,
    ) -> Result<(), RWAError> {
        spender.require_auth();
        
        // Check allowance
        let allowance = storage::get_allowance(&env, &from, &spender);
        if allowance < amount {
            return Err(RWAError::AllowanceExceeded);
        }
        
        // COMPLIANCE: Full verification
        compliance::verify_transfer(&env, &from, &to, amount)?;
        
        // Update allowance
        storage::set_allowance(&env, &from, &spender, allowance - amount, 0);
        
        // Execute transfer
        let from_balance = storage::get_balance(&env, &from);
        if from_balance < amount {
            return Err(RWAError::InsufficientBalance);
        }
        
        storage::set_balance(&env, &from, from_balance - amount);
        let to_balance = storage::get_balance(&env, &to);
        storage::set_balance(&env, &to, to_balance + amount);
        
        storage::set_first_acquisition(&env, &to, env.ledger().timestamp());
        compliance::update_daily_transfer_amount(&env, &from, amount);
        
        events::emit_transfer(&env, from, to, amount);
        
        Ok(())
    }
    
    // ============ GOVERNANCE FUNCTIONS (MULTI-SIG) ============
    
    /// Mint new tokens (requires 2-of-3 approval)
    pub fn mint(
        env: Env,
        governor: Address,
        to: Address,
        amount: i128,
    ) -> Result<(), RWAError> {
        governor.require_auth();
        governance::require_multisig_approval(&env, &governor)?;
        
        if amount <= 0 {
            return Err(RWAError::InvalidAmount);
        }
        
        // Update total supply
        let total_supply: i128 = env.storage().persistent()
            .get(&storage::TOTAL_SUPPLY)
            .unwrap_or(0);
        env.storage().persistent().set(&storage::TOTAL_SUPPLY, &(total_supply + amount));
        
        // Mint to address
        let balance = storage::get_balance(&env, &to);
        storage::set_balance(&env, &to, balance + amount);
        storage::set_first_acquisition(&env, &to, env.ledger().timestamp());
        
        events::emit_mint(&env, to, amount);
        
        Ok(())
    }
    
    /// Burn tokens (requires 2-of-3 approval)
    pub fn burn(
        env: Env,
        governor: Address,
        from: Address,
        amount: i128,
    ) -> Result<(), RWAError> {
        governor.require_auth();
        governance::require_multisig_approval(&env, &governor)?;
        
        let balance = storage::get_balance(&env, &from);
        if balance < amount {
            return Err(RWAError::InsufficientBalance);
        }
        
        storage::set_balance(&env, &from, balance - amount);
        
        // Update total supply
        let total_supply: i128 = env.storage().persistent()
            .get(&storage::TOTAL_SUPPLY)
            .unwrap_or(0);
        env.storage().persistent().set(&storage::TOTAL_SUPPLY, &(total_supply - amount));
        
        events::emit_burn(&env, from, amount);
        
        Ok(())
    }
    
    /// Freeze account (requires 2-of-3 approval)
    pub fn freeze_account(
        env: Env,
        governor: Address,
        address: Address,
    ) -> Result<(), RWAError> {
        governor.require_auth();
        governance::require_multisig_approval(&env, &governor)?;
        
        storage::set_frozen(&env, &address, true);
        events::emit_account_frozen(&env, address);
        
        Ok(())
    }
    
    /// Unfreeze account (requires 2-of-3 approval)
    pub fn unfreeze_account(
        env: Env,
        governor: Address,
        address: Address,
    ) -> Result<(), RWAError> {
        governor.require_auth();
        governance::require_multisig_approval(&env, &governor)?;
        
        storage::set_frozen(&env, &address, false);
        events::emit_account_unfrozen(&env, address);
        
        Ok(())
    }
    
    /// Update KYC record (requires 2-of-3 approval)
    pub fn update_kyc(
        env: Env,
        governor: Address,
        address: Address,
        record: ComplianceRecord,
    ) -> Result<(), RWAError> {
        governor.require_auth();
        governance::require_multisig_approval(&env, &governor)?;
        
        compliance::set_compliance_record(&env, &address, &record);
        events::emit_kyc_updated(&env, address, record.investor_status);
        
        Ok(())
    }
    
    // ============ MULTI-SIG PROPOSAL FUNCTIONS ============
    
    /// Create governance proposal
    pub fn propose(
        env: Env,
        proposer: Address,
        action: Symbol,
        parameters: Vec<Val>,
        expiry_ledgers: u32,
    ) -> Result<u32, RWAError> {
        proposer.require_auth();
        governance::create_proposal(&env, &proposer, action, parameters, expiry_ledgers)
    }
    
    /// Approve proposal
    pub fn approve_proposal(
        env: Env,
        governor: Address,
        proposal_id: u32,
    ) -> Result<bool, RWAError> {
        governor.require_auth();
        governance::approve_proposal(&env, &governor, proposal_id)
    }
    
    // ============ VIEW FUNCTIONS ============
    
    pub fn name(env: Env) -> String {
        env.storage().persistent().get(&storage::TOKEN_NAME).unwrap()
    }
    
    pub fn symbol(env: Env) -> String {
        env.storage().persistent().get(&storage::TOKEN_SYMBOL).unwrap()
    }
    
    pub fn decimals(env: Env) -> u32 {
        env.storage().persistent().get(&storage::TOKEN_DECIMALS).unwrap()
    }
    
    pub fn total_supply(env: Env) -> i128 {
        env.storage().persistent().get(&storage::TOTAL_SUPPLY).unwrap_or(0)
    }
    
    pub fn get_kyc_status(env: Env, address: Address) -> Result<ComplianceRecord, RWAError> {
        compliance::get_compliance_record(&env, &address)
    }
    
    pub fn is_frozen(env: Env, address: Address) -> bool {
        storage::is_frozen(&env, &address)
    }
    
    pub fn get_proposal(env: Env, proposal_id: u32) -> Result<Proposal, RWAError> {
        governance::get_proposal(&env, proposal_id)
    }
}

#[cfg(test)]
mod test;