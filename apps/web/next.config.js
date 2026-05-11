const { withSentryConfig } = require('@sentry/nextjs');
const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@phi-pro/shared'],
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
    serverComponentsExternalPackages: ['onnxruntime-node', 'sharp'],
  },
  webpack: (config, { isServer }) => {
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
      // Exclude native Node.js modules that @xenova/transformers pulls in server-side
      // Browser builds use onnxruntime-web (WASM) — onnxruntime-node is server-only
      config.resolve.alias = {
        ...config.resolve.alias,
        'sharp$': false,
        'onnxruntime-node$': false,
      };
    }

    // Prevent webpack from trying to parse native .node binary files
    // (onnxruntime-node ships darwin/linux/win binaries; browser uses WASM instead)
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /onnxruntime_binding\.node$/ })
    );

    // Give lazy-compiled chunks 5 min to appear on first dev load (avoids false timeout)
    config.output = { ...config.output, chunkLoadTimeout: 300000 };

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
