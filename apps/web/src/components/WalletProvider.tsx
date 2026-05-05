'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

// ── Types ──────────────────────────────────────────────────────────
interface WalletContextValue {
  address: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  shortAddress: string | null;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}

// ── Lazy SWK initialization ────────────────────────────────────────
let kitReady = false;

async function ensureKit() {
  if (kitReady) return;
  // Dynamic import avoids SSR issues (SWK uses DOM APIs)
  const { StellarWalletsKit } = await import('@creit.tech/stellar-wallets-kit');
  const { defaultModules } = await import('@creit.tech/stellar-wallets-kit/modules/utils');
  const { SwkAppDarkTheme, Networks } = await import('@creit.tech/stellar-wallets-kit/types');

  StellarWalletsKit.init({
    modules: defaultModules(),
    network: Networks.TESTNET,
    theme: SwkAppDarkTheme,
  });
  kitReady = true;
}

async function getSWK() {
  await ensureKit();
  const { StellarWalletsKit } = await import('@creit.tech/stellar-wallets-kit');
  return StellarWalletsKit;
}

// ── Provider ───────────────────────────────────────────────────────
export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Restore session from state events on mount
  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      try {
        const kit = await getSWK();
        const { KitEventType } = await import('@creit.tech/stellar-wallets-kit/types');

        unsub = kit.on(KitEventType.STATE_UPDATED, (event) => {
          setAddress(event.payload.address ?? null);
        });
      } catch {
        // SWK not available, ignore
      }
    })();

    return () => { unsub?.(); };
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const kit = await getSWK();
      const { address: addr } = await kit.authModal();
      setAddress(addr);
    } catch (err) {
      console.warn('[SELLO Wallet] Connection cancelled or failed:', err);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      const kit = await getSWK();
      await kit.disconnect();
    } catch {
      // noop
    }
    setAddress(null);
  }, []);

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return (
    <WalletContext.Provider value={{ address, connecting, connect, disconnect, shortAddress }}>
      {children}
    </WalletContext.Provider>
  );
}
