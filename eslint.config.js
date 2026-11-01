import js from '@eslint/js';
import globals from 'globals';
import eslintReact from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['dist', 'dist-ssr', 'node_modules', 'playwright-report', 'test-results', 'lighthouse'] },
  js.configs.recommended,
  { files: ['**/*.{js,jsx}'], ...eslintReact.configs.recommended },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { 'react-x': { version: '18.3' } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Index keys are only used on static, never-reordered content arrays;
      // effects that set state read window/scroll position on mount.
      '@eslint-react/no-array-index-key': 'off',
      '@eslint-react/set-state-in-effect': 'off',
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['scripts/**/*.mjs', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // Runs in Node but passes callbacks to page.evaluate(), which execute in the browser
    files: ['scripts/live-audit.mjs'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ['src/test/**'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    // Playwright fixtures receive a `use` callback that is not React's `use` hook
    files: ['e2e/**'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: { 'react-hooks/rules-of-hooks': 'off', '@eslint-react/rules-of-hooks': 'off' },
  },
];
