/**
 * SELLO Testnet Deployment Script
 *
 * Compiles, deploys, and initializes both Soroban contracts on Stellar Testnet.
 * Then configures default tiers and issues sample attestations.
 *
 * Prerequisites:
 *   - stellar-cli installed: cargo install stellar-cli
 *   - Rust wasm32-unknown-unknown target: rustup target add wasm32-unknown-unknown
 *   - STELLAR_SECRET_KEY env var set (testnet deployer key)
 *
 * Usage: npx tsx scripts/deploy-testnet.ts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const NETWORK = 'testnet';
const SECRET = process.env.STELLAR_SECRET_KEY;
const RPC_URL = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

// ── Helpers ──────────────────────────────────────────────────────

function run(cmd: string, cwd?: string): string {
  console.log(`  $ ${cmd}`);
  try {
    const result = execSync(cmd, {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120_000,
    });
    return result.trim();
  } catch (err: unknown) {
    const error = err as { stderr?: string; message?: string };
    console.error(`  ❌ Command failed: ${error.stderr || error.message}`);
    throw err;
  }
}

function updateEnvFile(filePath: string, updates: Record<string, string>) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ℹ️  Creating ${filePath}`);
    fs.writeFileSync(filePath, '', 'utf-8');
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const line = `${key}=${value}`;

    if (regex.test(content)) {
      content = content.replace(regex, line);
    } else {
      content += `\n${line}`;
    }
  }

  fs.writeFileSync(filePath, content.trimEnd() + '\n', 'utf-8');
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀 SELLO Testnet Deployment\n');

  if (!SECRET) {
    console.error('❌ STELLAR_SECRET_KEY not set. Generate a testnet keypair:');
    console.error('   stellar keys generate deployer --network testnet');
    console.error('   export STELLAR_SECRET_KEY=$(stellar keys show deployer)');
    process.exit(1);
  }

  const rootDir = path.resolve(__dirname, '..');
  const contractsDir = path.join(rootDir, 'contracts');
  const wasmDir = path.join(contractsDir, 'target', 'wasm32v1-none', 'release');

  // ── Step 1: Build contracts ──────────────────────────────────
  console.log('── Step 1: Building smart contracts ─────────────────');
  run('cargo build --release --target wasm32v1-none', contractsDir);
  console.log('  ✅ Contracts compiled\n');

  // Verify WASM files exist
  const attestationWasm = path.join(wasmDir, 'sello_attestation_store.wasm');
  const tierRegistryWasm = path.join(wasmDir, 'sello_tier_registry.wasm');

  if (!fs.existsSync(attestationWasm)) {
    // Try alternate naming
    const altName = fs.readdirSync(wasmDir).find((f) => f.includes('attestation') && f.endsWith('.wasm'));
    if (altName) {
      console.log(`  ℹ️  Found WASM as: ${altName}`);
    } else {
      console.error('  ❌ AttestationStore WASM not found in', wasmDir);
      console.error('     Available files:', fs.readdirSync(wasmDir).join(', '));
      process.exit(1);
    }
  }

  // ── Step 2: Deploy AttestationStore ──────────────────────────
  console.log('── Step 2: Deploying AttestationStore ────────────────');
  const attestationId = run(
    `stellar contract deploy ` +
    `--wasm "${attestationWasm}" ` +
    `--network ${NETWORK} ` +
    `--source "${SECRET}"`,
  );
  console.log(`  ✅ AttestationStore deployed: ${attestationId}\n`);

  // ── Step 3: Deploy TierRegistry ──────────────────────────────
  console.log('── Step 3: Deploying TierRegistry ───────────────────');
  const tierRegistryId = run(
    `stellar contract deploy ` +
    `--wasm "${tierRegistryWasm}" ` +
    `--network ${NETWORK} ` +
    `--source "${SECRET}"`,
  );
  console.log(`  ✅ TierRegistry deployed: ${tierRegistryId}\n`);

  // ── Step 4: Get deployer address ─────────────────────────────
  console.log('── Step 4: Resolving deployer address ────────────────');
  let adminAddress: string;
  try {
    adminAddress = run(`stellar keys address --source "${SECRET}"`);
  } catch {
    // Fallback: derive from secret key using stellar-sdk
    const { Keypair } = await import('@stellar/stellar-sdk');
    adminAddress = Keypair.fromSecret(SECRET).publicKey();
  }
  console.log(`  Admin: ${adminAddress}\n`);

  // ── Step 5: Initialize contracts ─────────────────────────────
  console.log('── Step 5: Initializing contracts ───────────────────');

  run(
    `stellar contract invoke ` +
    `--id ${attestationId} ` +
    `--network ${NETWORK} ` +
    `--source "${SECRET}" ` +
    `-- initialize --admin ${adminAddress}`,
  );
  console.log('  ✅ AttestationStore initialized');

  run(
    `stellar contract invoke ` +
    `--id ${tierRegistryId} ` +
    `--network ${NETWORK} ` +
    `--source "${SECRET}" ` +
    `-- initialize --admin ${adminAddress}`,
  );
  console.log('  ✅ TierRegistry initialized\n');

  // ── Step 6: Configure default tiers ──────────────────────────
  console.log('── Step 6: Configuring default tiers ────────────────');

  const tiers = [
    { tier: 1, name: 'Basic', desc: 'Email and phone verification', checks: ['email', 'phone'] },
    { tier: 2, name: 'Standard', desc: 'Government ID and liveness check', checks: ['email', 'phone', 'government_id', 'liveness'] },
    { tier: 3, name: 'Enhanced', desc: 'Proof of address and source of funds', checks: ['email', 'phone', 'government_id', 'liveness', 'proof_of_address', 'source_of_funds'] },
    { tier: 4, name: 'Business', desc: 'KYB with company registration and UBO', checks: ['company_registration', 'ubo_declaration', 'director_id', 'proof_of_address'] },
  ];

  for (const t of tiers) {
    const checksJson = JSON.stringify(t.checks);
    run(
      `stellar contract invoke ` +
      `--id ${tierRegistryId} ` +
      `--network ${NETWORK} ` +
      `--source "${SECRET}" ` +
      `-- set_tier_config ` +
      `--admin ${adminAddress} ` +
      `--tier ${t.tier} ` +
      `--name '${t.name}' ` +
      `--description '${t.desc}' ` +
      `--required_checks '${checksJson}'`,
    );
    console.log(`  ✅ Tier ${t.tier} (${t.name}) configured`);
  }
  console.log('');

  // ── Step 7: Add deployer as verifier ─────────────────────────
  console.log('── Step 7: Adding deployer as verifier ──────────────');
  run(
    `stellar contract invoke ` +
    `--id ${attestationId} ` +
    `--network ${NETWORK} ` +
    `--source "${SECRET}" ` +
    `-- add_verifier --admin ${adminAddress} --verifier ${adminAddress}`,
  );
  console.log('  ✅ Deployer added as verifier\n');

  // ── Step 8: Update configuration files ───────────────────────
  console.log('── Step 8: Updating configuration files ─────────────');

  // Update SDK constants.ts
  const constantsPath = path.join(rootDir, 'packages', 'sdk', 'src', 'constants.ts');
  if (fs.existsSync(constantsPath)) {
    let constants = fs.readFileSync(constantsPath, 'utf-8');
    constants = constants.replace(
      /export const TESTNET_ATTESTATION_STORE = '.*'/,
      `export const TESTNET_ATTESTATION_STORE = '${attestationId}'`,
    );
    constants = constants.replace(
      /export const TESTNET_TIER_REGISTRY = '.*'/,
      `export const TESTNET_TIER_REGISTRY = '${tierRegistryId}'`,
    );
    fs.writeFileSync(constantsPath, constants, 'utf-8');
    console.log('  ✅ SDK constants.ts updated');
  }

  // Update .env.example
  const envExamplePath = path.join(rootDir, '.env.example');
  updateEnvFile(envExamplePath, {
    CONTRACT_ATTESTATION_STORE: attestationId,
    CONTRACT_TIER_REGISTRY: tierRegistryId,
    NEXT_PUBLIC_CONTRACT_ATTESTATION_STORE: attestationId,
    NEXT_PUBLIC_CONTRACT_TIER_REGISTRY: tierRegistryId,
  });
  console.log('  ✅ .env.example updated');

  // Update/create .env.local
  const envLocalPath = path.join(rootDir, '.env.local');
  updateEnvFile(envLocalPath, {
    CONTRACT_ATTESTATION_STORE: attestationId,
    CONTRACT_TIER_REGISTRY: tierRegistryId,
    NEXT_PUBLIC_CONTRACT_ATTESTATION_STORE: attestationId,
    NEXT_PUBLIC_CONTRACT_TIER_REGISTRY: tierRegistryId,
  });
  console.log('  ✅ .env.local updated\n');

  // ── Summary ──────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🎉 SELLO Testnet Deployment Complete!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  AttestationStore: ${attestationId}`);
  console.log(`  TierRegistry:     ${tierRegistryId}`);
  console.log(`  Admin:            ${adminAddress}`);
  console.log(`  Network:          ${NETWORK}`);
  console.log(`  RPC:              ${RPC_URL}`);
  console.log('');
  console.log('  Next steps:');
  console.log('  1. Run `pnpm seed:testnet` to issue sample attestations');
  console.log('  2. Run `pnpm --filter @sello/sdk build` to rebuild SDK');
  console.log('  3. Run `pnpm dev` to start frontend with real contracts');
  console.log('');
}

main().catch((err) => {
  console.error('\n❌ Deployment failed:', err);
  process.exit(1);
});
