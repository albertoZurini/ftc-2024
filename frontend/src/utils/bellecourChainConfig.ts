import { type Chain } from 'viem';

export const stellarTestnet = {
  id: 0x6d, // A unique ID for Stellar Testnet; you can assign a custom ID if needed.
  name: 'Stellar Testnet',
  nativeCurrency: {
    decimals: 7, // Stellar assets use up to 7 decimals
    name: 'Lumen',
    symbol: 'XLM',
  },
  rpcUrls: {
    public: { http: ['https://horizon-testnet.stellar.org'] },
    default: { http: ['https://horizon-testnet.stellar.org'] },
  },
  blockExplorers: {
    stellarExpert: {
      name: 'StellarExpert',
      url: 'https://stellar.expert/explorer/testnet',
    },
    default: { name: 'StellarExpert', url: 'https://stellar.expert/explorer/testnet' },
  },
} as const satisfies Chain;
