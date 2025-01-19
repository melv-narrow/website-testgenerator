import * as fs from 'fs';
import * as path from 'path';
import { ElementMetadata } from '../models/types';
import { TestCaseGenerator } from './testCaseGenerator';
import { TestCodeGenerator } from './codeGenerator';

async function main() {
  try {
    // Read analysis results
    const analysisPath = path.join(process.cwd(), 'analysis', 'analysis-results.json');
    if (!fs.existsSync(analysisPath)) {
      throw new Error('Analysis results not found. Please run npm run analyze first.');
    }

    console.log('Reading analysis results from:', analysisPath);
    const analysisResults = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));
    console.log(`Found ${Object.keys(analysisResults.elements).length} elements to test`);

    const elementsMap = new Map<string, ElementMetadata>(
      Object.entries(analysisResults.elements)
    );

    // Generate test cases
    console.log('\nGenerating test cases...');
    const testGenerator = new TestCaseGenerator(elementsMap);
    const testCases = testGenerator.generateTestSuite();
    console.log(`Generated ${testCases.length} test cases`);
    
    // Generate test code
    console.log('\nGenerating test code...');
    const codeGenerator = new TestCodeGenerator(testCases);
    const testFiles = codeGenerator.generateTestFiles();
    console.log(`Generated ${testFiles.size} test files`);

    // Save generated tests
    const testsDir = path.join(process.cwd(), 'tests', 'generated');
    if (!fs.existsSync(testsDir)) {
      console.log('Creating tests directory:', testsDir);
      fs.mkdirSync(testsDir, { recursive: true });
    }

    for (const [fileName, content] of testFiles) {
      const filePath = path.join(testsDir, fileName);
      fs.writeFileSync(filePath, content);
      console.log(`Generated test file: ${filePath}`);
    }

    console.log('\nTest generation complete!');
    console.log(`Generated ${testFiles.size} test files`);
    console.log(`Location: ${testsDir}`);
  } catch (error: any) {
    console.error('Error during test generation:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

main().catch(console.error); 