import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/test-results.json' }]
  ],
  use: {
    baseURL: 'https://github.com/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.NODE_ENV === 'development' ? 'on' : 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Show browser in development
        headless: process.env.NODE_ENV !== 'development'
      },
    },
  ],
  // Create artifacts directory
  outputDir: 'test-artifacts',
}); 