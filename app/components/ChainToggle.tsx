'use client';

import { useChainStore } from '@/app/store/chainStore';

const chains = [
  { id: 'solana', label: 'Solana' },
  { id: 'evm', label: 'EVM' },
] as const;

export default function ChainToggle() {
  const activeChain = useChainStore(state => state.activeChain);
  const setActiveChain = useChainStore(state => state.setActiveChain);

  return (
    <div className="inline-flex rounded-full border border-slate-800 bg-slate-900 p-1">
      {chains.map(chain => {
        const isActive = chain.id === activeChain;

        return (
          <button
            key={chain.id}
            type="button"
            onClick={() => setActiveChain(chain.id)}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition',
              isActive
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white',
            ].join(' ')}
          >
            {chain.label}
          </button>
        );
      })}
    </div>
  );
}
