import type { ProjectContext } from '../context.js';
import { logger } from '../utils/logger.js';
import { writeFile, joinPath } from '../utils/file.js';
import { addDevDependencies, addScripts } from '../utils/packageJson.js';

export async function setupESLint(context: ProjectContext): Promise<void> {
  logger.step('Setting up ESLint...');

  try {
    // Install dependencies
    const devDeps = getESLintDependencies(context);
    await addDevDependencies(context.projectPath, devDeps);

    // Create ESLint config
    await createESLintConfig(context);

    // Add scripts
    await addScripts(context.projectPath, {
      lint: 'eslint . --ext .ts,.tsx,.js,.jsx',
      'lint:fix': 'eslint . --ext .ts,.tsx,.js,.jsx --fix',
    });

    // Create .eslintignore
    await createESLintIgnore(context);

    logger.success('ESLint configured');
  } catch (error) {
    logger.error('Failed to setup ESLint');
    throw error;
  }
}

function getESLintDependencies(context: ProjectContext): Record<string, string> {
  const deps: Record<string, string> = {
    eslint: '^8.56.0',
    'eslint-plugin-import': '^2.29.1',
  };

  if (context.typescript) {
    deps['@typescript-eslint/eslint-plugin'] = '^6.20.0';
    deps['@typescript-eslint/parser'] = '^6.20.0';
  }

  if (context.framework === 'react') {
    deps['eslint-plugin-react'] = '^7.33.2';
    deps['eslint-plugin-react-hooks'] = '^4.6.0';
    deps['eslint-plugin-jsx-a11y'] = '^6.8.0';
  }

  return deps;
}

async function createESLintConfig(context: ProjectContext): Promise<void> {
  const isStrict = context.lintingMode === 'strict';

  const configPath = joinPath(context.projectPath, 'eslint.config.js');
  const configContent = `import js from '@eslint/js';
${context.typescript ? "import tsPlugin from '@typescript-eslint/eslint-plugin';\nimport tsParser from '@typescript-eslint/parser';" : ''}
${context.framework === 'react' ? "import react from 'eslint-plugin-react';\nimport reactHooks from 'eslint-plugin-react-hooks';\nimport jsxA11y from 'eslint-plugin-jsx-a11y';" : ''}
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      ${context.typescript ? 'typescript: tsPlugin,' : ''}
      ${context.framework === 'react' ? 'react,\n      reactHooks,\n      jsxA11y,' : ''}
      import: importPlugin,
    },
    ${
      context.typescript
        ? `languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ${context.framework === 'react' ? 'ecmaFeatures: { jsx: true },' : ''}
      },
    },`
        : ''
    }
    rules: {
      ${isStrict ? "'no-console': ['warn', { allow: ['warn', 'error'] }]," : "'no-console': 'off',"}
      'no-unused-vars': 'off',
      ${context.typescript ? "'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]," : ''}
      ${context.typescript ? "'@typescript-eslint/explicit-function-return-type': 'off'," : ''}
      ${context.typescript ? "'@typescript-eslint/no-explicit-any': 'warn'," : ''}
      ${isStrict && context.typescript ? "'@typescript-eslint/strict-boolean-expressions': 'off'," : ''}
      ${isStrict ? "'import/no-default-export': 'error'," : ''}
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],
      ${context.framework === 'react' ? "'react/react-in-jsx-scope': 'off',\n      'react/prop-types': 'off',\n      'react-hooks/rules-of-hooks': 'error',\n      'react-hooks/exhaustive-deps': 'warn'," : ''}
    },
    ${context.framework === 'react' ? "settings: {\n      react: { version: 'detect' },\n    }," : ''}
  },
  {
    ignores: ['dist', 'node_modules', 'build', '.next', 'coverage'],
  },
];
`;

  await writeFile(configPath, configContent);
}

async function createESLintIgnore(context: ProjectContext): Promise<void> {
  const ignoreContent = `node_modules
dist
build
.next
coverage
*.config.js
*.config.ts
public
`;

  await writeFile(joinPath(context.projectPath, '.eslintignore'), ignoreContent);
}
