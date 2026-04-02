import type { ProjectContext } from '../context.js';
import { logger } from '../utils/logger.js';
import { writeFile, joinPath } from '../utils/file.js';

function getLockFile(pm: 'npm' | 'yarn' | 'pnpm'): string {
  if (pm === 'yarn') return 'yarn.lock';
  if (pm === 'pnpm') return 'pnpm-lock.yaml';
  return 'package-lock.json';
}

function getInstallCmd(pm: 'npm' | 'yarn' | 'pnpm'): string {
  if (pm === 'yarn') return 'yarn install --frozen-lockfile';
  if (pm === 'pnpm') return 'pnpm install --frozen-lockfile';
  return 'npm ci';
}

function getBuildCmd(pm: 'npm' | 'yarn' | 'pnpm'): string {
  if (pm === 'yarn') return 'yarn build';
  if (pm === 'pnpm') return 'pnpm build';
  return 'npm run build';
}

export async function setupDocker(context: ProjectContext): Promise<void> {
  logger.startSpinner('Setting up Docker...');

  try {
    // Create Dockerfile
    await createDockerfile(context);

    // Create .dockerignore
    await createDockerignore(context);

    logger.succeedSpinner('Docker configured');
  } catch (error) {
    logger.failSpinner('Failed to setup Docker');
    throw error;
  }
}

async function createDockerfile(context: ProjectContext): Promise<void> {
  let dockerfile = '';
  const pm = context.packageManager;
  const lockFile = getLockFile(pm);
  const installCmd = getInstallCmd(pm);
  const buildCmd = getBuildCmd(pm);

  if (context.framework === 'react') {
    dockerfile = `# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ${lockFile} ./
RUN ${installCmd}

COPY . .
RUN ${buildCmd}

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
`;
  } else if (context.framework === 'next') {
    dockerfile = `# Dependencies stage
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json ${lockFile} ./
RUN ${installCmd}

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN ${buildCmd}

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
`;
  }

  await writeFile(joinPath(context.projectPath, 'Dockerfile'), dockerfile);
}

async function createDockerignore(context: ProjectContext): Promise<void> {
  const dockerignore = `node_modules
npm-debug.log*
yarn-error.log
yarn-debug.log*
pnpm-debug.log*
.next
.git
.gitignore
README.md
.env
.env.local
dist
build
coverage
*.md
.vscode
.idea
`;

  await writeFile(joinPath(context.projectPath, '.dockerignore'), dockerignore);
}
