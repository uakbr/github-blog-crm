import '@testing-library/jest-dom/extend-expect';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/posts', (req, res, ctx) => {
    return res(ctx.json({ posts: [] }));
  }),
  rest.get('/api/metadata', (req, res, ctx) => {
    return res(ctx.json({ metadata: {} }));
  })
];

export const server = setupServer(...handlers);

// Setup API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that are declared during the tests.
afterEach(() => server.resetHandlers());

// Clean up after all tests are finished.
afterAll(() => server.close());
