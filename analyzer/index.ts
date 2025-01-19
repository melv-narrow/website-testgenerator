import { chromium } from '@playwright/test';
import { WebsiteAnalyzer } from './websiteAnalyzer';
import { testConfig } from '../config/analyzer.config';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log(`Analyzing website: ${testConfig.baseUrl}`);
    await page.goto(testConfig.baseUrl);
    
    const analyzer = new WebsiteAnalyzer(page);
    const elements = await analyzer.analyzePage();
    
    console.log('\nAnalysis Results:');
    console.log('----------------');
    console.log(`Found ${elements.size} interactive elements`);
    
    for (const [selector, metadata] of elements) {
      console.log(`\nElement: ${selector}`);
      console.log(`Type: ${metadata.type}`);
      console.log(`Interactable: ${metadata.interactable}`);
      console.log(`Visible: ${metadata.visibility}`);
      console.log(`Accessibility: ${JSON.stringify(metadata.accessibility, null, 2)}`);
    }
  } catch (error) {
    console.error('Error during analysis:', error);
  } finally {
    await browser.close();
  }
}

main().catch(console.error); 