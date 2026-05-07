'use client';

import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  DynamicContextProvider,
  DynamicWidget,
  useDynamicContext,
} from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors, isSolanaWallet } from '@dynamic-labs/solana';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useWalletStore } from '@/app/store/walletStore';

const dynamicSettings = {
  environmentId: process.env.NEXT_PUBLIC_DYNAMICENVID || 'hackathon-local-env',
  walletConnectors: [SolanaWalletConnectors],
  initialAuthenticationMode: 'connect-only' as const,
  enableVisitTrackingOnConnectOnly: false,
  localStorageSuffix: 'solana-external-only-v1',
  suppressEndUserConsoleWarning: true,
  logLevel: 'ERROR' as const,
};

function DynamicSessionGuard() {
  const { user, handleLogOut, sdkHasLoaded } = useDynamicContext();
  const didRunRef = useRef(false);

  useEffect(() => {
    if (!sdkHasLoaded || didRunRef.current) return;
    didRunRef.current = true;

    // If a stale authenticated Dynamic session exists, clear it so the SDK
    // stays in external-wallet connect-only mode (no WaaS init path).
    if (user?.sessionId) {
      void handleLogOut().catch(() => undefined);
    }
  }, [handleLogOut, sdkHasLoaded, user?.sessionId]);

  return null;
}

function WalletSync() {
  const { primaryWallet } = useDynamicContext();
  const { setSolanaAddress, disconnectWallet } = useWalletStore();

  const prevAddressRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const newAddress = primaryWallet?.address;
    if (prevAddressRef.current !== newAddress) {
      prevAddressRef.current = newAddress;
      if (!newAddress) disconnectWallet();
    }

    if (primaryWallet && isSolanaWallet(primaryWallet)) {
      setSolanaAddress(primaryWallet.address);
    } else {
      setSolanaAddress(undefined);
    }
  }, [disconnectWallet, primaryWallet, setSolanaAddress]);

  return null;
}

export function HeaderWalletWidget() {
  return <DynamicWidget />;
}

export default function Providers({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <DynamicContextProvider settings={dynamicSettings}>
      <QueryClientProvider client={queryClient}>
        <DynamicSessionGuard />
        <WalletSync />
        {children}
        <Toaster position="top-right" />
      </QueryClientProvider>
    </DynamicContextProvider>
  );
}
