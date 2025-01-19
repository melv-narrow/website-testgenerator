import { TestCase, TestStep } from '../models/types';

export class TestCodeGenerator {
  private testCases: TestCase[];
  
  constructor(testCases: TestCase[]) {
    this.testCases = testCases;
  }

  generateTestFiles(): Map<string, string> {
    const files = new Map<string, string>();
    
    for (const testCase of this.testCases) {
      const code = this.generatePlaywrightTest(testCase);
      files.set(`${this.sanitizeFileName(testCase.name)}.spec.ts`, code);
    }
    
    return files;
  }

  private generatePlaywrightTest(testCase: TestCase): string {
    const steps = testCase.steps.map(step => this.generateTestStep(step)).join('\n    ');
    
    return `import { test, expect } from '@playwright/test';

describe('${testCase.description}', () => {
  test('${testCase.name}', async ({ page }) => {
    ${steps}
  });
});`;
  }

  private generateTestStep(step: TestStep): string {
    switch (step.action) {
      case 'click':
        return `await page.click('${step.selector}');
    await expect(page.locator('${step.selector}')).toBeTruthy(); // ${step.expectedResult}`;
      
      case 'input':
        if (step.data) {
          return `// Test with valid input
    await page.fill('${step.selector}', '${step.data.validInput}');
    await expect(page.locator('${step.selector}')).toHaveValue('${step.data.validInput}');
    
    // Test with invalid input
    await page.fill('${step.selector}', '${step.data.invalidInput}');
    await expect(page.locator('${step.selector}')).toHaveValue('${step.data.invalidInput}');`;
        }
        return `await page.fill('${step.selector}', 'test');`;
      
      case 'verify':
        return `await expect(page.locator('${step.selector}')).toBeVisible();
    // ${step.expectedResult}`;
      
      case 'measure':
        if (step.data?.metrics) {
          return `// Measure performance metrics
    const metrics = await page.evaluate(() => performance.timing);
    expect(metrics.loadEventEnd - metrics.navigationStart).toBeLessThan(3000); // ${step.expectedResult}`;
        }
        return `// ${step.expectedResult}`;
      
      default:
        return `// Unsupported action: ${step.action}
    // ${step.expectedResult}`;
    }
  }

  private sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
} 