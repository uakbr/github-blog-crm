import '@testing-library/jest-dom/extend-expect';
import { server } from './server';

// Setup API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that are declared during the tests.
afterEach(() => server.resetHandlers());

// Clean up after all tests are finished.
afterAll(() => server.close());
