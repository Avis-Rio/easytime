// 课时记录状态
export type LessonStatus = 'planned' | 'completed' | 'cancelled';

// 教学方式
export type TeachingMethod = 'online' | 'offline';

// 课时记录接口
export interface LessonRecord {
  id: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:mm format
  duration: number; // in hours
  studentName: string;
  teachingMethod: TeachingMethod;
  status: LessonStatus;
  hourlyRate: number; // per hour rate
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 月度统计接口
export interface MonthlyStats {
  year: number;
  month: number;
  totalLessons: number;
  completedLessons: number;
  plannedLessons: number;
  cancelledLessons: number;
  totalIncome: number;
  totalHours: number;
  uniqueStudents: number;
  completionRate: number;
  averageHourlyRate: number;
  grossIncome: number;
  taxDeduction: number;
  netIncome: number;
  onlineHours: number;
  offlineHours: number;
  mostCancelledStudent?: string; // 最多取消的学生名字
}

// 应用设置接口
export interface AppSettings {
  hourlyRate: number; // 默认时薪
  taxRate: number; // 税率百分比
  defaultTeachingMethod: TeachingMethod;
  enableNotifications: boolean;
  notificationTime: number; // 提前多少分钟通知
}

// 统计面板数据接口
export interface StatsPanelData {
  totalIncome: number;
  totalLessons: number;
  uniqueStudents: number;
  completedLessons: number;
  completionRate: number;
  averageHourlyRate: number;
  onlineLessons: number;
  offlineLessons: number;
  cancelledLessons: number;
}

// 课时表单数据接口
export interface LessonFormData {
  date: string;
  startTime: string;
  duration: number;
  studentName: string;
  teachingMethod: TeachingMethod;
  status: LessonStatus;
  notes: string;
  hourlyRate: number;
}