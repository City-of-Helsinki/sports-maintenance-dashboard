import js from '@eslint/js';
import react from 'eslint-plugin-react';
import babelParser from '@babel/eslint-parser';

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
        expect: 'readonly',
      },
    },
    rules: {
      'quotes': ['warn', 'single'],
      'no-console': 'off',
      'no-alert': 'off',
      'react/jsx-uses-react': 'warn',
      'react/jsx-uses-vars': 'warn',
    },
  },
];