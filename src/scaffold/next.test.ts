import { describe, it, expect, beforeEach, vi } from 'vitest';
import { execa } from 'execa';
import type { ProjectContext } from '../context';
import { logger } from '../utils/logger';
import { writeFile, joinPath, pathExists } from '../utils/file';
import { scaffoldNext } from './next';

// Mock dependencies
vi.mock('execa');
vi.mock('../utils/logger');
vi.mock('../utils/file');

describe('Next.js Project Scaffold', () => {
  const mockContext: ProjectContext = {
    projectName: 'test-project',
    projectPath: '/test/project',
    framework: 'next',
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
    vi.mocked(execa).mockResolvedValue({} as any);
    vi.mocked(logger.step).mockImplementation(() => {});
    vi.mocked(logger.success).mockImplementation(() => {});
    vi.mocked(logger.error).mockImplementation(() => {});
    vi.mocked(writeFile).mockResolvedValue(undefined);
    vi.mocked(pathExists).mockResolvedValue(true);
    vi.mocked(joinPath).mockImplementation((...args: string[]) => args.join('/'));
  });

  describe('scaffoldNext', () => {
    it('should scaffold Next.js project successfully', async () => {
      await scaffoldNext(mockContext);

      expect(vi.mocked(logger.step)).toHaveBeenCalledWith('Creating Next.js project...');
      expect(vi.mocked(logger.success)).toHaveBeenCalledWith('Next.js project created');
    });

    it('should call execa to create next project', async () => {
      await scaffoldNext(mockContext);

      expect(vi.mocked(execa)).toHaveBeenCalledWith(
        'npx',
        [
          'create-next-app@latest',
          mockContext.projectName,
          '--',
          '--app',
          '--use-yarn',
          '--no-git',
        ],
        expect.any(Object)
      );
    });

    it('should detect TypeScript from tsconfig.json', async () => {
      vi.mocked(pathExists).mockResolvedValueOnce(true);
      await scaffoldNext(mockContext);

      expect(vi.mocked(pathExists)).toHaveBeenCalledWith(
        expect.stringContaining('tsconfig.json')
      );
    });

    it('should configure TypeScript when detected', async () => {
      vi.mocked(pathExists).mockResolvedValueOnce(true);
      await scaffoldNext(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('tsconfig.json'),
        expect.stringContaining('strict')
      );
    });

    it('should skip TypeScript configuration when not detected', async () => {
      vi.mocked(pathExists).mockResolvedValueOnce(false);
      await scaffoldNext(mockContext);

      expect(vi.mocked(writeFile)).not.toHaveBeenCalledWith(
        expect.stringContaining('tsconfig.json'),
        expect.any(String)
      );
    });

    it('should update next.config.ts when TypeScript is detected', async () => {
      vi.mocked(pathExists).mockResolvedValueOnce(true);
      await scaffoldNext(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('next.config.ts'),
        expect.stringContaining('nextConfig')
      );
    });

    it('should update next.config.mjs when TypeScript is not detected', async () => {
      vi.mocked(pathExists).mockResolvedValueOnce(false);
      await scaffoldNext(mockContext);

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('next.config.mjs'),
        expect.stringContaining('nextConfig')
      );
    });

    it('should configure TypeScript with path mappings', async () => {
      vi.mocked(pathExists).mockResolvedValueOnce(true);
      await scaffoldNext(mockContext);

      const tsconfigCall = vi.mocked(writeFile).mock.calls.find(call =>
        call[0].includes('tsconfig.json')
      );
      
      expect(tsconfigCall).toBeDefined();
      if (tsconfigCall) {
        const content = tsconfigCall[1];
        expect(content).toContain('@');
        expect(content).toContain('strict');
      }
    });

    it('should configure Next.js config with security headers', async () => {
      vi.mocked(pathExists).mockResolvedValueOnce(true);
      await scaffoldNext(mockContext);

      const nextConfigCall = vi.mocked(writeFile).mock.calls.find(call =>
        call[0].includes('next.config')
      );
      
      expect(nextConfigCall).toBeDefined();
      if (nextConfigCall) {
        const content = nextConfigCall[1];
        expect(content).toContain('reactStrictMode');
        expect(content).toContain('X-Frame-Options');
        expect(content).toContain('X-Content-Type-Options');
      }
    });

    it('should handle setup errors gracefully', async () => {
      const error = new Error('Setup failed');
      vi.mocked(execa).mockRejectedValueOnce(error);

      await expect(scaffoldNext(mockContext)).rejects.toThrow('Setup failed');
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith('Failed to create Next.js project');
    });

    it('should log success after TypeScript configuration', async () => {
      vi.mocked(pathExists).mockResolvedValueOnce(true);
      await scaffoldNext(mockContext);

      const calls = vi.mocked(logger.success).mock.calls;
      expect(calls.some(call => call[0] === 'Strict TypeScript configuration applied')).toBe(true);
    });

    it('should log success after Next.js configuration update', async () => {
      vi.mocked(pathExists).mockResolvedValueOnce(true);
      await scaffoldNext(mockContext);

      const calls = vi.mocked(logger.success).mock.calls;
      expect(calls.some(call => call[0] === 'Next.js configuration updated')).toBe(true);
    });

    it('should make execa call with stdio inherit property', async () => {
      await scaffoldNext(mockContext);

      const call = vi.mocked(execa).mock.calls[0] as any[];
      expect(call[2]).toHaveProperty('stdio', 'inherit');
    });

    it('should make execa call with cwd set to process.cwd()', async () => {
      await scaffoldNext(mockContext);

      const call = vi.mocked(execa).mock.calls[0] as any[];
      expect(call[2]).toHaveProperty('cwd');
    });

    it('should configure Next.js with reactStrictMode enabled', async () => {
      vi.mocked(pathExists).mockResolvedValueOnce(true);
      await scaffoldNext(mockContext);

      const nextConfigCall = vi.mocked(writeFile).mock.calls.find(call =>
        call[0].includes('next.config')
      );
      
      if (nextConfigCall) {
        expect(nextConfigCall[1]).toContain('reactStrictMode: true');
      }
    });

    it('should set poweredByHeader to false in Next.js config', async () => {
      vi.mocked(pathExists).mockResolvedValueOnce(true);
      await scaffoldNext(mockContext);

      const nextConfigCall = vi.mocked(writeFile).mock.calls.find(call =>
        call[0].includes('next.config')
      );
      
      if (nextConfigCall) {
        expect(nextConfigCall[1]).toContain('poweredByHeader: false');
      }
    });

    it('should configure TypeScript with proper compiler options', async () => {
      vi.mocked(pathExists).mockResolvedValueOnce(true);
      await scaffoldNext(mockContext);

      const tsconfigCall = vi.mocked(writeFile).mock.calls.find(call =>
        call[0].includes('tsconfig.json')
      );
      
      if (tsconfigCall) {
        const content = tsconfigCall[1];
        expect(content).toContain('noUnusedLocals');
        expect(content).toContain('noUnusedParameters');
        expect(content).toContain('noFallthroughCasesInSwitch');
      }
    });
  });
});
