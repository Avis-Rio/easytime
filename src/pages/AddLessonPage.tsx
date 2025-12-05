import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LessonForm } from '@/components/forms/LessonForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLessonStore } from '@/stores/lessonStore';
import type { LessonRecord } from '@/types/lesson';

export const AddLessonPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addLesson } = useLessonStore();

  // 获取从日历点击传递的日期或从localStorage获取
  const locationDate = location.state?.selectedDate;
  const storageDate = localStorage.getItem('selectedDateForAdd');
  
  let selectedDate = locationDate;
  if (!selectedDate && storageDate) {
    // 直接使用存储的本地日期字符串，避免时区转换问题
    selectedDate = new Date(storageDate + 'T00:00:00');
  }

  const handleSubmit = (data: Omit<LessonRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    addLesson(data);
    navigate(-1); // 返回上一页
  };

  const handleCancel = () => {
    navigate(-1); // 返回上一页
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: `calc(64px + env(safe-area-inset-bottom, 0px))` }}>
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">新增课时</h1>
            <div className="w-16"></div> {/* 占位符，保持标题居中 */}
          </div>
        </div>
      </div>

      {/* 表单内容 */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border p-6">
          <LessonForm
            selectedDate={selectedDate}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default AddLessonPage;