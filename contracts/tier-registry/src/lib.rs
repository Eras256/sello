#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, log, symbol_short, Address, Env, String,
    Vec,
};

// ─── Storage Keys ───────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    /// The contract administrator address
    Admin,
    /// Configuration for a specific tier
    TierConfig(u32),
    /// List of all configured tier IDs
    TierIds,
}

// ─── Data Types ─────────────────────────────────────────────────────────────

/// Configuration for a verification tier.
/// Defines what checks are required for each level of identity verification.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TierConfig {
    /// Tier ID (1-4)
    pub tier: u32,
    /// Human-readable name (e.g., "Basic", "Standard", "Enhanced", "Business")
    pub name: String,
    /// Description of the tier
    pub description: String,
    /// List of required verification checks for this tier
    pub required_checks: Vec<String>,
}

// ─── Custom Errors ──────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum TierRegistryError {
    /// Contract has already been initialized
    AlreadyInitialized = 1,
    /// Caller is not the contract administrator
    NotAdmin = 2,
    /// Provided tier ID is outside the valid range (1-4)
    InvalidTier = 3,
    /// Tier configuration not found
    TierNotFound = 4,
}

// ─── Contract ───────────────────────────────────────────────────────────────

#[contract]
pub struct TierRegistry;

#[contractimpl]
impl TierRegistry {
    /// Initialize the contract with an admin address.
    pub fn initialize(env: Env, admin: Address) -> Result<(), TierRegistryError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(TierRegistryError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);

        let tier_ids: Vec<u32> = Vec::new(&env);
        env.storage().instance().set(&DataKey::TierIds, &tier_ids);

        env.storage().instance().extend_ttl(100, 518_400);

        log!(&env, "TierRegistry initialized with admin: {}", admin);

        Ok(())
    }

    /// Set or update tier configuration. Only the admin can call this.
    pub fn set_tier_config(
        env: Env,
        admin: Address,
        tier: u32,
        name: String,
        description: String,
        required_checks: Vec<String>,
    ) -> Result<(), TierRegistryError> {
        admin.require_auth();
        Self::require_admin(&env, &admin)?;

        // Validate tier range (1-4)
        if tier < 1 || tier > 4 {
            return Err(TierRegistryError::InvalidTier);
        }

        let config = TierConfig {
            tier,
            name,
            description,
            required_checks,
        };

        // Store tier config in persistent storage
        env.storage()
            .persistent()
            .set(&DataKey::TierConfig(tier), &config);

        env.storage()
            .persistent()
            .extend_ttl(&DataKey::TierConfig(tier), 100, 518_400);

        // Track tier ID if not already tracked
        let mut tier_ids: Vec<u32> = env
            .storage()
            .instance()
            .get(&DataKey::TierIds)
            .unwrap_or(Vec::new(&env));

        if !tier_ids.contains(&tier) {
            tier_ids.push_back(tier);
            env.storage().instance().set(&DataKey::TierIds, &tier_ids);
        }

        env.storage().instance().extend_ttl(100, 518_400);

        env.events().publish(
            (symbol_short!("tier"), symbol_short!("config")),
            tier,
        );

        Ok(())
    }

    /// Get the configuration for a specific tier.
    pub fn get_tier_config(env: Env, tier: u32) -> Result<TierConfig, TierRegistryError> {
        if tier < 1 || tier > 4 {
            return Err(TierRegistryError::InvalidTier);
        }

        env.storage()
            .persistent()
            .get(&DataKey::TierConfig(tier))
            .ok_or(TierRegistryError::TierNotFound)
    }

    /// List all configured tiers.
    pub fn list_tiers(env: Env) -> Vec<TierConfig> {
        let tier_ids: Vec<u32> = env
            .storage()
            .instance()
            .get(&DataKey::TierIds)
            .unwrap_or(Vec::new(&env));

        let mut configs: Vec<TierConfig> = Vec::new(&env);

        for id in tier_ids.iter() {
            if let Some(config) = env
                .storage()
                .persistent()
                .get::<DataKey, TierConfig>(&DataKey::TierConfig(id))
            {
                configs.push_back(config);
            }
        }

        configs
    }

    /// Get the admin address.
    pub fn get_admin(env: Env) -> Result<Address, TierRegistryError> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(TierRegistryError::NotAdmin)
    }

    // ── Internal Helpers ────────────────────────────────────────────────

    fn require_admin(env: &Env, caller: &Address) -> Result<(), TierRegistryError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(TierRegistryError::NotAdmin)?;

        if *caller != admin {
            return Err(TierRegistryError::NotAdmin);
        }

        Ok(())
    }
}

// ─── Tests ──────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    fn setup_env() -> (Env, Address, TierRegistryClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(TierRegistry, ());
        let client = TierRegistryClient::new(&env, &contract_id);
        let admin = Address::generate(&env);

        (env, admin, client)
    }

    fn setup_default_tiers(env: &Env, admin: &Address, client: &TierRegistryClient) {
        // Tier 1: Basic
        client.set_tier_config(
            admin,
            &1u32,
            &String::from_str(env, "Basic"),
            &String::from_str(env, "Email and phone verification"),
            &Vec::from_array(
                env,
                [
                    String::from_str(env, "email"),
                    String::from_str(env, "phone"),
                ],
            ),
        );

        // Tier 2: Standard
        client.set_tier_config(
            admin,
            &2u32,
            &String::from_str(env, "Standard"),
            &String::from_str(env, "Government ID and liveness check"),
            &Vec::from_array(
                env,
                [
                    String::from_str(env, "email"),
                    String::from_str(env, "phone"),
                    String::from_str(env, "government_id"),
                    String::from_str(env, "liveness"),
                ],
            ),
        );

        // Tier 3: Enhanced
        client.set_tier_config(
            admin,
            &3u32,
            &String::from_str(env, "Enhanced"),
            &String::from_str(env, "Proof of address and source of funds"),
            &Vec::from_array(
                env,
                [
                    String::from_str(env, "email"),
                    String::from_str(env, "phone"),
                    String::from_str(env, "government_id"),
                    String::from_str(env, "liveness"),
                    String::from_str(env, "proof_of_address"),
                    String::from_str(env, "source_of_funds"),
                ],
            ),
        );

        // Tier 4: Business (KYB)
        client.set_tier_config(
            admin,
            &4u32,
            &String::from_str(env, "Business"),
            &String::from_str(env, "KYB with company registration and UBO"),
            &Vec::from_array(
                env,
                [
                    String::from_str(env, "company_registration"),
                    String::from_str(env, "ubo_declaration"),
                    String::from_str(env, "director_id"),
                    String::from_str(env, "proof_of_address"),
                ],
            ),
        );
    }

    #[test]
    fn test_initialize() {
        let (_env, admin, client) = setup_env();
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
    fn test_set_and_get_tier() {
        let (env, admin, client) = setup_env();
        client.initialize(&admin);

        client.set_tier_config(
            &admin,
            &1u32,
            &String::from_str(&env, "Basic"),
            &String::from_str(&env, "Basic verification"),
            &Vec::from_array(
                &env,
                [
                    String::from_str(&env, "email"),
                    String::from_str(&env, "phone"),
                ],
            ),
        );

        let config = client.get_tier_config(&1u32);
        assert_eq!(config.tier, 1);
        assert_eq!(config.name, String::from_str(&env, "Basic"));
    }

    #[test]
    fn test_setup_all_tiers() {
        let (env, admin, client) = setup_env();
        client.initialize(&admin);
        setup_default_tiers(&env, &admin, &client);

        let tiers = client.list_tiers();
        assert_eq!(tiers.len(), 4);

        let tier1 = client.get_tier_config(&1u32);
        assert_eq!(tier1.name, String::from_str(&env, "Basic"));

        let tier4 = client.get_tier_config(&4u32);
        assert_eq!(tier4.name, String::from_str(&env, "Business"));
    }

    #[test]
    fn test_invalid_tier_fails() {
        let (env, admin, client) = setup_env();
        client.initialize(&admin);

        let result = client.try_set_tier_config(
            &admin,
            &0u32,
            &String::from_str(&env, "Invalid"),
            &String::from_str(&env, "Should fail"),
            &Vec::new(&env),
        );
        assert!(result.is_err());

        let result = client.try_set_tier_config(
            &admin,
            &5u32,
            &String::from_str(&env, "Invalid"),
            &String::from_str(&env, "Should fail"),
            &Vec::new(&env),
        );
        assert!(result.is_err());
    }

    #[test]
    fn test_update_existing_tier() {
        let (env, admin, client) = setup_env();
        client.initialize(&admin);

        client.set_tier_config(
            &admin,
            &1u32,
            &String::from_str(&env, "Basic"),
            &String::from_str(&env, "Original description"),
            &Vec::new(&env),
        );

        client.set_tier_config(
            &admin,
            &1u32,
            &String::from_str(&env, "Basic Plus"),
            &String::from_str(&env, "Updated description"),
            &Vec::from_array(&env, [String::from_str(&env, "email")]),
        );

        let config = client.get_tier_config(&1u32);
        assert_eq!(config.name, String::from_str(&env, "Basic Plus"));
        assert_eq!(config.required_checks.len(), 1);
    }

    #[test]
    fn test_nonexistent_tier_returns_error() {
        let (_env, admin, client) = setup_env();
        client.initialize(&admin);

        let result = client.try_get_tier_config(&1u32);
        assert!(result.is_err());
    }

    #[test]
    fn test_list_tiers_empty() {
        let (_env, admin, client) = setup_env();
        client.initialize(&admin);

        let tiers = client.list_tiers();
        assert_eq!(tiers.len(), 0);
    }
}
