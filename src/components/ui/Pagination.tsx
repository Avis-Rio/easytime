import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
  className?: string;
}

/**
 * 分页组件
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxPageNumbers = 5,
  className
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxPageNumbers) {
      // 如果总页数少于最大显示数，显示全部
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 始终显示第一页
      pages.push(1);

      let startPage = Math.max(2, currentPage - Math.floor(maxPageNumbers / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxPageNumbers - 3);

      if (endPage - startPage < maxPageNumbers - 3) {
        startPage = Math.max(2, endPage - maxPageNumbers + 3);
      }

      if (startPage > 2) {
        pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // 始终显示最后一页
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {/* 上一页按钮 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className={cn(
          "p-2 rounded-lg border transition-all",
          hasPrev
            ? "border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-95"
            : "border-gray-200 text-gray-300 cursor-not-allowed"
        )}
        aria-label="上一页"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* 页码 */}
      {showPageNumbers && (
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-gray-400"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 active:scale-95"
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      )}

      {/* 页面信息（移动端） */}
      {!showPageNumbers && (
        <span className="px-4 py-2 text-sm text-gray-600">
          {currentPage} / {totalPages}
        </span>
      )}

      {/* 下一页按钮 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className={cn(
          "p-2 rounded-lg border transition-all",
          hasNext
            ? "border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-95"
            : "border-gray-200 text-gray-300 cursor-not-allowed"
        )}
        aria-label="下一页"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

/**
 * 简化版分页组件（仅上一页/下一页）
 */
export const SimplePagination: React.FC<{
  hasNext: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  className?: string;
}> = ({ hasNext, hasPrev, onNext, onPrev, className }) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <button
        onClick={onPrev}
        disabled={!hasPrev}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
          hasPrev
            ? "border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-95"
            : "border-gray-200 text-gray-300 cursor-not-allowed"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        上一页
      </button>

      <button
        onClick={onNext}
        disabled={!hasNext}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
          hasNext
            ? "border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-95"
            : "border-gray-200 text-gray-300 cursor-not-allowed"
        )}
      >
        下一页
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

