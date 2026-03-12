import type { ProjectContext } from '../context.js';
import { logger } from '../utils/logger.js';
import { writeFile, joinPath } from '../utils/file.js';
import { addDevDependencies } from '../utils/packageJson.js';

export async function setupTailwind(context: ProjectContext): Promise<void> {
  logger.step('Setting up Tailwind CSS...');

  try {
    // Install dependencies
    await addDevDependencies(context.projectPath, {
      tailwindcss: '^3.4.1',
      autoprefixer: '^10.4.17',
      postcss: '^8.4.35',
    });

    // Create Tailwind config
    await createTailwindConfig(context);

    // Create PostCSS config
    await createPostCSSConfig(context);

    // Update CSS files
    await updateCSSFiles(context);

    logger.success('Tailwind CSS configured');
  } catch (error) {
    logger.error('Failed to setup Tailwind CSS');
    throw error;
  }
}

async function createTailwindConfig(context: ProjectContext): Promise<void> {
  const config = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    ${context.framework === 'next' ? "'./app/**/*.{js,ts,jsx,tsx}'," : ''}
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;

  const configPath = joinPath(context.projectPath, 'tailwind.config.js');
  await writeFile(configPath, config);
}

async function createPostCSSConfig(context: ProjectContext): Promise<void> {
  const config = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

  const configPath = joinPath(context.projectPath, 'postcss.config.js');
  await writeFile(configPath, config);
}

async function updateCSSFiles(context: ProjectContext): Promise<void> {
  const tailwindDirectives = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

  if (context.framework === 'react') {
    const cssPath = joinPath(context.projectPath, 'src', 'index.css');
    await writeFile(cssPath, tailwindDirectives);

    // Update main entry to import CSS
    const mainExtension = context.typescript ? 'tsx' : 'jsx';
    const mainPath = joinPath(context.projectPath, 'src', `main.${mainExtension}`);

    const mainContent = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`;
    await writeFile(mainPath, mainContent);
  } else if (context.framework === 'next') {
    // For Next.js, update globals.css in app directory
    const cssPath = joinPath(context.projectPath, 'src', 'app', 'globals.css');
    await writeFile(cssPath, tailwindDirectives);
  }

  logger.info('Tailwind directives added to CSS files');
}
