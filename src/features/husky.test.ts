import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProjectContext } from '../context';
import { logger } from '../utils/logger';
import { writeFile, joinPath, ensureDir } from '../utils/file';
import { addDevDependencies, addScripts } from '../utils/packageJson';
import { setupHusky } from './husky';

// Mock dependencies
vi.mock('../utils/logger');
vi.mock('../utils/file');
vi.mock('../utils/packageJson');

describe('Husky Feature Setup', () => {
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
    vi.mocked(logger.info).mockImplementation(() => {});
    vi.mocked(writeFile).mockResolvedValue(undefined);
    vi.mocked(joinPath).mockImplementation((...args: string[]) => args.join('/'));
    vi.mocked(ensureDir).mockResolvedValue(undefined);
    vi.mocked(addDevDependencies).mockResolvedValue(undefined);
    vi.mocked(addScripts).mockResolvedValue(undefined);
  });

  describe('setupHusky', () => {
    it('should setup Husky successfully', async () => {
      await setupHusky(mockContext);

      expect(vi.mocked(logger.step)).toHaveBeenCalledWith('Setting up Husky and lint-staged...');
      expect(vi.mocked(logger.success)).toHaveBeenCalledWith('Husky configured');
    });

    it('should install Husky dependency', async () => {
      await setupHusky(mockContext);

      expect(vi.mocked(addDevDependencies)).toHaveBeenCalledWith(
        mockContext.projectPath,
        expect.objectContaining({
          husky: expect.any(String),
        })
      );
    });

    it('should create .husky directory', async () => {
      await setupHusky(mockContext);

      expect(vi.mocked(ensureDir)).toHaveBeenCalledWith(
        expect.stringContaining('.husky')
      );
    });

    it('should create pre-commit hook', async () => {
      await setupHusky(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('pre-commit'),
        expect.any(String)
      );
    });

    it('should handle setup errors', async () => {
      const error = new Error('Setup failed');
      vi.mocked(addDevDependencies).mockRejectedValueOnce(error);

      await expect(setupHusky(mockContext)).rejects.toThrow('Setup failed');
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith('Failed to setup Husky');
    });
  });

  describe('Pre-commit Hook', () => {
    it('should run lint command in pre-commit hook', async () => {
      await setupHusky(mockContext);

      // The pre-commit hook is the second writeFile call (after .lintstagedrc.json)
      const hookCall = vi.mocked(writeFile).mock.calls[1];
      const hookContent = hookCall[1] as string;

      expect(hookContent).toContain('lint-staged');
    });

    it('should be executable', async () => {
      await setupHusky(mockContext);

      // The pre-commit hook is the second writeFile call (after .lintstagedrc.json)
      const hookCall = vi.mocked(writeFile).mock.calls[1];
      const hookContent = hookCall[1] as string;

      expect(hookContent).toContain('#!/');
    });
  });

  describe('Husky Dependencies', () => {
    it('should install husky package', async () => {
      await setupHusky(mockContext);

      const callArgs = vi.mocked(addDevDependencies).mock.calls[0];
      expect(callArgs[1]).toHaveProperty('husky');
    });
  });
});
