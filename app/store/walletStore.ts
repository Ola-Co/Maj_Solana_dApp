import { create } from 'zustand';

interface WalletState {
  solanaAddress: string | undefined;
  isConnected: boolean;
  isLoading: boolean;
  setSolanaAddress: (addr: string | undefined) => void;
  setIsConnected: (connected: boolean) => void;
  disconnectWallet: () => void;
}

export const useWalletStore = create<WalletState>()(set => ({
  solanaAddress: undefined,
  isConnected: false,
  isLoading: false,

  setSolanaAddress: addr =>
    set(prev => {
      if (prev.solanaAddress === addr) return prev;
      return { solanaAddress: addr, isConnected: !!addr };
    }),

  setIsConnected: connected =>
    set(prev => {
      if (prev.isConnected === connected) return prev;
      return { isConnected: connected };
    }),

  disconnectWallet: () =>
    set(prev => {
      if (!prev.isConnected && !prev.solanaAddress) return prev;
      return { solanaAddress: undefined, isConnected: false };
    }),
}));
