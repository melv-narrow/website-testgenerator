import { ElementHandle, Page } from '@playwright/test';
import { ElementMetadata } from '../models/types';

export async function waitForElement(page: Page, selector: string, timeout = 5000): Promise<ElementHandle | null> {
  try {
    return await page.waitForSelector(selector, { timeout });
  } catch (error) {
    console.error(`Element not found: ${selector}`);
    return null;
  }
}

export async function isElementVisible(element: ElementHandle): Promise<boolean> {
  try {
    return await element.isVisible();
  } catch {
    return false;
  }
}

export async function getElementText(element: ElementHandle): Promise<string> {
  try {
    return await element.innerText();
  } catch {
    return '';
  }
}

export function generateUniqueSelector(metadata: ElementMetadata): string {
  if (metadata.attributes['id']) {
    return `#${metadata.attributes['id']}`;
  }
  
  if (metadata.attributes['data-testid']) {
    return `[data-testid="${metadata.attributes['data-testid']}"]`;
  }
  
  if (metadata.attributes['class']) {
    return `.${metadata.attributes['class'].split(' ')[0]}`;
  }
  
  return metadata.selector;
}

export function formatTestName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function measurePerformance(page: Page): Promise<Record<string, number>> {
  return await page.evaluate(() => {
    const timing = performance.timing;
    return {
      loadTime: timing.loadEventEnd - timing.navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
    };
  });
}

export function prioritizeTests(elements: Map<string, ElementMetadata>): ElementMetadata[] {
  return Array.from(elements.values())
    .sort((a, b) => {
      // Prioritize interactive elements
      if (a.interactable && !b.interactable) return -1;
      if (!a.interactable && b.interactable) return 1;
      
      // Then visible elements
      if (a.visibility && !b.visibility) return -1;
      if (!a.visibility && b.visibility) return 1;
      
      return 0;
    });
} 