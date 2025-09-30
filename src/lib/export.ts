import * as XLSX from 'xlsx';
import type { LessonRecord } from '@/types/lesson';
import { formatDate, formatTime, formatDuration } from '@/utils/dateUtils';

// 导出课时记录到Excel
export const exportToExcel = async (lessons: LessonRecord[]) => {
  try {
    // 准备数据
    const data = lessons.map((lesson, index) => ({
      '序号': index + 1,
      '日期': formatDate(lesson.date),
      '开始时间': formatTime(lesson.startTime),
      '时长': formatDuration(lesson.duration),
      '学生姓名': lesson.studentName,
      '教学方式': lesson.teachingMethod === 'online' ? '线上' : '线下',
      '状态': getStatusText(lesson.status),
      '时薪(元)': lesson.hourlyRate,
      '收入(元)': lesson.status === 'completed' ? (lesson.hourlyRate * lesson.duration).toFixed(2) : '0.00',
      '备注': lesson.notes || ''
    }));

    // 创建工作簿
    const ws = XLSX.utils.json_to_sheet(data);
    
    // 设置列宽
    const colWidths = [
      { wch: 8 },   // 序号
      { wch: 12 },  // 日期
      { wch: 10 },  // 开始时间
      { wch: 10 },  // 时长
      { wch: 15 },  // 学生姓名
      { wch: 8 },   // 教学方式
      { wch: 8 },   // 状态
      { wch: 10 },  // 时薪
      { wch: 10 },  // 收入
      { wch: 20 }   // 备注
    ];
    ws['!cols'] = colWidths;

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '课时记录');

    // 添加统计信息
    const statsData = generateStatsData(lessons);
    const statsWs = XLSX.utils.json_to_sheet(statsData);
    statsWs['!cols'] = [{ wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, statsWs, '统计汇总');

    // 生成文件名
    const now = new Date();
    const fileName = `课时记录_${formatDate(now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0'))}.xlsx`;

    // 下载文件
    XLSX.writeFile(wb, fileName);
    
    return true;
  } catch (error) {
    console.error('导出Excel失败:', error);
    throw new Error('导出失败，请重试');
  }
};

// 生成统计信息
const generateStatsData = (lessons: LessonRecord[]) => {
  const completedLessons = lessons.filter(l => l.status === 'completed');
  const totalIncome = completedLessons.reduce((sum, lesson) => {
    return sum + (lesson.hourlyRate * lesson.duration);
  }, 0);
  
  const totalHours = completedLessons.reduce((sum, lesson) => sum + lesson.duration, 0);
  const uniqueStudents = new Set(lessons.map(l => l.studentName)).size;

  return [
    { '统计项目': '总课时数', '数值': lessons.length + '节' },
    { '统计项目': '已完成课时', '数值': completedLessons.length + '节' },
    { '统计项目': '计划中课时', '数值': lessons.filter(l => l.status === 'planned').length + '节' },
    { '统计项目': '已取消课时', '数值': lessons.filter(l => l.status === 'cancelled').length + '节' },
    { '统计项目': '总收入', '数值': '¥' + totalIncome.toFixed(2) },
    { '统计项目': '总时长', '数值': formatDuration(totalHours) },
    { '统计项目': '学生数量', '数值': uniqueStudents + '人' },
    { '统计项目': '平均时薪', '数值': '¥' + (totalHours > 0 ? (totalIncome / totalHours).toFixed(2) : '0.00') },
    { '统计项目': '完成率', '数值': lessons.length > 0 ? ((completedLessons.length / lessons.length) * 100).toFixed(1) + '%' : '0%' },
    { '统计项目': '线上课时', '数值': lessons.filter(l => l.teachingMethod === 'online').length + '节' },
    { '统计项目': '线下课时', '数值': lessons.filter(l => l.teachingMethod === 'offline').length + '节' }
  ];
};

// 获取状态文本
const getStatusText = (status: string): string => {
  switch (status) {
    case 'planned': return '计划中';
    case 'completed': return '已完成';
    case 'cancelled': return '已取消';
    default: return '未知';
  }
};

// 导出CSV格式
export const exportToCSV = (lessons: LessonRecord[]) => {
  try {
    const data = lessons.map((lesson, index) => ({
      '序号': index + 1,
      '日期': formatDate(lesson.date),
      '开始时间': formatTime(lesson.startTime),
      '时长': formatDuration(lesson.duration),
      '学生姓名': lesson.studentName,
      '教学方式': lesson.teachingMethod === 'online' ? '线上' : '线下',
      '状态': getStatusText(lesson.status),
      '时薪(元)': lesson.hourlyRate,
      '收入(元)': lesson.status === 'completed' ? lesson.hourlyRate * lesson.duration : 0,
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
      link.setAttribute('download', `课时记录_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    return true;
  } catch (error) {
    console.error('导出CSV失败:', error);
    throw new Error('导出失败，请重试');
  }
};