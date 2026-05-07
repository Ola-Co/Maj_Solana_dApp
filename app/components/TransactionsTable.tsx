'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { PublicKey } from '@solana/web3.js';
import { useSolanaMaj } from '@/app/hooks/solana/useSolanaMaj';
import { useWalletStore } from '@/app/store/walletStore';

interface Props {
  majInstancePda: string;
  transactions: SolanaTransaction[];
  signaturesRequired: number;
  isAdmin: boolean;
}

function statusBadge(tx: SolanaTransaction) {
  if (tx.executed)
    return <span className="rounded-full bg-blue-900/60 px-2 py-0.5 text-xs text-blue-300">Executed</span>;
  if (!tx.active)
    return <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">Cancelled</span>;
  return <span className="rounded-full bg-emerald-900/60 px-2 py-0.5 text-xs text-emerald-300">Active</span>;
}

export default function TransactionsTable({
  majInstancePda,
  transactions,
  signaturesRequired,
  isAdmin,
}: Props) {
  const solanaAddress = useWalletStore(s => s.solanaAddress);
  const { signTransaction, cancelTransaction, revokeSignature, executeTransaction } =
    useSolanaMaj(majInstancePda);

  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    try {
      await fn();
      toast.success('Transaction confirmed');
    } catch (err) {
      toast.error((err as Error).message || 'Transaction failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <h3 className="text-lg font-semibold text-white">Transactions</h3>

      {transactions.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No transactions yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {transactions.map(tx => (
            <div
              key={tx.txIndex}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">#{tx.txIndex}</span>
                    {statusBadge(tx)}
                  </div>
                  <p className="mt-1 break-all text-xs text-slate-300">
                    <span className="text-slate-500">To: </span>
                    {tx.to}
                  </p>
                  {tx.value > BigInt(0) && (
                    <p className="text-xs text-slate-400">{tx.value.toString()} lamports</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    {tx.numSignatures} / {signaturesRequired} signatures
                  </p>
                </div>

                {/* Action buttons — only show for active, non-executed txs */}
                {tx.active && !tx.executed && isAdmin && solanaAddress && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => run(`sign-${tx.txIndex}`, () => signTransaction(tx.txIndex))}
                      disabled={!!busy}
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {busy === `sign-${tx.txIndex}` ? '…' : 'Sign'}
                    </button>

                    <button
                      onClick={() => run(`revoke-${tx.txIndex}`, () => revokeSignature(tx.txIndex))}
                      disabled={!!busy}
                      className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-slate-500 disabled:opacity-50"
                    >
                      {busy === `revoke-${tx.txIndex}` ? '…' : 'Revoke'}
                    </button>

                    {tx.numSignatures >= signaturesRequired && (
                      <button
                        onClick={() =>
                          run(`exec-${tx.txIndex}`, () =>
                            executeTransaction({
                              txIndex: tx.txIndex,
                              remainingAccounts: tx.accountMetas.map(m => ({
                                pubkey: new PublicKey(m.pubkey),
                                isWritable: m.isWritable,
                                isSigner: m.isSigner,
                              })),
                            })
                          )
                        }
                        disabled={!!busy}
                        className="rounded-lg bg-cyan-600 px-3 py-1 text-xs font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
                      >
                        {busy === `exec-${tx.txIndex}` ? '…' : 'Execute'}
                      </button>
                    )}

                    {tx.proposedBy === solanaAddress && (
                      <button
                        onClick={() =>
                          run(`cancel-${tx.txIndex}`, () => cancelTransaction(tx.txIndex))
                        }
                        disabled={!!busy}
                        className="rounded-lg border border-red-900 px-3 py-1 text-xs text-red-400 hover:border-red-700 disabled:opacity-50"
                      >
                        {busy === `cancel-${tx.txIndex}` ? '…' : 'Cancel'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {tx.programId && (
                <p className="mt-2 break-all text-xs text-slate-500">
                  <span className="text-slate-600">Program: </span>
                  {tx.programId}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
