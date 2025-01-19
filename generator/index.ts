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

    const analysisResults = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));
    const elementsMap = new Map<string, ElementMetadata>(
      Object.entries(analysisResults.elements)
    );

    // Generate test cases
    console.log('Generating test cases...');
    const testGenerator = new TestCaseGenerator(elementsMap);
    const testCases = testGenerator.generateTestSuite();
    
    // Generate test code
    console.log('Generating test code...');
    const codeGenerator = new TestCodeGenerator(testCases);
    const testFiles = codeGenerator.generateTestFiles();

    // Save generated tests
    const testsDir = path.join(process.cwd(), 'tests', 'generated');
    if (!fs.existsSync(testsDir)) {
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
    process.exit(1);
  }
}

main().catch(console.error); 