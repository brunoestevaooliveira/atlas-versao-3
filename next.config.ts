import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Necessário para build standalone no Docker
  output: 'standalone',
  
  // Otimizações de performance
  reactStrictMode: true,
  
  // Otimização de compilação
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', 'date-fns'],
  },
  
  // Turbopack configuration (estável no Next 15)
  turbopack: {
    resolveAlias: {
      '@/*': './src/*',
    },
  },
  
  // Compressão
  compress: true,
  
  // Otimização de produção
  productionBrowserSourceMaps: false,
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'a.tile.openstreetmap.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'b.tile.openstreetmap.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'c.tile.openstreetmap.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.mapbox.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
