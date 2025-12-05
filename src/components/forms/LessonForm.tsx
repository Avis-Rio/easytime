import React, { useMemo, useState } from 'react';
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
type LessonFormViewData = LessonFormData & { endTime: string };

export const LessonForm: React.FC<LessonFormProps> = ({
  initialData,
  selectedDate,
  onSubmit,
  onCancel,
  className
}) => {
  const { settings, lessons, students } = useLessonStore();
  
  // 表单状态 - duration以小时为单位存储和显示
  const [formData, setFormData] = useState<LessonFormViewData>({
    date: initialData?.date || (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')),
    startTime: initialData?.startTime || '09:00',
    duration: initialData?.duration || 1, // 作为计算结果字段使用
    endTime: initialData
      ? (() => {
          const [sh, sm] = (initialData.startTime || '09:00').split(':').map(Number);
          const startMinutes = sh * 60 + sm;
          const endMinutes = startMinutes + Math.max(0, (initialData.duration || 1)) * 60;
          const eh = Math.floor(endMinutes / 60);
          const em = endMinutes % 60;
          return `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`;
        })()
      : '10:00',
    studentName: initialData?.studentName || '',
    school: initialData?.school || '中山公园',
    teachingMethod: initialData?.teachingMethod || 'online',
    status: initialData?.status || 'planned',
    notes: initialData?.notes || '',
    hourlyRate: initialData?.hourlyRate || settings.hourlyRate,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 时间选项（10分钟间隔，9:00–22:00）
  const timeOptions = useMemo(() => generateTimeOptions(10, 9, 22), []);
  const schoolOptions = ['中山公园', '虹桥', '古北'];
  const endTimeOptions = useMemo(() => {
    // 结束时间必须晚于开始时间
    const [sh, sm] = formData.startTime.split(':').map(Number);
    const startMinutes = sh * 60 + sm;
    return timeOptions.filter(t => {
      const [eh, em] = t.split(':').map(Number);
      return (eh * 60 + em) > startMinutes;
    });
  }, [timeOptions, formData.startTime]);

  // 计算结束时间
  const calculateDurationFromRange = (startTime: string, endTime: string): number => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    const diff = Math.max(0, endMinutes - startMinutes);
    return Math.round((diff / 60) * 100) / 100; // 保留两位小数
  };

  // 检查时间冲突
  const checkTimeConflict = (): string | null => {
    const targetDate = formData.date;
    const targetStartTime = formData.startTime;
    const targetEndTime = formData.endTime || '10:00';
    // const targetStudent = formData.studentName.trim();
    
    // 获取同一天的现有课程（排除当前正在编辑的课程）
    const sameDayLessons = lessons.filter(lesson => {
      if (initialData && lesson.id === initialData.id) return false; // 排除当前编辑的课程
      return lesson.date === targetDate && lesson.status !== 'cancelled'; // 只检查未取消的课程
    });

    // 检查时间冲突
    for (const lesson of sameDayLessons) {
      const existingEndTime = (() => {
        const [sh, sm] = lesson.startTime.split(':').map(Number);
        const startMinutes = sh * 60 + sm;
        const endMinutes = startMinutes + lesson.duration * 60;
        const eh = Math.floor(endMinutes / 60);
        const em = endMinutes % 60;
        return `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`;
      })();
      
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
    const computedDuration = calculateDurationFromRange(formData.startTime, formData.endTime || '10:00');
    const { isValid, errors: validationErrors } = validateLessonForm({
      ...formData,
      duration: computedDuration,
    });
    
    // 结束时间必须大于开始时间
    const [sh, sm] = formData.startTime.split(':').map(Number);
    const [eh, em] = (formData.endTime || '10:00').split(':').map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    if (endMinutes <= startMinutes) {
      validationErrors.endTime = '结束时间必须晚于开始时间';
    }
    
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
      const computedDuration = calculateDurationFromRange(formData.startTime, formData.endTime || '10:00');
      const payload: LessonFormData = {
        date: formData.date,
        startTime: formData.startTime,
        duration: computedDuration,
        studentName: formData.studentName,
        studentId: formData.studentId,
        school: formData.school,
        teachingMethod: formData.teachingMethod,
        status: formData.status,
        notes: formData.notes,
        hourlyRate: formData.hourlyRate,
      };
      onSubmit(payload);
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

  // 计算收入（根据开始/结束时间推导时长）
  const calculateIncome = () => {
    const d = calculateDurationFromRange(formData.startTime, formData.endTime || '10:00');
    return Math.round(formData.hourlyRate * d);
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
          <label className="text-sm font-medium text-gray-700">结束时间</label>
          <select
            value={formData.endTime}
            onChange={(e) => handleInputChange('endTime', e.target.value)}
            className={cn(
              "w-full px-3 py-3 border rounded-lg",
              "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "transition-colors",
              errors.endTime ? "border-red-500" : "border-gray-200"
            )}
            required
          >
            {endTimeOptions.map((time: string) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          {errors.endTime && (
            <p className="text-sm text-red-500">{errors.endTime}</p>
          )}
        </div>
      </div>

      {/* 学生选择（下拉） */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <User className="w-4 h-4 mr-2" />
          学生
        </label>
        <select
          value={formData.studentId || ''}
          onChange={(e) => {
            const sid = e.target.value; // external student number
            const stu = students.find(s => s.studentId === sid);
            handleInputChange('studentId', sid);
            if (stu) {
              handleInputChange('studentName', stu.name);
            }
          }}
          className={cn(
            "w-full px-3 py-3 border rounded-lg",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "transition-colors",
            errors.studentName ? "border-red-500" : "border-gray-200"
          )}
          required
        >
          <option value="">请选择学生</option>
          {students.map(stu => (
            <option key={stu.id} value={stu.studentId}>
              {stu.studentId} - {stu.name}
            </option>
          ))}
        </select>
        {errors.studentName && (
          <p className="text-sm text-red-500">{errors.studentName}</p>
        )}
      </div>

      {/* 学校选择 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">学校</label>
        <select
          value={formData.school || ''}
          onChange={(e) => handleInputChange('school', e.target.value)}
          className={cn(
            "w-full px-3 py-3 border rounded-lg",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "transition-colors",
            "border-gray-200"
          )}
          required
        >
          {schoolOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
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
