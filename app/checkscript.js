// import { Connection, PublicKey } from "@solana/web3.js";

// const programId = new PublicKey("AniZZs2U4KyhMkUTFJ7S8hQagrLLhZN2WbXDVLLJ7TRx");
// const [registryPda] = PublicKey.findProgramAddressSync(
//   [Buffer.from("maj_registry")],
//   programId
// );

// const conn = new Connection("https://api.devnet.solana.com", "confirmed");
// const info = await conn.getAccountInfo(registryPda);

// console.log("registryPda:", registryPda.toBase58());
// console.log("exists:", !!info);
// console.log("owner:", info?.owner.toBase58());
// console.log("lamports:", info?.lamports);
// console.log("space:", info?.data.length);

// const [registryPda] = PublicKey.findProgramAddressSync(
//   [Buffer.from("maj_registry")],
//   programId
// );
// const registryInfo = await connection.getAccountInfo(registryPda);

import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey("AniZZs2U4KyhMkUTFJ7S8hQagrLLhZN2WbXDVLLJ7TRx");

const [registryPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("maj_registry")],
  programId
);

// Check if already initialized
const registryInfo = await connection.getAccountInfo(registryPda);
if (!registryInfo) {
  await program.methods
    .initializeRegistry()
    .accounts({
      registry: registryPda,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}