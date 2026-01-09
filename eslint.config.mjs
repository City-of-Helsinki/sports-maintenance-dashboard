import js from '@eslint/js';
import react from 'eslint-plugin-react';
import babelParser from '@babel/eslint-parser';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}', 'test/**/*.{js,jsx}'],
    plugins: {
      react,
    },
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
        requireConfigFile: false,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'comma-dangle': 'warn',
      'quotes': ['warn', 'single'],
      'no-undef': 'warn',
      'no-extra-semi': 'warn',
      'no-console': 'off',
      'no-unused-vars': 'warn',
      'no-trailing-spaces': ['warn', { 'skipBlankLines': true }],
      'no-unreachable': 'warn',
      'no-alert': 'off',
      'react/jsx-uses-react': 'warn',
      'react/jsx-uses-vars': 'warn',
      'indent': ['error', 2, { 'SwitchCase': 1 }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}', 'test/**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint,
      react,
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      // Base ESLint rules
      'comma-dangle': 'warn',
      'quotes': ['warn', 'single'],
      'no-undef': 'warn',
      'no-extra-semi': 'warn',
      'no-console': 'off',
      'no-trailing-spaces': ['warn', { 'skipBlankLines': true }],
      'no-unreachable': 'warn',
      'no-alert': 'off',
      'react/jsx-uses-react': 'warn',
      'react/jsx-uses-vars': 'warn',
      'indent': ['error', 2, { 'SwitchCase': 1 }],
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-unused-vars': 'off', // Turn off base rule as it conflicts with @typescript-eslint version
    },
  },
];