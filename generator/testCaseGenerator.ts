import { ElementMetadata, TestCase, TestStep } from '../models/types';

export class TestCaseGenerator {
  private elementsMap: Map<string, ElementMetadata>;

  constructor(elementsMap: Map<string, ElementMetadata>) {
    this.elementsMap = elementsMap;
  }

  generateTestSuite(): TestCase[] {
    const testCases: TestCase[] = [];
    
    // Generate different types of tests
    testCases.push(...this.generateFunctionalTests());
    testCases.push(...this.generateAccessibilityTests());
    testCases.push(...this.generatePerformanceTests());
    
    return testCases;
  }

  private generateFunctionalTests(): TestCase[] {
    const tests: TestCase[] = [];

    // Generate tests for interactive elements
    for (const [selector, metadata] of this.elementsMap) {
      if (metadata.interactable) {
        tests.push(this.generateInteractionTest(selector, metadata));
      }

      if (metadata.type === 'input' || metadata.type === 'form') {
        tests.push(this.generateFormValidationTest(selector, metadata));
      }
    }

    return tests;
  }

  private generateAccessibilityTests(): TestCase[] {
    const tests: TestCase[] = [];

    for (const [selector, metadata] of this.elementsMap) {
      if (metadata.accessibility) {
        tests.push({
          name: `Accessibility Test - ${selector}`,
          description: `Verify accessibility features for ${metadata.type} element`,
          type: 'accessibility',
          priority: 'high',
          steps: [
            {
              action: 'verify',
              selector,
              expectedResult: 'Element should have proper ARIA attributes',
            },
            {
              action: 'verify',
              selector,
              expectedResult: 'Element should have proper contrast ratio',
            }
          ]
        });
      }
    }

    return tests;
  }

  private generatePerformanceTests(): TestCase[] {
    return [{
      name: 'Page Load Performance Test',
      description: 'Verify page load times and performance metrics',
      type: 'performance',
      priority: 'medium',
      steps: [
        {
          action: 'measure',
          selector: 'document',
          expectedResult: 'Page should load within acceptable time limits',
          data: {
            metrics: ['FCP', 'LCP', 'CLS']
          }
        }
      ]
    }];
  }

  private generateInteractionTest(selector: string, metadata: ElementMetadata): TestCase {
    const steps: TestStep[] = [
      {
        action: 'click',
        selector,
        expectedResult: `${metadata.type} should respond to interaction`
      }
    ];

    if (metadata.visibility) {
      steps.unshift({
        action: 'verify',
        selector,
        expectedResult: 'Element should be visible'
      });
    }

    return {
      name: `Interaction Test - ${selector}`,
      description: `Verify ${metadata.type} element interaction`,
      type: 'functional',
      priority: 'high',
      steps
    };
  }

  private generateFormValidationTest(selector: string, metadata: ElementMetadata): TestCase {
    return {
      name: `Form Validation Test - ${selector}`,
      description: `Verify form validation for ${metadata.type}`,
      type: 'functional',
      priority: 'high',
      steps: [
        {
          action: 'input',
          selector,
          expectedResult: 'Form should validate input correctly',
          data: {
            validInput: 'test@example.com',
            invalidInput: 'invalid-input'
          }
        }
      ]
    };
  }
} 