/** Returns true for a valid EVM hex address (0x + 40 hex chars). */
export const isEvmAddress = (addr: string): boolean => /^0x[0-9a-fA-F]{40}$/.test(addr);

/** Returns true for a base58 Solana public key (32-44 chars, not a 0x address). */
export const isSolanaAddress = (addr: string): boolean =>
  !isEvmAddress(addr) && addr.length >= 32 && addr.length <= 44;
