import { create } from 'zustand';

type Address = string | undefined;

type UserState = {
    isInitialized: boolean;
    setInitialized: (param: boolean) => void;
    isConnected: boolean;
    setConnected: (param: boolean) => void;
    address: Address;
    setAddress: (param: Address) => void;
    walletConnectURI: string | undefined;
    setWalletConnectURI: (uri: string) => void;
};

export const useUserStore = create<UserState>((set) => ({
    isInitialized: false,
    setInitialized: (isInitialized: boolean) => set({ isInitialized }),
    isConnected: false,
    setConnected: (isConnected: boolean) => set({ isConnected }),
    address: undefined,
    setAddress: (address: Address) => set({ address }),
    walletConnectURI: undefined,
    setWalletConnectURI: (uri: string) => set({ walletConnectURI: uri }),
}));
