import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep local development from recreating generated agent instruction files.
  agentRules: false,
  // Keep tracing anchored to this repository; the host has an unrelated
  // parent package-lock.json that Next.js would otherwise treat as the root.
  outputFileTracingRoot: process.cwd(),
  experimental: {
    // Next 16's CLI checker cannot parse this workspace's `tsc --showConfig`
    // output. The compiler API performs the same production type check.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
