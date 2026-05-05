# Contributing to SELLO

Thank you for your interest in contributing to SELLO! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md) and the [Stellar Community Guidelines](https://stellar.gitbook.io/scf-handbook/governance/community-guidelines).

## Getting Started

### Prerequisites

- **Node.js** ≥ 20.0.0
- **pnpm** ≥ 9.0.0
- **Rust** toolchain (stable) with `wasm32-unknown-unknown` target
- **Stellar CLI**: `cargo install stellar-cli`

### Setup

```bash
# Clone the repository
git clone https://github.com/sello-protocol/sello.git
cd sello

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Build the SDK (required by other packages)
pnpm --filter @sello/sdk build

# Start the frontend
pnpm dev
```

### Smart Contracts

```bash
# Build contracts
cd contracts && cargo build --release --target wasm32-unknown-unknown

# Run contract tests
cargo test --workspace

# Deploy to testnet (requires STELLAR_SECRET_KEY)
pnpm seed:testnet
```

## How to Contribute

### Reporting Bugs

1. Check the [issue tracker](https://github.com/sello-protocol/sello/issues) for existing reports
2. Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
3. Include reproduction steps, expected behavior, and environment details

### Suggesting Features

1. Check for existing [feature requests](https://github.com/sello-protocol/sello/issues?q=label%3Aenhancement)
2. Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
3. Describe the use case and why it matters for the Stellar ecosystem

### Pull Requests

1. Fork the repository and create a branch from `main`
2. Follow the coding standards below
3. Write or update tests as needed
4. Ensure all tests pass: `pnpm test && cd contracts && cargo test`
5. Update documentation if applicable
6. Use the [PR template](.github/PULL_REQUEST_TEMPLATE.md)

## Coding Standards

### TypeScript (SDK, Frontend, API)

- Use TypeScript strict mode
- Follow existing code style (enforced by ESLint)
- Use descriptive variable and function names
- Add JSDoc comments for public API methods
- Export types from dedicated `types.ts` files

### Rust (Smart Contracts)

- Follow Rust conventions (`cargo fmt`, `cargo clippy`)
- Use `contracterror` for error handling (no panics in production code)
- Always use `require_auth()` for state-changing operations
- Emit events for all state mutations
- Extend TTL on storage reads and writes
- Write tests for all public contract functions

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(sdk): add batch verification method
fix(contracts): handle expired attestation edge case
docs(readme): update deployment instructions
test(e2e): add verify flow integration test
```

## Project Structure

```
sello/
├── contracts/              # Soroban smart contracts (Rust)
│   ├── attestation-store/  # KYC attestation storage
│   └── tier-registry/      # Verification tier configuration
├── packages/
│   └── sdk/                # @sello/sdk TypeScript package
├── apps/
│   ├── web/                # Next.js frontend + API routes
│   └── api/                # Express API with MPP
├── scripts/                # Deployment and seeding scripts
└── .github/                # CI/CD workflows and templates
```

## Testing

- **Contracts**: `pnpm test:contracts` (cargo test)
- **SDK**: `pnpm --filter @sello/sdk test` (vitest)
- **E2E**: `pnpm test:e2e` (Playwright)
- **All**: `pnpm test`

## Security

If you discover a security vulnerability, please **do not** open a public issue. Instead, follow the process described in [SECURITY.md](SECURITY.md).

## License

By contributing to SELLO, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for helping build compliant infrastructure for the Stellar ecosystem! 🔐
