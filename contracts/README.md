# SELLO Smart Contracts

Soroban smart contracts for the SELLO compliance infrastructure on Stellar.

## Contracts

### AttestationStore

Non-transferable on-chain KYC/KYB attestation credentials. No PII stored on-chain.

| Function | Auth | Description |
|----------|------|-------------|
| `initialize(admin)` | Once | Set contract admin |
| `add_verifier(admin, verifier)` | Admin | Authorize a verifier |
| `remove_verifier(admin, verifier)` | Admin | Revoke verifier |
| `issue_attestation(verifier, subject, tier, expiry)` | Verifier | Mint attestation |
| `verify(subject)` → `AttestationResult` | None | Check status |
| `revoke(caller, subject)` | Verifier/Admin | Revoke attestation |
| `total_minted()` → `u64` | None | Count issued |
| `total_revoked()` → `u64` | None | Count revoked |

### TierRegistry

Configuration contract for verification tiers.

| Function | Auth | Description |
|----------|------|-------------|
| `initialize(admin)` | Once | Set admin |
| `set_tier_config(admin, tier, name, desc, checks)` | Admin | Create/update tier |
| `get_tier_config(tier)` → `TierConfig` | None | Read config |
| `list_tiers()` → `Vec<TierConfig>` | None | List all |

### Standard Tiers

| Tier | Name | Checks |
|------|------|--------|
| 1 | Basic | Email, Phone |
| 2 | Standard | + Gov ID, Liveness |
| 3 | Enhanced | + Proof of Address, Source of Funds |
| 4 | Business | Company Reg, UBO, Director ID, PoA |

## Build

```bash
rustup target add wasm32-unknown-unknown
cargo build --release --target wasm32-unknown-unknown
```

## Test

```bash
cargo test --workspace          # 19 tests total
cargo test -p sello-attestation-store  # 11 tests
cargo test -p sello-tier-registry      # 8 tests
```

## Deploy

```bash
cargo install stellar-cli
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/sello_attestation_store.wasm \
  --network testnet --source <SECRET>
stellar contract invoke --id <ID> --network testnet -- initialize --admin <ADDR>
```

## Security

- No PII on-chain — only cryptographic proof
- All mutations require `require_auth()`
- Custom `contracterror` types (no panics)
- TTL management with `extend_ttl()`
- Event emission for all state changes
- Soroban SDK v25.3.1

## License

MIT
