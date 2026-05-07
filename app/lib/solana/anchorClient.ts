/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnchorProvider, Program, type Idl } from '@coral-xyz/anchor';
import {
  type Connection,
  PublicKey,
  type Transaction,
  type VersionedTransaction,
} from '@solana/web3.js';

export interface SolanaWalletAdapter {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>;
}

export function getAnchorProgram<T extends Idl>(
  idl: T,
  programId: PublicKey,
  wallet: SolanaWalletAdapter,
  connection: Connection
): Program<T> {
  void programId;
  const provider = new AnchorProvider(connection, wallet as any, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  });

  return new Program<T>(idl as any, provider as any);
}
