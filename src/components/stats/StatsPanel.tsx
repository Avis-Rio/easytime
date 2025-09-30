import React from 'react';
import { cn } from '../../lib/utils';
import type { MonthlyStats } from '../../types/lesson';
import { TrendingUp, Clock, DollarSign, Users, BookOpen, CheckCircle } from 'lucide-react';

interface StatsPanelProps {
  stats: MonthlyStats;
  className?: string;
}

/**
 * 统计面板组件
 * 显示月度数据统计信息
 */
export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, className }) => {
  const statItems = [
    {
      icon: DollarSign,
      label: '总收入',
      value: `¥${stats.totalIncome.toLocaleString()}`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: stats.totalIncome > 0 ? '+' : '',
    },
    {
      icon: Clock,
      label: '总课时',
      value: `${stats.totalHours.toFixed(1)}小时`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '',
    },
    {
      icon: Users,
      label: '学生数',
      value: stats.uniqueStudents.toString(),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '',
    },
    {
      icon: BookOpen,
      label: '课程数',
      value: stats.totalLessons.toString(),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: '',
    },
    {
      icon: CheckCircle,
      label: '完成率',
      value: `${stats.completionRate}%`,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: stats.completionRate >= 80 ? '↑' : '',
    },
    {
      icon: TrendingUp,
      label: '平均时薪',
      value: `¥${stats.averageHourlyRate.toFixed(2)}`,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      trend: '',
    },
  ];

  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100", className)}>
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">本月统计</h3>
        <p className="text-sm text-gray-500 mt-1">
          {stats.month}月数据概览
        </p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-lg border",
                  "flex flex-col items-center text-center",
                  "space-y-2",
                  item.bgColor,
                  "border-current/20"
                )}
              >
                <div className={cn(
                  "p-2 rounded-full",
                  item.bgColor,
                  "flex items-center justify-center"
                )}>
                  <Icon className={cn("w-5 h-5", item.color)} />
                </div>
                
                <div className="space-y-1">
                  <div className={cn("text-2xl font-bold", item.color)}>
                    {item.value}
                    {item.trend && (
                      <span className="text-sm ml-1">{item.trend}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 详细统计信息 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">详细分析</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">线上教学</span>
              <span className="font-medium text-gray-900">
                {stats.onlineHours.toFixed(1)}小时 ({Math.round((stats.onlineHours / stats.totalHours) * 100)}%)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">线下教学</span>
              <span className="font-medium text-gray-900">
                {stats.offlineHours.toFixed(1)}小时 ({Math.round((stats.offlineHours / stats.totalHours) * 100)}%)
              </span>
            </div>
            {stats.cancelledLessons > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">取消课程</span>
                <span className="font-medium text-red-600">
                  {stats.cancelledLessons}节
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 紧凑版统计面板
 * 用于首页等空间有限的场景
 */
export const CompactStatsPanel: React.FC<StatsPanelProps> = ({ stats, className }) => {
  const compactItems = [
    {
      icon: DollarSign,
      label: '收入',
      value: `¥${stats.totalIncome.toLocaleString()}`,
      color: 'text-green-600',
    },
    {
      icon: Clock,
      label: '课时',
      value: `${stats.totalHours.toFixed(1)}h`,
      color: 'text-blue-600',
    },
    {
      icon: CheckCircle,
      label: '完成率',
      value: `${stats.completionRate}%`,
      color: 'text-emerald-600',
    },
  ];

  return (
    <div className={cn("bg-white rounded-lg border border-gray-100", className)}>
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">本月统计</h4>
          <span className="text-xs text-gray-500">{stats.month}月</span>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {compactItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="text-center space-y-1">
                <Icon className={cn("w-4 h-4 mx-auto", item.color)} />
                <div className={cn("text-lg font-bold", item.color)}>
                  {item.value}
                </div>
                <div className="text-xs text-gray-500">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};