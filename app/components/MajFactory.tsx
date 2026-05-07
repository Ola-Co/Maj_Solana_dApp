'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useSolanaMajFactory } from '@/app/hooks/solana/useSolanaMajFactory';
import { useSolanaMajNamesMap } from '@/app/hooks/solana/useSolanaMajNamesMap';
import { isSolanaAddress } from '@/app/utils/chainDetect';
import { useWalletStore } from '@/app/store/walletStore';

export default function MajFactory() {
  const { deployedContracts, createMajContract, isCreating, isLoading } = useSolanaMajFactory();
  const { data: namesMap = {} } = useSolanaMajNamesMap(deployedContracts);
  const solanaAddress = useWalletStore(s => s.solanaAddress);

  const [name, setName] = useState('');
  const [adminsInput, setAdminsInput] = useState('');
  const [sigsRequired, setSigsRequired] = useState(2);

  const admins = useMemo(
    () =>
      adminsInput
        .split(',')
        .map(a => a.trim())
        .filter(Boolean),
    [adminsInput]
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!solanaAddress) {
      toast.error('Connect a Solana wallet first');
      return;
    }
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (admins.length < 2) {
      toast.error('At least 2 admins are required');
      return;
    }
    const invalidAdmin = admins.find(a => !isSolanaAddress(a));
    if (invalidAdmin) {
      toast.error(`Invalid Solana address: ${invalidAdmin}`);
      return;
    }
    if (sigsRequired < 2 || sigsRequired > admins.length) {
      toast.error('Signatures required must be between 2 and admin count');
      return;
    }

    try {
      await createMajContract({ name, admins, sigsRequired });
      toast.success('Maj created successfully!');
      setName('');
      setAdminsInput('');
      setSigsRequired(2);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to create Maj');
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 className="text-xl font-semibold text-white">Create Maj</h2>
        <p className="mt-1 text-sm text-slate-400">Deploy a new multisig on Solana devnet.</p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-400"
              placeholder="team-vault"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Admin Addresses
              <span className="ml-2 text-xs text-slate-500">comma-separated base58 pubkeys</span>
            </label>
            <textarea
              value={adminsInput}
              onChange={e => setAdminsInput(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-400"
              placeholder="Pubkey1, Pubkey2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Signatures Required</label>
            <input
              type="number"
              min={2}
              value={sigsRequired}
              onChange={e => setSigsRequired(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-400"
            />
          </div>

          <button
            type="submit"
            disabled={isCreating || !solanaAddress}
            className="w-full rounded-xl bg-emerald-500 py-2 font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {isCreating ? 'Creating…' : 'Create Maj'}
          </button>
          {!solanaAddress && (
            <p className="text-center text-xs text-slate-500">Connect a Solana wallet to continue</p>
          )}
        </div>
      </form>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="text-lg font-semibold text-white">Your Multisigs</h3>
        <p className="mt-1 text-sm text-slate-400">Maj instances where your wallet is an admin.</p>

        <div className="mt-4 space-y-3">
          {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
          {!isLoading && deployedContracts.length === 0 && (
            <p className="text-sm text-slate-500">
              {solanaAddress ? 'No multisigs found yet.' : 'Connect wallet to see your multisigs.'}
            </p>
          )}
          {deployedContracts.map(addr => (
            <Link
              key={addr}
              href={`/maj/${addr}`}
              className="block rounded-xl border border-slate-800 bg-slate-950 p-3 transition hover:border-emerald-700"
            >
              <p className="text-sm font-semibold text-emerald-300">{namesMap[addr] || 'Untitled Maj'}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">{addr}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
