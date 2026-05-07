'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import BN from 'bn.js';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { solanaConnection } from '@/app/lib/solana/connection';
import {
  findAdminRecordPda,
  findBlacklistRecordPda,
  findMajTransactionPda,
  findSignatureRecordPda,
  MAJ_PROGRAM_ID,
} from '@/app/lib/solana/pdas';
import { useSolanaProgram } from './useSolanaProgram';

export function useSolanaMaj(majInstancePda: string | undefined) {
  const { program, publicKey } = useSolanaProgram();
  const queryClient = useQueryClient();

  const majPubkey = majInstancePda ? new PublicKey(majInstancePda) : null;

  const { data: majData, isLoading: isLoadingMaj } = useQuery({
    queryKey: ['solana-maj-instance', majInstancePda],
    enabled: !!program && !!majPubkey,
    staleTime: 30_000,
    queryFn: () => (program as any).account.majInstance.fetch(majPubkey!),
  });

  const admins: string[] = (majData?.admins as PublicKey[] | undefined)?.map(pk => pk.toBase58()) ?? [];
  const signaturesRequired: number = majData?.sigsRequired
    ? Number((majData.sigsRequired as BN).toString())
    : 0;
  const txCount: number = majData?.txCount ? Number((majData.txCount as BN).toString()) : 0;

  const { data: transactions = [], isLoading: isLoadingTxs } = useQuery({
    queryKey: ['solana-maj-transactions', majInstancePda, txCount],
    enabled: !!program && !!majPubkey && txCount > 0,
    staleTime: 30_000,
    queryFn: async (): Promise<SolanaTransaction[]> => {
      const txPdas = Array.from({ length: txCount }, (_, i) =>
        findMajTransactionPda(majPubkey!, BigInt(i))[0]
      );
      const accountInfos = await solanaConnection.getMultipleAccountsInfo(txPdas);
      const results: SolanaTransaction[] = [];

      for (let i = 0; i < accountInfos.length; i++) {
        const info = accountInfos[i];
        if (!info) continue;

        try {
          const decoded = program!.coder.accounts.decode('MajTransaction', info.data);
          results.push({
            txIndex: i,
            to: (decoded.to as PublicKey).toBase58(),
            value: BigInt((decoded.value as BN).toString()),
            data: decoded.data as Uint8Array,
            proposedBy: (decoded.proposedBy as PublicKey).toBase58(),
            active: decoded.active as boolean,
            executed: decoded.executed as boolean,
            numSignatures: decoded.numSignatures as number,
            programId: decoded.programId ? (decoded.programId as PublicKey).toBase58() : null,
            accountMetas: (decoded.accountMetas as any[]).map(m => ({
              pubkey: (m.pubkey as PublicKey).toBase58(),
              isSigner: m.isSigner as boolean,
              isWritable: m.isWritable as boolean,
            })),
          });
        } catch {
          // Skip malformed or unknown accounts.
        }
      }

      return results;
    },
  });

  const { data: isAdmin = false } = useQuery({
    queryKey: ['solana-is-admin', majInstancePda, publicKey?.toBase58()],
    enabled: !!program && !!majPubkey && !!publicKey,
    staleTime: 30_000,
    queryFn: async () => {
      const [adminRecordPda] = findAdminRecordPda(publicKey!, majPubkey!);
      const info = await solanaConnection.getAccountInfo(adminRecordPda);
      return info !== null;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['solana-maj-instance', majInstancePda] });
    queryClient.invalidateQueries({ queryKey: ['solana-maj-transactions', majInstancePda] });
  };

  const { mutateAsync: proposeTransaction } = useMutation({
    mutationFn: async ({
      to,
      data,
      lamports = 0,
      targetProgramId,
      accountMetas = [],
    }: {
      to: string;
      data: Uint8Array;
      lamports?: number;
      targetProgramId?: string;
      accountMetas?: SerializedAccountMeta[];
    }) => {
      if (!program || !publicKey || !majPubkey) throw new Error('Wallet not connected');

      const currentTxCount = BigInt(txCount);
      const [txPda] = findMajTransactionPda(majPubkey, currentTxCount);

      await (program as any).methods
        .proposeTransaction(
          new PublicKey(to),
          new BN(lamports),
          Buffer.from(data),
          targetProgramId ? new PublicKey(targetProgramId) : null,
          accountMetas.map(m => ({
            pubkey: new PublicKey(m.pubkey),
            isSigner: m.isSigner,
            isWritable: m.isWritable,
          }))
        )
        .accounts({
          majInstance: majPubkey,
          majTransaction: txPda,
          proposer: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: invalidate,
  });

  const { mutateAsync: signTransaction } = useMutation({
    mutationFn: async (txIndex: number) => {
      if (!program || !publicKey || !majPubkey) throw new Error('Wallet not connected');
      const [txPda] = findMajTransactionPda(majPubkey, BigInt(txIndex));
      const [sigRecordPda] = findSignatureRecordPda(txPda, publicKey);
      const [adminRecordPda] = findAdminRecordPda(publicKey, majPubkey);
      await (program as any).methods
        .signTransaction()
        .accounts({
          majInstance: majPubkey,
          majTransaction: txPda,
          signatureRecord: sigRecordPda,
          adminRecord: adminRecordPda,
          admin: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: invalidate,
  });

  const { mutateAsync: cancelTransaction } = useMutation({
    mutationFn: async (txIndex: number) => {
      if (!program || !publicKey || !majPubkey) throw new Error('Wallet not connected');
      const [txPda] = findMajTransactionPda(majPubkey, BigInt(txIndex));
      const [adminRecordPda] = findAdminRecordPda(publicKey, majPubkey);
      await (program as any).methods
        .cancelTransaction()
        .accounts({
          majInstance: majPubkey,
          majTransaction: txPda,
          adminRecord: adminRecordPda,
          proposer: publicKey,
        })
        .rpc();
    },
    onSuccess: invalidate,
  });

  const { mutateAsync: revokeSignature } = useMutation({
    mutationFn: async (txIndex: number) => {
      if (!program || !publicKey || !majPubkey) throw new Error('Wallet not connected');
      const [txPda] = findMajTransactionPda(majPubkey, BigInt(txIndex));
      const [sigRecordPda] = findSignatureRecordPda(txPda, publicKey);
      const [adminRecordPda] = findAdminRecordPda(publicKey, majPubkey);
      await (program as any).methods
        .revokeSignature()
        .accounts({
          majInstance: majPubkey,
          majTransaction: txPda,
          signatureRecord: sigRecordPda,
          adminRecord: adminRecordPda,
          admin: publicKey,
        })
        .rpc();
    },
    onSuccess: invalidate,
  });

  const { mutateAsync: executeTransaction } = useMutation({
    mutationFn: async ({
      txIndex,
      remainingAccounts,
    }: {
      txIndex: number;
      remainingAccounts: { pubkey: PublicKey; isWritable: boolean; isSigner: boolean }[];
    }) => {
      if (!program || !publicKey || !majPubkey) throw new Error('Wallet not connected');
      const [txPda] = findMajTransactionPda(majPubkey, BigInt(txIndex));
      const [adminRecordPda] = findAdminRecordPda(publicKey, majPubkey);
      await (program as any).methods
        .executeTransaction()
        .accounts({
          majInstance: majPubkey,
          majTransaction: txPda,
          adminRecord: adminRecordPda,
          admin: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .remainingAccounts(remainingAccounts)
        .rpc();
    },
    onSuccess: invalidate,
  });

  const addAdmin = async (newAdmin: string) => {
    if (!program || !publicKey || !majPubkey) throw new Error('Wallet not connected');
    const newAdminPubkey = new PublicKey(newAdmin);
    const [newAdminRecordPda] = findAdminRecordPda(newAdminPubkey, majPubkey);
    const encoded = program.coder.instruction.encode('addAdmin', {
      new_admin: newAdminPubkey,
    });

    await proposeTransaction({
      to: majPubkey.toBase58(),
      data: encoded,
      lamports: 0,
      targetProgramId: MAJ_PROGRAM_ID.toBase58(),
      accountMetas: [
        { pubkey: majPubkey.toBase58(), isSigner: true, isWritable: true },
        { pubkey: newAdminRecordPda.toBase58(), isSigner: false, isWritable: true },
        { pubkey: publicKey.toBase58(), isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId.toBase58(), isSigner: false, isWritable: false },
      ],
    });
  };

  const removeAdmin = async (adminToRemove: string) => {
    if (!program || !publicKey || !majPubkey) throw new Error('Wallet not connected');
    const adminPubkey = new PublicKey(adminToRemove);
    const [adminRecordPda] = findAdminRecordPda(adminPubkey, majPubkey);
    const encoded = program.coder.instruction.encode('removeAdmin', {
      admin_to_remove: adminPubkey,
    });

    await proposeTransaction({
      to: majPubkey.toBase58(),
      data: encoded,
      lamports: 0,
      targetProgramId: MAJ_PROGRAM_ID.toBase58(),
      accountMetas: [
        { pubkey: majPubkey.toBase58(), isSigner: true, isWritable: true },
        { pubkey: adminRecordPda.toBase58(), isSigner: false, isWritable: true },
        { pubkey: publicKey.toBase58(), isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId.toBase58(), isSigner: false, isWritable: false },
      ],
    });
  };

  const blacklistAddress = async (target: string) => {
    if (!program || !publicKey || !majPubkey) throw new Error('Wallet not connected');
    const targetPubkey = new PublicKey(target);
    const [blacklistRecordPda] = findBlacklistRecordPda(majPubkey, targetPubkey);
    const encoded = program.coder.instruction.encode('addBlacklist', { target: targetPubkey });

    await proposeTransaction({
      to: majPubkey.toBase58(),
      data: encoded,
      lamports: 0,
      targetProgramId: MAJ_PROGRAM_ID.toBase58(),
      accountMetas: [
        { pubkey: majPubkey.toBase58(), isSigner: true, isWritable: true },
        { pubkey: blacklistRecordPda.toBase58(), isSigner: false, isWritable: true },
        { pubkey: publicKey.toBase58(), isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId.toBase58(), isSigner: false, isWritable: false },
      ],
    });
  };

  const whitelistAddress = async (target: string) => {
    if (!program || !publicKey || !majPubkey) throw new Error('Wallet not connected');
    const targetPubkey = new PublicKey(target);
    const [blacklistRecordPda] = findBlacklistRecordPda(majPubkey, targetPubkey);
    const encoded = program.coder.instruction.encode('removeBlacklist', { target: targetPubkey });

    await proposeTransaction({
      to: majPubkey.toBase58(),
      data: encoded,
      lamports: 0,
      targetProgramId: MAJ_PROGRAM_ID.toBase58(),
      accountMetas: [
        { pubkey: majPubkey.toBase58(), isSigner: false, isWritable: false },
        { pubkey: blacklistRecordPda.toBase58(), isSigner: false, isWritable: true },
        { pubkey: publicKey.toBase58(), isSigner: true, isWritable: true },
      ],
    });
  };

  const changeSigsRequired = async (n: number) => {
    if (!program || !publicKey || !majPubkey) throw new Error('Wallet not connected');
    const encoded = program.coder.instruction.encode('changeSigsRequired', {
      new_sigs_required: new BN(n),
    });

    await proposeTransaction({
      to: majPubkey.toBase58(),
      data: encoded,
      lamports: 0,
      targetProgramId: MAJ_PROGRAM_ID.toBase58(),
      accountMetas: [{ pubkey: majPubkey.toBase58(), isSigner: true, isWritable: true }],
    });
  };

  return {
    transactions,
    admins,
    signaturesRequired,
    txCount,
    isAdmin,
    isLoading: isLoadingMaj || isLoadingTxs,
    proposeTransaction,
    signTransaction,
    cancelTransaction,
    revokeSignature,
    executeTransaction,
    addAdmin,
    removeAdmin,
    blacklistAddress,
    whitelistAddress,
    changeSigsRequired,
  };
}
