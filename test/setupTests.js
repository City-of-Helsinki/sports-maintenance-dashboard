import { TextEncoder, TextDecoder } from 'util';

// jsdom does not provide these globals, but react-router requires them
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

import 'core-js/stable';
import '@testing-library/jest-dom';

// Set up environment variables for testing
process.env.API_URL = 'https://test-api.example.com/api';

// Set timezone to ensure consistent test results across environments
process.env.TZ = 'Europe/Helsinki';