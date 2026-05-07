'use client';

import MajFactory from '@/app/components/MajFactory';
import { useChainStore } from '@/app/store/chainStore';

export default function Home() {
  const activeChain = useChainStore(state => state.activeChain);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <section className="mb-6">
        <h1 className="text-3xl font-semibold text-white">
          Maj {activeChain === 'solana' ? 'Solana' : 'EVM'} Multisig
        </h1>
        <p className="mt-2 max-w-3xl text-slate-300">
          Connect either a Solana or EVM wallet with Dynamic. The Solana multisig flow is live;
          the EVM flow is still pending contract integration.
        </p>
      </section>
      {activeChain === 'solana' ? (
        <MajFactory />
      ) : (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-white">EVM Wallet Mode</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Dynamic can now connect EVM wallets in this app. The EVM Maj contract actions are still
            stubbed, so switching to EVM currently enables wallet connection and chain selection,
            but not create/list multisig actions yet.
          </p>
        </section>
      )}
    </main>
  );
}
