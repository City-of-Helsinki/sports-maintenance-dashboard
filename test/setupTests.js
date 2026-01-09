import 'core-js/stable';
import '@testing-library/jest-dom';

// Set up environment variables for testing
process.env.API_URL = 'https://test-api.example.com/api';

// Set timezone to ensure consistent test results across environments
process.env.TZ = 'Europe/Helsinki';