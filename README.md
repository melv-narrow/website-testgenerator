# 🚀 Website Test Generator

An intelligent framework that automatically analyzes websites and generates comprehensive test suites using Playwright. Built with TypeScript and following ISTQB principles.

## ✨ Features

- 🔍 **Automated Website Analysis**
  - Detects interactive elements (buttons, forms, links)
  - Analyzes accessibility attributes
  - Maps element relationships and dependencies
  - Handles dynamic content gracefully

- 🧪 **Smart Test Generation**
  - Functional tests for user interactions
  - Accessibility compliance tests
  - Performance measurements
  - Form validation tests

- 📊 **Comprehensive Coverage**
  - Element visibility checks
  - Interactive element validation
  - ARIA compliance verification
  - Color contrast analysis

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/melv-narrow/website-testgenerator.git
cd website-testgenerator
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## 📖 Usage

### 1. Analyze a Website

Configure the target website in `config/analyzer.config.ts`:
```typescript
export const testConfig: TestSuiteConfig = {
  baseUrl: 'https://your-website.com',
  timeout: 30000,
  retries: 2,
  parallel: true,
  browser: 'chromium'
};
```

Run the analyzer:
```bash
npm run analyze
```

This will:
- Scan the website for interactive elements
- Collect element metadata and accessibility info
- Save analysis results to `analysis/analysis-results.json`

### 2. Generate Tests

After analysis, generate test cases:
```bash
npm run generate
```

This will:
- Read the analysis results
- Generate appropriate test cases
- Create Playwright test files in `tests/generated/`

### 3. Run Tests

Execute the generated tests:
```bash
npm test           # Run in headless mode
npm run test:ui    # Run with UI mode
```

## 🏗️ Project Structure

```
website-testgenerator/
├── analyzer/
│   ├── websiteAnalyzer.ts    # Main analysis logic
│   ├── elementAnalyzer.ts    # Element-specific analysis
│   └── index.ts             # Analysis entry point
├── generator/
│   ├── testCaseGenerator.ts # Test case generation
│   ├── codeGenerator.ts     # Test code generation
│   └── index.ts            # Generator entry point
├── models/
│   └── types.ts            # Shared type definitions
├── config/
│   └── analyzer.config.ts  # Configuration settings
├── utils/
│   └── helpers.ts         # Utility functions
└── tests/
    └── generated/        # Generated test files
```

## 🧩 Test Types Generated

1. **Functional Tests**
   - Element interactions
   - Form submissions
   - Navigation flows
   - State changes

2. **Accessibility Tests**
   - ARIA attributes
   - Keyboard navigation
   - Screen reader compatibility
   - Color contrast

3. **Performance Tests**
   - Load times
   - First paint
   - DOM content loaded
   - Resource timing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Playwright](https://playwright.dev/)
- Inspired by ISTQB testing principles
- TypeScript for type safety
- Node.js ecosystem 