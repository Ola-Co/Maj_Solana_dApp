'use client';

import { useParams } from 'next/navigation';
import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import TransactionsTable from '@/app/components/TransactionsTable';
import DeployedTokensTable from '@/app/components/DeployedTokensTable';
import { useSolanaMaj } from '@/app/hooks/solana/useSolanaMaj';
import { useDeployedTokensUnified } from '@/app/hooks/useDeployedTokensUnified';
import { isSolanaAddress } from '@/app/utils/chainDetect';

export default function MajDetailsPage() {
  const params = useParams<{ contractAddress: string }>();
  const contractAddress = params.contractAddress;

  const {
    transactions,
    admins,
    signaturesRequired,
    txCount,
    isLoading,
    isAdmin,
    proposeTransaction,
  } = useSolanaMaj(contractAddress);
  const { factories, deployedTokens, tokenMetadataMap } = useDeployedTokensUnified(contractAddress);

  // Propose form state
  const [showPropose, setShowPropose] = useState(false);
  const [toAddr, setToAddr] = useState('');
  const [lamports, setLamports] = useState('');
  const [hexData, setHexData] = useState('');
  const [isProposing, setIsProposing] = useState(false);

  const onPropose = async (e: FormEvent) => {
    e.preventDefault();
    if (!toAddr || !isSolanaAddress(toAddr)) {
      toast.error('Enter a valid Solana address for "To"');
      return;
    }
    const lamportVal = lamports ? parseInt(lamports, 10) : 0;
    if (isNaN(lamportVal) || lamportVal < 0) {
      toast.error('Invalid lamport amount');
      return;
    }
    let dataBytes: Uint8Array;
    try {
      dataBytes = hexData.trim()
        ? Uint8Array.from(Buffer.from(hexData.trim().replace(/^0x/i, ''), 'hex'))
        : new Uint8Array(0);
    } catch {
      toast.error('Data must be valid hex (e.g. 0xdeadbeef)');
      return;
    }
    setIsProposing(true);
    try {
      await proposeTransaction({ to: toAddr, lamports: lamportVal, data: dataBytes });
      toast.success('Transaction proposed!');
      setToAddr('');
      setLamports('');
      setHexData('');
      setShowPropose(false);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to propose transaction');
    } finally {
      setIsProposing(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      {/* Stats + Admin list */}
      <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">Maj Details</h1>
            <p className="mt-1 break-all text-sm text-slate-400">{contractAddress}</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowPropose(v => !v)}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400"
            >
              {showPropose ? 'Close Form' : '+ Propose Transaction'}
            </button>
          )}
        </div>

        {isLoading ? (
          <p className="mt-4 text-sm text-slate-400">Loading Maj data…</p>
        ) : (
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
              <p className="text-xs uppercase tracking-wide text-slate-500">Transaction Count</p>
              <p className="mt-2 text-xl font-semibold text-white">{txCount}</p>
            </div>
          </div>
        )}

        <div className="mt-5">
          <h2 className="text-sm font-medium text-slate-300">Admin List</h2>
          {admins.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No admins loaded.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {admins.map(admin => (
                <li
                  key={admin}
                  className="truncate rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-300"
                >
                  {admin}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Propose form — shown when isAdmin and toggle open */}
      {isAdmin && showPropose && (
        <section className="mb-6 rounded-2xl border border-emerald-900 bg-slate-900/70 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Propose Transaction</h2>
          <form onSubmit={onPropose} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-300">To (Solana pubkey)</label>
              <input
                value={toAddr}
                onChange={e => setToAddr(e.target.value)}
                placeholder="Base58 address"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">
                Lamports
                <span className="ml-2 text-xs text-slate-500">0 for SOL-less CPI</span>
              </label>
              <input
                type="number"
                min={0}
                value={lamports}
                onChange={e => setLamports(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">
                Instruction Data (hex, optional)
              </label>
              <input
                value={hexData}
                onChange={e => setHexData(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
              />
            </div>
            <button
              type="submit"
              disabled={isProposing}
              className="rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-50"
            >
              {isProposing ? 'Proposing…' : 'Propose'}
            </button>
          </form>
        </section>
      )}

      {/* Transactions + Tokens */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TransactionsTable
          majInstancePda={contractAddress}
          transactions={transactions}
          signaturesRequired={signaturesRequired}
          isAdmin={isAdmin}
        />
        <DeployedTokensTable
          factories={factories as { name: string }[]}
          deployedTokens={deployedTokens as Record<string, TokenEntry[]>}
          tokenMetadataMap={tokenMetadataMap as Record<string, { name: string; symbol: string }>}
        />
      </div>
    </main>
  );
}
