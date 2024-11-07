"use client";

import { FC, ReactNode } from 'react';
import { useUserStore } from '../utils/user.store';
import { useWatchWagmiAccount } from '../utils/watchWagmiAccount';

const LoginGuard: FC<{ children: ReactNode }> = ({ children }) => {
  useWatchWagmiAccount();
  const { isInitialized, isConnected } = useUserStore();

  if (!isInitialized) {
    return <p className="text-center text-lg">Initializing...</p>;
  }

  if (!isConnected) {
    return <p className="text-center text-lg">Please login with your wallet.</p>;
  }

  return <>{children}</>;
};

export default LoginGuard;