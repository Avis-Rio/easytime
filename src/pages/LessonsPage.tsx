import React, { useState } from 'react';
import { useLessonStore } from '@/stores/lessonStore';
import { LessonList } from '@/components/lessons/LessonList';
import { LessonForm } from '@/components/forms/LessonForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { LessonRecord } from '@/types/lesson';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const LessonsPage: React.FC = () => {
  const { lessons, updateLesson, deleteLesson } = useLessonStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonRecord | null>(null);

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

  const handleAddNew = () => {
    setEditingLesson(null);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部标题栏 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">课时记录</h1>
              <p className="text-sm text-gray-500">管理您的所有课时</p>
            </div>
            <Button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              新增
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* 统计摘要 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg border p-3 text-center">
            <div className="text-lg font-bold text-gray-900">{lessons.length}</div>
            <div className="text-xs text-gray-500">总课时</div>
          </div>
          <div className="bg-white rounded-lg border p-3 text-center">
            <div className="text-lg font-bold text-blue-600">
              {lessons.filter(l => l.status === 'planned').length}
            </div>
            <div className="text-xs text-gray-500">计划中</div>
          </div>
          <div className="bg-white rounded-lg border p-3 text-center">
            <div className="text-lg font-bold text-green-600">
              {lessons.filter(l => l.status === 'completed').length}
            </div>
            <div className="text-xs text-gray-500">已完成</div>
          </div>
        </div>

        {/* 课时列表 */}
        <LessonList
          lessons={lessons}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showFilters={true}
          compact={false}
        />
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

export default LessonsPage;