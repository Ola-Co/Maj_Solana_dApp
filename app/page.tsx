import MajFactory from '@/app/components/MajFactory';

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <section className="mb-6">
        <h1 className="text-3xl font-semibold text-white">Maj Solana Multisig</h1>
        <p className="mt-2 max-w-3xl text-slate-300">
          Hackathon MVP for creating and managing Maj multisigs on Solana devnet, with unified
          chain architecture ready for EVM expansion.
        </p>
      </section>
      <MajFactory />
    </main>
  );
}
