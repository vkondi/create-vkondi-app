import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProjectContext } from '../context';
import { logger } from '../utils/logger';
import { writeFile, joinPath } from '../utils/file';
import { addDevDependencies, addScripts } from '../utils/packageJson';
import { setupTailwind } from './tailwind';

// Mock dependencies
vi.mock('../utils/logger');
vi.mock('../utils/file');
vi.mock('../utils/packageJson');

describe('Tailwind CSS Feature Setup', () => {
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

  describe('setupTailwind', () => {
    it('should setup Tailwind successfully', async () => {
      await setupTailwind(mockContext);

      expect(vi.mocked(logger.step)).toHaveBeenCalledWith('Setting up Tailwind CSS...');
      expect(vi.mocked(logger.success)).toHaveBeenCalledWith('Tailwind CSS configured');
    });

    it('should install Tailwind dependencies', async () => {
      await setupTailwind(mockContext);

      expect(vi.mocked(addDevDependencies)).toHaveBeenCalledWith(
        mockContext.projectPath,
        expect.objectContaining({
          tailwindcss: expect.any(String),
          postcss: expect.any(String),
          autoprefixer: expect.any(String),
        })
      );
    });

    it('should create Tailwind config', async () => {
      await setupTailwind(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('tailwind.config'),
        expect.any(String)
      );
    });

    it('should create PostCSS config', async () => {
      await setupTailwind(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('postcss.config'),
        expect.any(String)
      );
    });

    it('should handle setup errors', async () => {
      const error = new Error('Setup failed');
      vi.mocked(addDevDependencies).mockRejectedValueOnce(error);

      await expect(setupTailwind(mockContext)).rejects.toThrow('Setup failed');
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith('Failed to setup Tailwind CSS');
    });
  });

  describe('Tailwind Config', () => {
    it('should configure content paths', async () => {
      await setupTailwind(mockContext);

      const configCall = vi.mocked(writeFile).mock.calls[0];
      const config = configCall[1] as string;

      expect(config).toContain('content');
      expect(config).toContain('src');
    });

    it('should include theme configuration', async () => {
      await setupTailwind(mockContext);

      const configCall = vi.mocked(writeFile).mock.calls[0];
      const config = configCall[1] as string;

      expect(config).toContain('theme');
    });

    it('should include plugins', async () => {
      await setupTailwind(mockContext);

      const configCall = vi.mocked(writeFile).mock.calls[0];
      const config = configCall[1] as string;

      expect(config).toContain('plugins');
    });
  });

  describe('PostCSS Config', () => {
    it('should include Tailwind CSS plugin', async () => {
      await setupTailwind(mockContext);

      const postcssCall = vi.mocked(writeFile).mock.calls[1];
      const postcss = postcssCall[1] as string;

      expect(postcss).toContain('tailwindcss');
    });

    it('should include autoprefixer', async () => {
      await setupTailwind(mockContext);

      const postcssCall = vi.mocked(writeFile).mock.calls[1];
      const postcss = postcssCall[1] as string;

      expect(postcss).toContain('autoprefixer');
    });
  });
});
