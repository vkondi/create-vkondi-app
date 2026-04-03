import { describe, it, expect, beforeEach, vi, afterEach, type MockInstance } from 'vitest';
import chalk from 'chalk';
import ora from 'ora';
import { logger } from './logger';

// Mock chalk and ora
vi.mock('chalk', () => ({
  default: {
    blue: vi.fn((text) => text),
    green: vi.fn((text) => text),
    yellow: vi.fn((text) => text),
    red: vi.fn((text) => text),
    cyan: vi.fn((text) => text),
    bold: vi.fn((text) => text),
    dim: vi.fn((text) => text),
  },
}));

vi.mock('ora');

describe('Logger Utils', () => {
  let consoleSpy: MockInstance<typeof console.log>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('info', () => {
    it('should log info message', () => {
      logger.info('Test info message');

      expect(consoleSpy).toHaveBeenCalled();
      // console.log is called with (icon, message) so check the second argument
      const message = consoleSpy.mock.calls[0][1];
      expect(message).toBe('Test info message');
    });

    it('should use blue color', () => {
      logger.info('Info');

      expect(vi.mocked(chalk.blue)).toHaveBeenCalled();
    });
  });

  describe('success', () => {
    it('should log success message', () => {
      logger.success('Operation successful');

      expect(consoleSpy).toHaveBeenCalled();
      const message = consoleSpy.mock.calls[0][1];
      expect(message).toBe('Operation successful');
    });

    it('should use green color', () => {
      logger.success('Success');

      expect(vi.mocked(chalk.green)).toHaveBeenCalled();
    });
  });

  describe('warning', () => {
    it('should log warning message', () => {
      logger.warning('Warning message');

      expect(consoleSpy).toHaveBeenCalled();
      const message = consoleSpy.mock.calls[0][1];
      expect(message).toBe('Warning message');
    });

    it('should use yellow color', () => {
      logger.warning('Warn');

      expect(vi.mocked(chalk.yellow)).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log error message', () => {
      logger.error('Error occurred');

      expect(consoleSpy).toHaveBeenCalled();
      const message = consoleSpy.mock.calls[0][1];
      expect(message).toBe('Error occurred');
    });

    it('should use red color', () => {
      logger.error('Error');

      expect(vi.mocked(chalk.red)).toHaveBeenCalled();
    });
  });

  describe('step', () => {
    it('should log step message', () => {
      logger.step('Processing step');

      expect(consoleSpy).toHaveBeenCalled();
      const message = consoleSpy.mock.calls[0][1];
      expect(message).toBe('Processing step');
    });

    it('should use cyan color', () => {
      logger.step('Step');

      expect(vi.mocked(chalk.cyan)).toHaveBeenCalled();
    });
  });

  describe('startSpinner', () => {
    it('should start a spinner', () => {
      const mockSpinner = {
        start: vi.fn(),
        succeed: vi.fn(),
        fail: vi.fn(),
        stop: vi.fn(),
      };
      vi.mocked(ora).mockReturnValueOnce(mockSpinner as unknown as ReturnType<typeof ora>);

      logger.startSpinner('Loading...');

      expect(ora).toHaveBeenCalledWith('Loading...');
      expect(mockSpinner.start).toHaveBeenCalled();
    });
  });

  describe('succeedSpinner', () => {
    it('should succeed spinner with message', () => {
      const mockSpinner: Record<string, unknown> = {
        start: vi.fn((_message?: string) => mockSpinner),
        succeed: vi.fn(),
        fail: vi.fn(),
        stop: vi.fn(),
      };
      vi.mocked(ora).mockReturnValue(mockSpinner as unknown as ReturnType<typeof ora>);

      logger.startSpinner('Loading...');
      logger.succeedSpinner('Done!');

      expect(mockSpinner.succeed).toHaveBeenCalledWith('Done!');
    });

    it('should do nothing if no spinner is running', () => {
      expect(() => logger.succeedSpinner('Done')).not.toThrow();
    });
  });

  describe('failSpinner', () => {
    it('should fail spinner with message', () => {
      const mockSpinner: Record<string, unknown> = {
        start: vi.fn((_message?: string) => mockSpinner),
        succeed: vi.fn(),
        fail: vi.fn(),
        stop: vi.fn(),
      };
      vi.mocked(ora).mockReturnValue(mockSpinner as unknown as ReturnType<typeof ora>);

      logger.startSpinner('Loading...');
      logger.failSpinner('Failed!');

      expect(mockSpinner.fail).toHaveBeenCalledWith('Failed!');
    });

    it('should do nothing if no spinner is running', () => {
      expect(() => logger.failSpinner('Failed')).not.toThrow();
    });
  });

  describe('stopSpinner', () => {
    it('should stop spinner', () => {
      const mockSpinner: Record<string, unknown> = {
        start: vi.fn((_message?: string) => mockSpinner),
        succeed: vi.fn(),
        fail: vi.fn(),
        stop: vi.fn(),
      };
      vi.mocked(ora).mockReturnValue(mockSpinner as unknown as ReturnType<typeof ora>);

      logger.startSpinner('Loading...');
      logger.stopSpinner();

      expect(mockSpinner.stop).toHaveBeenCalled();
    });

    it('should do nothing if no spinner is running', () => {
      expect(() => logger.stopSpinner()).not.toThrow();
    });
  });

  describe('newLine', () => {
    it('should print new line', () => {
      logger.newLine();

      expect(consoleSpy).toHaveBeenCalledWith();
    });
  });

  describe('bold', () => {
    it('should return bold text', () => {
      logger.bold('Bold text');

      expect(vi.mocked(chalk.bold)).toHaveBeenCalledWith('Bold text');
    });
  });

  describe('dim', () => {
    it('should return dim text', () => {
      logger.dim('Dim text');

      expect(vi.mocked(chalk.dim)).toHaveBeenCalledWith('Dim text');
    });
  });
});
