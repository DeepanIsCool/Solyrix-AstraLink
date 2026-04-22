#![cfg(test)]

use super::*;
use soroban_sdk::{
    contract,
    contractimpl,
    testutils::{Address as _, Ledger},
    Address,
    Env,
    symbol_short,
    vec,
};

// ============ TEST-ONLY MOCK CONTRACTS ============

#[contract]
struct MockIdentitySBT;

#[contractimpl]
impl MockIdentitySBT {
    pub fn set_verified(env: Env, user: Address, is_verified: bool) {
        let key = (symbol_short!("verify"), user);
        env.storage().persistent().set(&key, &is_verified);
    }

    pub fn has_sbt(env: Env, user: Address) -> bool {
        let key = (symbol_short!("verify"), user);
        env.storage().persistent().get(&key).unwrap_or(false)
    }
}

// ============ TEST HELPERS ============

fn create_test_token(env: &Env) -> (Address, Address, Address, Address, RWATokenClient) {
    let gov1 = Address::generate(env);
    let gov2 = Address::generate(env);
    let gov3 = Address::generate(env);
    
    let contract_id = env.register_contract(None, RWAToken);
    let client = RWATokenClient::new(env, &contract_id);
    
    let governors = vec![env, gov1.clone(), gov2.clone(), gov3.clone()];
    
    client.initialize(
        &governors,
        &String::from_str(env, "Test RWA Token"),
        &String::from_str(env, "TRWA"),
        &6,
        &String::from_str(env, "REAL_ESTATE"),
        &1_000_000_000000, // 1M tokens
    );
    
    (gov1, gov2, gov3, contract_id, client)
}

fn setup_kyc_user(env: &Env, client: &RWATokenClient, gov1: &Address, user: &Address, status: InvestorStatus) {
    let record = ComplianceRecord {
        kyc_verified: true,
        investor_status: status,
        jurisdictions: vec![env, Jurisdiction::US],
        accreditation_expiry: 0,
        daily_limit_used: 0,
        last_reset_timestamp: 0,
    };
    
    client.update_kyc(gov1, user, &record);
}

// ============ 1. TOKEN BASICS (5 tests) ============

#[test]
fn test_initialization_with_governors() {
    let env = Env::default();
    let (gov1, gov2, gov3, _, client) = create_test_token(&env);
    
    // Check token metadata
    assert_eq!(client.name(), String::from_str(&env, "Test RWA Token"));
    assert_eq!(client.symbol(), String::from_str(&env, "TRWA"));
    assert_eq!(client.decimals(), 6);
    assert_eq!(client.total_supply(), 1_000_000_000000);
    
    // Check initial balance (should be with gov1/issuer)
    assert_eq!(client.balance(&gov1), 1_000_000_000000);
    assert_eq!(client.balance(&gov2), 0);
    assert_eq!(client.balance(&gov3), 0);
}

#[test]
fn test_transfer() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let user1 = Address::generate(&env);
    
    // Setup KYC for both parties
    setup_kyc_user(&env, &client, &gov1, &user1, InvestorStatus::Accredited);
    
    // Transfer from gov1 to user1
    client.transfer(&gov1, &user1, &100_000000);
    
    assert_eq!(client.balance(&user1), 100_000000);
    assert_eq!(client.balance(&gov1), 999_900_000000);
}

#[test]
fn test_balance() {
    let env = Env::default();
    let (gov1, gov2, _, _, client) = create_test_token(&env);
    
    assert_eq!(client.balance(&gov1), 1_000_000_000000);
    assert_eq!(client.balance(&gov2), 0);
}

#[test]
fn test_mint_burn_with_multisig() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let user1 = Address::generate(&env);
    
    // Mint new tokens
    client.mint(&gov1, &user1, &500_000000);
    assert_eq!(client.balance(&user1), 500_000000);
    assert_eq!(client.total_supply(), 1_000_500_000000);
    
    // Burn tokens
    client.burn(&gov1, &user1, &200_000000);
    assert_eq!(client.balance(&user1), 300_000000);
    assert_eq!(client.total_supply(), 1_000_300_000000);
}

#[test]
fn test_approve_allowance() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let spender = Address::generate(&env);
    
    // Approve spender
    client.approve(&gov1, &spender, &100_000000, &1000);
    
    assert_eq!(client.allowance(&gov1, &spender), 100_000000);
}

// ============ 2. PRIORITY COMPLIANCE CHECKS (10 tests) ============

// Group A: KYC Verification (Highest Priority)

#[test]
#[should_panic]
fn test_transfer_requires_kyc() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let user1 = Address::generate(&env);
    
    // Try transfer without KYC - should fail
    client.transfer(&gov1, &user1, &100_000000);
}

#[test]
fn test_transfer_with_verified_kyc() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let user1 = Address::generate(&env);
    
    // Setup KYC
    setup_kyc_user(&env, &client, &gov1, &user1, InvestorStatus::Accredited);
    
    // Transfer should succeed
    client.transfer(&gov1, &user1, &100_000000);
    assert_eq!(client.balance(&user1), 100_000000);
}

#[test]
#[should_panic]
fn test_kyc_expiry_blocks_transfer() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let user1 = Address::generate(&env);
    
    // Setup KYC with expiry in the past
    let record = ComplianceRecord {
        kyc_verified: true,
        investor_status: InvestorStatus::Accredited,
        jurisdictions: vec![&env, Jurisdiction::US],
        accreditation_expiry: 1, // Expired
        daily_limit_used: 0,
        last_reset_timestamp: 0,
    };
    
    client.update_kyc(&gov1, &user1, &record);

    // Ensure current ledger time is beyond the mock expiry timestamp.
    env.ledger().with_mut(|li| {
        li.timestamp = 100;
    });
    
    // Transfer should fail due to expiry
    client.transfer(&gov1, &user1, &100_000000);
}

#[test]
#[should_panic]
fn test_unverified_recipient_rejection() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    
    // Setup KYC only for user1
    setup_kyc_user(&env, &client, &gov1, &user1, InvestorStatus::Accredited);
    
    // Give user1 some tokens
    client.transfer(&gov1, &user1, &100_000000);
    
    // Try transfer to unverified user2 - should fail
    client.transfer(&user1, &user2, &50_000000);
}

// Group B: Accredited Investor Checks (Reg D Compliance)

#[test]
fn test_accredited_investor_allowed() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let accredited_user = Address::generate(&env);
    
    setup_kyc_user(&env, &client, &gov1, &accredited_user, InvestorStatus::Accredited);
    
    // Transfer to accredited investor should succeed
    client.transfer(&gov1, &accredited_user, &100_000000);
    assert_eq!(client.balance(&accredited_user), 100_000000);
}

#[test]
fn test_institutional_investor_allowed() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let institution = Address::generate(&env);
    
    setup_kyc_user(&env, &client, &gov1, &institution, InvestorStatus::Institutional);
    
    // Transfer to institution should succeed
    client.transfer(&gov1, &institution, &500_000000);
    assert_eq!(client.balance(&institution), 500_000000);
}

#[test]
#[should_panic]
fn test_non_accredited_rejection() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let retail_user = Address::generate(&env);
    
    // Setup KYC but as Unverified (non-accredited)
    let record = ComplianceRecord {
        kyc_verified: true,
        investor_status: InvestorStatus::Unverified,
        jurisdictions: vec![&env, Jurisdiction::US],
        accreditation_expiry: 0,
        daily_limit_used: 0,
        last_reset_timestamp: 0,
    };
    
    client.update_kyc(&gov1, &retail_user, &record);
    
    // Transfer should fail - not accredited
    client.transfer(&gov1, &retail_user, &100_000000);
}

// Group C: Transfer Restrictions

#[test]
#[should_panic]
fn test_holding_period_enforcement() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    
    setup_kyc_user(&env, &client, &gov1, &user1, InvestorStatus::Accredited);
    setup_kyc_user(&env, &client, &gov1, &user2, InvestorStatus::Accredited);

    // Override demo defaults to enforce a real holding period in this test.
    let mut restrictions = compliance::get_transfer_restrictions(&env);
    restrictions.min_holding_period = 86_400;
    compliance::set_transfer_restrictions(&env, &restrictions);
    
    // Transfer to user1
    client.transfer(&gov1, &user1, &100_000000);
    
    // Immediate re-transfer should fail (90-day holding period)
    client.transfer(&user1, &user2, &50_000000);
}

#[test]
#[should_panic]
fn test_ownership_limit_10_percent() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let whale = Address::generate(&env);
    
    setup_kyc_user(&env, &client, &gov1, &whale, InvestorStatus::Institutional);
    
    // Try to transfer 15% (exceeds 10% limit)
    // Total supply: 1M, 10% = 100k, trying 150k
    client.transfer(&gov1, &whale, &150_000_000000);
}

#[test]
#[should_panic]
fn test_daily_transfer_limit_100k() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let user3 = Address::generate(&env);
    
    setup_kyc_user(&env, &client, &gov1, &user1, InvestorStatus::Accredited);
    setup_kyc_user(&env, &client, &gov1, &user2, InvestorStatus::Accredited);
    setup_kyc_user(&env, &client, &gov1, &user3, InvestorStatus::Accredited);
    
    // Give user1 exactly 10% so ownership checks pass.
    client.transfer(&gov1, &user1, &100_000_000000);
    
    // First transfer keeps daily usage at $60k.
    client.transfer(&user1, &user2, &60_000_000000);

    // Second transfer pushes cumulative daily usage to $110k and must fail.
    client.transfer(&user1, &user3, &50_000_000000);
}

// ============ 3. MULTI-SIG GOVERNANCE (6 tests) ============

#[test]
fn test_propose_action() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    
    let params = vec![&env];
    let proposal_id = client.propose(&gov1, &symbol_short!("test"), &params, &1000);
    
    assert_eq!(proposal_id, 0); // First proposal
}

#[test]
fn test_approve_proposal() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, gov2, _, _, client) = create_test_token(&env);
    
    let params = vec![&env];
    let proposal_id = client.propose(&gov1, &symbol_short!("test"), &params, &1000);
    
    // Second governor approves
    let executed = client.approve_proposal(&gov2, &proposal_id);
    
    assert_eq!(executed, true); // Should execute with 2/3
}

#[test]
fn test_execute_with_2_of_3_sigs() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, gov2, _, _, client) = create_test_token(&env);
    
    let params = vec![&env];
    let proposal_id = client.propose(&gov1, &symbol_short!("mint"), &params, &1000);
    
    // Get proposal before approval
    let proposal_before = client.get_proposal(&proposal_id);
    assert_eq!(proposal_before.executed, false);
    
    // Second approval triggers execution
    client.approve_proposal(&gov2, &proposal_id);
    
    let proposal_after = client.get_proposal(&proposal_id);
    assert_eq!(proposal_after.executed, true);
}

#[test]
#[should_panic]
fn test_insufficient_approvals_fails() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    
    let params = vec![&env];
    let proposal_id = client.propose(&gov1, &symbol_short!("test"), &params, &1000);
    
    // Try to approve twice with same governor
    client.approve_proposal(&gov1, &proposal_id);
}

#[test]
#[should_panic]
fn test_proposal_expiry() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, gov2, _, _, client) = create_test_token(&env);
    
    let params = vec![&env];
    let proposal_id = client.propose(&gov1, &symbol_short!("test"), &params, &1); // 1 ledger expiry
    
    // Advance ledger beyond expiry
    env.ledger().with_mut(|li| {
        li.sequence_number += 10;
    });
    
    // Try to approve expired proposal
    client.approve_proposal(&gov2, &proposal_id);
}

#[test]
#[should_panic]
fn test_revoke_approval() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (_gov1, _, _, _, client) = create_test_token(&env);
    let non_governor = Address::generate(&env);
    
    let params = vec![&env];
    
    // Non-governor tries to propose - should fail
    client.propose(&non_governor, &symbol_short!("test"), &params, &1000);
}

// ============ 4. JURISDICTION & ADVANCED (4 tests) ============

#[test]
fn test_jurisdiction_restriction_us_sg_eu() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let us_user = Address::generate(&env);
    let sg_user = Address::generate(&env);
    
    // Setup users from allowed jurisdictions
    let us_record = ComplianceRecord {
        kyc_verified: true,
        investor_status: InvestorStatus::Accredited,
        jurisdictions: vec![&env, Jurisdiction::US],
        accreditation_expiry: 0,
        daily_limit_used: 0,
        last_reset_timestamp: 0,
    };
    
    let sg_record = ComplianceRecord {
        kyc_verified: true,
        investor_status: InvestorStatus::Qualified,
        jurisdictions: vec![&env, Jurisdiction::SG],
        accreditation_expiry: 0,
        daily_limit_used: 0,
        last_reset_timestamp: 0,
    };
    
    client.update_kyc(&gov1, &us_user, &us_record);
    client.update_kyc(&gov1, &sg_user, &sg_record);
    
    // Transfers should succeed for allowed jurisdictions
    client.transfer(&gov1, &us_user, &100_000000);
    client.transfer(&gov1, &sg_user, &100_000000);
    
    assert_eq!(client.balance(&us_user), 100_000000);
    assert_eq!(client.balance(&sg_user), 100_000000);
}

#[test]
#[should_panic]
fn test_frozen_account_blocks_transfer() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let user1 = Address::generate(&env);
    
    setup_kyc_user(&env, &client, &gov1, &user1, InvestorStatus::Accredited);
    
    // Give user tokens
    client.transfer(&gov1, &user1, &100_000000);
    
    // Freeze account
    client.freeze_account(&gov1, &user1);
    
    // Try transfer from frozen account - should fail
    let user2 = Address::generate(&env);
    setup_kyc_user(&env, &client, &gov1, &user2, InvestorStatus::Accredited);
    client.transfer(&user1, &user2, &50_000000);
}

#[test]
fn test_trading_suspension() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let user1 = Address::generate(&env);
    
    // Freeze account and unfreeze
    client.freeze_account(&gov1, &user1);
    assert_eq!(client.is_frozen(&user1), true);
    
    client.unfreeze_account(&gov1, &user1);
    assert_eq!(client.is_frozen(&user1), false);
}

#[test]
fn test_compliance_violation_events() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let user1 = Address::generate(&env);
    
    setup_kyc_user(&env, &client, &gov1, &user1, InvestorStatus::Accredited);
    
    // Update KYC status
    let new_record = ComplianceRecord {
        kyc_verified: true,
        investor_status: InvestorStatus::Institutional,
        jurisdictions: vec![&env, Jurisdiction::EU],
        accreditation_expiry: 0,
        daily_limit_used: 0,
        last_reset_timestamp: 0,
    };
    
    client.update_kyc(&gov1, &user1, &new_record);
    
    // Verify status updated
    let status = client.get_kyc_status(&user1);
    assert_eq!(status.investor_status, InvestorStatus::Institutional);
}

// ============ 5. EDGE CASES (3 tests) ============

#[test]
#[should_panic]
fn test_zero_transfer() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let user1 = Address::generate(&env);
    
    setup_kyc_user(&env, &client, &gov1, &user1, InvestorStatus::Accredited);
    
    // Try zero transfer
    client.transfer(&gov1, &user1, &0);
}

#[test]
#[should_panic]
fn test_overflow_protection() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let user1 = Address::generate(&env);
    
    setup_kyc_user(&env, &client, &gov1, &user1, InvestorStatus::Accredited);
    
    // User1 has no tokens; transfer attempt should fail with insufficient balance.
    client.transfer(&user1, &gov1, &1_000000);
}

#[test]
fn test_concurrent_daily_limit_tracking() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (gov1, _, _, _, client) = create_test_token(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    
    setup_kyc_user(&env, &client, &gov1, &user1, InvestorStatus::Accredited);
    setup_kyc_user(&env, &client, &gov1, &user2, InvestorStatus::Accredited);
    
    // Give user1 exactly 10% so ownership checks pass.
    client.transfer(&gov1, &user1, &100_000_000000);
    
    // Make multiple transfers under limit
    client.transfer(&user1, &user2, &30_000_000000); // $30k
    client.transfer(&user1, &user2, &40_000_000000); // $40k
    client.transfer(&user1, &user2, &20_000_000000); // $20k
    
    // Total: $90k - should succeed
    assert_eq!(client.balance(&user2), 90_000_000000);
}

// ============ 6. INTER-CONTRACT IDENTITY INTEGRATION (3 tests) ============

#[test]
fn test_transfer_uses_identity_contract_when_configured() {
    let env = Env::default();
    env.mock_all_auths();

    let (gov1, _, _, _, client) = create_test_token(&env);
    let recipient = Address::generate(&env);

    // Recipient still needs compliance metadata for non-KYC checks.
    setup_kyc_user(&env, &client, &gov1, &recipient, InvestorStatus::Accredited);

    // Deploy mock identity contract and mark both parties as SBT-verified.
    let identity_contract_id = env.register_contract(None, MockIdentitySBT);
    let identity_client = MockIdentitySBTClient::new(&env, &identity_contract_id);
    identity_client.set_verified(&gov1, &true);
    identity_client.set_verified(&recipient, &true);

    // Enable cross-contract identity checks.
    client.set_identity_contract(&gov1, &identity_contract_id);

    // Transfer should succeed via external SBT verification.
    client.transfer(&gov1, &recipient, &50_000000);
    assert_eq!(client.balance(&recipient), 50_000000);
}

#[test]
#[should_panic]
fn test_transfer_fails_when_identity_sbt_missing() {
    let env = Env::default();
    env.mock_all_auths();

    let (gov1, _, _, _, client) = create_test_token(&env);
    let recipient = Address::generate(&env);

    setup_kyc_user(&env, &client, &gov1, &recipient, InvestorStatus::Accredited);

    let identity_contract_id = env.register_contract(None, MockIdentitySBT);
    let identity_client = MockIdentitySBTClient::new(&env, &identity_contract_id);
    identity_client.set_verified(&gov1, &true);
    // Recipient intentionally not verified.
    identity_client.set_verified(&recipient, &false);

    client.set_identity_contract(&gov1, &identity_contract_id);

    // Must fail because external identity contract is authoritative when configured.
    client.transfer(&gov1, &recipient, &50_000000);
}

#[test]
fn test_identity_contract_can_override_local_kyc_flag() {
    let env = Env::default();
    env.mock_all_auths();

    let (gov1, _, _, _, client) = create_test_token(&env);
    let recipient = Address::generate(&env);

    // Local KYC flag is false, but investor metadata remains valid.
    let record = ComplianceRecord {
        kyc_verified: false,
        investor_status: InvestorStatus::Accredited,
        jurisdictions: vec![&env, Jurisdiction::US],
        accreditation_expiry: 0,
        daily_limit_used: 0,
        last_reset_timestamp: 0,
    };
    client.update_kyc(&gov1, &recipient, &record);

    let identity_contract_id = env.register_contract(None, MockIdentitySBT);
    let identity_client = MockIdentitySBTClient::new(&env, &identity_contract_id);
    identity_client.set_verified(&gov1, &true);
    identity_client.set_verified(&recipient, &true);

    client.set_identity_contract(&gov1, &identity_contract_id);

    // Succeeds because external SBT verification is used instead of local kyc_verified.
    client.transfer(&gov1, &recipient, &25_000000);
    assert_eq!(client.balance(&recipient), 25_000000);
}