import type { ProjectContext } from '../context.js';
import { logger } from '../utils/logger.js';
import { writeFile, joinPath, ensureDir } from '../utils/file.js';

function getInstallCmd(pm: 'npm' | 'yarn' | 'pnpm'): string {
  if (pm === 'yarn') return 'yarn install --frozen-lockfile';
  if (pm === 'pnpm') return 'pnpm install --frozen-lockfile';
  return 'npm ci';
}

function getRunCmd(pm: 'npm' | 'yarn' | 'pnpm', script: string): string {
  if (pm === 'npm') return `npm run ${script}`;
  if (pm === 'pnpm') return `pnpm ${script}`;
  return `yarn ${script}`;
}

function getTestCmd(pm: 'npm' | 'yarn' | 'pnpm'): string {
  if (pm === 'npm') return 'npm test';
  if (pm === 'pnpm') return 'pnpm test';
  return 'yarn test';
}

export async function setupGithubActions(context: ProjectContext): Promise<void> {
  logger.startSpinner('Setting up GitHub Actions...');

  try {
    // Create .github/workflows directory
    const workflowsDir = joinPath(context.projectPath, '.github', 'workflows');
    await ensureDir(workflowsDir);

    // Create CI workflow
    await createCIWorkflow(context, workflowsDir);

    logger.succeedSpinner('GitHub Actions configured');
  } catch (error) {
    logger.failSpinner('Failed to setup GitHub Actions');
    throw error;
  }
}

async function createCIWorkflow(context: ProjectContext, workflowsDir: string): Promise<void> {
  const pm = context.packageManager;
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
          cache: '${pm}'

      - name: Install dependencies
        run: ${getInstallCmd(pm)}

      ${
        context.typescript
          ? `- name: Type check
        run: ${getRunCmd(pm, 'type-check')}
`
          : ''
      }
      - name: Lint
        run: ${getRunCmd(pm, 'lint')}

      - name: Format check
        run: ${getRunCmd(pm, 'format:check')}

      ${
        context.testing === 'vitest'
          ? `- name: Run tests
        run: ${getTestCmd(pm)}

      - name: Generate coverage
        run: ${getRunCmd(pm, 'test:coverage')}
`
          : ''
      }
      - name: Build
        run: ${getRunCmd(pm, 'build')}

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
