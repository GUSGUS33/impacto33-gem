import { defineConfig, globalIgnores } from 'eslint/config';
import nextConfig from 'eslint-config-next';

export default defineConfig([
  ...nextConfig,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'off',
      // React 19's compiler-oriented rules expose legacy patterns that require
      // dedicated refactors. Keep the migration behavior-neutral and address
      // them separately instead of changing dozens of components at once.
      'react-hooks/error-boundaries': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    '.pnpm-store/**',
    '.builder-reviews/**',
    'build/**',
    'coverage/**',
    'dist/**',
    'node_modules/**',
  ]),
]);
