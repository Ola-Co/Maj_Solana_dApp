'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import BN from 'bn.js';
import bs58 from 'bs58';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { solanaConnection } from '@/app/lib/solana/connection';
import {
  findAdminRecordPda,
  findMajInstancePda,
  findNameRecordPda,
  findRegistryPda,
  MAJ_PROGRAM_ID,
} from '@/app/lib/solana/pdas';
import { useSolanaProgram } from './useSolanaProgram';

const MAJ_INSTANCE_DISCRIMINATOR = Buffer.from([36, 236, 138, 248, 124, 103, 84, 222]);
const ADMIN_RECORD_SIZE = 8 + 32 + 32 + 1;

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

export function useSolanaMajFactory() {
  const { program, publicKey } = useSolanaProgram();
  const queryClient = useQueryClient();

  const { data: deployedContracts = [], isLoading: isLoadingDeployed } = useQuery({
    queryKey: ['solana-deployed-contracts', publicKey?.toBase58()],
    enabled: !!publicKey && !!program,
    staleTime: 30_000,
    queryFn: async (): Promise<string[]> => {
      const accounts = await solanaConnection.getProgramAccounts(MAJ_PROGRAM_ID, {
        filters: [
          { dataSize: ADMIN_RECORD_SIZE },
          { memcmp: { offset: 8, bytes: publicKey!.toBase58() } },
        ],
      });

      const seen = new Set<string>();
      const results: string[] = [];
      for (const { account } of accounts) {
        const majInstanceBytes = account.data.slice(40, 72);
        const majInstancePubkey = new PublicKey(majInstanceBytes).toBase58();
        if (!seen.has(majInstancePubkey)) {
          seen.add(majInstancePubkey);
          results.push(majInstancePubkey);
        }
      }
      return results;
    },
  });

  const { data: allMajs = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['solana-all-majs'],
    staleTime: 30_000,
    queryFn: async (): Promise<string[]> => {
      const accounts = await solanaConnection.getProgramAccounts(MAJ_PROGRAM_ID, {
        filters: [{ memcmp: { offset: 0, bytes: bs58.encode(MAJ_INSTANCE_DISCRIMINATOR) } }],
      });
      return accounts.map(({ pubkey }) => pubkey.toBase58());
    },
  });

  const { mutateAsync: createMajContract, isPending: isCreating } = useMutation({
    mutationFn: async ({
      name,
      admins,
      sigsRequired,
    }: {
      name: string;
      admins: string[];
      sigsRequired: number;
    }) => {
      if (!program || !publicKey) throw new Error('Wallet not connected');

      const adminPubkeys = admins.map(a => new PublicKey(a));
      const [majInstancePda] = findMajInstancePda(name);
      const adminRecordPdas = adminPubkeys.map(pk => findAdminRecordPda(pk, majInstancePda)[0]);

      await withTimeout(
        (program as any).methods
          .createMaj(name, adminPubkeys, new BN(sigsRequired))
          .accounts({
            registry: findRegistryPda()[0],
            nameRecord: findNameRecordPda(name)[0],
            majInstance: majInstancePda,
            payer: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .remainingAccounts(
            adminRecordPdas.map(pda => ({
              pubkey: pda,
              isWritable: true,
              isSigner: false,
            }))
          )
          .rpc(),
        60_000,
        'Create Maj timed out while waiting for wallet confirmation or RPC response'
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['solana-deployed-contracts', publicKey?.toBase58()],
      });
      queryClient.invalidateQueries({ queryKey: ['solana-all-majs'] });
    },
  });

  return {
    deployedContracts,
    allMajs,
    isLoading: isLoadingDeployed || isLoadingAll,
    isCreating,
    createMajContract: (args: { name: string; admins: string[]; sigsRequired: number }) =>
      createMajContract(args),
  };
}
