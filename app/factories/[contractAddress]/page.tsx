'use client';

import { useParams } from 'next/navigation';
import DeployedTokensTable from '@/app/components/DeployedTokensTable';
import { useMajUnified } from '@/app/hooks/useMajUnified';
import { useDeployedTokensUnified } from '@/app/hooks/useDeployedTokensUnified';

export default function FactoryDetailsPage() {
  const params = useParams<{ contractAddress: string }>();
  const contractAddress = params.contractAddress;

  const { transactions, admins, signaturesRequired } = useMajUnified(contractAddress);
  const { factories, deployedTokens, tokenMetadataMap } = useDeployedTokensUnified(contractAddress);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h1 className="text-2xl font-semibold text-white">Factory View</h1>
        <p className="mt-1 break-all text-sm text-slate-400">{contractAddress}</p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Admins</p>
            <p className="mt-2 text-xl font-semibold text-white">{admins.length}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Required Signatures</p>
            <p className="mt-2 text-xl font-semibold text-white">{signaturesRequired}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Transactions</p>
            <p className="mt-2 text-xl font-semibold text-white">{transactions.length}</p>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <DeployedTokensTable
          factories={factories as { name: string }[]}
          deployedTokens={deployedTokens as Record<string, TokenEntry[]>}
          tokenMetadataMap={tokenMetadataMap as Record<string, { name: string; symbol: string }>}
        />
      </div>
    </main>
  );
}
