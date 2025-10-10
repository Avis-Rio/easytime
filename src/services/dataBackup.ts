import { ErrorHandler, ExportError, StorageError } from '@/utils/errorHandler';

export interface BackupData {
  version: string;
  exportDate: string;
  lessons: string;
  settings: string;
}

/**
 * 数据备份服务
 */
export class DataBackupService {
  private static readonly BACKUP_VERSION = '1.0';
  private static readonly LESSON_STORE_KEY = 'lesson-store';
  private static readonly APP_SETTINGS_KEY = 'app-settings';

  /**
   * 导出所有数据为 JSON 文件
   */
  static exportData(): void {
    try {
      const lessonsData = localStorage.getItem(this.LESSON_STORE_KEY);
      const settingsData = localStorage.getItem(this.APP_SETTINGS_KEY);

      if (!lessonsData && !settingsData) {
        throw new ExportError('没有可导出的数据');
      }

      const backupData: BackupData = {
        version: this.BACKUP_VERSION,
        exportDate: new Date().toISOString(),
        lessons: lessonsData || '{}',
        settings: settingsData || '{}'
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `easytime-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('数据导出成功');
    } catch (error) {
      const message = ErrorHandler.handle(error, 'DataBackup.exportData');
      throw new ExportError(message);
    }
  }

  /**
   * 从文件导入数据
   */
  static async importData(file: File): Promise<void> {
    try {
      const text = await file.text();
      const data: BackupData = JSON.parse(text);

      // 验证数据格式
      if (!data.version || !data.exportDate) {
        throw new StorageError('无效的备份文件格式');
      }

      // 验证版本兼容性
      if (data.version !== this.BACKUP_VERSION) {
        console.warn(`备份版本不匹配: ${data.version} vs ${this.BACKUP_VERSION}`);
      }

      // 恢复数据
      if (data.lessons) {
        localStorage.setItem(this.LESSON_STORE_KEY, data.lessons);
      }

      if (data.settings) {
        localStorage.setItem(this.APP_SETTINGS_KEY, data.settings);
      }

      console.log('数据导入成功');
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new StorageError('备份文件格式错误');
      }
      const message = ErrorHandler.handle(error, 'DataBackup.importData');
      throw new StorageError(message);
    }
  }

  /**
   * 检查存储空间使用情况
   */
  static async checkStorageUsage(): Promise<{
    used: string;
    quota: string;
    percentage: string;
  } | null> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const quota = estimate.quota || 0;

        return {
          used: (used / (1024 * 1024)).toFixed(2) + ' MB',
          quota: (quota / (1024 * 1024)).toFixed(2) + ' MB',
          percentage: ((used / quota) * 100).toFixed(1) + '%'
        };
      }
      return null;
    } catch (error) {
      ErrorHandler.handle(error, 'DataBackup.checkStorageUsage');
      return null;
    }
  }

  /**
   * 获取本地存储数据大小
   */
  static getLocalStorageSize(): string {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return (total / 1024).toFixed(2) + ' KB';
    } catch (error) {
      ErrorHandler.handle(error, 'DataBackup.getLocalStorageSize');
      return '未知';
    }
  }

  /**
   * 清除所有数据
   */
  static clearAllData(): void {
    try {
      localStorage.removeItem(this.LESSON_STORE_KEY);
      localStorage.removeItem(this.APP_SETTINGS_KEY);
      console.log('所有数据已清除');
    } catch (error) {
      const message = ErrorHandler.handle(error, 'DataBackup.clearAllData');
      throw new StorageError(message);
    }
  }

  /**
   * 验证备份文件
   */
  static async validateBackupFile(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      return !!(
        data &&
        typeof data === 'object' &&
        data.version &&
        data.exportDate &&
        (data.lessons || data.settings)
      );
    } catch {
      return false;
    }
  }
}

