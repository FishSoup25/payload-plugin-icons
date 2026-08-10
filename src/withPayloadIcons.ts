import type { NextConfig } from 'next'

// Next optimizes lucide-react by default and rejects it in serverExternalPackages.
// Its adapter uses Node createRequire directly, so it still stays outside the graph.
const BUILT_IN_PACKAGES = ['@phosphor-icons/react']

/** Keep provider packages as native Node dependencies in Next.js server builds. */
export function withPayloadIcons(nextConfig: NextConfig = {}, packageNames: string[] = []): NextConfig {
  return {
    ...nextConfig,
    serverExternalPackages: [...new Set([
      ...(nextConfig.serverExternalPackages ?? []),
      ...BUILT_IN_PACKAGES,
      ...packageNames,
    ])],
  }
}
