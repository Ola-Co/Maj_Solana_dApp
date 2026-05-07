'use client';

interface Props {
  factories: { name: string }[];
  deployedTokens: Record<string, TokenEntry[]>;
  tokenMetadataMap: Record<string, { name: string; symbol: string }>;
}

export default function DeployedTokensTable({
  factories,
  deployedTokens,
  tokenMetadataMap,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <h3 className="text-lg font-semibold text-white">Deployed Tokens</h3>
      <p className="mt-1 text-sm text-slate-400">SPL Token factory integration is currently in stub mode.</p>

      <div className="mt-4 space-y-4">
        {factories.length === 0 && <p className="text-sm text-slate-400">No token factories configured.</p>}
        {factories.map(factory => {
          const tokens = deployedTokens[factory.name] ?? [];
          return (
            <div key={factory.name}>
              <h4 className="text-sm font-medium text-slate-300">{factory.name}</h4>
              {tokens.length === 0 ? (
                <p className="mt-1 text-sm text-slate-500">No tokens found.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {tokens.map(token => {
                    const metadata = tokenMetadataMap[token.address];
                    return (
                      <li key={token.address} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                        <p className="truncate text-sm text-white">{token.address}</p>
                        {metadata && (
                          <p className="mt-1 text-xs text-slate-400">
                            {metadata.name} ({metadata.symbol})
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
