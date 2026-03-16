import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProjectContext } from '../context';
import { logger } from '../utils/logger';
import { writeFile, joinPath } from '../utils/file';
import { addDevDependencies, addScripts } from '../utils/packageJson';
import { setupESLint } from './eslint';

// Mock dependencies
vi.mock('../utils/logger');
vi.mock('../utils/file');
vi.mock('../utils/packageJson');

describe('ESLint Feature Setup', () => {
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

  describe('setupESLint', () => {
    it('should setup ESLint successfully', async () => {
      await setupESLint(mockContext);

      expect(vi.mocked(logger.step)).toHaveBeenCalledWith('Setting up ESLint...');
      expect(vi.mocked(logger.success)).toHaveBeenCalledWith('ESLint configured');
    });

    it('should install ESLint dependencies', async () => {
      await setupESLint(mockContext);

      expect(vi.mocked(addDevDependencies)).toHaveBeenCalledWith(
        mockContext.projectPath,
        expect.objectContaining({
          eslint: expect.stringContaining('^8'),
        })
      );
    });

    it('should add lint scripts', async () => {
      await setupESLint(mockContext);

      expect(vi.mocked(addScripts)).toHaveBeenCalledWith(
        mockContext.projectPath,
        expect.objectContaining({
          lint: expect.stringContaining('eslint'),
          'lint:fix': expect.stringContaining('eslint'),
        })
      );
    });

    it('should create ESLint config file', async () => {
      await setupESLint(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('eslint.config'),
        expect.any(String)
      );
    });

    it('should create .eslintignore file', async () => {
      await setupESLint(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('.eslintignore'),
        expect.stringContaining('node_modules')
      );
    });

    it('should handle setup errors', async () => {
      const error = new Error('Setup failed');
      vi.mocked(addDevDependencies).mockRejectedValueOnce(error);

      await expect(setupESLint(mockContext)).rejects.toThrow('Setup failed');
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith('Failed to setup ESLint');
    });
  });

  describe('ESLint Dependencies', () => {
    it('should install base ESLint dependencies', async () => {
      await setupESLint(mockContext);

      const callArgs = vi.mocked(addDevDependencies).mock.calls[0];
      expect(callArgs[1]).toHaveProperty('eslint');
      expect(callArgs[1]).toHaveProperty('eslint-plugin-import');
    });

    it('should install TypeScript ESLint when TypeScript is enabled', async () => {
      const tsContext = { ...mockContext, typescript: true };
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      
      await setupESLint(tsContext);

      const callArgs = vi.mocked(addDevDependencies).mock.calls[0];
      expect(callArgs[1]).toHaveProperty('@typescript-eslint/eslint-plugin');
      expect(callArgs[1]).toHaveProperty('@typescript-eslint/parser');
    });

    it('should not install TypeScript ESLint when TypeScript is disabled', async () => {
      const noTsContext = { ...mockContext, typescript: false };
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      
      await setupESLint(noTsContext);

      const callArgs = vi.mocked(addDevDependencies).mock.calls[0];
      expect(callArgs[1]).not.toHaveProperty('@typescript-eslint/eslint-plugin');
    });

    it('should install React ESLint plugins for React projects', async () => {
      const reactContext = { ...mockContext, framework: 'react' as const };
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      
      await setupESLint(reactContext);

      const callArgs = vi.mocked(addDevDependencies).mock.calls[0];
      expect(callArgs[1]).toHaveProperty('eslint-plugin-react');
      expect(callArgs[1]).toHaveProperty('eslint-plugin-react-hooks');
      expect(callArgs[1]).toHaveProperty('eslint-plugin-jsx-a11y');
    });

    it('should not install React ESLint plugins for Next.js projects', async () => {
      const nextContext = { ...mockContext, framework: 'next' as const };
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      
      await setupESLint(nextContext);

      const callArgs = vi.mocked(addDevDependencies).mock.calls[0];
      expect(callArgs[1]).not.toHaveProperty('eslint-plugin-react');
    });
  });

  describe('ESLint Config File', () => {
    it('should create eslint.config.ts for TypeScript projects', async () => {
      const tsContext = { ...mockContext, typescript: true };
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      
      await setupESLint(tsContext);

      expect(vi.mocked(joinPath)).toHaveBeenCalledWith(
        expect.any(String),
        'eslint.config.ts'
      );
    });

    it('should create eslint.config.js for non-TypeScript projects', async () => {
      const jsContext = { ...mockContext, typescript: false };
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      
      await setupESLint(jsContext);

      expect(vi.mocked(joinPath)).toHaveBeenCalledWith(
        expect.any(String),
        'eslint.config.js'
      );
    });

    it('should include recommended configs', async () => {
      await setupESLint(mockContext);

      const configCall = vi.mocked(writeFile).mock.calls[0];
      const config = configCall[1] as string;
      
      expect(config).toContain('@eslint/js');
      expect(config).toContain('js.configs.recommended');
    });

    it('should include import/order rule', async () => {
      await setupESLint(mockContext);

      const configCall = vi.mocked(writeFile).mock.calls[0];
      const config = configCall[1] as string;
      
      expect(config).toContain('import/order');
      expect(config).toContain('alphabetize');
    });
  });

  describe('ESLint Rules', () => {
    it('should disable console logs in standard mode', async () => {
      const standardContext = { ...mockContext, lintingMode: 'standard' as const };
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      
      await setupESLint(standardContext);

      const configCall = vi.mocked(writeFile).mock.calls[0];
      const config = configCall[1] as string;
      
      expect(config).toContain("'no-console': 'off'");
    });

    it('should warn about console logs in strict mode', async () => {
      const strictContext = { ...mockContext, lintingMode: 'strict' as const };
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      
      await setupESLint(strictContext);

      const configCall = vi.mocked(writeFile).mock.calls[0];
      const config = configCall[1] as string;
      
      expect(config).toContain("'no-console': ['warn'");
    });

    it('should configure React rules for React projects', async () => {
      const reactContext = { ...mockContext, framework: 'react' as const };
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      
      await setupESLint(reactContext);

      const configCall = vi.mocked(writeFile).mock.calls[0];
      const config = configCall[1] as string;
      
      expect(config).toContain('react-hooks/rules-of-hooks');
      expect(config).toContain('react-hooks/exhaustive-deps');
    });

    it('should configure TypeScript rules for TypeScript projects', async () => {
      const tsContext = { ...mockContext, typescript: true };
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);
      
      await setupESLint(tsContext);

      const configCall = vi.mocked(writeFile).mock.calls[0];
      const config = configCall[1] as string;
      
      expect(config).toContain('@typescript-eslint/no-unused-vars');
      expect(config).toContain('@typescript-eslint/no-explicit-any');
    });
  });

  describe('Lint Scripts', () => {
    it('should include TypeScript and JavaScript file extensions', async () => {
      await setupESLint(mockContext);

      const scriptCall = vi.mocked(addScripts).mock.calls[0];
      const lintScript = scriptCall[1]['lint'];
      
      expect(lintScript).toContain('.ts');
      expect(lintScript).toContain('.tsx');
      expect(lintScript).toContain('.js');
      expect(lintScript).toContain('.jsx');
    });

    it('should have lint:fix script with --fix flag', async () => {
      await setupESLint(mockContext);

      const scriptCall = vi.mocked(addScripts).mock.calls[0];
      const lintFixScript = scriptCall[1]['lint:fix'];
      
      expect(lintFixScript).toContain('--fix');
    });
  });

  describe('.eslintignore File', () => {
    it('should ignore common directories', async () => {
      await setupESLint(mockContext);

      const ignoreCall = vi.mocked(writeFile).mock.calls[1];
      const ignoreContent = ignoreCall[1] as string;
      
      expect(ignoreContent).toContain('node_modules');
      expect(ignoreContent).toContain('dist');
      expect(ignoreContent).toContain('build');
      expect(ignoreContent).toContain('.next');
      expect(ignoreContent).toContain('coverage');
    });

    it('should ignore config files', async () => {
      await setupESLint(mockContext);

      const ignoreCall = vi.mocked(writeFile).mock.calls[1];
      const ignoreContent = ignoreCall[1] as string;
      
      expect(ignoreContent).toContain('*.config.js');
      expect(ignoreContent).toContain('*.config.ts');
    });
  });
});
