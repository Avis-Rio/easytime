import * as XLSX from 'xlsx';
import type { LessonRecord, MonthlyStats } from '../types/lesson';
import { formatDuration } from '../utils/dateUtils';

/**
 * 导出月度课时记录到Excel
 */
export const exportMonthlyLessonsToExcel = (
  lessons: LessonRecord[],
  year: number,
  month: number,
  fileName?: string
): void => {
  // 过滤指定月份的课时记录
  const monthlyLessons = lessons.filter(lesson => {
    const lessonDate = new Date(lesson.date);
    return lessonDate.getFullYear() === year && lessonDate.getMonth() + 1 === month;
  }).sort((a, b) => new Date(a.date + ' ' + a.startTime).getTime() - new Date(b.date + ' ' + b.startTime).getTime());

  // 准备Excel数据
  const excelData = monthlyLessons.map((lesson, index) => ({
    '序号': index + 1,
    '日期': lesson.date.substring(5, 10), // MM-DD format
    '时间': lesson.startTime,
    '学生姓名': lesson.studentName,
    '时长': formatDuration(lesson.duration),
    '授课方式': lesson.teachingMethod === 'online' ? '线上' : '线下',
    '地点': lesson.teachingMethod === 'offline' ? '线下授课' : '线上授课',
    '状态': getStatusText(lesson.status),
    '课时费(元)': lesson.hourlyRate,
    '税前收入(元)': calculateLessonIncome(lesson).grossIncome,
    '税款(元)': calculateLessonIncome(lesson).taxDeduction,
    '税后收入(元)': calculateLessonIncome(lesson).netIncome
  }));

  // 创建工作簿
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  
  // 设置工作表名称
  const sheetName = `${year}年${month}月课时记录`;
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // 设置列宽
  const colWidths = [
    { wch: 8 },  // 序号
    { wch: 10 }, // 日期
    { wch: 10 }, // 时间
    { wch: 15 }, // 学生姓名
    { wch: 12 }, // 时长
    { wch: 10 }, // 授课方式
    { wch: 15 }, // 地点
    { wch: 10 }, // 状态
    { wch: 12 }, // 课时费
    { wch: 15 }, // 税前收入
    { wch: 10 }, // 税款
    { wch: 15 }  // 税后收入
  ];
  ws['!cols'] = colWidths;

  // 下载文件
  const defaultFileName = `EasyTime_${year}年${month}月课时记录.xlsx`;
  XLSX.writeFile(wb, fileName || defaultFileName);
};

/**
 * 导出月度统计报告
 */
export const exportMonthlyStatsToExcel = (
  monthlyStats: MonthlyStats,
  fileName?: string
): void => {
  // 统计数据
  const statsData = [
    { '项目': '总课时数', '数值': monthlyStats.totalLessons, '单位': '节' },
    { '项目': '已完成课时', '数值': monthlyStats.completedLessons, '单位': '节' },
    { '项目': '计划课时', '数值': monthlyStats.plannedLessons, '单位': '节' },
    { '项目': '取消课时', '数值': monthlyStats.cancelledLessons, '单位': '节' },
    { '项目': '总时长', '数值': monthlyStats.totalHours, '单位': '小时' },
    { '项目': '税前收入', '数值': monthlyStats.grossIncome, '单位': '元' },
    { '项目': '税款扣除', '数值': monthlyStats.taxDeduction, '单位': '元' },
    { '项目': '税后收入', '数值': monthlyStats.netIncome, '单位': '元' }
  ];

  // 创建工作簿
  const ws = XLSX.utils.json_to_sheet(statsData);
  const wb = XLSX.utils.book_new();
  
  const sheetName = `${monthlyStats.year}年${monthlyStats.month}月统计报告`;
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // 设置列宽
  ws['!cols'] = [
    { wch: 15 }, // 项目
    { wch: 12 }, // 数值
    { wch: 8 }   // 单位
  ];

  // 下载文件
  const defaultFileName = `EasyTime_${monthlyStats.year}年${monthlyStats.month}月统计报告.xlsx`;
  XLSX.writeFile(wb, fileName || defaultFileName);
};

/**
 * 导出年度统计报告
 */
export const exportYearlyStatsToExcel = (
  monthlyStatsList: MonthlyStats[],
  year: number,
  fileName?: string
): void => {
  // 准备年度统计数据
  const yearlyData = monthlyStatsList.map(stats => ({
    '月份': `${stats.year}年${stats.month}月`,
    '总课时': stats.totalLessons,
    '已完成': stats.completedLessons,
    '总时长(小时)': stats.totalHours,
    '税前收入(元)': stats.grossIncome,
    '税款(元)': stats.taxDeduction,
    '税后收入(元)': stats.netIncome
  }));

  // 计算年度总计
  const totalStats = monthlyStatsList.reduce(
    (acc, stats) => ({
      totalLessons: acc.totalLessons + stats.totalLessons,
      completedLessons: acc.completedLessons + stats.completedLessons,
      totalHours: acc.totalHours + stats.totalHours,
      grossIncome: acc.grossIncome + stats.grossIncome,
      taxDeduction: acc.taxDeduction + stats.taxDeduction,
      netIncome: acc.netIncome + stats.netIncome
    }),
    { totalLessons: 0, completedLessons: 0, totalHours: 0, grossIncome: 0, taxDeduction: 0, netIncome: 0 }
  );

  // 添加总计行
  yearlyData.push({
    '月份': '年度总计',
    '总课时': totalStats.totalLessons,
    '已完成': totalStats.completedLessons,
    '总时长(小时)': Math.round(totalStats.totalHours * 100) / 100,
    '税前收入(元)': Math.round(totalStats.grossIncome * 100) / 100,
    '税款(元)': Math.round(totalStats.taxDeduction * 100) / 100,
    '税后收入(元)': Math.round(totalStats.netIncome * 100) / 100
  });

  // 创建工作簿
  const ws = XLSX.utils.json_to_sheet(yearlyData);
  const wb = XLSX.utils.book_new();
  
  const sheetName = `${year}年年度统计报告`;
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // 设置列宽
  ws['!cols'] = [
    { wch: 15 }, // 月份
    { wch: 10 }, // 总课时
    { wch: 10 }, // 已完成
    { wch: 12 }, // 总时长
    { wch: 15 }, // 税前收入
    { wch: 12 }, // 税款
    { wch: 15 }  // 税后收入
  ];

  // 下载文件
  const defaultFileName = `EasyTime_${year}年年度统计报告.xlsx`;
  XLSX.writeFile(wb, fileName || defaultFileName);
};

/**
 * 导出学生统计报告
 */
export const exportStudentStatsToExcel = (
  lessons: LessonRecord[],
  fileName?: string
): void => {
  // 计算学生统计
  const studentMap = new Map<string, {
    name: string;
    totalHours: number;
    totalLessons: number;
    totalIncome: number;
  }>();

  lessons.forEach(lesson => {
    const studentName = lesson.studentName;
    
    if (!studentMap.has(studentName)) {
      studentMap.set(studentName, {
        name: studentName,
        totalHours: 0,
        totalLessons: 0,
        totalIncome: 0
      });
    }

    const studentStats = studentMap.get(studentName)!;
    const lessonIncome = calculateLessonIncome(lesson);

    studentStats.totalHours += lesson.duration;
    studentStats.totalLessons += 1;
    studentStats.totalIncome += lessonIncome.netIncome;
  });

  // 准备Excel数据
  const excelData = Array.from(studentMap.values())
    .map((student, index) => ({
      '序号': index + 1,
      '学生姓名': student.name,
      '总课时': student.totalLessons,
      '总时长': formatDuration(student.totalHours),
      '总收入(元)': Math.round(student.totalIncome * 100) / 100,
      '平均课时费(元)': student.totalLessons > 0 ? 
        Math.round((student.totalIncome / (student.totalHours)) * 100) / 100 : 0
    }))
    .sort((a, b) => b['总收入(元)'] - a['总收入(元)']); // 按收入排序

  // 创建工作簿
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  
  const sheetName = '学生统计报告';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // 设置列宽
  ws['!cols'] = [
    { wch: 8 },  // 序号
    { wch: 15 }, // 学生姓名
    { wch: 10 }, // 总课时
    { wch: 12 }, // 总时长
    { wch: 15 }, // 总收入
    { wch: 15 }  // 平均课时费
  ];

  // 下载文件
  const defaultFileName = `EasyTime_学生统计报告.xlsx`;
  XLSX.writeFile(wb, fileName || defaultFileName);
};

/**
 * 获取状态文本
 */
const getStatusText = (status: string): string => {
  const statusMap = {
    'planned': '计划中',
    'completed': '已完成',
    'cancelled': '已取消',
    'rescheduled': '已调课'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

/**
 * 计算单节课时收入
 */
const calculateLessonIncome = (lesson: LessonRecord): {
  grossIncome: number;
  taxDeduction: number;
  netIncome: number;
} => {
  const grossIncome = lesson.duration * lesson.hourlyRate;
  const taxDeduction = grossIncome * 0.1; // 默认税率10%
  const netIncome = grossIncome - taxDeduction;

  return {
    grossIncome: Math.round(grossIncome * 100) / 100,
    taxDeduction: Math.round(taxDeduction * 100) / 100,
    netIncome: Math.round(netIncome * 100) / 100
  };
};