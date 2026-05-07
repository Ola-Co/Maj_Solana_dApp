import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChainStoreState {
  activeChain: 'evm' | 'solana';
  setActiveChain: (chain: 'evm' | 'solana') => void;
}

export const useChainStore = create<ChainStoreState>()(
  persist(
    set => ({
      activeChain: 'evm',
      setActiveChain: chain => set({ activeChain: chain }),
    }),
    { name: 'maj-active-chain' }
  )
);
