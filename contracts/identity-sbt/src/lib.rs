#![no_std]

//! AstraLink Identity SBT - Soulbound Token for ZK-KYC Verification
//! 
//! This contract provides privacy-preserving identity verification
//! using Zero-Knowledge proofs (compatible with Anon Aadhaar).
//! 
//! Features:
//! - Soulbound (non-transferable) identity tokens
//! - Admin-controlled verification issuance
//! - Cross-contract compatible with RWA Token's IdentityTrait
//! - Revocable credentials

use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, symbol_short, log};

// ============ STORAGE KEYS ============

const ADMIN: soroban_sdk::Symbol = symbol_short!("ADMIN");
const INIT: soroban_sdk::Symbol = symbol_short!("INIT");

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Verified(Address),
}

// ============ CONTRACT ============

#[contract]
pub struct IdentitySBT;

#[contractimpl]
impl IdentitySBT {
    /// Initialize the Identity SBT contract
    /// 
    /// # Arguments
    /// * `admin` - Address authorized to issue/revoke SBTs
    pub fn initialize(env: Env, admin: Address) {
        // Prevent re-initialization
        if env.storage().instance().has(&INIT) {
            panic!("Already initialized");
        }
        
        // Store admin
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&INIT, &true);
        
        log!(&env, "Identity SBT initialized with admin: {}", admin);
    }
    
    /// Issue a Soulbound Token (SBT) to verify a user's identity
    /// 
    /// # Arguments
    /// * `user` - Address to verify
    /// 
    /// # Authorization
    /// Requires admin signature
    pub fn verify_user(env: Env, user: Address) {
        // Get and authenticate admin
        let admin: Address = env.storage().instance().get(&ADMIN)
            .expect("Not initialized");
        admin.require_auth();
        
        // Set user as verified
        let key = DataKey::Verified(user.clone());
        env.storage().persistent().set(&key, &true);
        
        // Extend TTL (1 year = ~31,536,000 ledgers at 1 ledger/sec)
        env.storage().persistent().extend_ttl(&key, 31_536_000, 31_536_000);
        
        // Emit event
        env.events().publish(
            (symbol_short!("verified"), user.clone()),
            true,
        );
        
        log!(&env, "User verified: {}", user);
    }
    
    /// Revoke a user's Soulbound Token
    /// 
    /// # Arguments
    /// * `user` - Address to revoke
    /// 
    /// # Authorization
    /// Requires admin signature
    pub fn revoke_user(env: Env, user: Address) {
        // Get and authenticate admin
        let admin: Address = env.storage().instance().get(&ADMIN)
            .expect("Not initialized");
        admin.require_auth();
        
        // Remove verification
        let key = DataKey::Verified(user.clone());
        env.storage().persistent().set(&key, &false);
        
        // Emit event
        env.events().publish(
            (symbol_short!("revoked"), user.clone()),
            true,
        );
        
        log!(&env, "User revoked: {}", user);
    }
    
    /// Check if a user has a valid Soulbound Token
    /// 
    /// # Arguments
    /// * `user` - Address to check
    /// 
    /// # Returns
    /// `true` if user has a valid SBT, `false` otherwise
    /// 
    /// # CRITICAL
    /// This function signature MUST match the IdentityTrait in rwa-token
    /// for cross-contract calls to work.
    pub fn has_sbt(env: Env, user: Address) -> bool {
        let key = DataKey::Verified(user);
        env.storage().persistent().get(&key).unwrap_or(false)
    }
    
    /// Get the admin address
    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&ADMIN)
            .expect("Not initialized")
    }
}

// ============ TESTS ============

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, IdentitySBT);
        let client = IdentitySBTClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        client.initialize(&admin);
        
        assert_eq!(client.get_admin(), admin);
    }

    #[test]
    fn test_verify_user() {
        let env = Env::default();
        env.mock_all_auths();
        
        let contract_id = env.register_contract(None, IdentitySBT);
        let client = IdentitySBTClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        
        client.initialize(&admin);
        
        // Before verification
        assert_eq!(client.has_sbt(&user), false);
        
        // Verify user
        client.verify_user(&user);
        
        // After verification
        assert_eq!(client.has_sbt(&user), true);
    }

    #[test]
    fn test_revoke_user() {
        let env = Env::default();
        env.mock_all_auths();
        
        let contract_id = env.register_contract(None, IdentitySBT);
        let client = IdentitySBTClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        
        client.initialize(&admin);
        client.verify_user(&user);
        assert_eq!(client.has_sbt(&user), true);
        
        // Revoke
        client.revoke_user(&user);
        assert_eq!(client.has_sbt(&user), false);
    }

    #[test]
    fn test_has_sbt_unverified_user() {
        let env = Env::default();
        
        let contract_id = env.register_contract(None, IdentitySBT);
        let client = IdentitySBTClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        
        client.initialize(&admin);
        
        // Unverified user should return false
        assert_eq!(client.has_sbt(&user), false);
    }

    #[test]
    #[should_panic(expected = "Already initialized")]
    fn test_double_init_fails() {
        let env = Env::default();
        
        let contract_id = env.register_contract(None, IdentitySBT);
        let client = IdentitySBTClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        
        client.initialize(&admin);
        client.initialize(&admin); // Should panic
    }
}
