#![cfg(test)]

use soroban_sdk::{
    testutils::Address as _,
    Address, BytesN, Env, String, Vec,
};

use crate::{AgentError, AgentRegistry, AgentRegistryClient, AgentStatus};

fn setup_env() -> (Env, Address, AgentRegistryClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(AgentRegistry, ());
    let client = AgentRegistryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    (env, admin, client)
}

fn dummy_hash(env: &Env) -> BytesN<32> {
    BytesN::from_array(env, &[0u8; 32])
}

fn make_capabilities(env: &Env) -> Vec<String> {
    let mut caps = Vec::new(env);
    caps.push_back(String::from_str(env, "transfer"));
    caps.push_back(String::from_str(env, "swap"));
    caps
}

// ── Initialization ──────────────────────────────────────────────────────

#[test]
fn test_initialize() {
    let (env, admin, client) = setup_env();
    let attestation_contract = Address::generate(&env);
    client.initialize(&admin, &attestation_contract);

    let stored_admin = client.get_admin();
    assert_eq!(stored_admin, admin);
    assert_eq!(client.total_registered(), 0);
    assert_eq!(client.total_revoked(), 0);
}

#[test]
fn test_double_initialize_fails() {
    let (env, admin, client) = setup_env();
    let attestation_contract = Address::generate(&env);
    client.initialize(&admin, &attestation_contract);

    let result = client.try_initialize(&admin, &attestation_contract);
    assert_eq!(result, Err(Ok(AgentError::AlreadyInitialized)));
}

// ── Registration ────────────────────────────────────────────────────────

#[test]
fn test_register_agent() {
    let (env, admin, client) = setup_env();
    let attestation_contract = Address::generate(&env);
    client.initialize(&admin, &attestation_contract);

    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let caps = make_capabilities(&env);
    let hash = dummy_hash(&env);

    client.register_agent(&owner, &agent, &String::from_str(&env, "TestAgent"), &caps, &1_000_000, &5_000_000, &hash);

    assert_eq!(client.total_registered(), 1);

    let record = client.get_agent(&agent);
    assert_eq!(record.owner, owner);
    assert_eq!(record.status, AgentStatus::Active);
    assert_eq!(record.spending_limit, 1_000_000);
    assert_eq!(record.daily_limit, 5_000_000);
    assert!(client.is_authorized(&agent));
}

#[test]
fn test_register_duplicate_fails() {
    let (env, admin, client) = setup_env();
    let attestation_contract = Address::generate(&env);
    client.initialize(&admin, &attestation_contract);

    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let caps = make_capabilities(&env);
    let hash = dummy_hash(&env);

    client.register_agent(&owner, &agent, &String::from_str(&env, "Agent1"), &caps, &100, &500, &hash);

    let result = client.try_register_agent(&owner, &agent, &String::from_str(&env, "Agent2"), &caps, &100, &500, &hash);
    assert_eq!(result, Err(Ok(AgentError::AgentAlreadyExists)));
}

#[test]
fn test_name_too_long_fails() {
    let (env, admin, client) = setup_env();
    let attestation_contract = Address::generate(&env);
    client.initialize(&admin, &attestation_contract);

    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let caps = make_capabilities(&env);
    let hash = dummy_hash(&env);

    // 65 chars — exceeds 64 limit
    let long_name = String::from_str(&env, "AAAAAAAAAABBBBBBBBBBCCCCCCCCCCDDDDDDDDDDEEEEEEEEEEFFFFF12345GGGGG");
    let result = client.try_register_agent(&owner, &agent, &long_name, &caps, &100, &500, &hash);
    assert_eq!(result, Err(Ok(AgentError::NameTooLong)));
}

// ── Lifecycle ───────────────────────────────────────────────────────────

#[test]
fn test_suspend_and_activate() {
    let (env, admin, client) = setup_env();
    let attestation_contract = Address::generate(&env);
    client.initialize(&admin, &attestation_contract);

    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let caps = make_capabilities(&env);
    let hash = dummy_hash(&env);

    client.register_agent(&owner, &agent, &String::from_str(&env, "Bot"), &caps, &100, &500, &hash);
    assert!(client.is_authorized(&agent));

    // Suspend
    client.suspend_agent(&owner, &agent);
    assert!(!client.is_authorized(&agent));
    let record = client.get_agent(&agent);
    assert_eq!(record.status, AgentStatus::Suspended);

    // Reactivate
    client.activate_agent(&owner, &agent);
    assert!(client.is_authorized(&agent));
    let record = client.get_agent(&agent);
    assert_eq!(record.status, AgentStatus::Active);
}

#[test]
fn test_revoke_agent() {
    let (env, admin, client) = setup_env();
    let attestation_contract = Address::generate(&env);
    client.initialize(&admin, &attestation_contract);

    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let caps = make_capabilities(&env);
    let hash = dummy_hash(&env);

    client.register_agent(&owner, &agent, &String::from_str(&env, "Bot"), &caps, &100, &500, &hash);
    client.revoke_agent(&owner, &agent);

    assert!(!client.is_authorized(&agent));
    assert_eq!(client.total_revoked(), 1);
    let record = client.get_agent(&agent);
    assert_eq!(record.status, AgentStatus::Revoked);
}

#[test]
fn test_revoke_is_terminal() {
    let (env, admin, client) = setup_env();
    let attestation_contract = Address::generate(&env);
    client.initialize(&admin, &attestation_contract);

    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let caps = make_capabilities(&env);
    let hash = dummy_hash(&env);

    client.register_agent(&owner, &agent, &String::from_str(&env, "Bot"), &caps, &100, &500, &hash);
    client.revoke_agent(&owner, &agent);

    // Cannot reactivate a revoked agent
    let result = client.try_activate_agent(&owner, &agent);
    assert_eq!(result, Err(Ok(AgentError::AgentRevoked)));

    // Cannot suspend a revoked agent
    let result = client.try_suspend_agent(&owner, &agent);
    assert_eq!(result, Err(Ok(AgentError::AgentRevoked)));
}

// ── Access Control ──────────────────────────────────────────────────────

#[test]
fn test_not_owner_cannot_activate() {
    let (env, admin, client) = setup_env();
    let attestation_contract = Address::generate(&env);
    client.initialize(&admin, &attestation_contract);

    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let caps = make_capabilities(&env);
    let hash = dummy_hash(&env);

    client.register_agent(&owner, &agent, &String::from_str(&env, "Bot"), &caps, &100, &500, &hash);
    client.suspend_agent(&owner, &agent);

    let stranger = Address::generate(&env);
    let result = client.try_activate_agent(&stranger, &agent);
    assert_eq!(result, Err(Ok(AgentError::NotOwner)));
}

// ── Configuration Updates ───────────────────────────────────────────────

#[test]
fn test_update_capabilities() {
    let (env, admin, client) = setup_env();
    let attestation_contract = Address::generate(&env);
    client.initialize(&admin, &attestation_contract);

    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let caps = make_capabilities(&env);
    let hash = dummy_hash(&env);

    client.register_agent(&owner, &agent, &String::from_str(&env, "Bot"), &caps, &100, &500, &hash);

    // Update capabilities
    let mut new_caps = Vec::new(&env);
    new_caps.push_back(String::from_str(&env, "query"));
    client.update_capabilities(&owner, &agent, &new_caps);

    let record = client.get_agent(&agent);
    assert_eq!(record.capabilities.len(), 1);
}

#[test]
fn test_update_limits() {
    let (env, admin, client) = setup_env();
    let attestation_contract = Address::generate(&env);
    client.initialize(&admin, &attestation_contract);

    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let caps = make_capabilities(&env);
    let hash = dummy_hash(&env);

    client.register_agent(&owner, &agent, &String::from_str(&env, "Bot"), &caps, &100, &500, &hash);

    client.update_limits(&owner, &agent, &2_000_000, &10_000_000);

    let record = client.get_agent(&agent);
    assert_eq!(record.spending_limit, 2_000_000);
    assert_eq!(record.daily_limit, 10_000_000);
}

// ── Owner Index ─────────────────────────────────────────────────────────

#[test]
fn test_list_agents() {
    let (env, admin, client) = setup_env();
    let attestation_contract = Address::generate(&env);
    client.initialize(&admin, &attestation_contract);

    let owner = Address::generate(&env);
    let caps = make_capabilities(&env);
    let hash = dummy_hash(&env);

    let agent1 = Address::generate(&env);
    let agent2 = Address::generate(&env);
    let agent3 = Address::generate(&env);

    client.register_agent(&owner, &agent1, &String::from_str(&env, "Bot1"), &caps, &100, &500, &hash);
    client.register_agent(&owner, &agent2, &String::from_str(&env, "Bot2"), &caps, &200, &600, &hash);
    client.register_agent(&owner, &agent3, &String::from_str(&env, "Bot3"), &caps, &300, &700, &hash);

    let agents = client.list_agents(&owner);
    assert_eq!(agents.len(), 3);
    assert_eq!(client.total_registered(), 3);
}
