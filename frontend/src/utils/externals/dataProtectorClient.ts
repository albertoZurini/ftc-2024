import {
  IExecDataProtector,
  IExecDataProtectorCore,
  IExecDataProtectorSharing,
} from '@iexec/dataprotector';
import { type Connector } from 'wagmi';
import { useUserStore } from '../user.store';
import { AbstractProvider, AbstractSigner, Eip1193Provider, Provider } from 'ethers';

let dataProtector: IExecDataProtectorCore | null = null;
let dataProtectorSharing: IExecDataProtectorSharing | null = null;

export function cleanDataProtectorSDK() {
  dataProtector = null;
}

export async function initDataProtectorSDK({
  connector,
  useDefaultOptions = false,
}: {
  connector?: Connector;
  useDefaultOptions?: boolean;
}) {
  const provider = (await connector?.getProvider()) as unknown as string | AbstractProvider | AbstractSigner<Provider | null> | Eip1193Provider | undefined;

  const iexecOptions = {
    smsURL: process.env.VITE_SMS_URL || 'https://sms.scone-prod.stagingv8.iex.ec',
    iexecGatewayURL: process.env.VITE_IEXEC_GATEWAY_URL || 'https://api.market.stagingv8.iex.ec',
    resultProxyURL: process.env.VITE_RESULT_PROXY_URL || 'https://result.stagingv8.iex.ec',
  };

  const dataProtectorOptions = {
    dataprotectorContractAddress: process.env.VITE_DATAPROTECTOR_ADDRESS || '0x3a4Ab33F3D605e75b6D00A32A0Fa55C3628F6A59',
    sharingContractAddress: process.env.VITE_DATAPROTECTOR_SHARING_ADDRESS || '0x1390c3c6a545198809F1C7c5Dd2600ef74D60925',
    subgraphUrl: process.env.VITE_DATAPROTECTOR_SUBGRAPH_URL || 'https://thegraph-product.iex.ec/subgraphs/name/bellecour/dataprotector-v2',
    ipfsGateway: process.env.VITE_IPFS_GATEWAY_URL || 'https://contentcreator-ipfs.iex.ec',
    ipfsNode: process.env.VITE_IPFS_NODE_URL || 'https://contentcreator-upload.iex.ec',
    iexecOptions,
  };


  const dataProtectorParent = useDefaultOptions
    ? new IExecDataProtector(provider)
    : new IExecDataProtector(provider, dataProtectorOptions);

  dataProtector = dataProtectorParent.core;
  dataProtectorSharing = dataProtectorParent.sharing;
}

export async function getDataProtectorClient(): Promise<{
  dataProtector: IExecDataProtectorCore;
  dataProtectorSharing: IExecDataProtectorSharing;
}> {
  if (!dataProtector) {
    const connector = useUserStore.getState().connector;
    await initDataProtectorSDK({ connector });
  }
  if (!dataProtector || !dataProtectorSharing) {
    throw new Error('iExecDataProtector is not initialized');
  }
  return { dataProtector, dataProtectorSharing };
}