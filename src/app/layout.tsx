"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/styles/globals.css";
import NavBar from "@/components/NavBar";
import styles from '@/components/body.module.css';
import { WalletConnectService } from "@/utils/WalletConnectService";
import { driver } from "@/utils/driver";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [uri, setUri] = useState<string>('');

  const walletConnectService = new WalletConnectService(driver);
  const connectWallet = async () => {
    console.log("Connecting to wallet...");
    const result = await walletConnectService.login();
    console.log(result)
    setUri(result);

    // Add WalletConnect logic here
  };
  useEffect(() => {

  }, [uri])

  const burnMoney = () => {
    console.log("Burning money...");
    // Add burn money logic here
  };

  const sendMoney = () => {
    console.log("Sending money...");
    // Add send money logic here
  };
  return (
    <QueryClientProvider client={queryClient}>
      <html lang="en">
        <body className="h-screen flex flex-col text-center">
          <NavBar />
          <main className="h-page bg-gray-900 m-0">
            <QRCodeCanvas value={uri} size={206} />
            {children}</main>
          <div className={styles.navbarActions}>
            <button className={styles.actionButton} onClick={connectWallet}>
              Wallet Connect
            </button>
            <button className={styles.actionButton} onClick={burnMoney}>
              Burn Money
            </button>
            <button className={styles.actionButton} onClick={sendMoney}>
              Send Money
            </button>
          </div>
        </body>
      </html>
    </QueryClientProvider>
  );
}
