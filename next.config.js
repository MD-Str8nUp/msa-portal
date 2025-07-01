/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Exclude server directory from client-side bundle
    config.module.rules.push({
      test: /server\/.*\.(ts|js)$/,
      loader: 'ignore-loader',
    });
    
    // Ignore server files completely
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push('/server/socketServer.ts');
    }
    
    return config;
  },
  // Exclude server directory from build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  serverExternalPackages: ['socket.io'],
};

module.exports = nextConfig;
