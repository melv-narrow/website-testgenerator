import { Page, ElementHandle } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface ElementMetadata {
  selector: string;
  type: string;
  attributes: Record<string, string>;
  interactable: boolean;
  visibility: boolean;
  accessibility: {
    role: string;
    label: string;
    required?: boolean;
  };
}

export class WebsiteAnalyzer {
  private page: Page;
  private elementsMap: Map<string, ElementMetadata> = new Map();

  constructor(page: Page) {
    this.page = page;
  }

  async analyzePage(): Promise<Map<string, ElementMetadata>> {
    // Collect all interactive elements
    const elements = await this.page.$$('button, input, select, a, [role="button"]');
    
    for (const element of elements) {
      try {
        // Check if element is still attached to DOM
        const isAttached = await element.evaluate(el => el.isConnected).catch(() => false);
        if (!isAttached) continue;

        const metadata = await this.collectElementMetadata(element);
        this.elementsMap.set(metadata.selector, metadata);
      } catch (error: any) {
        console.log('Skipping element due to:', error.message);
      }
    }

    // Save results to file
    await this.saveResults();

    return this.elementsMap;
  }

  private async collectElementMetadata(element: ElementHandle): Promise<ElementMetadata> {
    const selector = await element.evaluate((el) => {
      const htmlEl = el as HTMLElement;
      return htmlEl.id ? `#${htmlEl.id}` : htmlEl.className ? `.${htmlEl.className.split(' ')[0]}` : htmlEl.tagName.toLowerCase();
    });

    const type = await element.evaluate(el => (el as HTMLElement).tagName.toLowerCase());
    const attributes = await element.evaluate(el => {
      const htmlEl = el as HTMLElement;
      const attrs: Record<string, string> = {};
      for (const attr of htmlEl.attributes) {
        attrs[attr.name] = attr.value;
      }
      return attrs;
    });

    const isVisible = await element.isVisible();
    const isEnabled = await element.isEnabled();

    const accessibility = await element.evaluate(el => {
      const htmlEl = el as HTMLElement;
      return {
        role: htmlEl.getAttribute('role') || '',
        label: htmlEl.getAttribute('aria-label') || htmlEl.getAttribute('alt') || '',
        required: htmlEl.hasAttribute('required')
      };
    });

    return {
      selector,
      type,
      attributes,
      interactable: isEnabled,
      visibility: isVisible,
      accessibility
    };
  }

  private async saveResults(): Promise<void> {
    const outputDir = path.join(process.cwd(), 'analysis');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const results = {
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      elements: Object.fromEntries(this.elementsMap)
    };

    const outputPath = path.join(outputDir, 'analysis-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\nAnalysis results saved to: ${outputPath}`);
  }
} 