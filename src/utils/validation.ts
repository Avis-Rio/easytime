import type { LessonFormData } from '@/types/lesson';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * 验证课时表单数据
 */
export const validateLessonForm = (data: LessonFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  // 学生姓名验证
  if (!data.studentName || !data.studentName.trim()) {
    errors.studentName = '请输入学生姓名';
  } else if (data.studentName.trim().length < 2) {
    errors.studentName = '学生姓名至少需要2个字符';
  } else if (data.studentName.length > 50) {
    errors.studentName = '学生姓名不能超过50个字符';
  } else if (!/^[\u4e00-\u9fa5a-zA-Z\s]+$/.test(data.studentName)) {
    errors.studentName = '学生姓名只能包含中文、英文和空格';
  }

  // 日期验证
  if (!data.date) {
    errors.date = '请选择日期';
  } else {
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
    
    const minPastDate = new Date();
    minPastDate.setFullYear(minPastDate.getFullYear() - 2);

    if (isNaN(selectedDate.getTime())) {
      errors.date = '日期格式无效';
    } else if (selectedDate > maxFutureDate) {
      errors.date = '日期不能超过一年后';
    } else if (selectedDate < minPastDate) {
      errors.date = '日期不能早于两年前';
    }
  }

  // 开始时间验证
  if (!data.startTime) {
    errors.startTime = '请选择开始时间';
  } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.startTime)) {
    errors.startTime = '时间格式无效（应为 HH:mm）';
  }

  // 课时长度验证
  if (data.duration === undefined || data.duration === null) {
    errors.duration = '请输入课时长度';
  } else if (data.duration <= 0) {
    errors.duration = '课时长度必须大于0';
  } else if (data.duration > 12) {
    errors.duration = '单次课时不建议超过12小时';
  } else if (data.duration < 0.5) {
    errors.duration = '课时长度至少为0.5小时（30分钟）';
  }

  // 课时费验证
  if (data.hourlyRate === undefined || data.hourlyRate === null) {
    errors.hourlyRate = '请输入课时费';
  } else if (data.hourlyRate <= 0) {
    errors.hourlyRate = '课时费必须大于0';
  } else if (data.hourlyRate > 10000) {
    errors.hourlyRate = '课时费异常，请检查（不应超过10000元/小时）';
  } else if (data.hourlyRate < 10) {
    errors.hourlyRate = '课时费过低，请确认（不应低于10元/小时）';
  }

  // 备注验证（可选）
  if (data.notes && data.notes.length > 500) {
    errors.notes = '备注不能超过500个字符';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * 验证学生姓名
 */
export const validateStudentName = (name: string): string | null => {
  if (!name || !name.trim()) {
    return '请输入学生姓名';
  }
  
  if (name.trim().length < 2) {
    return '学生姓名至少需要2个字符';
  }
  
  if (name.length > 50) {
    return '学生姓名不能超过50个字符';
  }
  
  if (!/^[\u4e00-\u9fa5a-zA-Z\s]+$/.test(name)) {
    return '学生姓名只能包含中文、英文和空格';
  }
  
  return null;
};

/**
 * 验证课时费
 */
export const validateHourlyRate = (rate: number): string | null => {
  if (rate === undefined || rate === null || isNaN(rate)) {
    return '请输入有效的课时费';
  }
  
  if (rate <= 0) {
    return '课时费必须大于0';
  }
  
  if (rate > 10000) {
    return '课时费异常，请检查（不应超过10000元/小时）';
  }
  
  if (rate < 10) {
    return '课时费过低，请确认（不应低于10元/小时）';
  }
  
  return null;
};

/**
 * 验证课时长度
 */
export const validateDuration = (duration: number): string | null => {
  if (duration === undefined || duration === null || isNaN(duration)) {
    return '请输入有效的课时长度';
  }
  
  if (duration <= 0) {
    return '课时长度必须大于0';
  }
  
  if (duration > 12) {
    return '单次课时不建议超过12小时';
  }
  
  if (duration < 0.5) {
    return '课时长度至少为0.5小时（30分钟）';
  }
  
  return null;
};

/**
 * 验证日期
 */
export const validateDate = (dateStr: string): string | null => {
  if (!dateStr) {
    return '请选择日期';
  }
  
  const selectedDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const maxFutureDate = new Date();
  maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
  
  const minPastDate = new Date();
  minPastDate.setFullYear(minPastDate.getFullYear() - 2);

  if (isNaN(selectedDate.getTime())) {
    return '日期格式无效';
  }
  
  if (selectedDate > maxFutureDate) {
    return '日期不能超过一年后';
  }
  
  if (selectedDate < minPastDate) {
    return '日期不能早于两年前';
  }
  
  return null;
};

/**
 * 验证时间格式
 */
export const validateTime = (timeStr: string): string | null => {
  if (!timeStr) {
    return '请选择时间';
  }
  
  if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
    return '时间格式无效（应为 HH:mm）';
  }
  
  return null;
};

