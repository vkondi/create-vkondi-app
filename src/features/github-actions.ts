import type { ProjectContext } from '../context.js';
import { logger } from '../utils/logger.js';
import { writeFile, joinPath, ensureDir } from '../utils/file.js';

export async function setupGithubActions(context: ProjectContext): Promise<void> {
  logger.step('Setting up GitHub Actions...');

  try {
    // Create .github/workflows directory
    const workflowsDir = joinPath(context.projectPath, '.github', 'workflows');
    await ensureDir(workflowsDir);

    // Create CI workflow
    await createCIWorkflow(context, workflowsDir);

    logger.success('GitHub Actions configured');
  } catch (error) {
    logger.error('Failed to setup GitHub Actions');
    throw error;
  }
}

async function createCIWorkflow(context: ProjectContext, workflowsDir: string): Promise<void> {
  const workflow = `name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      ${
        context.typescript
          ? `- name: Type check
        run: yarn type-check
`
          : ''
      }
      - name: Lint
        run: yarn lint

      - name: Format check
        run: yarn format:check

      ${
        context.testing === 'vitest'
          ? `- name: Run tests
        run: yarn test

      - name: Generate coverage
        run: yarn test:coverage
`
          : ''
      }
      - name: Build
        run: yarn build

      ${
        context.testing === 'vitest'
          ? `- name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
`
          : ''
      }
`;

  await writeFile(joinPath(workflowsDir, 'ci.yml'), workflow);
}
