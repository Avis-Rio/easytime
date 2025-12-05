import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

// 格式化日期显示
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (isToday(date)) return '今天';
  if (isYesterday(date)) return '昨天';
  if (isTomorrow(date)) return '明天';
  
  return format(date, 'MM月dd日');
};

// 格式化时间显示
export const formatTime = (timeString: string): string => {
  return timeString; // 已经是 HH:mm 格式
};

// 格式化时长显示
export const formatDuration = (hours: number): string => {
  // 确保输入是合理的小时数值
  if (hours < 0) {
    return '0小时';
  }
  
  const fullHours = Math.floor(hours);
  const minutes = Math.round((hours - fullHours) * 60);
  
  // 处理边界情况
  if (fullHours === 0 && minutes === 0) {
    return '0小时';
  }
  
  if (fullHours === 0) {
    return `${minutes}分钟`;
  }
  
  if (minutes === 0) {
    return `${fullHours}小时`;
  }
  
  return `${fullHours}小时${minutes}分钟`;
};

// 计算结束时间
export const calculateEndTime = (startTime: string, duration: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + (duration * 60); // duration已经是小时，需要转换为分钟计算
  
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
};

// 将 Date 对象转换为 YYYY-MM-DD 格式（本地时间，避免时区问题）
export const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取当前日期（YYYY-MM-DD格式，使用本地时间）
export const getCurrentDate = (): string => {
  return formatDateToString(new Date());
};

// 获取当前时间（HH:mm格式）
export const getCurrentTime = (): string => {
  return format(new Date(), 'HH:mm');
};

// 验证日期格式
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

// 验证时间格式
export const isValidTime = (timeString: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

// 生成时间选项（支持设置间隔和开始/结束小时）
export const generateTimeOptions = (
  interval: number = 15,
  startHour: number = 6,
  endHour: number = 22
): string[] => {
  const options: string[] = [];
  const safeInterval = Math.max(1, Math.min(60, interval));
  const start = Math.max(0, Math.min(23, startHour));
  const end = Math.max(start, Math.min(23, endHour));
  for (let hour = start; hour <= end; hour++) {
    for (let minute = 0; minute < 60; minute += safeInterval) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push(time);
    }
  }
  return options;
};

// 获取月份名称
export const getMonthName = (date: Date): string => {
  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return months[date.getMonth()];
};

// 检查是否为同一月
export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
};

// 检查是否为同一天
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() && 
         date1.getMonth() === date2.getMonth() && 
         date1.getDate() === date2.getDate();
};

// 生成日历天数
export const generateCalendarDays = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days: Date[] = [];
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 41); // 6周 = 42天
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  
  return days;
};
