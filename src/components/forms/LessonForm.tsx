import React, { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import type { LessonRecord, LessonFormData } from '../../types/lesson';
import { generateTimeOptions } from '../../utils/dateUtils';
import { useLessonStore } from '../../stores/lessonStore';
import { validateLessonForm } from '../../utils/validation';
import { Calendar, Clock, User, BookOpen, DollarSign, MessageSquare } from 'lucide-react';

interface LessonFormProps {
  initialData?: LessonRecord;
  selectedDate?: Date;
  onSubmit: (data: LessonFormData) => void;
  onCancel: () => void;
  className?: string;
}

/**
 * 课时记录表单组件
 * 支持学生、时间、时长等信息的输入
 */
export const LessonForm: React.FC<LessonFormProps> = ({
  initialData,
  selectedDate,
  onSubmit,
  onCancel,
  className
}) => {
  const { settings, lessons } = useLessonStore();
  
  // 表单状态 - duration以小时为单位存储和显示
  const [formData, setFormData] = useState<LessonFormData>({
    date: initialData?.date || (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')),
    startTime: initialData?.startTime || '09:00',
    duration: initialData?.duration || 1, // 直接使用小时单位，默认1小时
    studentName: initialData?.studentName || '',
    teachingMethod: initialData?.teachingMethod || 'online',
    status: initialData?.status || 'planned',
    notes: initialData?.notes || '',
    hourlyRate: initialData?.hourlyRate || settings.hourlyRate,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 时间选项
  const timeOptions = useState(() => generateTimeOptions(15))[0];

  // 计算结束时间
  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + (duration * 60);
    
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  // 检查时间冲突
  const checkTimeConflict = (): string | null => {
    const targetDate = formData.date;
    const targetStartTime = formData.startTime;
    const targetDuration = formData.duration;
    const targetEndTime = calculateEndTime(targetStartTime, targetDuration);
    // const targetStudent = formData.studentName.trim();
    
    // 获取同一天的现有课程（排除当前正在编辑的课程）
    const sameDayLessons = lessons.filter(lesson => {
      if (initialData && lesson.id === initialData.id) return false; // 排除当前编辑的课程
      return lesson.date === targetDate && lesson.status !== 'cancelled'; // 只检查未取消的课程
    });

    // 检查时间冲突
    for (const lesson of sameDayLessons) {
      const existingEndTime = calculateEndTime(lesson.startTime, lesson.duration);
      
      // 检查时间是否重叠
      const isTimeOverlap = (
        (targetStartTime >= lesson.startTime && targetStartTime < existingEndTime) ||
        (targetEndTime > lesson.startTime && targetEndTime <= existingEndTime) ||
        (targetStartTime <= lesson.startTime && targetEndTime >= existingEndTime)
      );

      if (isTimeOverlap) {
        return `时间冲突：${lesson.studentName} ${lesson.startTime}-${existingEndTime}`;
      }
    }

    return null;
  };

  // 表单验证（使用增强的验证工具）
  const validateForm = (): boolean => {
    // 使用统一的验证函数
    const { isValid, errors: validationErrors } = validateLessonForm(formData);
    
    // 检查时间冲突
    if (isValid) {
      const conflict = checkTimeConflict();
      if (conflict) {
        validationErrors.startTime = conflict;
        setErrors(validationErrors);
        return false;
      }
    }

    setErrors(validationErrors);
    return isValid;
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // duration已经是小时单位，直接提交
      onSubmit(formData);
    }
  };

  // 输入处理
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 计算收入
  const calculateIncome = () => {
    return Math.round(formData.hourlyRate * formData.duration);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* 日期选择 */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Calendar className="w-4 h-4 mr-2" />
          日期
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          className={cn(
            "w-full px-3 py-3 border rounded-lg",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "transition-colors",
            errors.date ? "border-red-500" : "border-gray-200"
          )}
          required
        />
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date}</p>
        )}
      </div>

      {/* 时间选择 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4 mr-2" />
            开始时间
          </label>
          <select
            value={formData.startTime}
            onChange={(e) => handleInputChange('startTime', e.target.value)}
            className={cn(
              "w-full px-3 py-3 border rounded-lg",
              "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "transition-colors",
              errors.startTime ? "border-red-500" : "border-gray-200"
            )}
            required
          >
            {timeOptions.map((time: string) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          {errors.startTime && (
            <p className="text-sm text-red-500">{errors.startTime}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">课时长度</label>
          <select
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', parseFloat(e.target.value))}
            className={cn(
              "w-full px-3 py-3 border rounded-lg",
              "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "transition-colors",
              errors.duration ? "border-red-500" : "border-gray-200"
            )}
            required
          >
            <option value={0.5}>30分钟</option>
            <option value={0.75}>45分钟</option>
            <option value={1}>1小时</option>
            <option value={1.5}>1.5小时</option>
            <option value={2}>2小时</option>
          </select>
          {errors.duration && (
            <p className="text-sm text-red-500">{errors.duration}</p>
          )}
        </div>
      </div>

      {/* 学生姓名 */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <User className="w-4 h-4 mr-2" />
          学生姓名
        </label>
        <input
          type="text"
          value={formData.studentName}
          onChange={(e) => handleInputChange('studentName', e.target.value)}
          placeholder="请输入学生姓名"
          className={cn(
            "w-full px-3 py-3 border rounded-lg",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "transition-colors",
            errors.studentName ? "border-red-500" : "border-gray-200"
          )}
          required
        />
        {errors.studentName && (
          <p className="text-sm text-red-500">{errors.studentName}</p>
        )}
      </div>

      {/* 教学方式 */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <BookOpen className="w-4 h-4 mr-2" />
          教学方式
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'online', label: '线上教学' },
            { value: 'offline', label: '线下教学' }
          ].map(method => (
            <button
              key={method.value}
              type="button"
              onClick={() => handleInputChange('teachingMethod', method.value)}
              className={cn(
                "px-4 py-3 border rounded-lg text-sm font-medium",
                "transition-colors active:scale-95",
                formData.teachingMethod === method.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {method.label}
            </button>
          ))}
        </div>
      </div>

      {/* 状态 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">课时状态</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'planned', label: '计划中', color: 'blue' },
            { value: 'completed', label: '已完成', color: 'green' },
            { value: 'cancelled', label: '已取消', color: 'red' }
          ].map(status => (
            <button
              key={status.value}
              type="button"
              onClick={() => handleInputChange('status', status.value)}
              className={cn(
                "px-3 py-2 border rounded-lg text-xs font-medium",
                "transition-colors active:scale-95",
                formData.status === status.value
                  ? `border-${status.color}-500 bg-${status.color}-50 text-${status.color}-700`
                  : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* 课时费标准 */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <DollarSign className="w-4 h-4 mr-2" />
          课时费标准 (元/小时)
        </label>
        <input
          type="number"
          value={formData.hourlyRate}
          onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
          min="0"
          step="1"
          className={cn(
            "w-full px-3 py-3 border rounded-lg",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "transition-colors",
            errors.hourlyRate ? "border-red-500" : "border-gray-200"
          )}
          required
        />
        {errors.hourlyRate && (
          <p className="text-sm text-red-500">{errors.hourlyRate}</p>
        )}
      </div>

      {/* 收入预览 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">预计收入</span>
          <span className="text-lg font-semibold text-green-600">
            ¥{calculateIncome()}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {formData.duration}小时 × ¥{formData.hourlyRate}/小时
        </p>
      </div>

      {/* 备注 */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <MessageSquare className="w-4 h-4 mr-2" />
          备注
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="添加备注信息（可选）"
          rows={3}
          className={cn(
            "w-full px-3 py-3 border rounded-lg resize-none",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "transition-colors",
            "border-gray-200"
          )}
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            "flex-1 py-3 px-4 border border-gray-300 rounded-lg",
            "text-gray-700 font-medium",
            "hover:bg-gray-50 active:scale-95 transition-all"
          )}
        >
          取消
        </button>
        <button
          type="submit"
          className={cn(
            "flex-1 py-3 px-4 bg-blue-600 rounded-lg",
            "text-white font-medium",
            "hover:bg-blue-700 active:scale-95 transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {initialData ? '更新' : '保存'}
        </button>
      </div>
    </form>
  );
};