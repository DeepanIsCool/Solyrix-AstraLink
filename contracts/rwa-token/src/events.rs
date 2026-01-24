//! Event emissions for RWA token operations

use soroban_sdk::{Env, Address, Symbol, String, symbol_short};
use crate::InvestorStatus;

// ============ TOKEN EVENTS ============

pub fn emit_transfer(env: &Env, from: Address, to: Address, amount: i128) {
    env.events().publish(
        (symbol_short!("transfer"),),
        (from, to, amount)
    );
}

pub fn emit_mint(env: &Env, to: Address, amount: i128) {
    env.events().publish(
        (symbol_short!("mint"),),
        (to, amount)
    );
}

pub fn emit_burn(env: &Env, from: Address, amount: i128) {
    env.events().publish(
        (symbol_short!("burn"),),
        (from, amount)
    );
}

pub fn emit_approve(env: &Env, from: Address, spender: Address, amount: i128, expiration: u32) {
    env.events().publish(
        (symbol_short!("approve"),),
        (from, spender, amount, expiration)
    );
}

// ============ COMPLIANCE EVENTS ============

pub fn emit_kyc_updated(env: &Env, address: Address, status: InvestorStatus) {
    env.events().publish(
        (symbol_short!("kyc_upd"),),
        (address, status)
    );
}

pub fn emit_account_frozen(env: &Env, address: Address) {
    env.events().publish(
        (symbol_short!("frozen"),),
        (address,)
    );
}

pub fn emit_account_unfrozen(env: &Env, address: Address) {
    env.events().publish(
        (symbol_short!("unfrozen"),),
        (address,)
    );
}

pub fn emit_compliance_violation(env: &Env, address: Address, reason: Symbol) {
    env.events().publish(
        (symbol_short!("violation"),),
        (address, reason)
    );
}

// ============ GOVERNANCE EVENTS ============

pub fn emit_proposal_created(env: &Env, proposal_id: u32, proposer: Address, action: Symbol) {
    env.events().publish(
        (symbol_short!("proposal"),),
        (proposal_id, proposer, action)
    );
}

pub fn emit_proposal_approved(env: &Env, proposal_id: u32, governor: Address) {
    env.events().publish(
        (symbol_short!("approved"),),
        (proposal_id, governor)
    );
}

pub fn emit_proposal_executed(env: &Env, proposal_id: u32) {
    env.events().publish(
        (symbol_short!("executed"),),
        (proposal_id,)
    );
}

pub fn emit_governor_added(env: &Env, governor: Address) {
    env.events().publish(
        (symbol_short!("gov_add"),),
        (governor,)
    );
}

pub fn emit_governor_removed(env: &Env, governor: Address) {
    env.events().publish(
        (symbol_short!("gov_rm"),),
        (governor,)
    );
}

// ============ INITIALIZATION EVENT ============

pub fn emit_initialized(env: &Env, name: String, symbol: String, total_supply: i128) {
    env.events().publish(
        (symbol_short!("init"),),
        (name, symbol, total_supply)
    );
}
