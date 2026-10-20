import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Written with node:test by another session; not a vitest suite.
    exclude: ['**/node_modules/**', 'src/utils/calculations.test.ts'],
  },
});
