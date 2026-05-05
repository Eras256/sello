'use client';

import { useWallet } from './WalletProvider';
import { useT } from '@/i18n';

export default function WalletButton() {
  const { address, connecting, connect, disconnect, shortAddress } = useWallet();
  const t = useT();

  if (connecting) {
    return (
      <button className="wallet-btn" disabled id="wallet-connect-btn">
        <span className="wallet-spinner" />
        …
      </button>
    );
  }

  if (address) {
    return (
      <button
        className="wallet-btn wallet-btn-connected"
        id="wallet-connect-btn"
        onClick={disconnect}
        title={address}
      >
        <span className="wallet-dot" />
        <span className="address">{shortAddress}</span>
      </button>
    );
  }

  return (
    <button
      className="wallet-btn"
      id="wallet-connect-btn"
      onClick={connect}
    >
      {t('nav.connect')}
    </button>
  );
}
