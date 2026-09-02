import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Sem isso o Turbopack sobe um nível procurando lockfile e acha um
  // package-lock.json de fora do repositório.
  turbopack: {
    root: import.meta.dirname,
  },
  typedRoutes: true,
}

export default nextConfig
