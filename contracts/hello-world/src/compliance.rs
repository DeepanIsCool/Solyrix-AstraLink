//! Compliance engine for RWA token transfers

use soroban_sdk::{Env, Address, Vec};
use crate::{
    ComplianceRecord, TransferRestrictions, InvestorStatus, Jurisdiction, RWAError,
    storage, events,
};

/// Verify if a transfer meets all compliance requirements
pub fn verify_transfer(
    env: &Env,
    from: &Address,
    to: &Address,
    amount: i128,
) -> Result<(), RWAError> {
    // 1. Check if trading is halted globally
    if is_trading_halted(env) {
        return Err(RWAError::TradingSuspended);
    }
    
    // 2. Check if accounts are frozen
    if storage::is_frozen(env, from) || storage::is_frozen(env, to) {
        return Err(RWAError::AccountFrozen);
    }
    
    // 3. Get compliance records
    let from_record = get_compliance_record(env, from)?;
    let to_record = get_compliance_record(env, to)?;
    
    // 4. PRIORITY 1: KYC Verification
    if !from_record.kyc_verified || !to_record.kyc_verified {
        events::emit_compliance_violation(env, from.clone(), soroban_sdk::symbol_short!("NO_KYC"));
        return Err(RWAError::KYCRequired);
    }
    
    // 5. Check KYC expiration
    let current_time = env.ledger().timestamp();
    if from_record.accreditation_expiry > 0 && from_record.accreditation_expiry < current_time {
        return Err(RWAError::KYCExpired);
    }
    if to_record.accreditation_expiry > 0 && to_record.accreditation_expiry < current_time {
        return Err(RWAError::KYCExpired);
    }
    
    // 6. Get transfer restrictions
    let restrictions = get_transfer_restrictions(env);
    
    // 7. PRIORITY 2: Accredited Investor Check (Reg D compliance)
    if restrictions.require_accreditation {
        match to_record.investor_status {
            InvestorStatus::Accredited | InvestorStatus::Institutional | InvestorStatus::Qualified => {},
            _ => {
                events::emit_compliance_violation(env, to.clone(), soroban_sdk::symbol_short!("NOT_ACCR"));
                return Err(RWAError::AccreditationRequired);
            }
        }
    }
    
    // 8. Check jurisdiction restrictions
    if !is_jurisdiction_allowed(env, &to_record, &restrictions) {
        events::emit_compliance_violation(env, to.clone(), soroban_sdk::symbol_short!("BAD_JURIS"));
        return Err(RWAError::JurisdictionRestricted);
    }
    
    // 9. PRIORITY 3: Holding Period Check
    let holding_period = get_holding_period(env, from);
    if holding_period < restrictions.min_holding_period {
        return Err(RWAError::HoldingPeriodNotMet);
    }
    
    // 10. Ownership Limit Check (10% max)
    let total_supply = get_total_supply(env);
    let to_balance = storage::get_balance(env, to);
    let new_balance = to_balance + amount;
    let ownership_percent = (new_balance * 10000) / total_supply; // Basis points
    
    if ownership_percent > restrictions.max_ownership_percent {
        events::emit_compliance_violation(env, to.clone(), soroban_sdk::symbol_short!("OWN_LIMIT"));
        return Err(RWAError::OwnershipLimitExceeded);
    }
    
    // 11. Daily Transfer Limit Check ($100k)
    let daily_used = get_daily_transfer_amount(env, from);
    if daily_used + amount > restrictions.daily_transfer_limit {
        events::emit_compliance_violation(env, from.clone(), soroban_sdk::symbol_short!("DAY_LIMIT"));
        return Err(RWAError::DailyLimitExceeded);
    }
    
    Ok(())
}

/// Get compliance record for an address
pub fn get_compliance_record(env: &Env, address: &Address) -> Result<ComplianceRecord, RWAError> {
    let key = (soroban_sdk::symbol_short!("kyc"), address);
    env.storage().persistent().get(&key)
        .ok_or(RWAError::KYCRequired)
}

/// Set compliance record for an address
pub fn set_compliance_record(env: &Env, address: &Address, record: &ComplianceRecord) {
    let key = (soroban_sdk::symbol_short!("kyc"), address);
    env.storage().persistent().set(&key, record);
}

/// Get global transfer restrictions
pub fn get_transfer_restrictions(env: &Env) -> TransferRestrictions {
    env.storage().persistent()
        .get(&crate::storage::RESTRICTIONS)
        .unwrap_or_else(|| {
            // Default conservative restrictions  
            TransferRestrictions {
                min_holding_period: 7776000,
                max_ownership_percent: 1000,
                allowed_jurisdictions: Vec::new(env),
                require_accreditation: true,  
                daily_transfer_limit: 100_000_000000,
            }
        })
}

/// Set global transfer restrictions
pub fn set_transfer_restrictions(env: &Env, restrictions: &TransferRestrictions) {
    env.storage().persistent().set(&crate::storage::RESTRICTIONS, restrictions);
}

/// Check if trading is globally halted
pub fn is_trading_halted(env: &Env) -> bool {
    env.storage().persistent()
        .get(&crate::storage::TRADING_HALTED)
        .unwrap_or(false)
}

/// Get holding period in seconds for an address
fn get_holding_period(env: &Env, address: &Address) -> u64 {
    let first_acquisition = storage::get_first_acquisition(env, address);
    if first_acquisition == 0 {
        return 0;
    }
    let current_time = env.ledger().timestamp();
    current_time.saturating_sub(first_acquisition)
}

/// Get daily transfer amount used by address
fn get_daily_transfer_amount(env: &Env, address: &Address) -> i128 {
    let key = (soroban_sdk::symbol_short!("daily"), address);
    let current_day = env.ledger().timestamp() / 86400; // Days since epoch
    
    let (last_day, amount): (u64, i128) = env.storage().temporary()
        .get(&key)
        .unwrap_or((0, 0));
    
    if current_day > last_day {
        0 // Reset if new day
    } else {
        amount
    }
}

/// Update daily transfer amount for address
pub fn update_daily_transfer_amount(env: &Env, address: &Address, additional: i128) {
    let key = (soroban_sdk::symbol_short!("daily"), address);
    let current_day = env.ledger().timestamp() / 86400;
    
    let current_amount = get_daily_transfer_amount(env, address);
    let new_amount = current_amount + additional;
    
    env.storage().temporary().set(&key, &(current_day, new_amount));
    env.storage().temporary().extend_ttl(&key, 86400, 86400); // 1 day TTL
}

/// Check if jurisdiction is allowed
fn is_jurisdiction_allowed(
    _env: &Env,
    record: &ComplianceRecord,
    restrictions: &TransferRestrictions,
) -> bool {
    if restrictions.allowed_jurisdictions.is_empty() {
        return true; // No restrictions
    }
    
    // Check if any of the user's jurisdictions are allowed
    for user_juris in record.jurisdictions.iter() {
        for allowed_juris in restrictions.allowed_jurisdictions.iter() {
            if user_juris == allowed_juris {
                return true;
            }
        }
    }
    
    false
}

/// Get total supply
fn get_total_supply(env: &Env) -> i128 {
    env.storage().persistent()
        .get(&crate::storage::TOTAL_SUPPLY)
        .unwrap_or(0)
}
