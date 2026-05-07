'use client';

import Link from 'next/link';
import ChainToggle from '@/app/components/ChainToggle';
import { HeaderWalletWidget } from '@/app/providers';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-wide text-white">
          Maj Multisig
        </Link>
        <ChainToggle />
        <span className="rounded-full border border-emerald-800 bg-emerald-950/60 px-3 py-1 text-xs font-medium text-emerald-400">
          Solana {process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}
        </span>
        <ul className="flex items-center gap-5 text-sm text-slate-300">
          <li>
            <Link href="/" className="hover:text-white">
              Factory
            </Link>
          </li>
        </ul>
        <HeaderWalletWidget />
      </nav>
    </header>
  );
}
