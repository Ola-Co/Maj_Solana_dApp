'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSolanaProgram } from './useSolanaProgram';

export function useSolanaMajNamesMap(majPdas: string[]) {
  const { program } = useSolanaProgram();

  return useQuery({
    queryKey: ['solana-maj-names-map', majPdas],
    enabled: !!program && majPdas.length > 0,
    staleTime: Infinity,
    queryFn: async (): Promise<Record<string, string>> => {
      const results = await Promise.all(
        majPdas.map(async pda => {
          try {
            const data = await (program as any).account.majInstance.fetch(new PublicKey(pda));
            return [pda, data.name as string] as const;
          } catch {
            return [pda, ''] as const;
          }
        })
      );

      return Object.fromEntries(results);
    },
  });
}
