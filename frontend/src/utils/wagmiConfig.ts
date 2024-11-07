import { createWeb3Modal } from '@web3modal/wagmi/react';
import { http, createConfig, CreateConnectorFn } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { stellarTestnet } from './bellecourChainConfig';
import { InjectedWalletProvider } from './injected-wallet-provider/injected-wallet-provider';
import { EIP6963ProviderDetail } from './injected-wallet-provider/types';

// Wagmi Client initialization

export const projectId = 'ca16876cda029405437d5d73b0e0c39f';

// WalletConnect metadata
const metadata = {
  name: 'Web3mail use case demo',
  description: 'Web3mail use case demo',
  url: 'https://hack.zurini.dev',
  icons: [
    'https://cdn.prod.website-files.com/6646148828eddb19c172bf2a/665db3ba85a625628c353a64_Logo-RLC-Yellow.png',
  ],
};

// Connectors initialization
const connectors: CreateConnectorFn[] = [];
connectors.push(walletConnect({ projectId, metadata, showQrModal: false }));

// Injected wallet provider management
const injectedWalletProvider = new InjectedWalletProvider();
let availableProviderDetails: EIP6963ProviderDetail[] = [];

// Injected wallet provider details update
injectedWalletProvider.on('providerDetailsUpdated', () => {
  availableProviderDetails = injectedWalletProvider.providerDetails;
});
injectedWalletProvider.subscribe();
injectedWalletProvider.requestProviders();

// Preserved wallet providers IDs
const preservedId = [
  'co.lobstr'
];

// Filtering available providers
const preservedAvailableProviderDetails = availableProviderDetails.filter(
  (providerDetails) => preservedId.includes(providerDetails.info.rdns)
);

// Adding injected providers to connectors
preservedAvailableProviderDetails.forEach((providerDetails) => {
  connectors.push(
    injected({
      target() {
        return {
          id: providerDetails.info.rdns,
          name: providerDetails.info.name,
          icon: providerDetails.info.icon,
          provider: providerDetails.provider as any,
        };
      },
    })
  );
});

export const wagmiConfig = createConfig({
  chains: [stellarTestnet,],
  multiInjectedProviderDiscovery: false,
  transports: {
    [stellarTestnet.id]: http(),
  },
  connectors,
});

// Force some wallets to be displayed even if not detected in user's browser
// Find wallets IDs here: https://explorer.walletconnect.com/
const featuredWalletIds = [
  '76a3d548a08cf402f5c7d021f24fd2881d767084b387a5325df88bc3d4b6f21b', // LOBSTR
];

// Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  defaultChain: stellarTestnet,
  featuredWalletIds,
  allWallets: 'HIDE',
});
