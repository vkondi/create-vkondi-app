import { execa } from 'execa';
import { logger } from './logger.js';
import type { ProjectContext } from '../context.js';

export async function detectPackageManager(): Promise<'npm' | 'yarn' | 'pnpm'> {
  try {
    await execa('pnpm', ['--version']);
    return 'pnpm';
  } catch {
    try {
      await execa('yarn', ['--version']);
      return 'yarn';
    } catch {
      return 'npm';
    }
  }
}

export async function installDependencies(context: ProjectContext): Promise<void> {
  logger.startSpinner(`Installing dependencies with ${context.packageManager}...`);

  try {
    const installCommand = context.packageManager === 'npm' ? 'install' : 'install';
    await execa(context.packageManager, [installCommand], {
      cwd: context.projectPath,
      stdio: 'pipe',
    });
    logger.succeedSpinner('Dependencies installed successfully');
  } catch (error) {
    logger.failSpinner('Failed to install dependencies');
    throw error;
  }
}

export async function runCommand(
  command: string,
  args: string[],
  cwd: string,
  description?: string
): Promise<void> {
  if (description) {
    logger.startSpinner(description);
  }

  try {
    await execa(command, args, {
      cwd,
      stdio: 'pipe',
    });
    if (description) {
      logger.succeedSpinner(description);
    }
  } catch (error) {
    if (description) {
      logger.failSpinner(`Failed: ${description}`);
    }
    throw error;
  }
}

export async function initGit(projectPath: string): Promise<void> {
  try {
    await execa('git', ['--version']);
    await execa('git', ['init'], { cwd: projectPath });
    await execa('git', ['add', '.'], { cwd: projectPath });
    await execa('git', ['commit', '-m', 'Initial commit from create-vkondi-app'], {
      cwd: projectPath,
    });
    logger.success('Git repository initialized');
  } catch {
    logger.warning('Git not found, skipping repository initialization');
  }
}
