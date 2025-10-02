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
  
  // Configurações de segurança para TypeScript e ESLint
  typescript: {
    ignoreBuildErrors: false, // IMPORTANTE: Nunca ignore erros em produção
  },
  eslint: {
    ignoreDuringBuilds: false, // IMPORTANTE: Nunca ignore warnings em produção
  },
  // Headers de segurança para proteger a aplicação
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.gstatic.com https://api.mapbox.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net https://api.mapbox.com https://*.mapbox.com https://events.mapbox.com https://*.tile.openstreetmap.org; worker-src 'self' blob:; child-src 'self' blob:; frame-src 'self' https://accounts.google.com;"
        }
      ],
    },
  ],
  
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
