'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */

import { useMemo } from 'react';

export function useMaj(_contractAddress: `0x${string}` | undefined) {
  return useMemo(
    () => ({
      transactions: [] as TransactionEntry[],
      admins: [] as string[],
      signaturesRequired: 0,
      txCount: 0,
      isAdmin: false,
      isLoading: false,
      proposeTransaction: async (_args: {
        to: string;
        data: Uint8Array;
        lamports?: number;
      }) => {
        throw new Error('EVM integration is not configured in this MVP build.');
      },
      signTransaction: async (_txIndex: number) => {
        throw new Error('EVM integration is not configured in this MVP build.');
      },
      cancelTransaction: async (_txIndex: number) => {
        throw new Error('EVM integration is not configured in this MVP build.');
      },
      revokeSignature: async (_txIndex: number) => {
        throw new Error('EVM integration is not configured in this MVP build.');
      },
      executeTransaction: async (_args: {
        txIndex: number;
        remainingAccounts: { pubkey: string; isWritable: boolean; isSigner: boolean }[];
      }) => {
        throw new Error('EVM integration is not configured in this MVP build.');
      },
      addAdmin: async (_newAdmin: string) => {
        throw new Error('EVM integration is not configured in this MVP build.');
      },
      removeAdmin: async (_adminToRemove: string) => {
        throw new Error('EVM integration is not configured in this MVP build.');
      },
      blacklistAddress: async (_target: string) => {
        throw new Error('EVM integration is not configured in this MVP build.');
      },
      whitelistAddress: async (_target: string) => {
        throw new Error('EVM integration is not configured in this MVP build.');
      },
      changeSigsRequired: async (_n: number) => {
        throw new Error('EVM integration is not configured in this MVP build.');
      },
    }),
    []
  );
}

export function useMajNamesMap(_contracts: `0x${string}`[]) {
  return useMemo(() => ({ data: {} as Record<string, string>, isLoading: false }), []);
}
