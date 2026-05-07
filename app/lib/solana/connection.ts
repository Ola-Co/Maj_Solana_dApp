import { Connection, clusterApiUrl } from '@solana/web3.js';

const network =
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK as 'devnet' | 'mainnet-beta') ?? 'devnet';

const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl(network);

export const solanaConnection = new Connection(rpcUrl, 'confirmed');
