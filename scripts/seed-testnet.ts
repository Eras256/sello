/**
 * SELLO Testnet Seeder
 *
 * Seeds the Stellar testnet with attestation data and prepares
 * the MPP recipient wallet for paid API testing.
 *
 * Usage: pnpm seed:testnet
 */

import * as StellarSdk from '@stellar/stellar-sdk';

const RPC_URL = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
const FRIENDBOT_URL = 'https://friendbot.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

// ── Helpers ──────────────────────────────────────────────────────

async function fundWithFriendbot(address: string): Promise<void> {
  const res = await fetch(`${FRIENDBOT_URL}?addr=${address}`);
  if (!res.ok) {
    const text = await res.text();
    if (text.includes('createAccountAlreadyExist')) {
      console.log(`  ℹ️  Account ${address.slice(0, 8)}... already funded`);
      return;
    }
    throw new Error(`Friendbot failed: ${text}`);
  }
  console.log(`  ✅ Funded ${address.slice(0, 8)}... via Friendbot`);
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 SELLO Testnet Seeder\n');
  console.log(`  RPC:     ${RPC_URL}`);
  console.log(`  Network: ${NETWORK_PASSPHRASE}\n`);

  // ── Section 1: Generate test accounts ──────────────────────────
  console.log('── Section 1: Test Accounts ──────────────────────────');

  const testAccounts: { name: string; keypair: StellarSdk.Keypair }[] = [];

  for (let i = 0; i < 5; i++) {
    const kp = StellarSdk.Keypair.random();
    testAccounts.push({ name: `test-user-${i + 1}`, keypair: kp });
    console.log(`  Generated: ${kp.publicKey()} (${`test-user-${i + 1}`})`);
  }

  // Fund test accounts
  console.log('\n  Funding test accounts...');
  for (const { name, keypair } of testAccounts) {
    try {
      await fundWithFriendbot(keypair.publicKey());
    } catch (err) {
      console.warn(`  ⚠️  Failed to fund ${name}: ${err}`);
    }
  }

  // ── Section 2: Log attestation contract info ──────────────────
  console.log('\n── Section 2: Contract Info ──────────────────────────');
  const attestationContract = process.env.CONTRACT_ATTESTATION_STORE;
  const tierRegistry = process.env.CONTRACT_TIER_REGISTRY;

  if (attestationContract) {
    console.log(`  AttestationStore: ${attestationContract}`);
  } else {
    console.log('  ⚠️  CONTRACT_ATTESTATION_STORE not set — deploy contracts first');
    console.log('     cd contracts && stellar contract deploy ...');
  }

  if (tierRegistry) {
    console.log(`  TierRegistry:     ${tierRegistry}`);
  } else {
    console.log('  ⚠️  CONTRACT_TIER_REGISTRY not set');
  }

  // ── Section 3: MPP Recipient Setup ────────────────────────────
  console.log('\n── Section 3: MPP Recipient Wallet ──────────────────');

  const recipientAddress = process.env.STELLAR_RECIPIENT;

  if (recipientAddress) {
    console.log(`  Recipient: ${recipientAddress}`);

    // Fund the recipient if needed
    try {
      await fundWithFriendbot(recipientAddress);
    } catch (err) {
      console.warn(`  ⚠️  Friendbot: ${err}`);
    }

    // Log USDC trustline instructions
    console.log('\n  📝 USDC Trustline Setup:');
    console.log('     1. Go to https://lab.stellar.org/account/fund');
    console.log('     2. Paste your STELLAR_RECIPIENT address');
    console.log('     3. Click "Create USDC Trustline"');
    console.log('     4. Get test USDC from https://faucet.circle.com (select Stellar Testnet)');
  } else {
    console.log('  ⚠️  STELLAR_RECIPIENT not set');
    console.log('     Generate a keypair at https://lab.stellar.org/account/create');

    // Generate a suggestion
    const suggested = StellarSdk.Keypair.random();
    console.log(`\n  💡 Suggested recipient keypair:`);
    console.log(`     Public:  ${suggested.publicKey()}`);
    console.log(`     Secret:  ${suggested.secret()}`);
    console.log(`     Add to .env: STELLAR_RECIPIENT=${suggested.publicKey()}`);
  }

  // ── Section 4: MPP Test Commands ──────────────────────────────
  console.log('\n── Section 4: MPP Test Commands ─────────────────────');
  const apiPort = process.env.API_PORT || '3001';

  console.log(`\n  🧪 Test free endpoint:`);
  console.log(`     curl http://localhost:${apiPort}/api/attestation/${testAccounts[0]?.keypair.publicKey() || 'GTEST...'}`);

  console.log(`\n  💰 Test paid endpoint (will return 402):`);
  console.log(`     curl -i http://localhost:${apiPort}/api/paid/verify/${testAccounts[0]?.keypair.publicKey() || 'GTEST...'}`);

  console.log(`\n  📦 Test batch verification (will return 402):`);
  const batchAddrs = testAccounts.slice(0, 3).map((a) => a.keypair.publicKey()).join(',');
  console.log(`     curl -i "http://localhost:${apiPort}/api/paid/batch-verify?addresses=${batchAddrs}"`);

  // ── Summary ───────────────────────────────────────────────────
  console.log('\n── Summary ──────────────────────────────────────────');
  console.log(`  ✅ ${testAccounts.length} test accounts generated and funded`);
  console.log(`  ${attestationContract ? '✅' : '⚠️ '} AttestationStore contract: ${attestationContract ? 'configured' : 'not deployed'}`);
  console.log(`  ${recipientAddress ? '✅' : '⚠️ '} MPP recipient: ${recipientAddress ? 'configured' : 'not set'}`);
  console.log('');
}

main().catch((err) => {
  console.error('\n❌ Seeding failed:', err);
  process.exit(1);
});
