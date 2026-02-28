/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'next/typescript'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // TypeScript
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-as-const': 'error',

    // React
    'react/no-unescaped-entities': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-no-target-blank': 'error',

    // Next.js
    '@next/next/no-img-element': 'warn',

    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'dist/',
    'coverage/',
    '*.config.js',
    '*.config.mjs',
  ],
};
