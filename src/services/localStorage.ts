import type { LessonRecord, AppSettings } from '../types/lesson';

// LocalStorage 键名常量
const STORAGE_KEYS = {
  LESSONS: 'easytime_lessons',
  SETTINGS: 'easytime_settings',
  LAST_SYNC: 'easytime_last_sync'
} as const;

// 默认设置
const DEFAULT_SETTINGS: AppSettings = {
  hourlyRate: 55,
  taxRate: 10,
  defaultTeachingMethod: 'offline',
  enableNotifications: true,
  notificationTime: 30
};

export class LocalStorageService {
  /**
   * 保存课时记录
   */
  static saveLesson(lesson: LessonRecord): void {
    try {
      const lessons = this.getAllLessons();
      const existingIndex = lessons.findIndex(l => l.id === lesson.id);
      
      if (existingIndex >= 0) {
        lessons[existingIndex] = lesson;
      } else {
        lessons.push(lesson);
      }
      
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
    } catch (error) {
      console.error('保存课时记录失败:', error);
      throw new Error('保存课时记录失败，请检查存储空间');
    }
  }

  /**
   * 获取所有课时记录
   */
  static getAllLessons(): LessonRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LESSONS);
      if (!data) return [];
      
      const lessons = JSON.parse(data);
      // 将日期字符串转换为Date对象
      return lessons.map((lesson: LessonRecord) => ({ 
        ...lesson,
        createdAt: new Date(lesson.createdAt),
        updatedAt: new Date(lesson.updatedAt)
      }));
    } catch (error) {
      console.error('获取课时记录失败:', error);
      return [];
    }
  }

  /**
   * 获取指定日期范围的课时记录
   */
  static getLessonsByDateRange(startDate: Date, endDate: Date): LessonRecord[] {
    const lessons = this.getAllLessons();
    return lessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      return lessonDate >= startDate && lessonDate <= endDate;
    });
  }

  /**
   * 获取指定月份的课时记录
   */
  static getLessonsByMonth(year: number, month: number): LessonRecord[] {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    return this.getLessonsByDateRange(startDate, endDate);
  }

  /**
   * 删除课时记录
   */
  static deleteLesson(id: string): void {
    try {
      const lessons = this.getAllLessons();
      const filteredLessons = lessons.filter(lesson => lesson.id !== id);
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(filteredLessons));
    } catch (error) {
      console.error('删除课时记录失败:', error);
      throw new Error('删除课时记录失败');
    }
  }

  /**
   * 批量保存课时记录
   */
  static saveAllLessons(lessons: LessonRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
    } catch (error) {
      console.error('批量保存课时记录失败:', error);
      throw new Error('批量保存课时记录失败，请检查存储空间');
    }
  }

  /**
   * 获取应用设置
   */
  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      
      const settings = JSON.parse(data);
      return {
        ...DEFAULT_SETTINGS,
        ...settings
      };
    } catch (error) {
      console.error('获取应用设置失败:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * 保存应用设置
   */
  static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('保存应用设置失败:', error);
      throw new Error('保存应用设置失败，请检查存储空间');
    }
  }

  /**
   * 获取最后同步时间
   */
  static getLastSyncTime(): Date | null {
    try {
      const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return timestamp ? new Date(timestamp) : null;
    } catch (error) {
      console.error('获取最后同步时间失败:', error);
      return null;
    }
  }

  /**
   * 更新最后同步时间
   */
  static updateLastSyncTime(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('更新最后同步时间失败:', error);
    }
  }

  /**
   * 清空所有数据
   */
  static clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.LESSONS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('清空数据失败:', error);
      throw new Error('清空数据失败');
    }
  }

  /**
   * 导出数据（用于备份）
   */
  static exportData(): { lessons: LessonRecord[]; settings: AppSettings; exportTime: string } {
    return {
      lessons: this.getAllLessons(),
      settings: this.getSettings(),
      exportTime: new Date().toISOString()
    };
  }

  /**
   * 导入数据（用于恢复）
   */
  static importData(data: { lessons: LessonRecord[]; settings: AppSettings }): void {
    try {
      // 验证数据结构
      if (!data.lessons || !data.settings) {
        throw new Error('数据格式不正确');
      }

      // 保存数据
      this.saveAllLessons(data.lessons);
      this.saveSettings(data.settings);
      this.updateLastSyncTime();
    } catch (error) {
      console.error('导入数据失败:', error);
      throw new Error('导入数据失败，请检查数据格式');
    }
  }

  /**
   * 获取存储使用情况
   */
  static getStorageUsage(): { used: number; total: number; remaining: number } {
    try {
      const lessonsData = localStorage.getItem(STORAGE_KEYS.LESSONS) || '[]';
      const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}';
      
      const used = lessonsData.length + settingsData.length;
      const total = 5 * 1024 * 1024; // 5MB 估算
      const remaining = Math.max(0, total - used);
      
      return { used, total, remaining };
    } catch (error) {
      console.error('获取存储使用情况失败:', error);
      return { used: 0, total: 0, remaining: 0 };
    }
  }
}