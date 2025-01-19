import { AnalyzerConfig, TestSuiteConfig } from '../models/types';

export const analyzerConfig: AnalyzerConfig = {
  crawlDepth: 2,
  excludePatterns: ['/api/', '/static/', '/assets/'],
  elementTypes: ['button', 'input', 'select', 'a', 'form'],
  priorityRules: {
    high: ['login', 'checkout', 'payment', 'submit', 'register'],
    medium: ['search', 'filter', 'sort', 'navigation'],
    low: ['footer-links', 'social-media', 'optional-fields']
  }
};

export const testConfig: TestSuiteConfig = {
  baseUrl: 'https://github.com/',
  timeout: 30000,
  retries: 2,
  parallel: true,
  browser: 'chromium'
}; 