'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */

import { useMemo } from 'react';

export function useDeployedTokens(_contractAddress: `0x${string}` | undefined) {
  return useMemo(
    () => ({
      deployedTokens: {} as Record<string, TokenEntry[]>,
      allTokens: [] as TokenEntry[],
      tokenMetadataMap: {} as Record<string, { name: string; symbol: string }>,
      factories: [] as { name: string }[],
      isLoading: false,
    }),
    []
  );
}
