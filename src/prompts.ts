import prompts from 'prompts';
import type { ProjectContext } from './context.js';
import { logger } from './utils/logger.js';
import { pathExists } from './utils/file.js';
import path from 'path';

export async function collectUserInput(projectName?: string): Promise<ProjectContext> {
  logger.info('Welcome to create-vkondi-app! 🚀');
  logger.newLine();

  const questions = [];

  if (!projectName) {
    questions.push({
      type: 'text' as const,
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-app',
      validate: (value: string) => (value.length > 0 ? true : 'Project name cannot be empty'),
    });
  }

  questions.push(
    {
      type: 'select' as const,
      name: 'framework',
      message: 'Select a framework:',
      choices: [
        { title: 'React (Vite)', value: 'react' },
        { title: 'Next.js', value: 'next' },
      ],
      initial: 0,
    },
    {
      type: 'confirm' as const,
      name: 'typescript',
      message: 'Use TypeScript?',
      initial: true,
    },
    {
      type: 'confirm' as const,
      name: 'tailwind',
      message: 'Add Tailwind CSS?',
      initial: false,
    },
    {
      type: 'select' as const,
      name: 'testing',
      message: 'Testing framework:',
      choices: [
        { title: 'Vitest', value: 'vitest' },
        { title: 'None', value: 'none' },
      ],
      initial: 0,
    },
    {
      type: 'select' as const,
      name: 'lintingMode',
      message: 'Linting mode:',
      choices: [
        { title: 'Strict', value: 'strict' },
        { title: 'Standard', value: 'standard' },
      ],
      initial: 0,
    },
    {
      type: 'confirm' as const,
      name: 'githubActions',
      message: 'Add GitHub Actions CI?',
      initial: false,
    },
    {
      type: 'confirm' as const,
      name: 'docker',
      message: 'Add Docker setup?',
      initial: false,
    }
  );

  const answers = await prompts(questions, {
    onCancel: () => {
      logger.error('Operation cancelled');
      process.exit(1);
    },
  });

  const finalProjectName = projectName || answers.projectName;
  const projectPath = path.resolve(process.cwd(), finalProjectName);

  if (await pathExists(projectPath)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory ${finalProjectName} already exists. Overwrite?`,
      initial: false,
    });

    if (!overwrite) {
      logger.error('Operation cancelled');
      process.exit(1);
    }
  }

  return {
    projectName: finalProjectName,
    projectPath,
    framework: answers.framework,
    typescript: answers.typescript,
    tailwind: answers.tailwind,
    testing: answers.testing,
    lintingMode: answers.lintingMode,
    githubActions: answers.githubActions,
    docker: answers.docker,
    packageManager: 'yarn', // Will be detected later
  };
}
