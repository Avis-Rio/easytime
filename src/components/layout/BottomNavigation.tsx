import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Calendar, 
  PlusCircle, 
  BarChart3, 
  Settings 
} from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isAction?: boolean;
}

const navItems: NavItem[] = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/calendar', icon: Calendar, label: '日历' },
  { path: '/add', icon: PlusCircle, label: '新增', isAction: true },
  { path: '/stats', icon: BarChart3, label: '统计' },
  { path: '/settings', icon: Settings, label: '设置' },
];

/**
 * 底部导航栏组件
 * 使用 Lucide 图标和 React Router 进行导航
 * 针对移动端触摸优化
 */
export const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-white border-t border-gray-100",
      "flex items-center justify-around",
      "h-16 px-2",
      "safe-area-pb" // iOS安全区域适配
    )}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center",
              "relative px-2 py-1 rounded-lg",
              "transition-all duration-200",
              "active:scale-95",
              item.isAction 
                ? "text-blue-600 hover:text-blue-700"
                : active 
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
            aria-label={item.label}
          >
            <Icon 
              className={cn(
                "w-6 h-6 mb-1",
                item.isAction && "w-8 h-8 mb-0"
              )} 

            />
            
            {!item.isAction && (
              <span className={cn(
                "text-xs font-medium",
                active ? "text-blue-600" : "text-gray-500"
              )}>
                {item.label}
              </span>
            )}

            {/* 活跃状态指示器 */}
            {active && !item.isAction && (
              <div className={cn(
                "absolute -bottom-1 left-1/2 transform -translate-x-1/2",
                "w-1 h-1 bg-blue-600 rounded-full"
              )} />
            )}

            {/* 新增按钮特殊样式 */}
            {item.isAction && (
              <div className={cn(
                "absolute -top-2 left-1/2 transform -translate-x-1/2",
                "w-12 h-12 bg-white rounded-full border-4 border-gray-100",
                "flex items-center justify-center",
                "shadow-lg"
              )}>
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

/**
 * 底部占位组件
 * 用于在内容区域底部添加适当间距，避免被导航栏遮挡
 */
export const BottomNavigationSpacer: React.FC = () => {
  return <div className="h-16" />; // 与导航栏高度一致
};

/**
 * 底部导航栏容器
 * 包含导航栏和占位组件
 */
export const BottomNavigationContainer: React.FC = () => {
  return (
    <>
      <BottomNavigationSpacer />
      <BottomNavigation />
    </>
  );
};