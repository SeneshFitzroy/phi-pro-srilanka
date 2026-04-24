const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@phi-pro/shared'],
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  webpack: (config) => {
    config.resolve.plugins = config.resolve.plugins || [];
    config.resolve.plugins.push({
      apply(resolver) {
        resolver.hooks.result.tap('NormalizeWindowsDriveLetter', (result) => {
          if (result && result.path && /^[a-z]:/.test(result.path)) {
            result.path = result.path.charAt(0).toUpperCase() + result.path.slice(1);
          }
          return result;
        });
      },
    });
    return config;
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: 'university-of-plymouth-lo',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
