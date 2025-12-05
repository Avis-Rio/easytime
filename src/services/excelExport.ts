import * as XLSX from 'xlsx';
import { format } from 'date-fns';
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
    studentStats.totalIncome += lessonIncome.grossIncome;
  });

  const studentData = Array.from(studentMap.values()).map(stats => ({
    '学生姓名': stats.name,
    '总课时数': stats.totalLessons,
    '总时长(小时)': Math.round(stats.totalHours * 100) / 100,
    '总贡献收入(元)': Math.round(stats.totalIncome * 100) / 100,
    '平均课时单价(元)': stats.totalHours > 0 ? Math.round(stats.totalIncome / stats.totalHours * 100) / 100 : 0
  }));

  // 创建工作簿
  const ws = XLSX.utils.json_to_sheet(studentData);
  const wb = XLSX.utils.book_new();
  
  const sheetName = '学生统计报告';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // 设置列宽
  ws['!cols'] = [
    { wch: 15 }, // 学生姓名
    { wch: 10 }, // 总课时数
    { wch: 15 }, // 总时长
    { wch: 18 }, // 总贡献收入
    { wch: 18 }  // 平均课时单价
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

/**
 * 导出所有课时记录到Excel（通用导出功能）
 */
export const exportToExcel = (lessons: LessonRecord[]): void => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  exportMonthlyLessonsToExcel(lessons, year, month);
};

/**
 * 导出课时记录到CSV
 */
export const exportToCSV = (lessons: LessonRecord[]): void => {
  try {
    const data = lessons.map((lesson, index) => ({
      '序号': index + 1,
      '日期': lesson.date,
      '开始时间': lesson.startTime,
      '时长': `${lesson.duration}小时`,
      '学生姓名': lesson.studentName,
      '教学方式': lesson.teachingMethod === 'online' ? '线上' : '线下',
      '状态': getStatusText(lesson.status),
      '时薪(元)': lesson.hourlyRate,
      '收入(元)': lesson.status === 'completed' ? (lesson.hourlyRate * lesson.duration).toFixed(2) : '0.00',
      '备注': lesson.notes || ''
    }));

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `EasyTime_课时记录_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('导出CSV失败:', error);
    throw new Error('导出失败，请重试');
  }
};

/**
 * 导出语之森课时确认表
 * 格式要求：固定标题表头，教师名字固定为：龚莹瑜，交通费统一为 0，按学生汇总
 */
export const exportConfirmationSheet = (
  lessons: LessonRecord[],
  year: number,
  month: number,
  fileName?: string
): void => {
  // 1. 过滤指定月份的课时记录，只包含已完成的课程
  const monthlyLessons = lessons.filter(lesson => {
    const lessonDate = new Date(lesson.date);
    return lessonDate.getFullYear() === year && 
           lessonDate.getMonth() + 1 === month &&
           lesson.status === 'completed'; // 只导出已完成的课程
  });

  // 2. 按学生姓名分组并排序
  monthlyLessons.sort((a, b) => {
    // 先按学生姓名排序
    if (a.studentName !== b.studentName) {
      return a.studentName.localeCompare(b.studentName, 'zh-CN');
    }
    // 同一学生按日期排序
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // 3. 准备数据行
  const dataRows = monthlyLessons.map(lesson => {
    const baseSchool = lesson.school || '';
    const schoolName = lesson.teachingMethod === 'online' && baseSchool
      ? `${baseSchool}-网课`
      : baseSchool;

    return [
    '龚莹瑜', // 老师姓名
    schoolName, // 学校（线上自动加 -网课）
    lesson.studentId || '', // 学生号
    lesson.studentName, // 学生名
    month.toString(), // 上课月份
    format(new Date(lesson.date), 'yyyy/M/d'), // 上课日
    lesson.duration, // 时数
    lesson.hourlyRate, // 工资
    0, // 交通费
    lesson.duration * lesson.hourlyRate // 金额
  ]});

  // 4. 创建工作簿和工作表
  const wb = XLSX.utils.book_new();
  
  // 创建表头数据
  const headerData = [
    ['语之森课时确认表'], // A1:J1
    [], // A2 空行
    ['老师姓名', '学校', '学生号', '学生名', '上课月份', '上课日', '时数', '工资', '交通费', '金额'] // A3
  ];

  // 将表头和数据合并
  const wsData = [...headerData, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // 5. 设置合并单元格 (标题行)
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }); // A1:J1 合并

  // 设置标题行更高以模拟更大字号
  ws['!rows'] = ws['!rows'] || [];
  ws['!rows'][0] = { hpt: 28 }; // 约等于 28pt 的行高

  // 6. 设置列宽
  ws['!cols'] = [
    { wch: 10 }, // 老师姓名
    { wch: 15 }, // 学校
    { wch: 8 },  // 学生号
    { wch: 10 }, // 学生名
    { wch: 8 },  // 上课月份
    { wch: 12 }, // 上课日
    { wch: 8 },  // 时数
    { wch: 8 },  // 工资
    { wch: 8 },  // 交通费
    { wch: 10 }  // 金额
  ];

  // 7. 设置样式 (居中对齐) - 注意：XLSX 基础版不支持样式，这里只设置基本结构
  // 实际样式可能需要 Pro 版本或使用 exceljs 等其他库，但 XLSX 基础版能满足数据导出需求

  const sheetName = '课时确认表';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // 8. 下载文件
  const defaultFileName = `语之森课时确认表_${year}年${month}月.xlsx`;
  XLSX.writeFile(wb, fileName || defaultFileName);
};
