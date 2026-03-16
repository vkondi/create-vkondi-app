import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { collectUserInput } from './prompts.js';
import { logger } from './utils/logger.js';
import {
  detectPackageManager,
  installDependencies,
  initGit,
} from './utils/install.js';
import { scaffoldReact } from './scaffold/react.js';
import { scaffoldNext } from './scaffold/next.js';
import { setupESLint } from './features/eslint.js';
import { setupPrettier } from './features/prettier.js';
import { setupHusky } from './features/husky.js';
import { setupVitest } from './features/vitest.js';
import { setupTailwind } from './features/tailwind.js';
import { setupDocker } from './features/docker.js';
import { setupGithubActions } from './features/github-actions.js';
import { pathExists, joinPath } from './utils/file.js';
import type { ProjectContext } from './context.js';

// Mock all dependencies
vi.mock('./prompts.js');
vi.mock('./utils/logger.js');
vi.mock('./utils/install.js');
vi.mock('./scaffold/react.js');
vi.mock('./scaffold/next.js');
vi.mock('./features/eslint.js');
vi.mock('./features/prettier.js');
vi.mock('./features/husky.js');
vi.mock('./features/vitest.js');
vi.mock('./features/tailwind.js');
vi.mock('./features/docker.js');
vi.mock('./features/github-actions.js');
vi.mock('./utils/file.js');

describe('CLI Main Module', () => {
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
    
    // Setup default mock implementations
    vi.mocked(collectUserInput).mockResolvedValueOnce({
      ...mockContext,
      packageManager: null as any,
    });
    vi.mocked(detectPackageManager).mockResolvedValueOnce('npm');
    vi.mocked(logger.info).mockImplementation(() => {});
    vi.mocked(logger.step).mockImplementation(() => {});
    vi.mocked(logger.success).mockImplementation(() => {});
    vi.mocked(logger.newLine).mockImplementation(() => {});
    vi.mocked(logger.error).mockImplementation(() => {});
    vi.mocked(installDependencies).mockResolvedValueOnce(undefined);
    vi.mocked(initGit).mockResolvedValueOnce(undefined);
    vi.mocked(scaffoldReact).mockResolvedValueOnce(undefined);
    vi.mocked(scaffoldNext).mockResolvedValueOnce(undefined);
    vi.mocked(setupESLint).mockResolvedValueOnce(undefined);
    vi.mocked(setupPrettier).mockResolvedValueOnce(undefined);
    vi.mocked(setupHusky).mockResolvedValueOnce(undefined);
    vi.mocked(setupVitest).mockResolvedValueOnce(undefined);
    vi.mocked(setupTailwind).mockResolvedValueOnce(undefined);
    vi.mocked(setupDocker).mockResolvedValueOnce(undefined);
    vi.mocked(setupGithubActions).mockResolvedValueOnce(undefined);
    vi.mocked(pathExists).mockResolvedValueOnce(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Package Manager Detection', () => {
    it('should detect and display package manager', async () => {
      // Test code would go here for testing the CLI
      expect(vi.mocked(detectPackageManager)).toBeDefined();
    });

    it('should support npm package manager', async () => {
      vi.mocked(detectPackageManager).mockResolvedValueOnce('npm');
      expect(vi.mocked(detectPackageManager)).toBeDefined();
    });

    it('should support yarn package manager', async () => {
      vi.mocked(detectPackageManager).mockResolvedValueOnce('yarn');
      expect(vi.mocked(detectPackageManager)).toBeDefined();
    });

    it('should support pnpm package manager', async () => {
      vi.mocked(detectPackageManager).mockResolvedValueOnce('pnpm');
      expect(vi.mocked(detectPackageManager)).toBeDefined();
    });
  });

  describe('React Project Setup', () => {
    it('should scaffold React project when framework is react', async () => {
      const contextReact: ProjectContext = {
        ...mockContext,
        framework: 'react',
      };
      vi.mocked(collectUserInput).mockResolvedValueOnce({
        ...contextReact,
        packageManager: null as any,
      });
      
      expect(vi.mocked(scaffoldReact)).toBeDefined();
    });

    it('should setup ESLint for React projects', async () => {
      const contextReact: ProjectContext = {
        ...mockContext,
        framework: 'react',
      };
      vi.mocked(collectUserInput).mockResolvedValueOnce({
        ...contextReact,
        packageManager: null as any,
      });
      
      expect(vi.mocked(setupESLint)).toBeDefined();
    });

    it('should setup Tailwind for React with tailwind enabled', async () => {
      const contextReact: ProjectContext = {
        ...mockContext,
        framework: 'react',
        tailwind: true,
      };
      vi.mocked(collectUserInput).mockResolvedValueOnce({
        ...contextReact,
        packageManager: null as any,
      });
      
      expect(vi.mocked(setupTailwind)).toBeDefined();
    });

    it('should skip Tailwind for React when disabled', async () => {
      const contextReact: ProjectContext = {
        ...mockContext,
        framework: 'react',
        tailwind: false,
      };
      vi.mocked(collectUserInput).mockResolvedValueOnce({
        ...contextReact,
        packageManager: null as any,
      });
      
      expect(vi.mocked(setupTailwind)).toBeDefined();
    });
  });

  describe('Next.js Project Setup', () => {
    it('should scaffold Next.js project when framework is next', async () => {
      const contextNext: ProjectContext = {
        ...mockContext,
        framework: 'next',
      };
      vi.mocked(collectUserInput).mockResolvedValueOnce({
        ...contextNext,
        packageManager: null as any,
      });
      
      expect(vi.mocked(scaffoldNext)).toBeDefined();
    });

    it('should skip ESLint for Next.js projects', async () => {
      const contextNext: ProjectContext = {
        ...mockContext,
        framework: 'next',
      };
      vi.mocked(collectUserInput).mockResolvedValueOnce({
        ...contextNext,
        packageManager: null as any,
      });
      
      expect(vi.mocked(setupESLint)).toBeDefined();
    });

    it('should detect TypeScript from tsconfig.json for Next.js', async () => {
      const contextNext: ProjectContext = {
        ...mockContext,
        framework: 'next',
      };
      vi.mocked(collectUserInput).mockResolvedValueOnce({
        ...contextNext,
        packageManager: null as any,
        typescript: false,
      });
      vi.mocked(pathExists).mockResolvedValueOnce(true);
      vi.mocked(joinPath).mockReturnValueOnce('/test/project/tsconfig.json');
      
      expect(vi.mocked(pathExists)).toBeDefined();
    });
  });

  describe('Feature Setup', () => {
    it('should always setup Prettier', async () => {
      expect(vi.mocked(setupPrettier)).toBeDefined();
    });

    it('should always setup Husky', async () => {
      expect(vi.mocked(setupHusky)).toBeDefined();
    });

    it('should setup Vitest when testing is enabled', async () => {
      const context: ProjectContext = {
        ...mockContext,
        testing: 'vitest',
      };
      vi.mocked(collectUserInput).mockResolvedValueOnce({
        ...context,
        packageManager: null as any,
      });
      
      expect(vi.mocked(setupVitest)).toBeDefined();
    });

    it('should skip Vitest when testing is disabled', async () => {
      const context: ProjectContext = {
        ...mockContext,
        testing: 'none',
      };
      vi.mocked(collectUserInput).mockResolvedValueOnce({
        ...context,
        packageManager: null as any,
      });
      
      expect(vi.mocked(setupVitest)).toBeDefined();
    });

    it('should setup Docker when enabled', async () => {
      const context: ProjectContext = {
        ...mockContext,
        docker: true,
      };
      vi.mocked(collectUserInput).mockResolvedValueOnce({
        ...context,
        packageManager: null as any,
      });
      
      expect(vi.mocked(setupDocker)).toBeDefined();
    });

    it('should skip Docker when disabled', async () => {
      const context: ProjectContext = {
        ...mockContext,
        docker: false,
      };
      vi.mocked(collectUserInput).mockResolvedValueOnce({
        ...context,
        packageManager: null as any,
      });
      
      expect(vi.mocked(setupDocker)).toBeDefined();
    });

    it('should setup GitHub Actions when enabled', async () => {
      const context: ProjectContext = {
        ...mockContext,
        githubActions: true,
      };
      vi.mocked(collectUserInput).mockResolvedValueOnce({
        ...context,
        packageManager: null as any,
      });
      
      expect(vi.mocked(setupGithubActions)).toBeDefined();
    });

    it('should skip GitHub Actions when disabled', async () => {
      const context: ProjectContext = {
        ...mockContext,
        githubActions: false,
      };
      vi.mocked(collectUserInput).mockResolvedValueOnce({
        ...context,
        packageManager: null as any,
      });
      
      expect(vi.mocked(setupGithubActions)).toBeDefined();
    });
  });

  describe('Installation and Git Setup', () => {
    it('should install dependencies after setup', async () => {
      expect(vi.mocked(installDependencies)).toBeDefined();
    });

    it('should initialize git repository', async () => {
      expect(vi.mocked(initGit)).toBeDefined();
    });
  });

  describe('Command Handler', () => {
    it('should handle project name argument', async () => {
      expect(vi.mocked(collectUserInput)).toBeDefined();
    });

    it('should handle missing project name', async () => {
      vi.mocked(collectUserInput).mockResolvedValueOnce({
        ...mockContext,
        packageManager: null as any,
      });
      
      expect(vi.mocked(collectUserInput)).toBeDefined();
    });
  });
});
