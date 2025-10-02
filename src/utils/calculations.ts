import type { LessonRecord, MonthlyStats } from '../types/lesson';

/**
 * 计算月度统计
 */
export const calculateMonthlyStats = (
  lessons: LessonRecord[], 
  year: number, 
  month: number
): MonthlyStats => {
  const monthlyLessons = lessons.filter(lesson => {
    const lessonDate = new Date(lesson.date);
    return lessonDate.getFullYear() === year && lessonDate.getMonth() + 1 === month;
  });

  const completedLessons = monthlyLessons.filter(l => l.status === 'completed');
  const plannedLessons = monthlyLessons.filter(l => l.status === 'planned');
  const cancelledLessons = monthlyLessons.filter(l => l.status === 'cancelled');

  // 计算总时长（小时）
  const totalHours = completedLessons.reduce((total, lesson) => total + lesson.duration, 0);

  // 计算收入
  const grossIncome = completedLessons.reduce((total, lesson) => {
    return total + (lesson.duration * lesson.hourlyRate);
  }, 0);

  const taxDeduction = grossIncome * 0.1; // 默认10%税率
  const netIncome = grossIncome - taxDeduction;

  // 计算最多取消的学生
  const studentCancelledCount = new Map<string, number>();
  cancelledLessons.forEach(lesson => {
    const current = studentCancelledCount.get(lesson.studentName) || 0;
    studentCancelledCount.set(lesson.studentName, current + 1);
  });

  let mostCancelledStudent: string | undefined;
  let maxCancelled = 0;
  studentCancelledCount.forEach((count, student) => {
    if (count > maxCancelled) {
      maxCancelled = count;
      mostCancelledStudent = student;
    }
  });

  return {
    year,
    month,
    totalHours: Math.round(totalHours * 100) / 100, // 保留两位小数
    totalLessons: monthlyLessons.length,
    totalIncome: Math.round(netIncome * 100) / 100,
    completedLessons: completedLessons.length,
    plannedLessons: plannedLessons.length,
    cancelledLessons: cancelledLessons.length,
    uniqueStudents: new Set(monthlyLessons.map(l => l.studentName)).size,
    completionRate: monthlyLessons.length > 0 ? Math.round((completedLessons.length / monthlyLessons.length) * 100) : 0,
    averageHourlyRate: Math.round((netIncome / Math.max(totalHours, 0.01)) * 100) / 100,
    grossIncome: Math.round(grossIncome * 100) / 100,
    taxDeduction: Math.round(taxDeduction * 100) / 100,
    netIncome: Math.round(netIncome * 100) / 100,
    onlineHours: Math.round(completedLessons.filter(l => l.teachingMethod === 'online').reduce((sum, l) => sum + l.duration, 0) * 100) / 100,
    offlineHours: Math.round(completedLessons.filter(l => l.teachingMethod === 'offline').reduce((sum, l) => sum + l.duration, 0) * 100) / 100,
    mostCancelledStudent
  };
};

/**
 * 计算单日统计
 */
export const calculateDailyStats = (lessons: LessonRecord[], date: Date) => {
  const dailyLessons = lessons.filter(lesson => {
    const lessonDate = new Date(lesson.date);
    return lessonDate.getFullYear() === date.getFullYear() &&
           lessonDate.getMonth() === date.getMonth() &&
           lessonDate.getDate() === date.getDate();
  });

  const completedLessons = dailyLessons.filter(l => l.status === 'completed');
  const plannedLessons = dailyLessons.filter(l => l.status === 'planned');

  const completedHours = completedLessons.reduce((total, lesson) => total + lesson.duration, 0);
  const plannedHours = plannedLessons.reduce((total, lesson) => total + lesson.duration, 0);

  return {
    date,
    lessons: dailyLessons,
    totalHours: dailyLessons.reduce((total, lesson) => total + lesson.duration, 0),
    completedHours: completedHours,
    plannedHours: plannedHours
  };
};

/**
 * 计算单节课时收入
 */
export const calculateLessonIncome = (lesson: LessonRecord): {
  grossIncome: number;
  taxDeduction: number;
  netIncome: number;
} => {
  const grossIncome = lesson.duration * lesson.hourlyRate;
  const taxDeduction = grossIncome * 0.1; // 默认10%税率
  const netIncome = grossIncome - taxDeduction;

  return {
    grossIncome: Math.round(grossIncome * 100) / 100,
    taxDeduction: Math.round(taxDeduction * 100) / 100,
    netIncome: Math.round(netIncome * 100) / 100
  };
};

/**
 * 计算年度统计
 */
export const calculateYearlyStats = (lessons: LessonRecord[], year: number) => {
  const yearlyLessons = lessons.filter(lesson => {
    const lessonDate = new Date(lesson.date);
    return lessonDate.getFullYear() === year;
  });

  const monthlyStats: MonthlyStats[] = [];
  
  for (let month = 1; month <= 12; month++) {
    const stats = calculateMonthlyStats(yearlyLessons, year, month);
    monthlyStats.push(stats);
  }

  const totalHours = monthlyStats.reduce((sum, stats) => sum + stats.totalHours, 0);
  const totalIncome = monthlyStats.reduce((sum, stats) => sum + stats.totalIncome, 0);
  const totalTax = monthlyStats.reduce((sum, stats) => sum + stats.taxDeduction, 0);
  const totalNetIncome = monthlyStats.reduce((sum, stats) => sum + stats.netIncome, 0);

  return {
    year,
    monthlyStats,
    totalHours: Math.round(totalHours * 100) / 100,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    totalNetIncome: Math.round(totalNetIncome * 100) / 100,
    totalLessons: yearlyLessons.length,
    averageMonthlyIncome: Math.round((totalIncome / 12) * 100) / 100
  };
};

/**
 * 计算学生统计
 */
export const calculateStudentStats = (lessons: LessonRecord[]) => {
  const studentMap = new Map<string, {
    name: string;
    totalHours: number;
    totalLessons: number;
    totalIncome: number;
    lessons: LessonRecord[];
  }>();

  lessons.forEach(lesson => {
    const studentName = lesson.studentName;
    
    if (!studentMap.has(studentName)) {
      studentMap.set(studentName, {
        name: studentName,
        totalHours: 0,
        totalLessons: 0,
        totalIncome: 0,
        lessons: []
      });
    }

    const studentStats = studentMap.get(studentName)!;
    const lessonHours = lesson.duration / 60;
    const lessonIncome = calculateLessonIncome(lesson);

    studentStats.totalHours += lessonHours;
    studentStats.totalLessons += 1;
    studentStats.totalIncome += lessonIncome.netIncome;
    studentStats.lessons.push(lesson);
  });

  return Array.from(studentMap.values())
    .map(student => ({
      ...student,
      totalHours: Math.round(student.totalHours * 100) / 100,
      totalIncome: Math.round(student.totalIncome * 100) / 100
    }))
    .sort((a, b) => b.totalIncome - a.totalIncome); // 按收入排序
};

/**
 * 计算教学方式的统计
 */
export const calculateTeachingMethodStats = (lessons: LessonRecord[]) => {
  const onlineLessons = lessons.filter(l => l.teachingMethod === 'online');
  const offlineLessons = lessons.filter(l => l.teachingMethod === 'offline');

  const onlineHours = onlineLessons.reduce((sum, lesson) => sum + lesson.duration, 0);
  const offlineHours = offlineLessons.reduce((sum, lesson) => sum + lesson.duration, 0);

  const onlineIncome = onlineLessons.reduce((sum, lesson) => {
    const income = calculateLessonIncome(lesson);
    return sum + income.netIncome;
  }, 0);

  const offlineIncome = offlineLessons.reduce((sum, lesson) => {
    const income = calculateLessonIncome(lesson);
    return sum + income.netIncome;
  }, 0);

  return {
    online: {
      lessons: onlineLessons.length,
      hours: Math.round(onlineHours * 100) / 100,
      income: Math.round(onlineIncome * 100) / 100
    },
    offline: {
      lessons: offlineLessons.length,
      hours: Math.round(offlineHours * 100) / 100,
      income: Math.round(offlineIncome * 100) / 100
    }
  };
};

/**
 * 计算平均课时费
 */
export const calculateAverageHourlyRate = (lessons: LessonRecord[]): number => {
  if (lessons.length === 0) return 0;
  
  const totalIncome = lessons.reduce((sum, lesson) => {
    const income = calculateLessonIncome(lesson);
    return sum + income.netIncome;
  }, 0);
  
  const totalHours = lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
  
  return totalHours > 0 ? Math.round((totalIncome / totalHours) * 100) / 100 : 0;
};

/**
 * 计算课时完成率
 */
export const calculateCompletionRate = (lessons: LessonRecord[]): number => {
  if (lessons.length === 0) return 0;
  
  const completedLessons = lessons.filter(l => l.status === 'completed');
  return Math.round((completedLessons.length / lessons.length) * 100);
};