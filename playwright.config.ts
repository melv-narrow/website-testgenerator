import { PlaywrightTestConfig } from '@playwright/test';
import { testConfig } from './config/analyzer.config';

const config: PlaywrightTestConfig = {
  testDir: './tests/generated',
  timeout: testConfig.timeout,
  retries: testConfig.retries,
  workers: testConfig.parallel ? undefined : 1,
  use: {
    baseURL: testConfig.baseUrl,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: testConfig.browser,
      use: { browserName: testConfig.browser },
    },
  ],
  reporter: [
    ['html'],
    ['list']
  ],
};

export default config; 