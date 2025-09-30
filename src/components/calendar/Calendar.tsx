import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { useLessonStore } from '../../stores/lessonStore';
import { generateCalendarDays, getMonthName, isSameMonth, isSameDay } from '../../utils/dateUtils';
import type { LessonRecord } from '../../types/lesson';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

/**
 * 日历组件
 * 显示月历视图，支持课时状态颜色标记
 */
export const Calendar: React.FC<CalendarProps> = ({ 
  selectedDate = new Date(), 
  onDateSelect,
  className 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { lessons } = useLessonStore();

  // 生成日历天数
  const calendarDays = useMemo(() => 
    generateCalendarDays(currentMonth), 
    [currentMonth]
  );

  // 获取指定日期的课时记录
  const getLessonsForDate = (date: Date): LessonRecord[] => {
    return lessons.filter(lesson => 
      isSameDay(new Date(lesson.date), date)
    );
  };

  // 获取日期状态颜色
  const getDateStatusColor = (date: Date): string => {
    const dayLessons = getLessonsForDate(date);
    
    if (dayLessons.length === 0) {
      return '';
    }

    const hasCompleted = dayLessons.some(l => l.status === 'completed');
    const hasPlanned = dayLessons.some(l => l.status === 'planned');
    const hasCancelled = dayLessons.some(l => l.status === 'cancelled');

    if (hasCompleted && !hasPlanned && !hasCancelled) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (hasPlanned && !hasCompleted && !hasCancelled) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (hasCancelled && !hasCompleted && !hasPlanned) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // 导航到上一月
  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  // 导航到下一月
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // 导航到今天
  const goToToday = () => {
    setCurrentMonth(new Date());
    onDateSelect?.(new Date());
  };

  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100", className)}>
      {/* 日历头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-900">
            {getMonthName(currentMonth)} {currentMonth.getFullYear()}
          </h2>
          {!isSameMonth(currentMonth, new Date()) && (
            <button
              onClick={goToToday}
              className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
            >
              今天
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={goToPrevMonth}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors active:scale-95"
            aria-label="上一月"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors active:scale-95"
            aria-label="下一月"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-0 border-b border-gray-100">
        {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-0">
        {calendarDays.map((date: Date, index: number) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isToday = isSameDay(date, new Date());
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const statusColor = getDateStatusColor(date);
          const dayLessons = getLessonsForDate(date);

          return (
            <button
              key={index}
              onClick={() => onDateSelect?.(date)}
              className={cn(
                "relative p-3 text-center transition-all duration-200",
                "border-r border-b border-gray-50 last:border-r-0",
                "hover:bg-gray-50 active:scale-95",
                !isCurrentMonth && "text-gray-300",
                isCurrentMonth && "text-gray-900",
                isToday && "bg-blue-50 text-blue-600 font-semibold",
                isSelected && "ring-2 ring-blue-500 ring-inset",
                statusColor && "font-semibold",
                dayLessons.length > 0 && "cursor-pointer"
              )}
              disabled={!isCurrentMonth}
            >
              <span className="text-sm">{date.getDate()}</span>
              
              {/* 课时状态指示器 */}
              {dayLessons.length > 0 && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {dayLessons.slice(0, 3).map((lesson) => (
                    <div
                      key={lesson.id}
                      className={cn(
                        "w-1 h-1 rounded-full",
                        lesson.status === 'completed' && "bg-green-500",
                        lesson.status === 'planned' && "bg-blue-500",
                        lesson.status === 'cancelled' && "bg-red-500"
                      )}
                    />
                  ))}
                  {dayLessons.length > 3 && (
                    <div className="w-1 h-1 rounded-full bg-gray-400" />
                  )}
                </div>
              )}

              {/* 状态背景色 */}
              {statusColor && (
                <div className={cn(
                  "absolute inset-1 rounded-md border",
                  statusColor,
                  "opacity-20"
                )} />
              )}
            </button>
          );
        })}
      </div>

      {/* 图例 */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded" />
            <span>已完成</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded" />
            <span>计划中</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded" />
            <span>已取消</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded" />
            <span>混合</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 紧凑版日历组件
 * 用于首页等空间有限的场景
 */
export const CompactCalendar: React.FC<Omit<CalendarProps, 'className'>> = (props) => {
  return (
    <Calendar 
      {...props} 
      className="shadow-none border-0 rounded-none"
    />
  );
};