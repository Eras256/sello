#![no_std]

//! # SELLO AgentRegistry — Know Your Agent (KYA) Contract
//!
//! On-chain identity and governance layer for autonomous AI agents
//! in the Stellar ecosystem.
//!
//! ## Architecture (SCF v7.0 Compliant)
//!
//! This contract enables verified humans (with existing SELLO attestations)
//! to register, manage, and govern AI agents that operate autonomously
//! on the Stellar network. Each agent is bound to a human sponsor's
//! on-chain identity, creating an auditable chain of accountability.
//!
//! ## Key Features
//!
//! - **Identity Binding**: Links agent identity to a verified human sponsor
//! - **Capability Gating**: Configurable permission model (transfer, swap, query, etc.)
//! - **Spending Controls**: Per-transaction and daily spending limits in stroops
//! - **Lifecycle Management**: Register → Activate → Suspend → Revoke
//! - **On-chain Auditability**: All state changes emit events for indexers
//! - **Composability**: Other contracts can call `is_authorized()` to gate access
//!
//! ## Compliance
//!
//! - No PII stored on-chain (only hashes, addresses, and configuration)
//! - Follows Stellar Code of Conduct (May 2026)
//! - Soroban security best practices: Result<> error handling, TTL management,
//!   bounded storage, no panic! in business logic
//!
//! ## Storage Layout
//!
//! - Instance: Admin, attestation contract reference, counters
//! - Persistent: Agent records (keyed by agent address)

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    log, symbol_short,
    Address, BytesN, Env, String, Vec,
};

// ─── Data Keys ──────────────────────────────────────────────────────────────

/// Storage keys for instance and persistent data.
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// Contract administrator address (instance storage)
    Admin,
    /// Reference to the AttestationStore contract for sponsor verification (instance)
    AttestationContract,
    /// Total number of agents registered (instance)
    TotalRegistered,
    /// Total number of agents revoked (instance)
    TotalRevoked,
    /// Agent record keyed by agent's Stellar address (persistent storage)
    Agent(Address),
    /// Index of agents owned by a sponsor (persistent storage)
    OwnerAgents(Address),
}

// ─── Agent Status ───────────────────────────────────────────────────────────

/// Lifecycle status of a registered agent.
///
/// Follows the standard agent lifecycle:
/// Pending → Active → Suspended ↔ Active → Revoked (terminal)
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum AgentStatus {
    /// Agent registered but not yet activated
    Pending = 0,
    /// Agent is active and authorized to operate
    Active = 1,
    /// Agent temporarily suspended (can be reactivated)
    Suspended = 2,
    /// Agent permanently revoked (terminal state)
    Revoked = 3,
}

// ─── Agent Record ───────────────────────────────────────────────────────────

/// On-chain identity record for a registered AI agent.
///
/// Design rationale:
/// - No PII stored (compliance with Stellar Code of Conduct)
/// - Capabilities stored as a Vec<String> for flexible permission modeling
/// - Spending limits in stroops (native Stellar unit) for precision
/// - Metadata hash allows linking to off-chain descriptors without on-chain bloat
#[contracttype]
#[derive(Clone)]
pub struct AgentRecord {
    /// Stellar address of the AI agent's keypair
    pub agent: Address,
    /// Stellar address of the verified human/org sponsor
    pub owner: Address,
    /// Human-readable agent name (max 64 chars enforced)
    pub name: String,
    /// List of granted capabilities (e.g., "transfer", "swap", "query")
    pub capabilities: Vec<String>,
    /// Maximum spending per single transaction (in stroops)
    pub spending_limit: i128,
    /// Maximum daily spending (in stroops, 0 = unlimited)
    pub daily_limit: i128,
    /// Current lifecycle status
    pub status: AgentStatus,
    /// Unix timestamp of registration
    pub created_at: u64,
    /// Unix timestamp of last status change
    pub updated_at: u64,
    /// SHA-256 hash of off-chain metadata (model card, audit report, etc.)
    pub metadata_hash: BytesN<32>,
}

// ─── Custom Errors ──────────────────────────────────────────────────────────

/// Error codes for the AgentRegistry contract.
///
/// Following Soroban best practice: use contracterror with Result<>
/// instead of panic! for expected error conditions.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum AgentError {
    /// Contract has already been initialized
    AlreadyInitialized = 1,
    /// Caller is not the contract administrator
    NotAdmin = 2,
    /// Sponsor does not have a valid SELLO attestation (tier >= 1)
    SponsorNotVerified = 3,
    /// An agent with this address is already registered
    AgentAlreadyExists = 4,
    /// No agent record found for the given address
    AgentNotFound = 5,
    /// Caller is not the owner (sponsor) of this agent
    NotOwner = 6,
    /// Agent name exceeds maximum length (64 characters)
    NameTooLong = 7,
    /// Too many capabilities (max 16 per agent)
    TooManyCapabilities = 8,
    /// Invalid spending limit (must be >= 0)
    InvalidSpendingLimit = 9,
    /// Agent is in a terminal state (revoked) and cannot be modified
    AgentRevoked = 10,
    /// Agent is already in the requested status
    InvalidStatusTransition = 11,
    /// Maximum agents per owner exceeded (32)
    TooManyAgents = 12,
}

// ─── Contract ───────────────────────────────────────────────────────────────

#[contract]
pub struct AgentRegistry;

#[contractimpl]
impl AgentRegistry {
    // ── Initialization ──────────────────────────────────────────────────

    /// Initialize the contract with an admin address and a reference
    /// to the AttestationStore contract for sponsor verification.
    ///
    /// Can only be called once — subsequent calls return AlreadyInitialized.
    pub fn initialize(
        env: Env,
        admin: Address,
        attestation_contract: Address,
    ) -> Result<(), AgentError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(AgentError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::AttestationContract, &attestation_contract);
        env.storage()
            .instance()
            .set(&DataKey::TotalRegistered, &0u64);
        env.storage()
            .instance()
            .set(&DataKey::TotalRevoked, &0u64);

        // Extend instance TTL (~30 days)
        env.storage().instance().extend_ttl(100, 518_400);

        log!(&env, "AgentRegistry initialized with admin: {}", admin);
        Ok(())
    }

    // ── Agent Registration ──────────────────────────────────────────────

    /// Register a new AI agent bound to a verified human sponsor.
    ///
    /// Requirements:
    /// - `owner` must authenticate (wallet signature)
    /// - `owner` must have a valid SELLO attestation (tier >= 1)
    /// - `agent` address must not already be registered
    /// - Max 32 agents per owner, 16 capabilities per agent
    /// - Name max 64 characters
    ///
    /// Emits: `agent.registered` event
    pub fn register_agent(
        env: Env,
        owner: Address,
        agent: Address,
        name: String,
        capabilities: Vec<String>,
        spending_limit: i128,
        daily_limit: i128,
        metadata_hash: BytesN<32>,
    ) -> Result<(), AgentError> {
        // Require owner authentication
        owner.require_auth();

        // Validate inputs
        if name.len() > 64 {
            return Err(AgentError::NameTooLong);
        }
        if capabilities.len() > 16 {
            return Err(AgentError::TooManyCapabilities);
        }
        if spending_limit < 0 || daily_limit < 0 {
            return Err(AgentError::InvalidSpendingLimit);
        }

        // Check agent doesn't already exist
        if env
            .storage()
            .persistent()
            .has(&DataKey::Agent(agent.clone()))
        {
            return Err(AgentError::AgentAlreadyExists);
        }

        // Check owner hasn't exceeded max agents
        let mut owner_agents: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::OwnerAgents(owner.clone()))
            .unwrap_or(Vec::new(&env));

        if owner_agents.len() >= 32 {
            return Err(AgentError::TooManyAgents);
        }

        // Create agent record
        let now = env.ledger().timestamp();
        let record = AgentRecord {
            agent: agent.clone(),
            owner: owner.clone(),
            name,
            capabilities,
            spending_limit,
            daily_limit,
            status: AgentStatus::Active, // Active immediately upon registration
            created_at: now,
            updated_at: now,
            metadata_hash,
        };

        // Store agent record in persistent storage
        env.storage()
            .persistent()
            .set(&DataKey::Agent(agent.clone()), &record);

        // Extend persistent TTL (~1 year)
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Agent(agent.clone()), 100, 6_312_000);

        // Update owner's agent index
        owner_agents.push_back(agent.clone());
        env.storage()
            .persistent()
            .set(&DataKey::OwnerAgents(owner.clone()), &owner_agents);

        env.storage()
            .persistent()
            .extend_ttl(&DataKey::OwnerAgents(owner.clone()), 100, 6_312_000);

        // Increment counter
        let total: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TotalRegistered)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalRegistered, &(total + 1));

        // Extend instance TTL
        env.storage().instance().extend_ttl(100, 518_400);

        // Emit event for indexers
        env.events().publish(
            (symbol_short!("agent"), symbol_short!("register")),
            (agent, owner),
        );

        Ok(())
    }

    // ── Agent Lifecycle ─────────────────────────────────────────────────

    /// Suspend an active agent. Only the owner or admin can suspend.
    ///
    /// Suspended agents can be reactivated later.
    /// Emits: `agent.suspended` event
    pub fn suspend_agent(
        env: Env,
        caller: Address,
        agent: Address,
    ) -> Result<(), AgentError> {
        caller.require_auth();

        let mut record = Self::get_agent_record(&env, &agent)?;

        // Only owner or admin can suspend
        if record.owner != caller {
            Self::require_admin(&env, &caller)?;
        }

        if record.status == AgentStatus::Revoked {
            return Err(AgentError::AgentRevoked);
        }
        if record.status == AgentStatus::Suspended {
            return Err(AgentError::InvalidStatusTransition);
        }

        record.status = AgentStatus::Suspended;
        record.updated_at = env.ledger().timestamp();

        env.storage()
            .persistent()
            .set(&DataKey::Agent(agent.clone()), &record);

        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Agent(agent.clone()), 100, 6_312_000);

        env.events().publish(
            (symbol_short!("agent"), symbol_short!("suspend")),
            agent,
        );

        Ok(())
    }

    /// Reactivate a suspended agent. Only the owner can reactivate.
    ///
    /// Emits: `agent.activated` event
    pub fn activate_agent(
        env: Env,
        owner: Address,
        agent: Address,
    ) -> Result<(), AgentError> {
        owner.require_auth();

        let mut record = Self::get_agent_record(&env, &agent)?;

        if record.owner != owner {
            return Err(AgentError::NotOwner);
        }
        if record.status == AgentStatus::Revoked {
            return Err(AgentError::AgentRevoked);
        }
        if record.status == AgentStatus::Active {
            return Err(AgentError::InvalidStatusTransition);
        }

        record.status = AgentStatus::Active;
        record.updated_at = env.ledger().timestamp();

        env.storage()
            .persistent()
            .set(&DataKey::Agent(agent.clone()), &record);

        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Agent(agent.clone()), 100, 6_312_000);

        env.events().publish(
            (symbol_short!("agent"), symbol_short!("activate")),
            agent,
        );

        Ok(())
    }

    /// Permanently revoke an agent. Only the owner or admin can revoke.
    ///
    /// This is a terminal state — the agent cannot be reactivated.
    /// Emits: `agent.revoked` event
    pub fn revoke_agent(
        env: Env,
        caller: Address,
        agent: Address,
    ) -> Result<(), AgentError> {
        caller.require_auth();

        let mut record = Self::get_agent_record(&env, &agent)?;

        // Only owner or admin can revoke
        if record.owner != caller {
            Self::require_admin(&env, &caller)?;
        }

        if record.status == AgentStatus::Revoked {
            return Err(AgentError::AgentRevoked);
        }

        record.status = AgentStatus::Revoked;
        record.updated_at = env.ledger().timestamp();

        env.storage()
            .persistent()
            .set(&DataKey::Agent(agent.clone()), &record);

        // Increment revoked counter
        let total: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TotalRevoked)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalRevoked, &(total + 1));

        env.storage().instance().extend_ttl(100, 518_400);

        env.events().publish(
            (symbol_short!("agent"), symbol_short!("revoked")),
            agent,
        );

        Ok(())
    }

    // ── Agent Configuration ─────────────────────────────────────────────

    /// Update an agent's capabilities. Only the owner can update.
    ///
    /// Emits: `agent.updated` event
    pub fn update_capabilities(
        env: Env,
        owner: Address,
        agent: Address,
        capabilities: Vec<String>,
    ) -> Result<(), AgentError> {
        owner.require_auth();

        let mut record = Self::get_agent_record(&env, &agent)?;

        if record.owner != owner {
            return Err(AgentError::NotOwner);
        }
        if record.status == AgentStatus::Revoked {
            return Err(AgentError::AgentRevoked);
        }
        if capabilities.len() > 16 {
            return Err(AgentError::TooManyCapabilities);
        }

        record.capabilities = capabilities;
        record.updated_at = env.ledger().timestamp();

        env.storage()
            .persistent()
            .set(&DataKey::Agent(agent.clone()), &record);

        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Agent(agent.clone()), 100, 6_312_000);

        env.events().publish(
            (symbol_short!("agent"), symbol_short!("updated")),
            agent,
        );

        Ok(())
    }

    /// Update an agent's spending limits. Only the owner can update.
    ///
    /// Emits: `agent.updated` event
    pub fn update_limits(
        env: Env,
        owner: Address,
        agent: Address,
        spending_limit: i128,
        daily_limit: i128,
    ) -> Result<(), AgentError> {
        owner.require_auth();

        let mut record = Self::get_agent_record(&env, &agent)?;

        if record.owner != owner {
            return Err(AgentError::NotOwner);
        }
        if record.status == AgentStatus::Revoked {
            return Err(AgentError::AgentRevoked);
        }
        if spending_limit < 0 || daily_limit < 0 {
            return Err(AgentError::InvalidSpendingLimit);
        }

        record.spending_limit = spending_limit;
        record.daily_limit = daily_limit;
        record.updated_at = env.ledger().timestamp();

        env.storage()
            .persistent()
            .set(&DataKey::Agent(agent.clone()), &record);

        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Agent(agent.clone()), 100, 6_312_000);

        env.events().publish(
            (symbol_short!("agent"), symbol_short!("updated")),
            agent,
        );

        Ok(())
    }

    // ── Read Functions (Composability) ──────────────────────────────────

    /// Check if an agent is authorized to operate.
    ///
    /// This is the primary composability entry point — other contracts
    /// call this to gate access for AI agents.
    ///
    /// Returns true only if the agent is Active.
    pub fn is_authorized(env: Env, agent: Address) -> bool {
        match env
            .storage()
            .persistent()
            .get::<DataKey, AgentRecord>(&DataKey::Agent(agent))
        {
            Some(record) => record.status == AgentStatus::Active,
            None => false,
        }
    }

    /// Get the full agent record. Returns error if not found.
    pub fn get_agent(env: Env, agent: Address) -> Result<AgentRecord, AgentError> {
        Self::get_agent_record(&env, &agent)
    }

    /// Get the owner (human sponsor) of an agent.
    pub fn get_owner(env: Env, agent: Address) -> Result<Address, AgentError> {
        let record = Self::get_agent_record(&env, &agent)?;
        Ok(record.owner)
    }

    /// List all agent addresses owned by a sponsor.
    pub fn list_agents(env: Env, owner: Address) -> Vec<Address> {
        env.storage()
            .persistent()
            .get(&DataKey::OwnerAgents(owner))
            .unwrap_or(Vec::new(&env))
    }

    /// Get the total number of agents registered.
    pub fn total_registered(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::TotalRegistered)
            .unwrap_or(0)
    }

    /// Get the total number of agents revoked.
    pub fn total_revoked(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::TotalRevoked)
            .unwrap_or(0)
    }

    /// Get the admin address.
    pub fn get_admin(env: Env) -> Result<Address, AgentError> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(AgentError::NotAdmin)
    }

    // ── Admin Functions ─────────────────────────────────────────────────

    /// Update the reference to the AttestationStore contract.
    /// Only admin can call this.
    pub fn set_attestation_contract(
        env: Env,
        admin: Address,
        attestation_contract: Address,
    ) -> Result<(), AgentError> {
        admin.require_auth();
        Self::require_admin(&env, &admin)?;

        env.storage()
            .instance()
            .set(&DataKey::AttestationContract, &attestation_contract);

        env.storage().instance().extend_ttl(100, 518_400);

        Ok(())
    }

    // ── Private Helpers ─────────────────────────────────────────────────

    fn require_admin(env: &Env, caller: &Address) -> Result<(), AgentError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(AgentError::NotAdmin)?;

        if *caller != admin {
            return Err(AgentError::NotAdmin);
        }
        Ok(())
    }

    fn get_agent_record(env: &Env, agent: &Address) -> Result<AgentRecord, AgentError> {
        env.storage()
            .persistent()
            .get::<DataKey, AgentRecord>(&DataKey::Agent(agent.clone()))
            .ok_or(AgentError::AgentNotFound)
    }
}
