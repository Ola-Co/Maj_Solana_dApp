'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from 'react';
import { useSolanaProgram } from './solana/useSolanaProgram';
import { isSolanaAddress } from '@/app/utils/chainDetect';

export function useDecodedTransaction(tx: TransactionEntry | null) {
  const { program } = useSolanaProgram();

  return useMemo(() => {
    if (!tx) return null;

    if (isSolanaAddress(tx.to) && program) {
      try {
        const decoded = (program.coder.instruction as any).decode?.(Buffer.from(tx.data));
        if (decoded) {
          return { ...tx, decoded: { functionName: decoded.name, args: decoded.data as any } };
        }
      } catch {
        return { ...tx, decoded: null };
      }
      return { ...tx, decoded: null };
    }

    return { ...tx, decoded: null };
  }, [tx, program]);
}
