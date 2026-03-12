import type { ProjectContext } from '../context.js';
import { logger } from '../utils/logger.js';
import { writeFile, joinPath, ensureDir } from '../utils/file.js';
import { addDevDependencies, addScripts } from '../utils/packageJson.js';

export async function setupVitest(context: ProjectContext): Promise<void> {
  logger.step('Setting up Vitest...');

  try {
    // Install dependencies
    const devDeps = getVitestDependencies(context);
    await addDevDependencies(context.projectPath, devDeps);

    // Create Vitest config
    await createVitestConfig(context);

    // Create test setup file
    await createTestSetup(context);

    // Create example test
    await createExampleTest(context);

    // Add scripts
    await addScripts(context.projectPath, {
      test: 'vitest',
      'test:ui': 'vitest --ui',
      'test:coverage': 'vitest --coverage',
    });

    logger.success('Vitest configured');
  } catch (error) {
    logger.error('Failed to setup Vitest');
    throw error;
  }
}

function getVitestDependencies(context: ProjectContext): Record<string, string> {
  const deps: Record<string, string> = {
    vitest: '^1.2.2',
    '@vitest/ui': '^1.2.2',
    '@vitest/coverage-v8': '^1.2.2',
  };

  if (context.framework === 'react') {
    deps['@testing-library/react'] = '^14.2.1';
    deps['@testing-library/jest-dom'] = '^6.4.2';
    deps['@testing-library/user-event'] = '^14.5.2';
    deps['jsdom'] = '^24.0.0';
  }

  return deps;
}

async function createVitestConfig(context: ProjectContext): Promise<void> {
  const config = `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: '${context.framework === 'react' ? 'jsdom' : 'node'}',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.spec.tsx',
        '**/*.test.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
});
`;

  const configPath = joinPath(
    context.projectPath,
    context.typescript ? 'vitest.config.ts' : 'vitest.config.js'
  );
  await writeFile(configPath, config);
}

async function createTestSetup(context: ProjectContext): Promise<void> {
  const testDir = joinPath(context.projectPath, 'src', 'test');
  await ensureDir(testDir);

  let setupContent = '';

  if (context.framework === 'react') {
    setupContent = `import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
`;
  } else {
    setupContent = `import { afterEach } from 'vitest';

// Global test setup
afterEach(() => {
  // Cleanup logic
});
`;
  }

  const setupPath = joinPath(testDir, context.typescript ? 'setup.ts' : 'setup.js');
  await writeFile(setupPath, setupContent);
}

async function createExampleTest(context: ProjectContext): Promise<void> {
  const testDir = joinPath(context.projectPath, 'src', 'test');

  let testContent = '';

  if (context.framework === 'react') {
    testContent = context.typescript
      ? `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../App';

describe('App', () => {
  it('renders welcome message', () => {
    render(<App />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
`
      : `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../App';

describe('App', () => {
  it('renders welcome message', () => {
    render(<App />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
`;
  } else {
    testContent = `import { describe, it, expect } from 'vitest';

describe('Example', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
`;
  }

  const testPath = joinPath(testDir, context.typescript ? 'example.test.tsx' : 'example.test.jsx');
  await writeFile(testPath, testContent);
}
