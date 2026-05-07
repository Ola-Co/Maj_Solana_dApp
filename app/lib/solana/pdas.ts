import { PublicKey } from '@solana/web3.js';

export const MAJ_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_MAJ_PROGRAM_ID ?? 'AniZZs2U4KyhMkUTFJ7S8hQagrLLhZN2WbXDVLLJ7TRx'
);

export function findRegistryPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('maj_registry')], MAJ_PROGRAM_ID);
}

export function findNameRecordPda(name: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('maj_name'), Buffer.from(name)],
    MAJ_PROGRAM_ID
  );
}

export function findMajInstancePda(name: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('maj_instance'), Buffer.from(name)],
    MAJ_PROGRAM_ID
  );
}

export function findAdminRecordPda(
  adminPubkey: PublicKey,
  majInstancePda: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('admin_record'), adminPubkey.toBuffer(), majInstancePda.toBuffer()],
    MAJ_PROGRAM_ID
  );
}

export function findBlacklistRecordPda(
  majInstancePda: PublicKey,
  targetPubkey: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('blacklist'), majInstancePda.toBuffer(), targetPubkey.toBuffer()],
    MAJ_PROGRAM_ID
  );
}

export function findMajTransactionPda(
  majInstancePda: PublicKey,
  txIndex: bigint
): [PublicKey, number] {
  const indexBuf = Buffer.alloc(8);
  indexBuf.writeBigUInt64LE(txIndex);

  return PublicKey.findProgramAddressSync(
    [Buffer.from('maj_tx'), majInstancePda.toBuffer(), indexBuf],
    MAJ_PROGRAM_ID
  );
}

export function findSignatureRecordPda(
  majTxPda: PublicKey,
  adminPubkey: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('sig'), majTxPda.toBuffer(), adminPubkey.toBuffer()],
    MAJ_PROGRAM_ID
  );
}
