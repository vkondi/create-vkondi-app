import { execa } from 'execa';
import type { ProjectContext } from '../context.js';
import { logger } from '../utils/logger.js';
import { ensureDir, writeFile, joinPath, removeFile } from '../utils/file.js';

export async function scaffoldReact(context: ProjectContext): Promise<void> {
  logger.step('Creating React (Vite) project...');

  try {
    // Create Vite project
    const template = context.typescript ? 'react-ts' : 'react';
    await execa(
      'yarn',
      ['create', 'vite@latest', context.projectName, '--', '--template', template],
      {
        cwd: process.cwd(),
        stdio: 'pipe',
      }
    );

    logger.success('React project created');

    // Clean up boilerplate
    await cleanupReactBoilerplate(context);

    // Create feature-based folder structure
    await createReactFolderStructure(context);

    // Configure path aliases
    await configurePathAliases(context);

    // Update tsconfig for strict mode
    if (context.typescript) {
      await configureStrictTypeScript(context);
    }
  } catch (error) {
    logger.error('Failed to create React project');
    throw error;
  }
}

async function cleanupReactBoilerplate(context: ProjectContext): Promise<void> {
  const filesToRemove = [
    joinPath(context.projectPath, 'src', 'App.css'),
    joinPath(context.projectPath, 'src', 'index.css'),
    joinPath(context.projectPath, 'public', 'vite.svg'),
  ];

  for (const file of filesToRemove) {
    try {
      await removeFile(file);
    } catch {
      // File might not exist
    }
  }

  // Create clean App component
  const appExtension = context.typescript ? 'tsx' : 'jsx';
  const appContent = context.typescript
    ? `export function App() {
  return (
    <div>
      <h1>Welcome to ${context.projectName}</h1>
    </div>
  );
}
`
    : `export function App() {
  return (
    <div>
      <h1>Welcome to ${context.projectName}</h1>
    </div>
  );
}
`;

  await writeFile(joinPath(context.projectPath, 'src', `App.${appExtension}`), appContent);

  // Create clean main entry
  const mainExtension = context.typescript ? 'tsx' : 'jsx';
  const mainContent = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`;

  await writeFile(joinPath(context.projectPath, 'src', `main.${mainExtension}`), mainContent);
}

async function createReactFolderStructure(context: ProjectContext): Promise<void> {
  const folders = ['app', 'features', 'shared', 'lib', 'hooks', 'types'];

  for (const folder of folders) {
    await ensureDir(joinPath(context.projectPath, 'src', folder));
  }

  // Create index files for better organization
  const indexContent = '// Export your modules here\n';

  for (const folder of folders) {
    const extension = context.typescript ? 'ts' : 'js';
    await writeFile(
      joinPath(context.projectPath, 'src', folder, `index.${extension}`),
      indexContent
    );
  }

  logger.success('Feature-based folder structure created');
}

async function configurePathAliases(context: ProjectContext): Promise<void> {
  // Update vite.config
  const viteConfigPath = joinPath(
    context.projectPath,
    context.typescript ? 'vite.config.ts' : 'vite.config.js'
  );

  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
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

  await writeFile(viteConfigPath, viteConfig);
  logger.success('Path aliases configured');
}

async function configureStrictTypeScript(context: ProjectContext): Promise<void> {
  const tsconfigPath = joinPath(context.projectPath, 'tsconfig.json');
  const tsconfigAppPath = joinPath(context.projectPath, 'tsconfig.app.json');

  // Read existing tsconfig
  const tsconfig = {
    files: [],
    references: [{ path: './tsconfig.app.json' }, { path: './tsconfig.node.json' }],
    compilerOptions: {
      composite: true,
      tsBuildInfoFile: './node_modules/.tmp/tsconfig.app.tsbuildinfo',
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      moduleDetection: 'force',
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
      noImplicitReturns: true,
      baseUrl: '.',
      paths: {
        '@/*': ['./src/*'],
        '@app/*': ['./src/app/*'],
        '@features/*': ['./src/features/*'],
        '@shared/*': ['./src/shared/*'],
        '@lib/*': ['./src/lib/*'],
        '@hooks/*': ['./src/hooks/*'],
        '@types/*': ['./src/types/*'],
      },
    },
  };

  await writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));

  // Update tsconfig.app.json with path mappings
  const tsconfigApp = {
    compilerOptions: {
      composite: true,
      tsBuildInfoFile: './node_modules/.tmp/tsconfig.app.tsbuildinfo',
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      moduleDetection: 'force',
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
      noImplicitReturns: true,
      baseUrl: '.',
      paths: {
        '@/*': ['./src/*'],
        '@app/*': ['./src/app/*'],
        '@features/*': ['./src/features/*'],
        '@shared/*': ['./src/shared/*'],
        '@lib/*': ['./src/lib/*'],
        '@hooks/*': ['./src/hooks/*'],
        '@types/*': ['./src/types/*'],
      },
    },
    include: ['src'],
  };

  await writeFile(tsconfigAppPath, JSON.stringify(tsconfigApp, null, 2));
  logger.success('Strict TypeScript configuration applied');
}
