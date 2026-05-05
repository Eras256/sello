# SELLO Roadmap & Milestones (SCF v7.0)

## Timeline Overview

This roadmap aligns with the SCF v7.0 milestone-based funding structure. We are currently at **Tranche 3 (Testnet Readiness)**.

### Q1 2026: Foundation & Design (Tranche 1)
*   [x] Project conceptualization and architecture design.
*   [x] Design system (`DESIGN.md`) and UI/UX mockups.
*   [x] Initial monorepo setup (Turborepo, Next.js, Express).

### Q2 2026: Core Development (Tranche 2)
*   [x] Smart Contracts (AttestationStore, TierRegistry, AgentRegistry) written in Rust/Soroban.
*   [x] TypeScript SDK (`@sello/sdk`) initial implementation.
*   [x] Web dashboard and explorer frontend development.

### May 2026: Testnet & Audits (Tranche 3) 📍 WE ARE HERE
*   [x] Deploy smart contracts to Stellar Testnet.
*   [x] Connect Frontend and API to Testnet contracts.
*   [x] Implement KYA (Know Your Agent) contract with Soroban security best practices.
*   [x] Complete internal security audit and code quality checks.
*   [ ] External security audit (Veridise or CoinFabrik).
*   [ ] End-to-end integration testing and bug fixing.

### Q3 2026: Mainnet & Integrations (Tranche 4)
*   [ ] Mainnet deployment of all SELLO contracts.
*   [ ] Official launch of the SELLO developer portal and documentation.
*   [ ] Partner integrations (DeFi protocols, lending platforms).
*   [ ] UX verification by SDF.

## Future Roadmap (Post-SCF)

*   **Cross-chain Attestations:** Using specialized oracles to bridge SELLO identity to other networks.
*   **Zero-Knowledge Proofs:** Allowing users to prove attributes (e.g., 'over 18', 'non-US resident') without revealing the underlying data or their public key.
*   **Decentralized Verification Network:** Transitioning from a single admin-approved verifier list to a decentralized curation market.
