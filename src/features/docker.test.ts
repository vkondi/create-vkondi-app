import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProjectContext } from '../context';
import { logger } from '../utils/logger';
import { writeFile, joinPath } from '../utils/file';
import { setupDocker } from './docker';

// Mock dependencies
vi.mock('../utils/logger');
vi.mock('../utils/file');

describe('Docker Feature Setup', () => {
  const mockContext: ProjectContext = {
    projectName: 'test-project',
    projectPath: '/test/project',
    framework: 'react',
    typescript: true,
    lintingMode: 'standard',
    tailwind: true,
    testing: 'vitest',
    githubActions: true,
    docker: true,
    packageManager: 'npm',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(logger.step).mockImplementation(() => {});
    vi.mocked(logger.success).mockImplementation(() => {});
    vi.mocked(logger.error).mockImplementation(() => {});
    vi.mocked(writeFile).mockResolvedValue(undefined);
    vi.mocked(joinPath).mockImplementation((...args: string[]) => args.join('/'));
  });

  describe('setupDocker', () => {
    it('should setup Docker successfully', async () => {
      await setupDocker(mockContext);

      expect(vi.mocked(logger.step)).toHaveBeenCalledWith('Setting up Docker...');
      expect(vi.mocked(logger.success)).toHaveBeenCalledWith('Docker configured');
    });

    it('should create Dockerfile', async () => {
      await setupDocker(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('Dockerfile'),
        expect.stringContaining('FROM')
      );
    });

    it('should create .dockerignore file', async () => {
      await setupDocker(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('.dockerignore'),
        expect.any(String)
      );
    });

    it('should handle setup errors', async () => {
      const error = new Error('Setup failed');
      vi.mocked(writeFile).mockRejectedValueOnce(error);

      await expect(setupDocker(mockContext)).rejects.toThrow('Setup failed');
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith('Failed to setup Docker');
    });
  });

  describe('Dockerfile for React Projects', () => {
    it('should create multistage React Dockerfile', async () => {
      const reactContext = { ...mockContext, framework: 'react' as const };
      await setupDocker(reactContext);

      const dockerfileCall = vi.mocked(writeFile).mock.calls[0];
      const dockerfile = dockerfileCall[1] as string;

      expect(dockerfile).toContain('FROM node:20-alpine AS build');
      expect(dockerfile).toContain('FROM nginx:alpine');
    });

    it('should include build stage for React', async () => {
      const reactContext = { ...mockContext, framework: 'react' as const };
      await setupDocker(reactContext);

      const dockerfileCall = vi.mocked(writeFile).mock.calls[0];
      const dockerfile = dockerfileCall[1] as string;

      expect(dockerfile).toContain('yarn install');
      expect(dockerfile).toContain('yarn build');
    });

    it('should setup nginx for React', async () => {
      const reactContext = { ...mockContext, framework: 'react' as const };
      await setupDocker(reactContext);

      const dockerfileCall = vi.mocked(writeFile).mock.calls[0];
      const dockerfile = dockerfileCall[1] as string;

      expect(dockerfile).toContain('nginx');
      expect(dockerfile).toContain('/app/dist');
    });

    it('should expose port 80 for React', async () => {
      const reactContext = { ...mockContext, framework: 'react' as const };
      await setupDocker(reactContext);

      const dockerfileCall = vi.mocked(writeFile).mock.calls[0];
      const dockerfile = dockerfileCall[1] as string;

      expect(dockerfile).toContain('EXPOSE 80');
    });
  });

  describe('Dockerfile for Next.js Projects', () => {
    it('should create Next.js Dockerfile', async () => {
      const nextContext = { ...mockContext, framework: 'next' as const };
      await setupDocker(nextContext);

      const dockerfileCall = vi.mocked(writeFile).mock.calls[0];
      const dockerfile = dockerfileCall[1] as string;

      expect(dockerfile).toContain('FROM node:20-alpine');
      expect(dockerfile).toContain('next');
    });

    it('should setup Next.js production build with multistage', async () => {
      const nextContext = { ...mockContext, framework: 'next' as const };
      await setupDocker(nextContext);

      const dockerfileCall = vi.mocked(writeFile).mock.calls[0];
      const dockerfile = dockerfileCall[1] as string;

      expect(dockerfile).toContain('yarn build');
      expect(dockerfile).toContain('server.js');
      expect(dockerfile).toContain('EXPOSE 3000');
    });

    it('should expose port 3000 for Next.js', async () => {
      const nextContext = { ...mockContext, framework: 'next' as const };
      await setupDocker(nextContext);

      const dockerfileCall = vi.mocked(writeFile).mock.calls[0];
      const dockerfile = dockerfileCall[1] as string;

      expect(dockerfile).toContain('EXPOSE 3000');
    });
  });

  describe('.dockerignore File', () => {
    it('should exclude node_modules', async () => {
      await setupDocker(mockContext);

      const ignoreCall = vi.mocked(writeFile).mock.calls[1];
      const ignoreContent = ignoreCall[1] as string;

      expect(ignoreContent).toContain('node_modules');
    });

    it('should exclude git directories', async () => {
      await setupDocker(mockContext);

      const ignoreCall = vi.mocked(writeFile).mock.calls[1];
      const ignoreContent = ignoreCall[1] as string;

      expect(ignoreContent).toContain('.git');
    });

    it('should exclude coverage', async () => {
      await setupDocker(mockContext);

      const ignoreCall = vi.mocked(writeFile).mock.calls[1];
      const ignoreContent = ignoreCall[1] as string;

      expect(ignoreContent).toContain('coverage');
    });

    it('should exclude log files', async () => {
      await setupDocker(mockContext);

      const ignoreCall = vi.mocked(writeFile).mock.calls[1];
      const ignoreContent = ignoreCall[1] as string;

      expect(ignoreContent).toContain('yarn-error.log');
    });
  });
});
