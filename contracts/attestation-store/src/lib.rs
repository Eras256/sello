#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, log, symbol_short, Address, Env, Map,
    String, Vec,
};

// ─── Storage Keys ───────────────────────────────────────────────────────────

/// All storage keys use a `DataKey` enum to prevent key collisions.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    /// The contract administrator address
    Admin,
    /// Set of authorized verifier addresses
    Verifiers,
    /// Attestation data for a specific subject address
    Attestation(Address),
    /// Counter of total attestations minted
    TotalMinted,
    /// Counter of total attestations revoked
    TotalRevoked,
}

// ─── Data Types ─────────────────────────────────────────────────────────────

/// Attestation data stored on-chain for each verified subject.
/// Contains NO personally identifiable information (PII) — only cryptographic
/// proof of verification status.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AttestationData {
    /// Whether the attestation is currently valid
    pub verified: bool,
    /// Verification tier (1=Basic, 2=Standard, 3=Enhanced, 4=Business KYB)
    pub tier: u32,
    /// Ledger timestamp when the attestation was issued
    pub timestamp: u64,
    /// Unix timestamp when the attestation expires
    pub expiry: u64,
    /// Address of the verifier who issued this attestation
    pub verifier: Address,
}

/// Result returned by the `verify()` function.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AttestationResult {
    /// Whether the subject has a valid, non-expired attestation
    pub verified: bool,
    /// Verification tier (0 if not verified)
    pub tier: u32,
    /// Timestamp of issuance (0 if not verified)
    pub timestamp: u64,
    /// Expiry timestamp (0 if not verified)
    pub expiry: u64,
}

// ─── Custom Errors ──────────────────────────────────────────────────────────

/// Custom error codes for the AttestationStore contract.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum AttestationError {
    /// Contract has already been initialized
    AlreadyInitialized = 1,
    /// Caller is not the contract administrator
    NotAdmin = 2,
    /// Caller is not an authorized verifier
    NotVerifier = 3,
    /// Provided tier is outside the valid range (1-4)
    InvalidTier = 4,
    /// Provided expiry timestamp is in the past
    InvalidExpiry = 5,
    /// No attestation exists for the given address
    AttestationNotFound = 6,
    /// The address is a zero/empty address
    InvalidAddress = 7,
}

// ─── Contract ───────────────────────────────────────────────────────────────

#[contract]
pub struct AttestationStore;

#[contractimpl]
impl AttestationStore {
    // ── Initialization ──────────────────────────────────────────────────

    /// Initialize the contract with an admin address.
    /// Can only be called once — subsequent calls will panic.
    pub fn initialize(env: Env, admin: Address) -> Result<(), AttestationError> {
        // Guard against re-initialization
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(AttestationError::AlreadyInitialized);
        }

        // Store admin in instance storage (lives as long as the contract)
        env.storage().instance().set(&DataKey::Admin, &admin);

        // Initialize empty verifier list
        let verifiers: Vec<Address> = Vec::new(&env);
        env.storage().instance().set(&DataKey::Verifiers, &verifiers);

        // Initialize counters
        env.storage().instance().set(&DataKey::TotalMinted, &0u64);
        env.storage().instance().set(&DataKey::TotalRevoked, &0u64);

        // Extend instance TTL (~30 days)
        env.storage()
            .instance()
            .extend_ttl(100, 518_400);

        log!(&env, "AttestationStore initialized with admin: {}", admin);

        Ok(())
    }

    // ── Admin Functions ─────────────────────────────────────────────────

    /// Add an authorized verifier. Only the admin can call this.
    pub fn add_verifier(env: Env, admin: Address, verifier: Address) -> Result<(), AttestationError> {
        // Require admin authentication
        admin.require_auth();
        Self::require_admin(&env, &admin)?;

        let mut verifiers: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Verifiers)
            .unwrap_or(Vec::new(&env));

        // Only add if not already present
        if !verifiers.contains(&verifier) {
            verifiers.push_back(verifier.clone());
            env.storage()
                .instance()
                .set(&DataKey::Verifiers, &verifiers);
        }

        // Extend TTL on mutation
        env.storage()
            .instance()
            .extend_ttl(100, 518_400);

        // Emit event
        env.events()
            .publish((symbol_short!("verifier"), symbol_short!("added")), verifier);

        Ok(())
    }

    /// Remove an authorized verifier. Only the admin can call this.
    pub fn remove_verifier(
        env: Env,
        admin: Address,
        verifier: Address,
    ) -> Result<(), AttestationError> {
        admin.require_auth();
        Self::require_admin(&env, &admin)?;

        let verifiers: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Verifiers)
            .unwrap_or(Vec::new(&env));

        let mut new_verifiers: Vec<Address> = Vec::new(&env);
        for v in verifiers.iter() {
            if v != verifier {
                new_verifiers.push_back(v);
            }
        }

        env.storage()
            .instance()
            .set(&DataKey::Verifiers, &new_verifiers);

        env.storage()
            .instance()
            .extend_ttl(100, 518_400);

        env.events().publish(
            (symbol_short!("verifier"), symbol_short!("removed")),
            verifier,
        );

        Ok(())
    }

    /// Returns the admin address.
    pub fn get_admin(env: Env) -> Result<Address, AttestationError> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(AttestationError::NotAdmin)
    }

    /// Check if an address is an authorized verifier.
    pub fn is_verifier(env: Env, address: Address) -> bool {
        let verifiers: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Verifiers)
            .unwrap_or(Vec::new(&env));
        verifiers.contains(&address)
    }

    // ── Attestation Functions ───────────────────────────────────────────

    /// Issue a non-transferable attestation for a subject address.
    /// Only authorized verifiers can call this function.
    /// If the subject already has an attestation, it will be overwritten.
    pub fn issue_attestation(
        env: Env,
        verifier: Address,
        subject: Address,
        tier: u32,
        expiry: u64,
    ) -> Result<(), AttestationError> {
        // Require verifier authentication
        verifier.require_auth();

        // Validate verifier is authorized
        if !Self::is_verifier(env.clone(), verifier.clone()) {
            return Err(AttestationError::NotVerifier);
        }

        // Validate tier (1-4)
        if tier < 1 || tier > 4 {
            return Err(AttestationError::InvalidTier);
        }

        // Validate expiry is in the future
        let now = env.ledger().timestamp();
        if expiry <= now {
            return Err(AttestationError::InvalidExpiry);
        }

        // Create attestation data
        let attestation = AttestationData {
            verified: true,
            tier,
            timestamp: now,
            expiry,
            verifier: verifier.clone(),
        };

        // Store attestation in persistent storage (survives contract updates)
        env.storage()
            .persistent()
            .set(&DataKey::Attestation(subject.clone()), &attestation);

        // Extend persistent TTL (~30 days)
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Attestation(subject.clone()), 100, 518_400);

        // Increment total minted counter
        let total: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TotalMinted)
            .unwrap_or(0u64);
        env.storage()
            .instance()
            .set(&DataKey::TotalMinted, &total.checked_add(1).unwrap_or(total));

        env.storage()
            .instance()
            .extend_ttl(100, 518_400);

        // Emit attestation issued event
        env.events().publish(
            (symbol_short!("attest"), symbol_short!("issued")),
            (subject, tier, expiry),
        );

        Ok(())
    }

    /// Verify an address — returns the attestation status.
    /// If no attestation exists or it has expired, returns verified=false.
    pub fn verify(env: Env, subject: Address) -> AttestationResult {
        let key = DataKey::Attestation(subject);

        match env.storage().persistent().get::<DataKey, AttestationData>(&key) {
            Some(attestation) => {
                let now = env.ledger().timestamp();
                let is_valid = attestation.verified && attestation.expiry > now;

                // Extend TTL on read
                env.storage()
                    .persistent()
                    .extend_ttl(&key, 100, 518_400);

                AttestationResult {
                    verified: is_valid,
                    tier: if is_valid { attestation.tier } else { 0 },
                    timestamp: attestation.timestamp,
                    expiry: attestation.expiry,
                }
            }
            None => AttestationResult {
                verified: false,
                tier: 0,
                timestamp: 0,
                expiry: 0,
            },
        }
    }

    /// Revoke an attestation. Only the original verifier or admin can revoke.
    pub fn revoke(env: Env, caller: Address, subject: Address) -> Result<(), AttestationError> {
        caller.require_auth();

        let key = DataKey::Attestation(subject.clone());

        // Check attestation exists
        let attestation: AttestationData = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(AttestationError::AttestationNotFound)?;

        // Only the original verifier or admin can revoke
        let is_admin = Self::get_admin(env.clone())
            .map(|admin| admin == caller)
            .unwrap_or(false);
        let is_verifier = attestation.verifier == caller;

        if !is_admin && !is_verifier {
            return Err(AttestationError::NotVerifier);
        }

        // Remove the attestation from storage
        env.storage().persistent().remove(&key);

        // Increment revoked counter
        let total: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TotalRevoked)
            .unwrap_or(0u64);
        env.storage()
            .instance()
            .set(&DataKey::TotalRevoked, &total.checked_add(1).unwrap_or(total));

        env.storage()
            .instance()
            .extend_ttl(100, 518_400);

        // Emit revocation event
        env.events().publish(
            (symbol_short!("attest"), symbol_short!("revoked")),
            subject,
        );

        Ok(())
    }

    // ── Read-Only Helpers ───────────────────────────────────────────────

    /// Get total number of attestations minted.
    pub fn total_minted(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::TotalMinted)
            .unwrap_or(0u64)
    }

    /// Get total number of attestations revoked.
    pub fn total_revoked(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::TotalRevoked)
            .unwrap_or(0u64)
    }

    // ── Internal Helpers ────────────────────────────────────────────────

    /// Verify that the caller is the admin.
    fn require_admin(env: &Env, caller: &Address) -> Result<(), AttestationError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(AttestationError::NotAdmin)?;

        if *caller != admin {
            return Err(AttestationError::NotAdmin);
        }

        Ok(())
    }
}

// ─── Tests ──────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger, LedgerInfo};
    use soroban_sdk::Env;

    fn setup_env() -> (Env, Address, AttestationStoreClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(AttestationStore, ());
        let client = AttestationStoreClient::new(&env, &contract_id);
        let admin = Address::generate(&env);

        (env, admin, client)
    }

    #[test]
    fn test_initialize() {
        let (env, admin, client) = setup_env();
        client.initialize(&admin);
        assert_eq!(client.get_admin(), admin);
    }

    #[test]
    fn test_double_initialize_fails() {
        let (_env, admin, client) = setup_env();
        client.initialize(&admin);
        let result = client.try_initialize(&admin);
        assert!(result.is_err());
    }

    #[test]
    fn test_add_and_check_verifier() {
        let (env, admin, client) = setup_env();
        client.initialize(&admin);

        let verifier = Address::generate(&env);
        client.add_verifier(&admin, &verifier);

        assert!(client.is_verifier(&verifier));
    }

    #[test]
    fn test_remove_verifier() {
        let (env, admin, client) = setup_env();
        client.initialize(&admin);

        let verifier = Address::generate(&env);
        client.add_verifier(&admin, &verifier);
        assert!(client.is_verifier(&verifier));

        client.remove_verifier(&admin, &verifier);
        assert!(!client.is_verifier(&verifier));
    }

    #[test]
    fn test_issue_attestation() {
        let (env, admin, client) = setup_env();

        // Set ledger timestamp
        env.ledger().with_mut(|li| {
            li.timestamp = 1_000_000;
        });

        client.initialize(&admin);

        let verifier = Address::generate(&env);
        client.add_verifier(&admin, &verifier);

        let subject = Address::generate(&env);
        let expiry = 2_000_000u64;
        client.issue_attestation(&verifier, &subject, &2u32, &expiry);

        let result = client.verify(&subject);
        assert!(result.verified);
        assert_eq!(result.tier, 2);
        assert_eq!(result.expiry, expiry);
    }

    #[test]
    fn test_verify_unverified_address() {
        let (env, admin, client) = setup_env();
        client.initialize(&admin);

        let unknown = Address::generate(&env);
        let result = client.verify(&unknown);
        assert!(!result.verified);
        assert_eq!(result.tier, 0);
    }

    #[test]
    fn test_expired_attestation() {
        let (env, admin, client) = setup_env();

        env.ledger().with_mut(|li| {
            li.timestamp = 1_000_000;
        });

        client.initialize(&admin);

        let verifier = Address::generate(&env);
        client.add_verifier(&admin, &verifier);

        let subject = Address::generate(&env);
        client.issue_attestation(&verifier, &subject, &1u32, &1_500_000u64);

        // Advance time past expiry
        env.ledger().with_mut(|li| {
            li.timestamp = 2_000_000;
        });

        let result = client.verify(&subject);
        assert!(!result.verified);
        assert_eq!(result.tier, 0);
    }

    #[test]
    fn test_revoke_attestation() {
        let (env, admin, client) = setup_env();

        env.ledger().with_mut(|li| {
            li.timestamp = 1_000_000;
        });

        client.initialize(&admin);

        let verifier = Address::generate(&env);
        client.add_verifier(&admin, &verifier);

        let subject = Address::generate(&env);
        client.issue_attestation(&verifier, &subject, &2u32, &2_000_000u64);

        // Revoke
        client.revoke(&verifier, &subject);

        let result = client.verify(&subject);
        assert!(!result.verified);
    }

    #[test]
    fn test_unauthorized_issuance_fails() {
        let (env, admin, client) = setup_env();

        env.ledger().with_mut(|li| {
            li.timestamp = 1_000_000;
        });

        client.initialize(&admin);

        let unauthorized = Address::generate(&env);
        let subject = Address::generate(&env);

        let result = client.try_issue_attestation(&unauthorized, &subject, &1u32, &2_000_000u64);
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_tier_fails() {
        let (env, admin, client) = setup_env();

        env.ledger().with_mut(|li| {
            li.timestamp = 1_000_000;
        });

        client.initialize(&admin);

        let verifier = Address::generate(&env);
        client.add_verifier(&admin, &verifier);

        let subject = Address::generate(&env);

        // Tier 0 (invalid)
        let result = client.try_issue_attestation(&verifier, &subject, &0u32, &2_000_000u64);
        assert!(result.is_err());

        // Tier 5 (invalid)
        let result = client.try_issue_attestation(&verifier, &subject, &5u32, &2_000_000u64);
        assert!(result.is_err());
    }

    #[test]
    fn test_overwrite_attestation() {
        let (env, admin, client) = setup_env();

        env.ledger().with_mut(|li| {
            li.timestamp = 1_000_000;
        });

        client.initialize(&admin);

        let verifier = Address::generate(&env);
        client.add_verifier(&admin, &verifier);

        let subject = Address::generate(&env);

        // Issue tier 1
        client.issue_attestation(&verifier, &subject, &1u32, &2_000_000u64);
        let result = client.verify(&subject);
        assert_eq!(result.tier, 1);

        // Overwrite with tier 3
        client.issue_attestation(&verifier, &subject, &3u32, &3_000_000u64);
        let result = client.verify(&subject);
        assert_eq!(result.tier, 3);
        assert_eq!(result.expiry, 3_000_000);
    }

    #[test]
    fn test_total_counters() {
        let (env, admin, client) = setup_env();

        env.ledger().with_mut(|li| {
            li.timestamp = 1_000_000;
        });

        client.initialize(&admin);

        let verifier = Address::generate(&env);
        client.add_verifier(&admin, &verifier);

        assert_eq!(client.total_minted(), 0);
        assert_eq!(client.total_revoked(), 0);

        let subject1 = Address::generate(&env);
        let subject2 = Address::generate(&env);

        client.issue_attestation(&verifier, &subject1, &1u32, &2_000_000u64);
        client.issue_attestation(&verifier, &subject2, &2u32, &2_000_000u64);

        assert_eq!(client.total_minted(), 2);

        client.revoke(&verifier, &subject1);
        assert_eq!(client.total_revoked(), 1);
    }

    #[test]
    fn test_admin_can_revoke() {
        let (env, admin, client) = setup_env();

        env.ledger().with_mut(|li| {
            li.timestamp = 1_000_000;
        });

        client.initialize(&admin);

        let verifier = Address::generate(&env);
        client.add_verifier(&admin, &verifier);

        let subject = Address::generate(&env);
        client.issue_attestation(&verifier, &subject, &2u32, &2_000_000u64);

        // Admin revokes (not original verifier)
        client.revoke(&admin, &subject);

        let result = client.verify(&subject);
        assert!(!result.verified);
    }
}
