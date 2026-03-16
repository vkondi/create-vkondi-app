import { describe, it, expect, beforeEach, vi } from 'vitest';
import prompts from 'prompts';
import { collectUserInput } from './prompts';
import * as loggerModule from './utils/logger';
import * as fileModule from './utils/file';

// Mock dependencies
vi.mock('prompts');
vi.mock('./utils/logger');
vi.mock('./utils/file');

describe('Prompts Module', () => {
  const mockLogger = {
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    step: vi.fn(),
    newLine: vi.fn(),
    startSpinner: vi.fn(),
    succeedSpinner: vi.fn(),
    failSpinner: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loggerModule.logger).info = mockLogger.info;
    vi.mocked(loggerModule.logger).newLine = mockLogger.newLine;
    vi.mocked(loggerModule.logger).error = mockLogger.error;
  });

  describe('collectUserInput', () => {
    it('should collect project name when not provided', async () => {
      vi.mocked(prompts)
        .mockResolvedValueOnce({
          projectName: 'my-app',
          framework: 'react',
        })
        .mockResolvedValueOnce({
          typescript: true,
          lintingMode: 'strict',
          tailwind: true,
          testing: 'vitest',
          githubActions: true,
          docker: false,
        });

      vi.mocked(fileModule.pathExists).mockResolvedValueOnce(false);

      const result = await collectUserInput();

      expect(result.projectName).toBe('my-app');
      expect(result.framework).toBe('react');
    });

    it('should use provided project name', async () => {
      vi.mocked(prompts)
        .mockResolvedValueOnce({
          projectName: undefined,
          framework: 'next',
        })
        .mockResolvedValueOnce({
          testing: 'vitest',
          githubActions: true,
          docker: false,
        });

      vi.mocked(fileModule.pathExists).mockResolvedValueOnce(false);

      const result = await collectUserInput('provided-app');

      expect(result.projectName).toBe('provided-app');
    });

    it('should ask about TypeScript for React projects', async () => {
      vi.mocked(prompts)
        .mockResolvedValueOnce({
          projectName: 'test-app',
          framework: 'react',
        })
        .mockResolvedValueOnce({
          typescript: false,
          lintingMode: 'standard',
          tailwind: false,
          testing: 'none',
          githubActions: false,
          docker: false,
        });

      vi.mocked(fileModule.pathExists).mockResolvedValueOnce(false);

      const result = await collectUserInput();

      expect(result.typescript).toBe(false);
    });

    it('should set TypeScript to true for Next.js by default', async () => {
      vi.mocked(prompts)
        .mockResolvedValueOnce({
          projectName: 'next-app',
          framework: 'next',
        })
        .mockResolvedValueOnce({
          testing: 'vitest',
          githubActions: true,
          docker: false,
        });

      vi.mocked(fileModule.pathExists).mockResolvedValueOnce(false);

      const result = await collectUserInput();

      expect(result.framework).toBe('next');
      expect(result.typescript).toBe(true);
    });

    it('should ask about Tailwind for React projects', async () => {
      vi.mocked(prompts)
        .mockResolvedValueOnce({
          projectName: 'react-app',
          framework: 'react',
        })
        .mockResolvedValueOnce({
          typescript: true,
          lintingMode: 'strict',
          tailwind: true,
          testing: 'vitest',
          githubActions: true,
          docker: false,
        });

      vi.mocked(fileModule.pathExists).mockResolvedValueOnce(false);

      const result = await collectUserInput();

      expect(result.tailwind).toBe(true);
    });

    it('should not ask about Tailwind for Next.js projects', async () => {
      vi.mocked(prompts)
        .mockResolvedValueOnce({
          projectName: 'next-app',
          framework: 'next',
        })
        .mockResolvedValueOnce({
          testing: 'vitest',
          githubActions: false,
          docker: false,
        });

      vi.mocked(fileModule.pathExists).mockResolvedValueOnce(false);

      const result = await collectUserInput();

      expect(result.tailwind).toBe(false);
    });

    it('should ask about testing framework', async () => {
      vi.mocked(prompts)
        .mockResolvedValueOnce({
          projectName: 'test-app',
          framework: 'react',
        })
        .mockResolvedValueOnce({
          typescript: true,
          lintingMode: 'strict',
          tailwind: false,
          testing: 'vitest',
          githubActions: true,
          docker: false,
        });

      vi.mocked(fileModule.pathExists).mockResolvedValueOnce(false);

      const result = await collectUserInput();

      expect(result.testing).toBe('vitest');
    });

    it('should ask about GitHub Actions with default Yes', async () => {
      vi.mocked(prompts)
        .mockResolvedValueOnce({
          projectName: 'app',
          framework: 'react',
        })
        .mockResolvedValueOnce({
          typescript: true,
          lintingMode: 'strict',
          tailwind: true,
          testing: 'vitest',
          githubActions: true,
          docker: false,
        });

      vi.mocked(fileModule.pathExists).mockResolvedValueOnce(false);

      const result = await collectUserInput();

      expect(result.githubActions).toBe(true);
    });

    it('should ask about Docker', async () => {
      vi.mocked(prompts)
        .mockResolvedValueOnce({
          projectName: 'docker-app',
          framework: 'react',
        })
        .mockResolvedValueOnce({
          typescript: true,
          lintingMode: 'strict',
          tailwind: false,
          testing: 'vitest',
          githubActions: true,
          docker: true,
        });

      vi.mocked(fileModule.pathExists).mockResolvedValueOnce(false);

      const result = await collectUserInput();

      expect(result.docker).toBe(true);
    });

    it('should prompt for overwrite if directory exists', async () => {
      vi.mocked(prompts)
        .mockResolvedValueOnce({
          projectName: 'existing-app',
          framework: 'react',
        })
        .mockResolvedValueOnce({
          typescript: true,
          lintingMode: 'strict',
          tailwind: false,
          testing: 'vitest',
          githubActions: true,
          docker: false,
        })
        .mockResolvedValueOnce({ overwrite: true });

      vi.mocked(fileModule.pathExists).mockResolvedValueOnce(true);

      const result = await collectUserInput();

      expect(result.projectName).toBe('existing-app');
    });

    it('should exit if user declines overwrite', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });

      vi.mocked(prompts)
        .mockResolvedValueOnce({
          projectName: 'existing-app',
          framework: 'react',
        })
        .mockResolvedValueOnce({
          typescript: true,
          lintingMode: 'strict',
          tailwind: false,
          testing: 'vitest',
          githubActions: true,
          docker: false,
        })
        .mockResolvedValueOnce({ overwrite: false });

      vi.mocked(fileModule.pathExists).mockResolvedValueOnce(true);

      await expect(collectUserInput()).rejects.toThrow('process.exit');

      exitSpy.mockRestore();
    });

    it('should exit on cancel', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });

      vi.mocked(prompts).mockImplementationOnce(async (questions, config: any) => {
        config.onCancel();
      });

      await expect(collectUserInput()).rejects.toThrow('process.exit');

      exitSpy.mockRestore();
    });

    it('should return complete context with all properties', async () => {
      vi.mocked(prompts)
        .mockResolvedValueOnce({
          projectName: 'complete-app',
          framework: 'react',
        })
        .mockResolvedValueOnce({
          typescript: true,
          lintingMode: 'strict',
          tailwind: true,
          testing: 'vitest',
          githubActions: true,
          docker: true,
        });

      vi.mocked(fileModule.pathExists).mockResolvedValueOnce(false);

      const result = await collectUserInput();

      expect(result).toHaveProperty('projectName');
      expect(result).toHaveProperty('projectPath');
      expect(result).toHaveProperty('framework');
      expect(result).toHaveProperty('typescript');
      expect(result).toHaveProperty('tailwind');
      expect(result).toHaveProperty('testing');
      expect(result).toHaveProperty('lintingMode');
      expect(result).toHaveProperty('githubActions');
      expect(result).toHaveProperty('docker');
    });

    it('should compute correct project path', async () => {
      vi.mocked(prompts)
        .mockResolvedValueOnce({
          projectName: 'my-app',
          framework: 'react',
        })
        .mockResolvedValueOnce({
          typescript: true,
          lintingMode: 'strict',
          tailwind: false,
          testing: 'vitest',
          githubActions: true,
          docker: false,
        });

      vi.mocked(fileModule.pathExists).mockResolvedValueOnce(false);

      const result = await collectUserInput();

      expect(result.projectPath).toContain('my-app');
    });

    it('should support all linting modes', async () => {
      // Test strict
      vi.mocked(prompts)
        .mockResolvedValueOnce({
          projectName: 'app1',
          framework: 'react',
        })
        .mockResolvedValueOnce({
          typescript: true,
          lintingMode: 'strict',
          tailwind: false,
          testing: 'vitest',
          githubActions: true,
          docker: false,
        });

      vi.mocked(fileModule.pathExists).mockResolvedValueOnce(false);

      let result = await collectUserInput();
      expect(result.lintingMode).toBe('strict');

      vi.clearAllMocks();

      // Test standard
      vi.mocked(prompts)
        .mockResolvedValueOnce({
          projectName: 'app2',
          framework: 'react',
        })
        .mockResolvedValueOnce({
          typescript: true,
          lintingMode: 'standard',
          tailwind: false,
          testing: 'vitest',
          githubActions: true,
          docker: false,
        });

      vi.mocked(fileModule.pathExists).mockResolvedValueOnce(false);

      result = await collectUserInput();
      expect(result.lintingMode).toBe('standard');
    });
  });
});
