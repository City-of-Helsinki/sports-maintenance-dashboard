/* eslint-disable no-undef */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.js'],
  testMatch: [
    '<rootDir>/{test,src}/**/__tests__/*.test.{js,jsx,ts,tsx}'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { presets: ['@babel/preset-typescript'] }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^actions/(.*)$': '<rootDir>/src/actions/$1',
    '^sources/(.*)$': '<rootDir>/src/sources/$1',
    '^stores/(.*)$': '<rootDir>/src/stores/$1',
    '^styles/(.*)\\.(css|scss)$': 'identity-obj-proxy',
    '^styles/(.*)$': '<rootDir>/src/styles/$1',
    '^config$': '<rootDir>/src/config/test',
    '\\.(css|scss)$': 'identity-obj-proxy',
    'normalize.css/normalize.css': 'identity-obj-proxy'
  },
  moduleDirectories: ['node_modules', 'src'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/index.js',
    '!src/config/**',
    '!src/**/types.ts',
    '!src/**/mock_groups.js',
  ],
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transformIgnorePatterns: [
    'node_modules/(?!(redux-actions|@babel|bootstrap-sass)/)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ]
};