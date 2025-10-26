'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon } from 'wagmi/chains';
import { http } from 'wagmi';

// Create wagmi config using getDefaultConfig (recommended for RainbowKit v2)
export const wagmiConfig = getDefaultConfig({
  appName: 'Agent Bazaar',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [polygon],
  transports: {
    // Using public Polygon RPC - for production, use Alchemy or Infura
    [polygon.id]: http('https://polygon-rpc.com'),
  },
  ssr: true,
});