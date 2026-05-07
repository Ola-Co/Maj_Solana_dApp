interface SerializedAccountMeta {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
}

interface SolanaTransaction {
  txIndex: number;
  to: string;
  value: bigint;
  data: Uint8Array;
  proposedBy: string;
  active: boolean;
  executed: boolean;
  numSignatures: number;
  programId: string | null;
  accountMetas: SerializedAccountMeta[];
}

interface TransactionEntry {
  txIndex: number;
  to: string;
  value: bigint;
  data: Uint8Array;
  proposedBy: string;
  active: boolean;
  executed: boolean;
  numSignatures: number;
  programId?: string | null;
  accountMetas?: SerializedAccountMeta[];
}

interface TokenEntry {
  address: string;
  abiType: string;
}
