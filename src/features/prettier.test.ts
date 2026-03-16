import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProjectContext } from '../context';
import { logger } from '../utils/logger';
import { writeFile, joinPath } from '../utils/file';
import { addDevDependencies, addScripts } from '../utils/packageJson';
import { setupPrettier } from './prettier';

// Mock dependencies
vi.mock('../utils/logger');
vi.mock('../utils/file');
vi.mock('../utils/packageJson');

describe('Prettier Feature Setup', () => {
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
    vi.mocked(joinPath).mockImplementation((...args) => args.join('/'));
    vi.mocked(addDevDependencies).mockResolvedValue(undefined);
    vi.mocked(addScripts).mockResolvedValue(undefined);
  });

  describe('setupPrettier', () => {
    it('should setup Prettier successfully', async () => {
      await setupPrettier(mockContext);

      expect(vi.mocked(logger.step)).toHaveBeenCalledWith('Setting up Prettier...');
      expect(vi.mocked(addDevDependencies)).toHaveBeenCalledWith(
        mockContext.projectPath,
        expect.objectContaining({
          prettier: '^3.2.5',
          'eslint-config-prettier': '^9.1.0',
          'eslint-plugin-prettier': '^5.1.3',
        })
      );
    });

    it('should create Prettier config file', async () => {
      await setupPrettier(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('.prettierrc.json'),
        expect.stringContaining('semi')
      );
    });

    it('should create .prettierignore file', async () => {
      await setupPrettier(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('.prettierignore'),
        expect.stringContaining('node_modules')
      );
    });

    it('should add format scripts', async () => {
      await setupPrettier(mockContext);

      expect(vi.mocked(addScripts)).toHaveBeenCalledWith(
        mockContext.projectPath,
        expect.objectContaining({
          format: expect.stringContaining('prettier'),
          'format:check': expect.stringContaining('prettier'),
        })
      );
    });

    it('should log success message', async () => {
      await setupPrettier(mockContext);

      expect(vi.mocked(logger.success)).toHaveBeenCalledWith('Prettier configured');
    });

    it('should handle setup errors', async () => {
      const error = new Error('Setup failed');
      vi.mocked(addDevDependencies).mockRejectedValueOnce(error);

      await expect(setupPrettier(mockContext)).rejects.toThrow('Setup failed');
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith('Failed to setup Prettier');
    });

    it('should add required Prettier dependencies', async () => {
      await setupPrettier(mockContext);

      const callArgs = vi.mocked(addDevDependencies).mock.calls[0];
      expect(callArgs[1]).toHaveProperty('prettier');
      expect(callArgs[1]).toHaveProperty('eslint-config-prettier');
      expect(callArgs[1]).toHaveProperty('eslint-plugin-prettier');
    });
  });

  describe('Prettier Config', () => {
    it('should configure with correct formatting options', async () => {
      await setupPrettier(mockContext);

      const configCall = vi.mocked(writeFile).mock.calls[0];
      const config = configCall[1];
      
      expect(config).toContain('"semi": true');
      expect(config).toContain('"singleQuote": true');
      expect(config).toContain('"printWidth": 100');
      expect(config).toContain('"tabWidth": 2');
    });

    it('should set trailingComma to es5', async () => {
      await setupPrettier(mockContext);

      const configCall = vi.mocked(writeFile).mock.calls[0];
      const config = configCall[1];
      
      expect(config).toContain('"trailingComma": "es5"');
    });

    it('should configure lineEnding to lf', async () => {
      await setupPrettier(mockContext);

      const configCall = vi.mocked(writeFile).mock.calls[0];
      const config = configCall[1];
      
      expect(config).toContain('"endOfLine": "lf"');
    });

    it('should enable arrowParens', async () => {
      await setupPrettier(mockContext);

      const configCall = vi.mocked(writeFile).mock.calls[0];
      const config = configCall[1];
      
      expect(config).toContain('"arrowParens": "always"');
    });

    it('should enable bracketSpacing', async () => {
      await setupPrettier(mockContext);

      const configCall = vi.mocked(writeFile).mock.calls[0];
      const config = configCall[1];
      
      expect(config).toContain('"bracketSpacing": true');
    });
  });

  describe('Prettier Ignore File', () => {
    it('should include common ignored directories', async () => {
      await setupPrettier(mockContext);

      const ignoreCall = vi.mocked(writeFile).mock.calls[1];
      const ignoreContent = ignoreCall[1] as string;
      
      expect(ignoreContent).toContain('node_modules');
      expect(ignoreContent).toContain('dist');
      expect(ignoreContent).toContain('coverage');
      expect(ignoreContent).toContain('.next');
    });

    it('should ignore lock files', async () => {
      await setupPrettier(mockContext);

      const ignoreCall = vi.mocked(writeFile).mock.calls[1];
      const ignoreContent = ignoreCall[1] as string;
      
      expect(ignoreContent).toContain('package-lock.json');
      expect(ignoreContent).toContain('yarn.lock');
      expect(ignoreContent).toContain('pnpm-lock.yaml');
    });

    it('should ignore minified files', async () => {
      await setupPrettier(mockContext);

      const ignoreCall = vi.mocked(writeFile).mock.calls[1];
      const ignoreContent = ignoreCall[1] as string;
      
      expect(ignoreContent).toContain('*.min.js');
      expect(ignoreContent).toContain('*.min.css');
    });

    it('should ignore public directory', async () => {
      await setupPrettier(mockContext);

      const ignoreCall = vi.mocked(writeFile).mock.calls[1];
      const ignoreContent = ignoreCall[1] as string;
      
      expect(ignoreContent).toContain('public');
    });
  });

  describe('Format Scripts', () => {
    it('should add format script for common file types', async () => {
      await setupPrettier(mockContext);

      const scriptCall = vi.mocked(addScripts).mock.calls[0];
      const scripts = scriptCall[1];
      const formatScript = scripts['format'];
      
      expect(formatScript).toContain('ts');
      expect(formatScript).toContain('tsx');
      expect(formatScript).toContain('js');
      expect(formatScript).toContain('jsx');
      expect(formatScript).toContain('json');
      expect(formatScript).toContain('css');
      expect(formatScript).toContain('md');
    });

    it('should add format:check script', async () => {
      await setupPrettier(mockContext);

      const scriptCall = vi.mocked(addScripts).mock.calls[0];
      const scripts = scriptCall[1];
      
      expect(scripts).toHaveProperty('format:check');
      expect(scripts['format:check']).toContain('--check');
    });

    it('should format files in src directory', async () => {
      await setupPrettier(mockContext);

      const scriptCall = vi.mocked(addScripts).mock.calls[0];
      const scripts = scriptCall[1];
      
      expect(scripts['format']).toContain('src/**');
    });
  });
});
