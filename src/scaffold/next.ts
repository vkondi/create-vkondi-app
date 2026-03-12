import { execa } from 'execa';
import type { ProjectContext } from '../context.js';
import { logger } from '../utils/logger.js';
import { writeFile, joinPath } from '../utils/file.js';

export async function scaffoldNext(context: ProjectContext): Promise<void> {
  logger.step('Creating Next.js project...');

  try {
    const args = [
      'create-next-app@latest',
      context.projectName,
      '--',
      '--app',
      '--use-yarn',
      '--no-git',
    ];

    if (context.typescript) {
      args.push('--typescript');
    } else {
      args.push('--javascript');
    }

    args.push('--eslint');
    args.push('--no-tailwind'); // We'll add it later if needed

    // Use import alias
    args.push('--import-alias', '@/*');

    await execa('yarn', ['dlx', ...args], {
      cwd: process.cwd(),
      stdio: 'inherit',
    });

    logger.success('Next.js project created');

    // Configure strict TypeScript if needed
    if (context.typescript) {
      await configureNextTypeScript(context);
    }

    // Update Next.js config
    await updateNextConfig(context);
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

async function updateNextConfig(context: ProjectContext): Promise<void> {
  const nextConfigPath = joinPath(
    context.projectPath,
    context.typescript ? 'next.config.ts' : 'next.config.mjs'
  );

  const nextConfig = context.typescript
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
