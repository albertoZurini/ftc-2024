"use client";

import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from '../utils/wagmiConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NavBar from '@/components/NavBar';

import './globals.css';

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <html lang="en">
          <body className="dark:bg-gray-900 dark:text-white flex h-screen flex-col text-center">
            <NavBar />
            <div>
              {children}
            </div>
          </body>
        </html>
      </QueryClientProvider>
    </WagmiConfig>
  );
}