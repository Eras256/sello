# Security Policy

## Reporting a Vulnerability

The SELLO team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

**Please do NOT open a public GitHub issue for security vulnerabilities.**

### How to Report

1. **Email**: Send a detailed report to **security@sello.dev**
2. **Subject**: `[SECURITY] Brief description of the vulnerability`
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if any)

### What to Expect

| Timeline | Action |
|----------|--------|
| **24 hours** | Acknowledgment of your report |
| **72 hours** | Initial assessment and severity classification |
| **7 days** | Detailed response with remediation plan |
| **30 days** | Fix deployed (critical) or scheduled (non-critical) |

### Severity Levels

| Level | Description | Examples |
|-------|-------------|---------|
| **Critical** | Direct loss of funds or PII exposure | Contract auth bypass, key leakage |
| **High** | Significant functionality compromise | Attestation forgery, admin escalation |
| **Medium** | Limited impact or requires conditions | TTL manipulation, rate limit bypass |
| **Low** | Minimal impact | UI spoofing, non-sensitive info leak |

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x (current) | ✅ Active development |
| < 0.1.0 | ❌ Not supported |

## Security Design Principles

SELLO follows these security principles by design:

### On-Chain Security
- **No PII on-chain**: Only cryptographic proof of verification status is stored
- **Auth-gated mutations**: All state-changing operations require `require_auth()`
- **Role-based access**: Admin → Verifier → Subject hierarchy
- **TTL management**: All storage entries have managed time-to-live
- **Event emission**: All state changes emit verifiable events

### Off-Chain Security
- **Webhook signature verification**: HMAC-SHA256 with timing-safe comparison
- **Input validation**: All Stellar addresses validated (G-prefix, 56 chars)
- **No secrets in code**: All sensitive values via environment variables
- **CORS restrictions**: API endpoints are origin-restricted

### Smart Contract Audit Status

| Contract | Tests | Audit Status |
|----------|-------|-------------|
| AttestationStore | 11 unit tests | Pending (eligible for [Soroban Audit Bank](https://stellar.gitbook.io/scf-handbook/supporting-programs/audit-bank)) |
| TierRegistry | 8 unit tests | Pending |

## Soroban Audit Bank

As an SCF-funded project, SELLO is eligible for the [Soroban Security Audit Bank](https://stellar.gitbook.io/scf-handbook/supporting-programs/audit-bank). We plan to request a formal security audit after testnet deployment stabilizes.

## Dependencies

We monitor dependencies for known vulnerabilities:
- **Rust**: `cargo audit` (run in CI)
- **Node.js**: `pnpm audit` (run periodically)
- **Soroban SDK**: Pinned to `25.3.1` (latest stable)

## Bug Bounty

We do not currently operate a formal bug bounty program. However, we deeply appreciate responsible disclosure and will publicly credit reporters (with permission) in our changelog.

---

For general (non-security) bugs, please use our [issue tracker](https://github.com/sello-protocol/sello/issues).
