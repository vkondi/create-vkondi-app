import type { ProjectContext } from '../context.js';
import { logger } from '../utils/logger.js';
import { writeFile, joinPath, ensureDir } from '../utils/file.js';
import { addDevDependencies, addScripts } from '../utils/packageJson.js';

export async function setupHusky(context: ProjectContext): Promise<void> {
  logger.startSpinner('Setting up Husky and lint-staged...');

  try {
    // Install dependencies
    await addDevDependencies(context.projectPath, {
      husky: '^9.0.10',
      'lint-staged': '^15.2.2',
    });

    // Add prepare script
    await addScripts(context.projectPath, {
      prepare: 'husky',
    });

    // Configure lint-staged
    await configureLintStaged(context);

    // Create husky hooks (will be created after dependency install)
    await createHuskyHooks(context);

    logger.succeedSpinner('Husky configured');
  } catch (error) {
    logger.failSpinner('Failed to setup Husky');
    throw error;
  }
}

async function configureLintStaged(context: ProjectContext): Promise<void> {
  const extension = context.typescript ? '{ts,tsx}' : '{js,jsx}';

  const config = {
    [`src/**/*.${extension}`]: [
      'eslint --fix',
      'prettier --write',
      context.testing === 'vitest' ? 'vitest related --run' : undefined,
    ].filter(Boolean),
    'src/**/*.{json,css,md}': ['prettier --write'],
  };

  const configPath = joinPath(context.projectPath, '.lintstagedrc.json');
  await writeFile(configPath, JSON.stringify(config, null, 2));
}

async function createHuskyHooks(context: ProjectContext): Promise<void> {
  // Create .husky directory and hooks
  const huskyDir = joinPath(context.projectPath, '.husky');
  await ensureDir(huskyDir);

  const lintStagedCmd =
    context.packageManager === 'yarn'
      ? 'yarn dlx lint-staged'
      : context.packageManager === 'pnpm'
        ? 'pnpm dlx lint-staged'
        : 'npx lint-staged';

  const runCmd = (script: string): string =>
    context.packageManager === 'npm'
      ? `npm run ${script}`
      : context.packageManager === 'pnpm'
        ? `pnpm ${script}`
        : `yarn ${script}`;

  // pre-commit hook
  const preCommit = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

${lintStagedCmd}
`;

  await writeFile(joinPath(huskyDir, 'pre-commit'), preCommit);

  // pre-push hook
  const prePush = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

${context.typescript ? runCmd('type-check') : ''}
${context.testing === 'vitest' ? runCmd('test') : ''}
`;

  await writeFile(joinPath(huskyDir, 'pre-push'), prePush);

  logger.info(`Husky hooks created (run ${context.packageManager} install to activate)`);
}
