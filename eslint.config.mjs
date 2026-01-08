import js from '@eslint/js';
import react from 'eslint-plugin-react';
import babelParser from '@babel/eslint-parser';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

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
        // Node.js environment
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Browser environment 
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        // Test environment
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
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
        // Node.js environment
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Browser environment 
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        HTMLElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLFormElement: 'readonly',
        // Test environment
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
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