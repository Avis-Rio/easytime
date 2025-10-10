/**
 * 应用自定义错误类
 */
export class AppError extends Error {
  public code?: string;
  public severity: 'error' | 'warning' | 'info';

  constructor(
    message: string,
    code?: string,
    severity: 'error' | 'warning' | 'info' = 'error'
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
  }
}

/**
 * 错误类型
 */
export const ErrorType = {
  VALIDATION: 'VALIDATION',
  STORAGE: 'STORAGE',
  EXPORT: 'EXPORT',
  NETWORK: 'NETWORK',
  UNKNOWN: 'UNKNOWN'
} as const;

/**
 * 错误处理器
 */
export class ErrorHandler {
  /**
   * 处理错误并返回用户友好的消息
   */
  static handle(error: unknown, context: string = ''): string {
    console.error(`[${context}]`, error);
    
    let message = '操作失败，请重试';
    
    if (error instanceof AppError) {
      message = error.message;
    } else if (error instanceof Error) {
      message = this.getErrorMessage(error);
    } else if (typeof error === 'string') {
      message = error;
    }
    
    // 可以在这里添加错误上报逻辑
    this.logError(error, context);
    
    return message;
  }

  /**
   * 根据错误类型返回友好消息
   */
  private static getErrorMessage(error: Error): string {
    // 存储相关错误
    if (error.message.includes('localStorage') || error.message.includes('quota')) {
      return '存储空间不足，请清理数据或导出备份';
    }
    
    // 网络相关错误
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return '网络连接失败，请检查网络设置';
    }
    
    // 导出相关错误
    if (error.message.includes('export') || error.message.includes('download')) {
      return '导出失败，请重试';
    }
    
    return error.message || '未知错误';
  }

  /**
   * 记录错误日志
   */
  private static logError(error: unknown, context: string): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : String(error)
    };
    
    // 将错误保存到 localStorage（限制最多保存100条）
    try {
      const logs = JSON.parse(localStorage.getItem('error-logs') || '[]');
      logs.unshift(errorLog);
      if (logs.length > 100) {
        logs.length = 100; // 只保留最新的100条
      }
      localStorage.setItem('error-logs', JSON.stringify(logs));
    } catch (e) {
      // 如果存储失败，静默处理
      console.warn('无法保存错误日志:', e);
    }
  }

  /**
   * 获取错误日志
   */
  static getErrorLogs(): Array<{
    timestamp: string;
    context: string;
    error: any;
  }> {
    try {
      return JSON.parse(localStorage.getItem('error-logs') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * 清除错误日志
   */
  static clearErrorLogs(): void {
    try {
      localStorage.removeItem('error-logs');
    } catch (e) {
      console.warn('无法清除错误日志:', e);
    }
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, ErrorType.VALIDATION, 'warning');
    this.name = 'ValidationError';
  }
}

/**
 * 存储错误
 */
export class StorageError extends AppError {
  constructor(message: string) {
    super(message, ErrorType.STORAGE, 'error');
    this.name = 'StorageError';
  }
}

/**
 * 导出错误
 */
export class ExportError extends AppError {
  constructor(message: string) {
    super(message, ErrorType.EXPORT, 'error');
    this.name = 'ExportError';
  }
}

/**
 * 网络错误
 */
export class NetworkError extends AppError {
  constructor(message: string) {
    super(message, ErrorType.NETWORK, 'error');
    this.name = 'NetworkError';
  }
}

