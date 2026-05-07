import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      '@dynamic-labs/sdk-react-core',
      '@dynamic-labs/solana',
      '@dynamic-labs/ethereum',
      '@solana/web3.js',
      '@coral-xyz/anchor',
    ],
  },
};

export default nextConfig;
