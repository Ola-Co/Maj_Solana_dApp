'use client';

import { useQuery } from '@tanstack/react-query';

export function useSolanaDeployedTokens(majInstancePda: string | undefined) {
  const factoryProgramId = process.env.NEXT_PUBLIC_SPL_FACTORY_PROGRAM_ID;

  const { data: splTokens = [], isLoading } = useQuery({
    queryKey: ['solana-deployed-tokens', majInstancePda],
    enabled: !!majInstancePda && !!factoryProgramId,
    staleTime: 30_000,
    queryFn: async (): Promise<TokenEntry[]> => {
      return [];
    },
  });

  return {
    deployedTokens: { SplTokenFactory: splTokens } as Record<string, TokenEntry[]>,
    allTokens: splTokens,
    tokenMetadataMap: {} as Record<string, { name: string; symbol: string }>,
    factories: [{ name: 'SplTokenFactory' }],
    isLoading,
  };
}
