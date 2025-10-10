import React from 'react';
import { useLessonStore } from '@/stores/lessonStore';
import { Calendar } from '@/components/calendar/Calendar';
import { StatsPanel } from '@/components/stats/StatsPanel';
import { formatDate, getCurrentDate, formatDuration } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Plus, Calendar as CalendarIcon, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { LessonStatus } from '@/types/lesson';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { lessons } = useLessonStore();
  
  const today = getCurrentDate();
  const todayLessons = lessons.filter(lesson => lesson.date === today);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // 计算本月统计数据
  const monthlyLessons = lessons.filter(lesson => {
    const lessonDate = new Date(lesson.date);
    return lessonDate.getMonth() + 1 === currentMonth && lessonDate.getFullYear() === currentYear;
  });

  const completedLessons = monthlyLessons.filter(lesson => lesson.status === 'completed');
  const plannedLessons = monthlyLessons.filter(lesson => lesson.status === 'planned');
  const totalIncome = completedLessons.reduce((sum, lesson) => sum + Math.round(lesson.hourlyRate * lesson.duration), 0);
  const totalHours = completedLessons.reduce((sum, lesson) => sum + lesson.duration, 0);

  const monthlyStats = {
    year: currentYear,
    month: currentMonth,
    totalLessons: monthlyLessons.length,
    completedLessons: completedLessons.length,
    plannedLessons: plannedLessons.length,
    cancelledLessons: monthlyLessons.filter(lesson => lesson.status === 'cancelled').length,
    totalHours: totalHours,
    totalIncome: totalIncome,
    averageHourlyRate: totalHours > 0 ? totalIncome / totalHours : 0,
    onlineHours: monthlyLessons.filter(l => l.teachingMethod === 'online').reduce((sum, lesson) => sum + lesson.duration, 0),
    offlineHours: monthlyLessons.filter(l => l.teachingMethod === 'offline').reduce((sum, lesson) => sum + lesson.duration, 0),
    uniqueStudents: new Set(monthlyLessons.map(l => l.studentName)).size,
    completionRate: monthlyLessons.length > 0 ? Math.round((completedLessons.length / monthlyLessons.length) * 100) : 0,
    grossIncome: totalIncome,
    taxDeduction: totalIncome * 0.1,
    netIncome: totalIncome * 0.9
  };

  const handleAddLesson = () => {
    navigate('/add');
  };

  const handleDateSelect = (date: Date) => {
    navigate('/add', { state: { selectedDate: date } });
  };

  const handleViewCalendar = () => {
    navigate('/calendar');
  };

  const handleViewStats = () => {
    navigate('/stats');
  };

  const getStatusColor = (status: LessonStatus) => {
    switch (status) {
      case 'completed': return 'text-green-800 bg-green-100 border-green-200';
      case 'planned': return 'text-blue-800 bg-blue-100 border-blue-200';
      case 'cancelled': return 'text-red-800 bg-red-100 border-red-200';
      default: return 'text-gray-800 bg-gray-100 border-gray-200';
    }
  };

  const getStatusText = (status: LessonStatus) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'planned': return '计划中';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: `calc(64px + env(safe-area-inset-bottom, 0px))` }}>
      {/* 顶部标题栏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 text-center">EasyTime</h1>
          <p className="text-sm text-gray-500 text-center mt-1">课时管理系统</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 快速操作按钮 */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={handleAddLesson}
            className="flex flex-col items-center justify-center h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus className="w-6 h-6 mb-1" />
            <span className="text-xs">新增课时</span>
          </Button>
          <Button
            onClick={handleViewCalendar}
            variant="outline"
            className="flex flex-col items-center justify-center h-20 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <CalendarIcon className="w-6 h-6 mb-1" />
            <span className="text-xs">查看日历</span>
          </Button>
          <Button
            onClick={handleViewStats}
            variant="outline"
            className="flex flex-col items-center justify-center h-20 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <BarChart3 className="w-6 h-6 mb-1" />
            <span className="text-xs">统计分析</span>
          </Button>
        </div>

        {/* 统计概览 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">本月概览</h2>
            <p className="text-sm text-gray-500">{currentYear}年{currentMonth}月</p>
          </div>
          <StatsPanel stats={monthlyStats} />
        </div>

        {/* 今日课程 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">今日课程</h2>
              <span className="text-sm text-gray-500">{formatDate(today)}</span>
            </div>
          </div>
          
          <div className="p-4">
            {todayLessons.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CalendarIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">今天暂无课程安排</p>
                <Button
                  onClick={handleAddLesson}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加课程
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{lesson.studentName}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lesson.status)}`}>
                          {getStatusText(lesson.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {lesson.startTime} · {formatDuration(lesson.duration)} · ¥{lesson.hourlyRate}/时
                      </div>
                      {lesson.teachingMethod === 'online' && (
                        <div className="text-xs text-blue-600 mt-1">线上教学</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ¥{(lesson.hourlyRate * lesson.duration).toFixed(0)}
                      </div>
                      {lesson.notes && (
                        <div className="text-xs text-gray-500 mt-1">{lesson.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 本月日历预览 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">本月日历</h2>
              <Button
                onClick={handleViewCalendar}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                查看全部
              </Button>
            </div>
          </div>
          <div className="p-4">
            <Calendar selectedDate={new Date()} onDateSelect={handleDateSelect} />
          </div>
        </div>

        {/* 快速统计 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-2xl font-bold text-blue-600">
              {lessons.filter(l => l.status === 'planned').length}
            </div>
            <div className="text-sm text-gray-500">待上课程</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-2xl font-bold text-green-600">
              {lessons.filter(l => l.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-500">已完成课程</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;