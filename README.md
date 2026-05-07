# Maj Solana 

Development Frontend for Maj multisig contracts on Solana devnet.


For this app backend is written in Solana Rust - https://github.com/Ola-Co/Maj_Core_Solana

This is the link to live site: https://maj.olaco.xyz/

## Features

- Dynamic wallet connect integration with Solana connector setup
- Chain toggle UI and chain-aware address validation
- Solana Maj factory hook (create + list multisigs)
- Solana Maj details hook (admins, signatures, transactions)
- SPL token factory integration stub for future deployment

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create environment file from the example:

```bash
cp .env.example .env.local
```

3. Fill at minimum:

- `NEXT_PUBLIC_DYNAMICENVID`
- `NEXT_PUBLIC_SOLANA_RPC_URL`
- `NEXT_PUBLIC_SOLANA_NETWORK`
- `NEXT_PUBLIC_MAJ_PROGRAM_ID`

4. Run dev server:

```bash
npm run dev
```

5. Type/lint checks:

```bash
npx tsc --noEmit
npm run lint
```

6. Production build:

```bash
npm run build
```

