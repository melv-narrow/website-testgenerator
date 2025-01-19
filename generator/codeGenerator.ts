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
    const steps = testCase.steps.map(step => this.generateTestStep(step)).join('\n      ');
    const testType = this.getTestType(testCase.name);
    
    return `import { test, expect } from '@playwright/test';

/**
 * ${testType}
 * Target: ${testCase.name}
 * Elements tested:
 * ${testCase.steps.map(step => ` * - ${step.selector}: ${step.expectedResult}`).join('\n')}
 */
test.describe('${testType}', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // Enable debug mode in development
  test.beforeEach(async ({ page }) => {
    if (process.env.NODE_ENV === 'development') {
      // Highlight elements being tested
      await page.addStyleTag({
        content: '[data-testid] { outline: 2px solid red !important; }'
      });
      // Slow down test execution for visual debugging
      await page.setDefaultTimeout(2000);
    }
  });

  test('${testCase.name}', async ({ page }) => {
    // Take screenshot before test
    if (process.env.NODE_ENV === 'development') {
      await page.screenshot({ path: 'test-artifacts/before-${testCase.name}.png' });
    }

    ${steps}

    // Take screenshot after test
    if (process.env.NODE_ENV === 'development') {
      await page.screenshot({ path: 'test-artifacts/after-${testCase.name}.png' });
    }
  });
});`;
  }

  private getTestType(testName: string): string {
    if (testName.includes('accessibility')) return 'Accessibility Tests';
    if (testName.includes('form-validation')) return 'Form Validation Tests';
    if (testName.includes('interaction')) return 'Interaction Tests';
    if (testName.includes('performance')) return 'Performance Tests';
    return 'Tests';
  }

  private generateTestStep(step: TestStep): string {
    const locator = this.getPlaywrightLocator(step.selector);
    
    switch (step.action) {
      case 'click':
        return `const element = ${locator};
      await expect(element).toBeVisible();
      const beforeState = await element.evaluate(el => ({
        text: el.textContent?.trim(),
        classes: el.className,
        attributes: Object.fromEntries([...el.attributes].map(a => [a.name, a.value]))
      }));
      
      await element.click();
      
      // Verify element responded to interaction
      const afterState = await element.evaluate(el => ({
        text: el.textContent?.trim(),
        classes: el.className,
        attributes: Object.fromEntries([...el.attributes].map(a => [a.name, a.value]))
      }));
      expect(afterState).not.toEqual(beforeState); // ${step.expectedResult}`;
      
      case 'input':
        if (step.data) {
          return `const element = ${locator};
      await expect(element).toBeVisible();
      
      // Test with valid input
      await element.fill('${step.data.validInput}');
      await expect(element).toHaveValue('${step.data.validInput}');
      await expect(element).not.toHaveAttribute('aria-invalid', 'true');
      
      // Test with invalid input
      await element.fill('${step.data.invalidInput}');
      await expect(element).toHaveValue('${step.data.invalidInput}');
      await element.press('Tab');
      await expect(element).toHaveAttribute('aria-invalid', 'true');`;
        }
        return `await ${locator}.fill('test');`;
      
      case 'verify':
        const checks = [];
        if (step.expectedResult.includes('ARIA')) {
          checks.push(`const ariaElement = ${locator};
      await expect(ariaElement).toBeVisible();
      
      // Verify ARIA attributes
      const ariaAttrs = await ariaElement.evaluate(el => {
        const attrs: Record<string, string> = {};
        for (const attr of el.attributes) {
          if (attr.name.startsWith('aria-')) {
            attrs[attr.name] = attr.value;
          }
        }
        return attrs;
      });
      expect(Object.keys(ariaAttrs).length).toBeGreaterThan(0);
      
      // Verify role
      await expect(ariaElement).toHaveAttribute('role');`);
        }
        if (step.expectedResult.includes('contrast')) {
          checks.push(`const contrastElement = ${locator};
      await expect(contrastElement).toBeVisible();
      
      // Check color contrast using axe-core
      const violations = await page.evaluate(async selector => {
        // @ts-ignore
        const axe = await import('axe-core');
        const results = await axe.run(document.querySelector(selector));
        return results.violations.filter(v => v.id === 'color-contrast');
      }, contrastElement);
      expect(violations.length).toBe(0);`);
        }
        return checks.join('\n\n      ');
      
      case 'measure':
        if (step.data?.metrics) {
          return `// Measure performance metrics
      const metrics = await page.evaluate(() => ({
        navigationStart: performance.timing.navigationStart,
        loadEventEnd: performance.timing.loadEventEnd,
        domContentLoaded: performance.timing.domContentLoadedEventEnd,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
      }));
      
      expect(metrics.loadEventEnd - metrics.navigationStart).toBeLessThan(3000);
      expect(metrics.domContentLoaded - metrics.navigationStart).toBeLessThan(1500);
      expect(metrics.firstPaint).toBeLessThan(1000);`;
        }
        return `// ${step.expectedResult}`;
      
      default:
        return `// Unsupported action: ${step.action}
      // ${step.expectedResult}`;
    }
  }

  private getPlaywrightLocator(selector: string): string {
    // Convert CSS selectors to Playwright's recommended locators
    if (selector.startsWith('#')) {
      return `page.getByTestId('${selector.slice(1)}')`;
    }
    
    if (selector === 'a') {
      return `page.getByRole('link')`;
    }
    
    if (selector === 'button') {
      return `page.getByRole('button')`;
    }
    
    if (selector === 'input') {
      return `page.getByRole('textbox')`;
    }

    // For other selectors, try to use semantic locators
    if (selector.includes('btn') || selector.includes('button')) {
      return `page.getByRole('button', { name: /${selector}/ })`;
    }
    
    if (selector.includes('link')) {
      return `page.getByRole('link', { name: /${selector}/ })`;
    }
    
    if (selector.includes('input') || selector.includes('field')) {
      return `page.getByRole('textbox', { name: /${selector}/ })`;
    }

    // Fallback to locator but with a warning comment
    return `page.locator('${selector}') /* TODO: Use a better locator */`;
  }

  private sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
} 