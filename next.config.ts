/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '/16x12/**',
      },
    ],
  },
  // Configuração do servidor (opcional - melhor usar package.json ou .env)
  serverRuntimeConfig: {
    port: 3000,
  },
  // Configuração para API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*',
      },
    ];
  },
};

export default nextConfig;