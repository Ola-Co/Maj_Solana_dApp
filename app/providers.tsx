'use client';

import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  DynamicContextProvider,
  DynamicWidget,
  useDynamicContext,
} from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors, isEthereumWallet } from '@dynamic-labs/ethereum';
import { SolanaWalletConnectors, isSolanaWallet } from '@dynamic-labs/solana';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useChainStore } from '@/app/store/chainStore';
import { useWalletStore } from '@/app/store/walletStore';

const dynamicSettings = {
  environmentId: process.env.NEXT_PUBLIC_DYNAMICENVID || 'hackathon-local-env',
  walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
  initialAuthenticationMode: 'connect-only' as const,
  enableVisitTrackingOnConnectOnly: false,
  localStorageSuffix: 'multichain-external-only-v1',
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
  const { setConnectedChain, setEvmAddress, setSolanaAddress, disconnectWallet } = useWalletStore();

  const prevAddressRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const newAddress = primaryWallet?.address;
    if (prevAddressRef.current !== newAddress) {
      prevAddressRef.current = newAddress;
      if (!newAddress) disconnectWallet();
    }

    if (primaryWallet && isSolanaWallet(primaryWallet)) {
      setSolanaAddress(primaryWallet.address);
      setEvmAddress(undefined);
      setConnectedChain('solana');
    } else if (primaryWallet && isEthereumWallet(primaryWallet)) {
      setEvmAddress(primaryWallet.address);
      setSolanaAddress(undefined);
      setConnectedChain('evm');
    } else {
      setSolanaAddress(undefined);
      setEvmAddress(undefined);
      setConnectedChain(undefined);
    }
  }, [disconnectWallet, primaryWallet, setConnectedChain, setEvmAddress, setSolanaAddress]);

  return null;
}

function ChainSwitchGuard() {
  const activeChain = useChainStore(state => state.activeChain);
  const { handleLogOut, primaryWallet, sdkHasLoaded, user } = useDynamicContext();
  const { disconnectWallet } = useWalletStore();
  const prevChainRef = useRef(activeChain);

  useEffect(() => {
    if (!sdkHasLoaded) return;

    const prevChain = prevChainRef.current;
    if (prevChain === activeChain) return;

    prevChainRef.current = activeChain;

    if (!primaryWallet && !user?.sessionId) return;

    disconnectWallet();
    void handleLogOut().catch(() => undefined);
  }, [activeChain, disconnectWallet, handleLogOut, primaryWallet, sdkHasLoaded, user?.sessionId]);

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
        <ChainSwitchGuard />
        <WalletSync />
        {children}
        <Toaster position="top-right" />
      </QueryClientProvider>
    </DynamicContextProvider>
  );
}
