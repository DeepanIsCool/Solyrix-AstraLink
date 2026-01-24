//! Storage keys and helpers for RWA token state

use soroban_sdk::{Env, Address, Symbol, symbol_short};

// ============ STORAGE KEYS ============

/// Token metadata keys
pub const TOKEN_NAME: Symbol = symbol_short!("name");
pub const TOKEN_SYMBOL: Symbol = symbol_short!("symbol");
pub const TOKEN_DECIMALS: Symbol = symbol_short!("decimals");
pub const TOTAL_SUPPLY: Symbol = symbol_short!("supply");
pub const ASSET_TYPE: Symbol = symbol_short!("asset");

/// Governance keys
pub const GOVERNORS: Symbol = symbol_short!("govs");
pub const REQUIRED_SIGS: Symbol = symbol_short!("req_sigs");
pub const PROPOSAL_COUNT: Symbol = symbol_short!("prop_cnt");
pub const TRADING_HALTED: Symbol = symbol_short!("halted");

/// Compliance keys
pub const RESTRICTIONS: Symbol = symbol_short!("restrict");

// ============ STORAGE FUNCTIONS ============

/// Get balance for an address
pub fn get_balance(env: &Env, address: &Address) -> i128 {
    let key = (symbol_short!("balance"), address);
    env.storage().persistent().get(&key).unwrap_or(0)
}

/// Set balance for an address
pub fn set_balance(env: &Env, address: &Address, amount: i128) {
    let key = (symbol_short!("balance"), address);
    env.storage().persistent().set(&key, &amount);
}

/// Get allowance between two addresses
pub fn get_allowance(env: &Env, from: &Address, spender: &Address) -> i128 {
    let key = (symbol_short!("allow"), from, spender);
    env.storage().temporary().get(&key).unwrap_or(0)
}

/// Set allowance between two addresses
pub fn set_allowance(env: &Env, from: &Address, spender: &Address, amount: i128, expiration: u32) {
    let key = (symbol_short!("allow"), from, spender);
    env.storage().temporary().set(&key, &amount);
    env.storage().temporary().extend_ttl(&key, expiration, expiration);
}

/// Check if account is frozen
pub fn is_frozen(env: &Env, address: &Address) -> bool {
    let key = (symbol_short!("frozen"), address);
    env.storage().persistent().get(&key).unwrap_or(false)
}

/// Set frozen status for account
pub fn set_frozen(env: &Env, address: &Address, frozen: bool) {
    let key = (symbol_short!("frozen"), address);
    env.storage().persistent().set(&key, &frozen);
}

/// Get first acquisition timestamp for holding period tracking
pub fn get_first_acquisition(env: &Env, address: &Address) -> u64 {
    let key = (symbol_short!("first"), address);
    env.storage().persistent().get(&key).unwrap_or(0)
}

/// Set first acquisition timestamp
pub fn set_first_acquisition(env: &Env, address: &Address, timestamp: u64) {
    let key = (symbol_short!("first"), address);
    if get_first_acquisition(env, address) == 0 {
        env.storage().persistent().set(&key, &timestamp);
    }
}
