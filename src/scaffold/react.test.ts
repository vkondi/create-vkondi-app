import { describe, it, expect, beforeEach, vi } from 'vitest';
import { execa } from 'execa';
import type { ProjectContext } from '../context';
import { logger } from '../utils/logger';
import { ensureDir, writeFile, joinPath, removeFile, pathExists } from '../utils/file';
import { scaffoldReact } from './react';

// Mock dependencies
vi.mock('execa');
vi.mock('../utils/logger');
vi.mock('../utils/file');

describe('React Project Scaffold', () => {
  const mockContext: ProjectContext = {
    projectName: 'test-project',
    projectPath: '/test/project',
    framework: 'react',
    typescript: true,
    linter: 'eslint',
    formatter: 'prettier',
    tailwind: true,
    testing: 'vitest',
    githubActions: true,
    docker: true,
    packageManager: 'npm',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(execa).mockResolvedValue({ isCanceled: false } as unknown as Awaited<
      ReturnType<typeof execa>
    >);
    vi.mocked(logger.startSpinner).mockImplementation(() => {});
    vi.mocked(logger.succeedSpinner).mockImplementation(() => {});
    vi.mocked(logger.failSpinner).mockImplementation(() => {});
    vi.mocked(logger.success).mockImplementation(() => {});
    vi.mocked(ensureDir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);
    vi.mocked(removeFile).mockResolvedValue(undefined);
    vi.mocked(pathExists).mockResolvedValue(true);
    vi.mocked(joinPath).mockImplementation((...args: string[]) => args.join('/'));
  });

  describe('scaffoldReact', () => {
    it('should scaffold React project successfully', async () => {
      await scaffoldReact(mockContext);

      expect(vi.mocked(logger.startSpinner)).toHaveBeenCalledWith(
        'Creating React (Vite) project...'
      );
      expect(vi.mocked(logger.succeedSpinner)).toHaveBeenCalledWith('React project created');
    });

    it('should call execa to create vite project', async () => {
      await scaffoldReact(mockContext);

      expect(vi.mocked(execa)).toHaveBeenCalledWith(
        'npm',
        ['create', 'vite@latest', mockContext.projectName, '--', '--template', 'react-ts'],
        expect.any(Object)
      );
    });

    it('should use react template for JavaScript projects', async () => {
      const jsContext = { ...mockContext, typescript: false };
      await scaffoldReact(jsContext);

      expect(vi.mocked(execa)).toHaveBeenCalledWith(
        'npm',
        ['create', 'vite@latest', jsContext.projectName, '--', '--template', 'react'],
        expect.any(Object)
      );
    });

    it('should use npm to create vite project when packageManager is yarn', async () => {
      // yarn classic on Windows has a bug where unquoted Node.js paths with spaces
      // (e.g. C:\Program Files\nodejs\node.exe) cause command-not-found errors.
      // We always delegate to 'npm create vite@latest' for both npm and yarn.
      const yarnContext = { ...mockContext, packageManager: 'yarn' as const };
      await scaffoldReact(yarnContext);

      expect(vi.mocked(execa)).toHaveBeenCalledWith(
        'npm',
        ['create', 'vite@latest', yarnContext.projectName, '--', '--template', 'react-ts'],
        expect.any(Object)
      );
    });

    it('should call execa with pnpm args when packageManager is pnpm', async () => {
      const pnpmContext = { ...mockContext, packageManager: 'pnpm' as const };
      await scaffoldReact(pnpmContext);

      expect(vi.mocked(execa)).toHaveBeenCalledWith(
        'pnpm',
        ['create', 'vite', pnpmContext.projectName, '--template', 'react-ts'],
        expect.any(Object)
      );
    });

    it('should cleanup React boilerplate files', async () => {
      await scaffoldReact(mockContext);

      expect(vi.mocked(removeFile)).toHaveBeenCalledWith(expect.stringContaining('App.css'));
      expect(vi.mocked(removeFile)).toHaveBeenCalledWith(expect.stringContaining('index.css'));
      expect(vi.mocked(removeFile)).toHaveBeenCalledWith(expect.stringContaining('vite.svg'));
    });

    it('should create App component file', async () => {
      await scaffoldReact(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('App.tsx'),
        expect.stringContaining('Welcome to')
      );
    });

    it('should create main entry file', async () => {
      await scaffoldReact(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('main.tsx'),
        expect.stringContaining('createRoot')
      );
    });

    it('should create folder structure', async () => {
      await scaffoldReact(mockContext);

      const folders = ['app', 'features', 'shared', 'lib', 'hooks', 'types'];
      for (const folder of folders) {
        expect(vi.mocked(ensureDir)).toHaveBeenCalledWith(expect.stringContaining(folder));
      }
    });

    it('should create index files in folders', async () => {
      await scaffoldReact(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('index.ts'),
        expect.any(String)
      );
    });

    it('should configure vite config with path aliases', async () => {
      await scaffoldReact(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('vite.config.ts'),
        expect.stringContaining('@')
      );
    });

    it('should configure TypeScript strict mode', async () => {
      await scaffoldReact(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('tsconfig.json'),
        expect.stringContaining('strict')
      );
    });

    it('should handle setup errors gracefully', async () => {
      const error = new Error('Scaffold failed');
      vi.mocked(execa).mockRejectedValueOnce(error);

      await expect(scaffoldReact(mockContext)).rejects.toThrow('Scaffold failed');
      expect(vi.mocked(logger.failSpinner)).toHaveBeenCalledWith('Failed to create React project');
    });

    it('should create JavaScript project without TypeScript', async () => {
      const jsContext = { ...mockContext, typescript: false };
      await scaffoldReact(jsContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('App.jsx'),
        expect.any(String)
      );
    });

    it('should create main.jsx for JavaScript projects', async () => {
      const jsContext = { ...mockContext, typescript: false };
      await scaffoldReact(jsContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('main.jsx'),
        expect.stringContaining('createRoot')
      );
    });

    it('should create vite.config.js for JavaScript projects', async () => {
      const jsContext = { ...mockContext, typescript: false };
      await scaffoldReact(jsContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('vite.config.js'),
        expect.any(String)
      );
    });

    it('should log success after folder structure is created', async () => {
      await scaffoldReact(mockContext);

      const calls = vi.mocked(logger.success).mock.calls;
      expect(calls.some((call) => call[0] === 'Feature-based folder structure created')).toBe(true);
    });

    it('should log success after path aliases are configured', async () => {
      await scaffoldReact(mockContext);

      const calls = vi.mocked(logger.success).mock.calls;
      expect(calls.some((call) => call[0] === 'Path aliases configured')).toBe(true);
    });

    it('should configure strict TypeScript with proper options', async () => {
      await scaffoldReact(mockContext);

      const writeCallWithTsconfig = vi
        .mocked(writeFile)
        .mock.calls.find((call) => call[0].includes('tsconfig.json'));

      expect(writeCallWithTsconfig).toBeDefined();
      if (writeCallWithTsconfig) {
        const content = writeCallWithTsconfig[1];
        expect(content).toContain('strict');
        expect(content).toContain('noUnusedLocals');
        expect(content).toContain('noUnusedParameters');
      }
    });
  });
});
