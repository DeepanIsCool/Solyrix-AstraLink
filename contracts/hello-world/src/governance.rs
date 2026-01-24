//! Multi-signature governance for RWA token

use soroban_sdk::{Env, Address, Vec, Symbol, Val};
use crate::{Governors, Proposal, RWAError, events, storage};

/// Initialize governance with 3 governors requiring 2 signatures
pub fn initialize_governance(env: &Env, governors: Vec<Address>) -> Result<(), RWAError> {
    if governors.len() != 3 {
        return Err(RWAError::InvalidGovernorCount);
    }
    
    let gov_struct = Governors {
        addresses: governors,
        required_sigs: 2,
    };
    
    env.storage().persistent().set(&storage::GOVERNORS, &gov_struct);
    env.storage().persistent().set(&storage::PROPOSAL_COUNT, &0u32);
    
    Ok(())
}

/// Check if address is a governor
pub fn is_governor(env: &Env, address: &Address) -> bool {
    let governors: Governors = env.storage().persistent()
        .get(&storage::GOVERNORS)
        .unwrap();
    
    governors.addresses.iter().any(|gov| gov == address.clone())
}

/// Require caller to be a governor
pub fn require_governor(env: &Env, caller: &Address) -> Result<(), RWAError> {
    if !is_governor(env, caller) {
        return Err(RWAError::NotGovernor);
    }
    Ok(())
}

/// Create a new governance proposal
pub fn create_proposal(
    env: &Env,
    proposer: &Address,
    action: Symbol,
    parameters: Vec<Val>,
    expiry_ledgers: u32,
) -> Result<u32, RWAError> {
    require_governor(env, proposer)?;
    
    // Get and increment proposal count
    let proposal_id: u32 = env.storage().persistent()
        .get(&storage::PROPOSAL_COUNT)
        .unwrap_or(0);
    
    let new_count = proposal_id + 1;
    env.storage().persistent().set(&storage::PROPOSAL_COUNT, &new_count);
    
    // Create proposal with proposer as first approval
    let mut approvals = Vec::new(env);
    approvals.push_back(proposer.clone());
    
    let proposal = Proposal {
        id: proposal_id,
        proposer: proposer.clone(),
        action: action.clone(),
        parameters,
        approvals,
        expiry: (env.ledger().sequence() as u64) + (expiry_ledgers as u64),
        executed: false,
    };
    
    // Store proposal
    let key = (soroban_sdk::symbol_short!("prop"), proposal_id);
    env.storage().persistent().set(&key, &proposal);
    
    events::emit_proposal_created(env, proposal_id, proposer.clone(), action);
    
    Ok(proposal_id)
}

/// Approve a proposal
pub fn approve_proposal(
    env: &Env,
    governor: &Address,
    proposal_id: u32,
) -> Result<bool, RWAError> {
    require_governor(env, governor)?;
    
    // Get proposal
    let key = (soroban_sdk::symbol_short!("prop"), proposal_id);
    let mut proposal: Proposal = env.storage().persistent()
        .get(&key)
        .ok_or(RWAError::ProposalNotFound)?;
    
    // Check if already executed
    if proposal.executed {
        return Err(RWAError::ProposalAlreadyExecuted);
    }
    
    // Check expiry
    if (env.ledger().sequence() as u64) > proposal.expiry {
        return Err(RWAError::ProposalExpired);
    }
    
    // Check if already approved by this governor
    if proposal.approvals.iter().any(|addr| addr == governor.clone()) {
        return Err(RWAError::AlreadyApproved);
    }
    
    // Add approval
    proposal.approvals.push_back(governor.clone());
    
    events::emit_proposal_approved(env, proposal_id, governor.clone());
    
    // Check if threshold met (2 of 3)
    let governors: Governors = env.storage().persistent()
        .get(&storage::GOVERNORS)
        .unwrap();
    
    let threshold_met = proposal.approvals.len() as u32 >= governors.required_sigs;
    
    if threshold_met {
        proposal.executed = true;
        events::emit_proposal_executed(env, proposal_id);
    }
    
    // Update proposal
    env.storage().persistent().set(&key, &proposal);
    
    Ok(threshold_met)
}

/// Get proposal by ID
pub fn get_proposal(env: &Env, proposal_id: u32) -> Result<Proposal, RWAError> {
    let key = (soroban_sdk::symbol_short!("prop"), proposal_id);
    env.storage().persistent()
        .get(&key)
        .ok_or(RWAError::ProposalNotFound)
}

/// Require multi-sig approval for action
pub fn require_multisig_approval(env: &Env, caller: &Address) -> Result<(), RWAError> {
    // For now, just check if caller is a governor
    // In full implementation, would check for approved proposal
    require_governor(env, caller)
}
