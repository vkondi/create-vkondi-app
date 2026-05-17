import { execa } from 'execa';
import type { ProjectContext } from '../context.js';
import { logger } from '../utils/logger.js';
import { writeFile, joinPath, pathExists } from '../utils/file.js';

export async function scaffoldNext(context: ProjectContext): Promise<void> {
  try {
    const args = [
      '-y',
      'create-next-app@latest',
      context.projectName,
      '--app',
      '--no-git',
      context.typescript ? '--ts' : '--js',
      context.tailwind ? '--tailwind' : '--no-tailwind',
      context.linter === 'eslint' ? '--eslint' : '--no-eslint',
      '--no-src-dir',
      '--import-alias',
      '@/*',
    ];

    logger.step('Creating Next.js project...');

    await execa('npx', args, {
      cwd: process.cwd(),
      stdio: 'inherit',
    });

    logger.success('Next.js project created');

    // Detect if TypeScript was chosen by create-next-app
    const detectTypeScript = async (): Promise<boolean> => {
      const tsconfigPath = joinPath(context.projectPath, 'tsconfig.json');
      return await pathExists(tsconfigPath);
    };

    const usesTypeScript = await detectTypeScript();

    // Configure strict TypeScript if needed
    if (usesTypeScript) {
      await configureNextTypeScript(context);
    }

    // Update Next.js config
    await updateNextConfig(context, usesTypeScript);
  } catch (error) {
    logger.error('Failed to create Next.js project');
    throw error;
  }
}

async function configureNextTypeScript(context: ProjectContext): Promise<void> {
  const tsconfigPath = joinPath(context.projectPath, 'tsconfig.json');

  const tsconfig = {
    compilerOptions: {
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
      noImplicitReturns: true,
      plugins: [
        {
          name: 'next',
        },
      ],
      paths: {
        '@/*': ['./src/*'],
        '@app/*': ['./src/app/*'],
        '@components/*': ['./src/components/*'],
        '@lib/*': ['./src/lib/*'],
        '@types/*': ['./src/types/*'],
      },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  };

  await writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  logger.success('Strict TypeScript configuration applied');
}

async function updateNextConfig(context: ProjectContext, usesTypeScript: boolean): Promise<void> {
  const nextConfigPath = joinPath(
    context.projectPath,
    usesTypeScript ? 'next.config.ts' : 'next.config.mjs'
  );

  const nextConfig = usesTypeScript
    ? `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Disable x-powered-by header
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
      ],
    },
  ],
};

export default nextConfig;
`
    : `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Disable x-powered-by header
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
      ],
    },
  ],
};

export default nextConfig;
`;

  await writeFile(nextConfigPath, nextConfig);
  logger.success('Next.js configuration updated');
}
