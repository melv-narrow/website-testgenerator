export interface ElementMetadata {
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

export interface TestCase {
  name: string;
  description: string;
  steps: TestStep[];
  priority: 'high' | 'medium' | 'low';
  type: 'functional' | 'accessibility' | 'performance';
}

export interface TestStep {
  action: string;
  selector: string;
  expectedResult: string;
  data?: any;
}

export interface TestSuiteConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  parallel: boolean;
  browser: 'chromium' | 'firefox' | 'webkit';
}

export interface AnalyzerConfig {
  crawlDepth: number;
  excludePatterns: string[];
  elementTypes: string[];
  priorityRules: {
    high: string[];
    medium: string[];
    low: string[];
  };
} 