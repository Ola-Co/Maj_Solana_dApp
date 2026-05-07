import { create } from 'zustand';

export type WalletChain = 'evm' | 'solana';

interface WalletState {
  solanaAddress: string | undefined;
  evmAddress: string | undefined;
  connectedChain: WalletChain | undefined;
  isConnected: boolean;
  isLoading: boolean;
  setSolanaAddress: (addr: string | undefined) => void;
  setEvmAddress: (addr: string | undefined) => void;
  setConnectedChain: (chain: WalletChain | undefined) => void;
  setIsConnected: (connected: boolean) => void;
  disconnectWallet: () => void;
}

export const useWalletStore = create<WalletState>()(set => ({
  solanaAddress: undefined,
  evmAddress: undefined,
  connectedChain: undefined,
  isConnected: false,
  isLoading: false,

  setSolanaAddress: addr =>
    set(prev => {
      if (prev.solanaAddress === addr) return prev;
      return { solanaAddress: addr, isConnected: !!addr || !!prev.evmAddress };
    }),

  setEvmAddress: addr =>
    set(prev => {
      if (prev.evmAddress === addr) return prev;
      return { evmAddress: addr, isConnected: !!addr || !!prev.solanaAddress };
    }),

  setConnectedChain: chain =>
    set(prev => {
      if (prev.connectedChain === chain) return prev;
      return { connectedChain: chain };
    }),

  setIsConnected: connected =>
    set(prev => {
      if (prev.isConnected === connected) return prev;
      return { isConnected: connected };
    }),

  disconnectWallet: () =>
    set(prev => {
      if (!prev.isConnected && !prev.solanaAddress && !prev.evmAddress && !prev.connectedChain) {
        return prev;
      }
      return {
        solanaAddress: undefined,
        evmAddress: undefined,
        connectedChain: undefined,
        isConnected: false,
      };
    }),
}));
