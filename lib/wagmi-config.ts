'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon } from 'wagmi/chains';
import { http } from 'wagmi';

// Debug logging
if (typeof window !== 'undefined') {
  console.log('[Wagmi Config] Window ethereum:', window.ethereum);
  console.log('[Wagmi Config] MetaMask detected:', window.ethereum?.isMetaMask);
  console.log('[Wagmi Config] Coinbase detected:', window.ethereum?.isCoinbaseWallet);
  console.log('[Wagmi Config] Project ID:', process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID);
}

// Create wagmi config using getDefaultConfig (recommended for RainbowKit v2)
export const wagmiConfig = getDefaultConfig({
  appName: 'Agent Bazaar',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [polygon],
  transports: {
    [polygon.id]: http('https://polygon-rpc.com'),
  },
  ssr: true,
});