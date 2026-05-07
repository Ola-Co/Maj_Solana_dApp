'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isSolanaWallet } from '@dynamic-labs/solana';
import { PublicKey } from '@solana/web3.js';
import { getAnchorProgram, type SolanaWalletAdapter } from '@/app/lib/solana/anchorClient';
import { solanaConnection } from '@/app/lib/solana/connection';
import { MAJ_PROGRAM_ID } from '@/app/lib/solana/pdas';
import majCoreIdl from '@/app/lib/contractInfo/solana/maj_core.json';

async function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export function useSolanaProgram() {
  const { primaryWallet } = useDynamicContext();

  return useMemo(() => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      return { program: null, publicKey: null };
    }

    const publicKey = new PublicKey(primaryWallet.address);

    const resolveSigner = async () => {
      const wallet = primaryWallet as any;

      if (wallet?.getSigner) {
        return withTimeout(wallet.getSigner(), 15_000, 'Wallet signer request timed out');
      }

      if (wallet?.connector?.getSigner) {
        return withTimeout(
          wallet.connector.getSigner(),
          15_000,
          'Wallet connector signer request timed out'
        );
      }

      if (wallet?.connector?.signTransaction || wallet?.signTransaction) {
        return wallet.connector ?? wallet;
      }

      throw new Error('Connected wallet does not support transaction signing');
    };

    const walletAdapter: SolanaWalletAdapter = {
      publicKey,
      signTransaction: async tx => {
        const signer = await resolveSigner();
        if (typeof signer.signTransaction !== 'function') {
          throw new Error('Wallet signer does not implement signTransaction');
        }
        return withTimeout(
          signer.signTransaction(tx),
          30_000,
          'Wallet did not sign transaction in time'
        );
      },
      signAllTransactions: async txs => {
        const signer = await resolveSigner();
        if (typeof signer.signAllTransactions === 'function') {
          return withTimeout(
            signer.signAllTransactions(txs),
            30_000,
            'Wallet did not sign transactions in time'
          );
        }
        if (typeof signer.signTransaction !== 'function') {
          throw new Error('Wallet signer does not implement signTransaction');
        }
        return withTimeout(
          Promise.all(txs.map((tx: any) => signer.signTransaction(tx))),
          30_000,
          'Wallet did not sign transactions in time'
        );
      },
    };

    const program = getAnchorProgram(
      majCoreIdl as any,
      MAJ_PROGRAM_ID,
      walletAdapter,
      solanaConnection
    );

    return { program, publicKey };
  }, [primaryWallet]);
}
