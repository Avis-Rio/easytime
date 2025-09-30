import { useState } from 'react';
import { useLessonStore } from '@/stores/lessonStore';
import { Calendar } from '@/components/calendar/Calendar';
import { LessonList } from '@/components/lessons/LessonList';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LessonForm } from '@/components/forms/LessonForm';
import type { LessonRecord } from '@/types/lesson';


export const CalendarPage: React.FC = () => {
  const { lessons, updateLesson, deleteLesson } = useLessonStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonRecord | null>(null);


  // 获取选中日期的课程
  const getLessonsForDate = (date: Date) => {
    return lessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      const isSame = isSameDay(lessonDate, date);
      const matchesFilter = filterStatus === 'all' || lesson.status === filterStatus;
      return isSame && matchesFilter;
    });
  };

  // 获取月份课程
  const getLessonsForMonth = () => {
    return lessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      return lessonDate.getMonth() === currentMonth.getMonth() && 
             lessonDate.getFullYear() === currentMonth.getFullYear();
    });
  };



  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // 处理日期选择
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // 保存选中的日期到localStorage，供新增按钮使用
    // 使用本地时间格式而不是UTC时间，避免时区问题
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    localStorage.setItem('selectedDateForAdd', `${year}-${month}-${day}`);
  };

  const selectedDateLessons = selectedDate ? getLessonsForDate(selectedDate) : [];
  const monthlyLessons = getLessonsForMonth();

  const handleEdit = (lesson: LessonRecord) => {
    setEditingLesson(lesson);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteLesson(id);
  };

  const handleFormSubmit = (data: Omit<LessonRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingLesson) {
      updateLesson(editingLesson.id, data);
    }
    setIsFormOpen(false);
    setEditingLesson(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingLesson(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">课程日历</h1>
            <Button
              onClick={handleGoToToday}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              今天
            </Button>
          </div>

          {/* 月份导航 */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {format(currentMonth, 'yyyy年MM月')}
              </div>
              <div className="text-sm text-gray-500">
                {monthlyLessons.length} 节课
              </div>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* 日历组件 */}
        <div className="bg-white rounded-lg border mb-6">
          <Calendar
                selectedDate={selectedDate || undefined}
                onDateSelect={handleDateSelect}
              />
        </div>

        {/* 状态过滤器 */}
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { key: 'all', label: '全部', color: 'bg-gray-100 text-gray-700' },
              { key: 'completed', label: '已完成', color: 'bg-green-100 text-green-700' },
              { key: 'planned', label: '计划中', color: 'bg-blue-100 text-blue-700' },
              { key: 'cancelled', label: '已取消', color: 'bg-red-100 text-red-700' }
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filterStatus === key
                    ? 'bg-blue-600 text-white'
                    : color
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 选中日期详情 */}
        {selectedDate && (
          <div className="bg-white rounded-lg border mb-6">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {format(selectedDate, 'MM月dd日')} 课程
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedDateLessons.length} 节课 • 
                    {selectedDateLessons.reduce((sum, l) => sum + l.duration, 0)} 小时
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  selectedDateLessons.length === 0 ? 'bg-gray-300' :
                  selectedDateLessons.every(l => l.status === 'completed') ? 'bg-green-500' :
                  selectedDateLessons.every(l => l.status === 'cancelled') ? 'bg-red-500' :
                  selectedDateLessons.every(l => l.status === 'planned') ? 'bg-blue-500' :
                  'bg-yellow-500'
                }`}></div>
              </div>
            </div>
            
            {selectedDateLessons.length > 0 ? (
              <div className="p-4">
                <LessonList
                  lessons={selectedDateLessons}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  showFilters={false}
                  compact={true}
                />
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>这一天还没有安排课程</p>
                <p className="text-sm">点击添加按钮创建新课程</p>
              </div>
            )}
          </div>
        )}

        {/* 月度课程概览 */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">本月课程</h3>
            <p className="text-sm text-gray-500">
              共 {monthlyLessons.length} 节课，
              {monthlyLessons.filter(l => l.status === 'completed').length} 节已完成，
              {monthlyLessons.filter(l => l.status === 'planned').length} 节计划中，
              {monthlyLessons.filter(l => l.status === 'cancelled').length} 节已取消
            </p>
          </div>
          
          {monthlyLessons.length > 0 ? (
            <div className="p-4">
              <LessonList
                lessons={monthlyLessons}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showFilters={false}
                compact={true}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>这个月还没有安排课程</p>
              <p className="text-sm">点击添加按钮创建新课程</p>
            </div>
          )}
        </div>
      </div>

      {/* 编辑表单对话框 */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? '编辑课时记录' : '新增课时记录'}
            </DialogTitle>
          </DialogHeader>
          <LessonForm
            initialData={editingLesson || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;