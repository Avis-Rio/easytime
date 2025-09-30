import React, { useState } from 'react';
import { useLessonStore } from '@/stores/lessonStore';
import { StatsPanel } from '@/components/stats/StatsPanel';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Users, Calendar } from 'lucide-react';
import { exportToExcel } from '@/lib/export';
import type { LessonRecord, MonthlyStats } from '@/types/lesson';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';

export const StatsPage: React.FC = () => {
  const { lessons } = useLessonStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly' | 'student'>('monthly');

  // 获取月度数据
  const getMonthlyStats = () => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    const monthlyLessons = lessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      return lessonDate >= monthStart && lessonDate <= monthEnd;
    });

    return calculateStats(monthlyLessons);
  };

  // 获取年度数据
  const getYearlyStats = () => {
    const year = selectedMonth.getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    
    const yearlyLessons = lessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      return lessonDate >= yearStart && lessonDate <= yearEnd;
    });

    return calculateStats(yearlyLessons);
  };

  // 获取学生统计数据
  const getStudentStats = () => {
    const studentMap = new Map<string, LessonRecord[]>();
    
    lessons.forEach(lesson => {
      if (!studentMap.has(lesson.studentName)) {
        studentMap.set(lesson.studentName, []);
      }
      studentMap.get(lesson.studentName)!.push(lesson);
    });

    const studentStats = Array.from(studentMap.entries()).map(([studentName, studentLessons]) => ({
      studentName,
      ...calculateStats(studentLessons)
    }));

    return studentStats.sort((a, b) => b.totalLessons - a.totalLessons);
  };

  // 计算统计数据
  const calculateStats = (lessonList: LessonRecord[]): MonthlyStats => {
    const completedLessons = lessonList.filter(l => l.status === 'completed');
    const plannedLessons = lessonList.filter(l => l.status === 'planned');
    const cancelledLessons = lessonList.filter(l => l.status === 'cancelled');
    const onlineLessons = lessonList.filter(l => l.teachingMethod === 'online');
    const offlineLessons = lessonList.filter(l => l.teachingMethod === 'offline');
    
    const totalIncome = completedLessons.reduce((sum, lesson) => {
      return sum + Math.round(lesson.hourlyRate * lesson.duration);
    }, 0);

    const totalHours = completedLessons.reduce((sum, lesson) => sum + lesson.duration, 0);
    const onlineHours = onlineLessons.reduce((sum, lesson) => sum + lesson.duration, 0);
    const offlineHours = offlineLessons.reduce((sum, lesson) => sum + lesson.duration, 0);
    const uniqueStudents = new Set(lessonList.map(l => l.studentName)).size;
    const grossIncome = totalIncome;
    const taxDeduction = grossIncome * 0.1; // 默认税率10%
    const netIncome = grossIncome - taxDeduction;

    const currentDate = new Date();
    return {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      totalLessons: lessonList.length,
      completedLessons: completedLessons.length,
      plannedLessons: plannedLessons.length,
      cancelledLessons: cancelledLessons.length,
      totalIncome,
      totalHours,
      uniqueStudents,
      completionRate: lessonList.length > 0 ? Math.round((completedLessons.length / lessonList.length) * 100) : 0,
      averageHourlyRate: totalHours > 0 ? Math.round(totalIncome / totalHours) : 0,
      grossIncome,
      taxDeduction,
      netIncome,
      onlineHours,
      offlineHours
    };
  };

  const handleExport = async () => {
    try {
      await exportToExcel(lessons);
      alert('数据导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      alert('数据导出失败，请重试');
    }
  };

  const handlePrevMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, 1));
  };

  const monthlyStats = getMonthlyStats();
  const yearlyStats = getYearlyStats();
  const studentStats = getStudentStats();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">统计分析</h1>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              导出
            </Button>
          </div>

          {/* 标签页切换 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'monthly', label: '月度', icon: Calendar },
              { key: 'yearly', label: '年度', icon: TrendingUp },
              { key: 'student', label: '学生', icon: Users }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as 'monthly' | 'yearly' | 'student')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* 月度/年度导航 */}
        {(activeTab === 'monthly' || activeTab === 'yearly') && (
          <div className="flex items-center justify-between mb-6 bg-white rounded-lg border p-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              ←
            </button>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {activeTab === 'monthly' 
                  ? format(selectedMonth, 'yyyy年MM月')
                  : format(selectedMonth, 'yyyy年')
                }
              </div>
              <div className="text-sm text-gray-500">
                {activeTab === 'monthly' ? '月度统计' : '年度统计'}
              </div>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              →
            </button>
          </div>
        )}

        {/* 统计面板 */}
        {activeTab === 'monthly' && (
          <StatsPanel stats={monthlyStats} />
        )}

        {activeTab === 'yearly' && (
          <StatsPanel stats={yearlyStats} />
        )}

        {activeTab === 'student' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">学生排名</h3>
              <div className="space-y-3">
                {studentStats.slice(0, 10).map((student, index) => (
                  <div key={student.studentName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{student.studentName}</div>
                        <div className="text-sm text-gray-500">
                          {student.totalLessons}课时 • ¥{student.totalIncome}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {student.completionRate}%
                      </div>
                      <div className="text-xs text-gray-500">完成率</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 总体学生统计 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border p-4 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{studentStats.length}</div>
                <div className="text-sm text-gray-500">总学生数</div>
              </div>
              <div className="bg-white rounded-lg border p-4 text-center">
                <div className="w-8 h-8 text-green-600 mx-auto mb-2">💰</div>
                <div className="text-2xl font-bold text-gray-900">
                  ¥{Math.round(studentStats.reduce((sum, s) => sum + s.averageHourlyRate, 0) / studentStats.length || 0)}
                </div>
                <div className="text-sm text-gray-500">平均时薪</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;