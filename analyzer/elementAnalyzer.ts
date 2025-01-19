import { ElementHandle } from '@playwright/test';

export interface ElementAnalysis {
  isInteractive: boolean;
  isFormElement: boolean;
  isNavigational: boolean;
  accessibilityScore: number;
  potentialIssues: string[];
}

export class ElementAnalyzer {
  static async analyzeElement(element: ElementHandle): Promise<ElementAnalysis> {
    const analysis: ElementAnalysis = {
      isInteractive: false,
      isFormElement: false,
      isNavigational: false,
      accessibilityScore: 0,
      potentialIssues: [],
    };

    // Check element properties
    const [tagName, role] = await Promise.all([
      element.evaluate(el => (el as HTMLElement).tagName.toLowerCase()),
      element.evaluate(el => (el as HTMLElement).getAttribute('role'))
    ]);

    // Determine interactivity
    analysis.isInteractive = await this.checkInteractivity(element, tagName, role);
    
    // Check if it's a form element
    analysis.isFormElement = ['input', 'select', 'textarea', 'button'].includes(tagName);
    
    // Check if it's navigational
    analysis.isNavigational = tagName === 'a' || role === 'link' || role === 'navigation';

    // Analyze accessibility
    const accessibilityResults = await this.analyzeAccessibility(element);
    analysis.accessibilityScore = accessibilityResults.score;
    analysis.potentialIssues = accessibilityResults.issues;

    return analysis;
  }

  private static async checkInteractivity(
    element: ElementHandle, 
    tagName: string, 
    role?: string | null
  ): Promise<boolean> {
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
    const interactiveRoles = ['button', 'link', 'menuitem', 'tab', 'checkbox', 'radio'];
    
    if (interactiveTags.includes(tagName)) return true;
    if (role && interactiveRoles.includes(role)) return true;
    
    const hasClickHandler = await element.evaluate(el => {
      const listeners = (window as any).getEventListeners?.((el as HTMLElement));
      return listeners?.click?.length > 0 || (el as HTMLElement).onclick !== null;
    });

    return hasClickHandler;
  }

  private static async analyzeAccessibility(element: ElementHandle): Promise<{ score: number; issues: string[] }> {
    const issues: string[] = [];
    let score = 100;

    // Check for basic accessibility attributes
    const [hasLabel, hasAria] = await Promise.all([
      element.evaluate(el => !!((el as HTMLElement).getAttribute('aria-label') || (el as HTMLElement).getAttribute('alt') || (el as HTMLElement).getAttribute('title'))),
      element.evaluate(el => {
        return Object.keys((el as HTMLElement).attributes).some(attr => attr.startsWith('aria-'));
      })
    ]);

    if (!hasLabel) {
      issues.push('Missing accessible label');
      score -= 25;
    }

    if (!hasAria) {
      issues.push('No ARIA attributes found');
      score -= 15;
    }

    // Check color contrast (simplified)
    const hasGoodContrast = await element.evaluate(el => {
      const style = window.getComputedStyle(el as HTMLElement);
      return style.color !== style.backgroundColor;
    });

    if (!hasGoodContrast) {
      issues.push('Potential contrast issues');
      score -= 20;
    }

    return {
      score: Math.max(0, score),
      issues
    };
  }
} 