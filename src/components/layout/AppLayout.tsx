import React from 'react';
import { cn } from '../../lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 应用主布局组件
 * 提供统一的页面结构和样式
 * 
 * iOS Safari 优化：
 * 1. 使用 flex 布局确保内容区域正确填充
 * 2. 应用滚动容器优化类
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "min-h-screen bg-white",
      "flex flex-col",
      "ios-scroll-container", // iOS 滚动优化
      className
    )}>
      {children}
    </div>
  );
};

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

/**
 * 页面头部组件
 * 包含标题、返回按钮和右侧操作区域
 */
export const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBack = false, 
  onBack, 
  rightAction,
  className 
}) => {
  return (
    <header className={cn(
      "sticky top-0 z-50",
      "bg-white border-b border-gray-100",
      "px-4 py-3",
      "flex items-center justify-between",
      "safe-area-pt", // iOS安全区域适配
      className
    )}>
      <div className="flex items-center flex-1">
        {showBack && (
          <button
            onClick={onBack}
            className={cn(
              "mr-3 p-2 rounded-lg",
              "text-gray-600 hover:text-gray-900",
              "hover:bg-gray-50 transition-colors",
              "active:scale-95"
            )}
            aria-label="返回"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        <h1 className={cn(
          "text-lg font-semibold text-gray-900",
          "truncate"
        )}>
          {title}
        </h1>
      </div>

      {rightAction && (
        <div className="flex items-center">
          {rightAction}
        </div>
      )}
    </header>
  );
};

interface ContentProps {
  children: React.ReactNode;
  className?: string;
  withPadding?: boolean;
}

/**
 * 页面内容区域组件
 * 提供统一的内容区域样式和内边距
 */
export const Content: React.FC<ContentProps> = ({ 
  children, 
  className,
  withPadding = true 
}) => {
  return (
    <main 
      className={cn(
        "flex-1",
        "relative",
        withPadding && "px-4 py-4",
        // 底部导航栏占位，避免内容被遮挡
        "pb-20",
        className
      )}
      style={{
        // 确保底部有足够的空间（导航栏高度 + 安全区域）
        paddingBottom: `calc(64px + env(safe-area-inset-bottom, 0px))`
      }}
    >
      {children}
    </main>
  );
};

interface FooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 页面底部组件
 * 用于放置底部导航栏等固定内容
 */
export const Footer: React.FC<FooterProps> = ({ children, className }) => {
  return (
    <footer className={cn(
      "sticky bottom-0 z-40",
      "bg-white border-t border-gray-100",
      "safe-area-pb", // iOS安全区域适配
      className
    )}>
      {children}
    </footer>
  );
};

/**
 * 加载状态组件
 */
export const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn(
      "flex items-center justify-center",
      "p-8",
      className
    )}>
      <div className={cn(
        "w-8 h-8 border-4 border-blue-200 border-t-blue-600",
        "rounded-full animate-spin"
      )} />
    </div>
  );
};

/**
 * 错误状态组件
 */
export const ErrorMessage: React.FC<{ 
  message: string; 
  onRetry?: () => void;
  className?: string;
}> = ({ message, onRetry, className }) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      "p-8 text-center",
      className
    )}>
      <div className="text-red-500 mb-2">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            "px-4 py-2 bg-blue-600 text-white rounded-lg",
            "hover:bg-blue-700 active:scale-95 transition-all"
          )}
        >
          重试
        </button>
      )}
    </div>
  );
};

/**
 * 空状态组件
 */
export const EmptyState: React.FC<{ 
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, description, icon, action, className }) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      "p-8 text-center",
      className
    )}>
      {icon && (
        <div className="text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6">{description}</p>
      )}
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};