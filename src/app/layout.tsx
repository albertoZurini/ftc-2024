"use client";

import { WagmiConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/styles/globals.css";
import NavBar from "@/components/NavBar";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <html lang="en">
        <body className="h-screen flex flex-col text-center">
          <NavBar />
          <main className="h-page bg-gray-900 m-0">{children}</main>
        </body>
      </html>
    </QueryClientProvider>
  );
}
