import WalletConnectClient, { SignClient } from '@walletconnect/sign-client';
import { getSdkError } from '@walletconnect/utils';
import * as StellarSdk from '@stellar/stellar-sdk';

// Constants
const WALLET_CONNECT_PROJECT_ID = '107ab981eb5dfb8db65a1dddc5986de2';

const METADATA = {
  name: 'StellarTerm',
  description: 'StellarTerm is an advanced web-based trading client for the Stellar network. ' +
    'Send, receive, and trade assets on the Stellar network easily with StellarTerm.',
  url: 'https://blockademy.shahryarbhm.com',
  icons: ['https://avatars.githubusercontent.com/u/25021964?s=200&v=4.png'],
};

const PUBNET = 'stellar:testnet';

const STELLAR_METHODS = {
  SIGN_AND_SUBMIT: 'stellar_signAndSubmitXDR',
  SIGN: 'stellar_signXDR',
} as const;

const REQUIRED_NAMESPACES = {
  stellar: {
    chains: [PUBNET],
    methods: Object.values(STELLAR_METHODS),
    events: [],
  },
};

type ModalHandlers = {
  activate: (name: string, data?: any) => void;
  finish: () => void;
  cancel: () => void;
};

type SessionHandlers = {
  logIn: (keypair: StellarSdk.Keypair, options: { authType: string }) => Promise<void>;
  handleLogout: () => void;
};

interface Driver {
  isOnline: boolean;
  modal: {
    modalName: string | null;
    handlers: ModalHandlers;
  };
  session: {
    handlers: SessionHandlers;
    account: {
      refresh: () => void;
      updateOffers: () => void;
    };
  };
  toastService: {
    error: (title: string, message: string) => void;
  };
}

export class WalletConnectService {
  private driver: Driver;
  private appMeta: any | null;
  private client: any;
  private session: any | null;

  constructor(driver: Driver) {
    this.driver = driver;
    this.appMeta = null;
    this.client = null;
    this.session = null;
  }

  async initWalletConnect(): Promise<'logged' | null> {
    if (!this.driver.isOnline) {
      this.driver.toastService.error('No connection', 'Internet connection appears to be offline');
    }
    if (this.client) {
      return null;
    }

    this.client = await WalletConnectClient.init({
      projectId: WALLET_CONNECT_PROJECT_ID,
      metadata: METADATA,
    });

    this.listenWalletConnectEvents();

    if (!this.client.session.length) {
      return null;
    }

    this.session = await this.client.session.getAll()[0];

    const [_chain, _reference, publicKey] = this.session.namespaces.stellar.accounts[0].split(':');
    this.appMeta = this.session.peer.metadata;
    const keypair = StellarSdk.Keypair.fromPublicKey(publicKey.toUpperCase());

    await this.driver.session.handlers.logIn(keypair, {
      authType: 'WALLET_CONNECT',
    });

    return 'logged';
  }

  clearClient(): void {
    if (this.client) {
      this.client = null;
    }
  }

  async restoreConnectionIfNeeded(): Promise<void> {
    if (this.session) {
      this.client = await WalletConnectClient.init({
        projectId: WALLET_CONNECT_PROJECT_ID,
        metadata: METADATA,
      });
    }
  }

  private listenWalletConnectEvents(): void {
    if (!this.client) return;

    this.client.on('session_delete', ({ topic }: { topic: string }) => this.onSessionDeleted(topic));
  }

  private onSessionDeleted(topic: string): void {
    if (this.session && this.session.topic === topic) {
      this.session = null;
      this.appMeta = null;
      this.driver.session.handlers.handleLogout();
    }
  }

  async login(): Promise<any> {
    const result = await this.initWalletConnect();

    if (result === 'logged') {
      return;
    }

    if (this.driver.modal.modalName) {
      this.driver.modal.handlers.cancel();
    }

    if (!this.client) return;

    const activePairings = this.client.pairing.getAll({ active: true });

    if (activePairings.length > 3) {
      const deletePromises = activePairings
        .slice(0, -3)
        .map((pairing: any) =>
          this.client?.pairing.delete(pairing.topic, getSdkError('UNAUTHORIZED_METHOD')));

      await Promise.all(deletePromises.filter((p: any): p is Promise<void> => p !== undefined));
    }

    if (activePairings.length) {
      this.driver.modal.handlers.activate('WalletConnectPairingModal', {
        pairings: activePairings.reverse(),
        connect: this.connect.bind(this),
        deletePairing: this.deletePairing.bind(this),
      });
      return;
    }

    return await this.connect();
  }

  async deletePairing(topic: string): Promise<void> {
    if (!this.client) return;
    await this.client.pairing.delete(topic, getSdkError('UNAUTHORIZED_METHOD'));
  }

  async connect(pairing?: any): Promise<{ status: string } | void> {
    if (!this.driver.isOnline) {
      this.driver.toastService.error('No connection', 'Internet connection appears to be offline');
    }

    if (this.driver.modal.modalName === 'WalletConnectPairingModal') {
      this.driver.modal.handlers.finish();
    }

    if (pairing) {
      this.driver.modal.handlers.activate('WalletConnectSessionRequestModal', {
        title: pairing.peerMetadata.name,
        logo: pairing.peerMetadata.icons[0],
      });
    }

    try {
      if (!this.client) throw new Error('Client not initialized');

      const { uri, approval } = await this.client.connect({
        pairingTopic: pairing ? pairing.topic : undefined,
        requiredNamespaces: REQUIRED_NAMESPACES,
      });
      console.log(uri)
      if (!pairing) {
        this.driver.modal.handlers.activate('WalletConnectQRModal', uri);
        return uri // ALBERTO
      }
      this.session = await approval();
      return uri // ALBERTO
    } catch (e: any) {
      if (this.session) {
        return { status: 'cancel' };
      }
      this.appMeta = null;

      if (e.message === 'cancelled') {
        return { status: 'cancel' };
      }

      const errorMessage =
        e.message === 'rejected' ||
          e.message === '' ||
          e.code === getSdkError('USER_REJECTED').code
          ? 'Connection canceled by the user'
          : e.message;

      this.driver.toastService.error('Connection unsuccessful', errorMessage);
      return this.driver.modal.handlers.cancel();
    }

    this.driver.modal.handlers.cancel();
    this.appMeta = this.session.peer.metadata;

    const [_chain, _reference, publicKey] = this.session.namespaces.stellar.accounts[0].split(':');
    const keypair = StellarSdk.Keypair.fromPublicKey(publicKey.toUpperCase());

    return this.driver.session.handlers.logIn(keypair, {
      authType: 'WALLET_CONNECT',
    }).then(() => {
      if (pairing && this.client) {
        this.client.pairing.update(pairing.topic, {
          peerMetadata: this.appMeta,
        });
      }
    });
  }

  async logout(): Promise<void> {
    if (this.session && this.client) {
      await this.client.disconnect({
        topic: this.session.topic,
        reason: getSdkError('USER_DISCONNECTED'),
      });
      this.onSessionDeleted(this.session.topic);
    }
  }

  signAndSubmitTx(tx: StellarSdk.Transaction): { status: string } {
    if (!this.client || !this.session) {
      throw new Error('No active session');
    }

    if (this.driver.modal.modalName) {
      this.driver.modal.handlers.finish();
    }

    const xdr = tx.toEnvelope().toXDR('base64');

    this.driver.modal.handlers.activate('WalletConnectRequestModal', {
      title: this.appMeta.name,
      logo: this.appMeta.icons[0],
      result: this.client.request({
        topic: this.session.topic,
        chainId: PUBNET,
        request: {
          method: STELLAR_METHODS.SIGN_AND_SUBMIT,
          params: {
            xdr,
          },
        },
      }).then((result: any) => {
        this.driver.session.account.refresh();
        this.driver.session.account.updateOffers();
        return result;
      }),
    });

    return { status: 'SENT_TO_WALLET_CONNECT' };
  }

  signTx(tx: StellarSdk.Transaction): Promise<string> {
    if (!this.client || !this.session) {
      throw new Error('No active session');
    }

    if (this.driver.modal.modalName) {
      this.driver.modal.handlers.finish();
    }

    const xdr = tx.toEnvelope().toXDR('base64');

    return new Promise((resolve, reject) => {
      this.driver.modal.handlers.activate('WalletConnectRequestModal', {
        title: this.appMeta.name,
        logo: this.appMeta.icons[0],
        result: this.client.request({
          topic: this.session.topic,
          chainId: PUBNET,
          request: {
            method: STELLAR_METHODS.SIGN,
            params: {
              xdr,
            },
          },
        }).then(({ signedXDR }: { signedXDR: string }) => {
          resolve(signedXDR);
          return {
            status: 'success',
          };
        }).catch(() => {
          reject('Cancelled by user');
          throw new Error();
        }),
      });
    });
  }
}