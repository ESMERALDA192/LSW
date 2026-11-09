import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      { test: { name: 'node', environment: 'node', include: ['apps/api-*/**/*.test.js', 'packages/**/*.test.js', 'scripts/**/*.test.js'], testTimeout: 20000, hookTimeout: 20000 } },
      { test: { name: 'web', environment: 'jsdom', include: ['apps/web/**/*.test.{js,jsx}'] } },
    ],
  },
});
