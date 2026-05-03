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
  webpack: (config, { isServer, dev }) => {
    // Stabilize module IDs in dev — prevents HMR-induced options.factory undefined errors
    if (dev && !isServer) {
      config.optimization.moduleIds = 'named';
    }

    // Browser-only packages: stub Node.js built-ins mqtt uses
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        readline: false,
        child_process: false,
      };
    }

    // Enable async WASM for @xenova/transformers (onnxruntime-web)
    config.experiments = { ...config.experiments, asyncWebAssembly: true, layers: true };

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
  // Disable Sentry webpack instrumentation in dev — prevents module factory corruption
  disableClientWebpackPlugin: process.env.NODE_ENV !== 'production',
  disableServerWebpackPlugin: process.env.NODE_ENV !== 'production',
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: true,
  },
});
