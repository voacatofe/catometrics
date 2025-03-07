/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  env: {
    APP_NAME: 'CatoMetrics',
  },
  onDemandEntries: {
    // Controla quanto tempo as páginas em memoria
    maxInactiveAge: 15 * 1000,
    // Máximo de páginas em cache
    pagesBufferLength: 2,
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  experimental: {
    // Reduzir uso de memória
    optimizeCss: true,
    scrollRestoration: true,
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  logging: {
    // Adicionar mais logs para debugging
    level: 'verbose',
    fetches: {
      fullUrl: true,
    },
  },
  // Ignorar erros TypeScript durante o build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 