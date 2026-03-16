import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProjectContext } from '../context';
import { logger } from '../utils/logger';
import { writeFile, joinPath, ensureDir } from '../utils/file';
import { setupGithubActions } from './github-actions';

// Mock dependencies
vi.mock('../utils/logger');
vi.mock('../utils/file');

describe('GitHub Actions Feature Setup', () => {
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
    vi.mocked(ensureDir).mockResolvedValue(undefined);
  });

  describe('setupGithubActions', () => {
    it('should setup GitHub Actions successfully', async () => {
      await setupGithubActions(mockContext);

      expect(vi.mocked(logger.step)).toHaveBeenCalledWith('Setting up GitHub Actions...');
      expect(vi.mocked(logger.success)).toHaveBeenCalledWith('GitHub Actions configured');
    });

    it('should create .github/workflows directory', async () => {
      await setupGithubActions(mockContext);

      expect(vi.mocked(ensureDir)).toHaveBeenCalledWith(
        expect.stringContaining('.github/workflows')
      );
    });

    it('should create CI workflow file', async () => {
      await setupGithubActions(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('ci.yml'),
        expect.any(String)
      );
    });

    it('should handle setup errors', async () => {
      const error = new Error('Setup failed');
      vi.mocked(ensureDir).mockRejectedValueOnce(error);

      await expect(setupGithubActions(mockContext)).rejects.toThrow('Setup failed');
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith('Failed to setup GitHub Actions');
    });
  });

  describe('CI Workflow', () => {
    it('should define workflow name', async () => {
      await setupGithubActions(mockContext);

      const workflowCall = vi.mocked(writeFile).mock.calls[0];
      const workflow = workflowCall[1] as string;

      expect(workflow).toContain('name:');
      expect(workflow).toContain('CI');
    });

    it('should trigger on push and pull_request', async () => {
      await setupGithubActions(mockContext);

      const workflowCall = vi.mocked(writeFile).mock.calls[0];
      const workflow = workflowCall[1] as string;

      expect(workflow).toContain('on:');
      expect(workflow).toContain('push');
      expect(workflow).toContain('pull_request');
    });

    it('should checkout code', async () => {
      await setupGithubActions(mockContext);

      const workflowCall = vi.mocked(writeFile).mock.calls[0];
      const workflow = workflowCall[1] as string;

      expect(workflow).toContain('actions/checkout');
    });

    it('should setup Node.js', async () => {
      await setupGithubActions(mockContext);

      const workflowCall = vi.mocked(writeFile).mock.calls[0];
      const workflow = workflowCall[1] as string;

      expect(workflow).toContain('actions/setup-node');
    });

    it('should run tests', async () => {
      await setupGithubActions(mockContext);

      const workflowCall = vi.mocked(writeFile).mock.calls[0];
      const workflow = workflowCall[1] as string;

      expect(workflow).toContain('test');
    });

    it('should run linter', async () => {
      await setupGithubActions(mockContext);

      const workflowCall = vi.mocked(writeFile).mock.calls[0];
      const workflow = workflowCall[1] as string;

      expect(workflow).toContain('lint');
    });

    it('should build project', async () => {
      await setupGithubActions(mockContext);

      const workflowCall = vi.mocked(writeFile).mock.calls[0];
      const workflow = workflowCall[1] as string;

      expect(workflow).toContain('build');
    });
  });
});
