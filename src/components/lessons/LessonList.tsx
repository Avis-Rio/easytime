import React, { useState } from 'react';
import type { LessonRecord, LessonStatus, TeachingMethod } from '@/types/lesson';
import { formatDate, formatTime, formatDuration } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Trash2,
  Clock,
  User,
  Video,
  Users,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LessonListProps {
  lessons: LessonRecord[];
  onEdit?: (lesson: LessonRecord) => void;
  onDelete?: (id: string) => void;
  showFilters?: boolean;
  compact?: boolean;
}

export const LessonList: React.FC<LessonListProps> = ({
  lessons,
  onEdit,
  onDelete,
  showFilters = true,
  compact = false
}) => {
  const [statusFilter, setStatusFilter] = useState<LessonStatus | 'all'>('all');
  const [methodFilter, setMethodFilter] = useState<TeachingMethod | 'all'>('all');
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('desc');
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const getStatusBadgeVariant = (status: LessonStatus) => {
    switch (status) {
      case 'completed': return 'default';
      case 'planned': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
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

  const getMethodIcon = (method: TeachingMethod) => {
    switch (method) {
      case 'online': return <Video className="w-4 h-4" />;
      case 'offline': return <Users className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getMethodText = (method: TeachingMethod) => {
    switch (method) {
      case 'online': return '线上';
      case 'offline': return '线下';
      default: return '未知';
    }
  };

  // 过滤和排序逻辑
  const filteredLessons = lessons
    .filter(lesson => {
      if (statusFilter !== 'all' && lesson.status !== statusFilter) return false;
      if (methodFilter !== 'all' && lesson.teachingMethod !== methodFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.startTime).getTime();
      const dateB = new Date(b.date + ' ' + b.startTime).getTime();
      return dateSort === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const handleEdit = (lesson: LessonRecord) => {
    if (onEdit) {
      onEdit(lesson);
    }
  };

  const handleDelete = (id: string) => {
    if (onDelete && window.confirm('确定要删除这条课时记录吗？')) {
      onDelete(id);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedLesson(expandedLesson === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* 过滤和排序控件 */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                状态: {statusFilter === 'all' ? '全部' : getStatusText(statusFilter)}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                全部状态
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('planned')}>
                计划中
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                已完成
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>
                已取消
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                {getMethodIcon(methodFilter === 'all' ? 'offline' : methodFilter)}
                方式: {methodFilter === 'all' ? '全部' : getMethodText(methodFilter)}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setMethodFilter('all')}>
                全部方式
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMethodFilter('online')}>
                线上教学
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMethodFilter('offline')}>
                线下教学
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDateSort(dateSort === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            {dateSort === 'desc' ? '最新在前' : '最早在前'}
          </Button>
        </div>
      )}

      {/* 课时列表 */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">暂无符合条件的课时记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white rounded-lg border hover:shadow-md transition-shadow"
            >
              {/* 主要信息 */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {lesson.studentName}
                      </h3>
                      <Badge variant={getStatusBadgeVariant(lesson.status)}>
                        {getStatusText(lesson.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(lesson.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(lesson.startTime)}
                      </div>
                      <div className="flex items-center gap-1">
                        {getMethodIcon(lesson.teachingMethod)}
                        {getMethodText(lesson.teachingMethod)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <span className="text-gray-600">
                        {formatDuration(lesson.duration)} · ¥{lesson.hourlyRate}/时
                      </span>
                      <span className="font-semibold text-gray-900">
                        ¥{(lesson.hourlyRate * lesson.duration).toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {!compact && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(lesson.id)}
                        className="p-1"
                      >
                        {expandedLesson === lesson.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(lesson)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(lesson.id)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* 展开的详细信息 */}
                {!compact && expandedLesson === lesson.id && lesson.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{lesson.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 统计信息 */}
      {filteredLessons.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {filteredLessons.length}
              </div>
              <div className="text-sm text-gray-500">总课时</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {filteredLessons.reduce((sum, lesson) => sum + lesson.duration, 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">总时长(小时)</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                ¥{filteredLessons.reduce((sum, lesson) => sum + (lesson.hourlyRate * lesson.duration), 0).toFixed(0)}
              </div>
              <div className="text-sm text-gray-500">总收入</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {new Set(filteredLessons.map(l => l.studentName)).size}
              </div>
              <div className="text-sm text-gray-500">学生数</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonList;