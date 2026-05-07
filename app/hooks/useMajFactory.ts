'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */

import { useMemo } from 'react';

export function useMajFactory() {
  return useMemo(
    () => ({
      deployedContracts: [] as `0x${string}`[],
      allMajs: [] as `0x${string}`[],
      isLoading: false,
      isCreating: false,
      createMajContract: async (_args: {
        name: string;
        admins: string[];
        sigsRequired: number;
      }) => {
        throw new Error('EVM integration is not configured in this MVP build.');
      },
    }),
    []
  );
}
