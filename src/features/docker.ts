import type { ProjectContext } from '../context.js';
import { logger } from '../utils/logger.js';
import { writeFile, joinPath } from '../utils/file.js';

export async function setupDocker(context: ProjectContext): Promise<void> {
  logger.step('Setting up Docker...');

  try {
    // Create Dockerfile
    await createDockerfile(context);

    // Create .dockerignore
    await createDockerignore(context);

    logger.success('Docker configured');
  } catch (error) {
    logger.error('Failed to setup Docker');
    throw error;
  }
}

async function createDockerfile(context: ProjectContext): Promise<void> {
  let dockerfile = '';

  if (context.framework === 'react') {
    dockerfile = `# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

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

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

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
yarn-error.log
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
