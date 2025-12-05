import { useState, useMemo } from 'react';

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
}

/**
 * 分页 Hook
 * @param items 数据数组
 * @param initialPageSize 初始每页数量，默认 20
 * @returns 分页结果和控制方法
 */
export function usePagination<T>(
  items: T[],
  initialPageSize: number = 20
): PaginationResult<T> {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);

  // 计算当前页数据
  const data = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }, [items, page, pageSize]);

  // 导航方法
  const goToPage = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setPage(validPage);
  };

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleSetPageSize = (size: number) => {
    setPageSize(size);
    setPage(1); // 重置到第一页
  };

  return {
    data,
    page,
    pageSize,
    totalPages,
    total,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    goToPage,
    nextPage,
    prevPage,
    setPageSize: handleSetPageSize
  };
}

