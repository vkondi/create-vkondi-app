import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProjectContext } from '../context';
import { logger } from '../utils/logger';
import { writeFile, joinPath } from '../utils/file';
import { addDevDependencies, addScripts } from '../utils/packageJson';
import { setupVitest } from './vitest';

// Mock dependencies
vi.mock('../utils/logger');
vi.mock('../utils/file');
vi.mock('../utils/packageJson');

describe('Vitest Feature Setup', () => {
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
    vi.mocked(addDevDependencies).mockResolvedValue(undefined);
    vi.mocked(addScripts).mockResolvedValue(undefined);
  });

  describe('setupVitest', () => {
    it('should setup Vitest successfully', async () => {
      await setupVitest(mockContext);

      expect(vi.mocked(logger.step)).toHaveBeenCalledWith('Setting up Vitest...');
      expect(vi.mocked(logger.success)).toHaveBeenCalledWith('Vitest configured');
    });

    it('should install Vitest dependencies', async () => {
      await setupVitest(mockContext);

      expect(vi.mocked(addDevDependencies)).toHaveBeenCalledWith(
        mockContext.projectPath,
        expect.objectContaining({
          vitest: expect.any(String),
        })
      );
    });

    it('should create Vitest config', async () => {
      await setupVitest(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('vitest.config'),
        expect.any(String)
      );
    });

    it('should add test scripts', async () => {
      await setupVitest(mockContext);

      expect(vi.mocked(addScripts)).toHaveBeenCalledWith(
        mockContext.projectPath,
        expect.objectContaining({
          test: expect.any(String),
          'test:ui': expect.any(String),
          'test:coverage': expect.any(String),
        })
      );
    });

    it('should handle setup errors', async () => {
      const error = new Error('Setup failed');
      vi.mocked(addDevDependencies).mockRejectedValueOnce(error);

      await expect(setupVitest(mockContext)).rejects.toThrow('Setup failed');
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith('Failed to setup Vitest');
    });
  });

  describe('Vitest Config', () => {
    it('should configure globals test environment', async () => {
      await setupVitest(mockContext);

      const configCall = vi.mocked(writeFile).mock.calls[0];
      const config = configCall[1] as string;

      expect(config).toContain('globals');
    });

    it('should setup test environment', async () => {
      await setupVitest(mockContext);

      const configCall = vi.mocked(writeFile).mock.calls[0];
      const config = configCall[1] as string;

      expect(config).toContain('environment');
    });

    it('should configure coverage', async () => {
      await setupVitest(mockContext);

      const configCall = vi.mocked(writeFile).mock.calls[0];
      const config = configCall[1] as string;

      expect(config).toContain('coverage');
    });
  });

  describe('Test Scripts', () => {
    it('should include test script', async () => {
      await setupVitest(mockContext);

      const scriptCall = vi.mocked(addScripts).mock.calls[0];
      const scripts = scriptCall[1];

      expect(scripts).toHaveProperty('test');
    });

    it('should include ui script', async () => {
      await setupVitest(mockContext);

      const scriptCall = vi.mocked(addScripts).mock.calls[0];
      const scripts = scriptCall[1];

      expect(scripts).toHaveProperty('test:ui');
      expect(scripts['test:ui']).toContain('--ui');
    });

    it('should include coverage script', async () => {
      await setupVitest(mockContext);

      const scriptCall = vi.mocked(addScripts).mock.calls[0];
      const scripts = scriptCall[1];

      expect(scripts).toHaveProperty('test:coverage');
      expect(scripts['test:coverage']).toContain('--coverage');
    });
  });
});
