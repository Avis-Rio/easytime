import { useEffect } from 'react';
import type { RefObject, MutableRefObject } from 'react';

/**
 * iOS VisualViewport Hook
 * 用于处理键盘弹出时底部导航栏的定位问题
 * 
 * 原理：
 * 1. 监听 visualViewport 的 resize 和 scroll 事件
 * 2. 当键盘弹出时，visualViewport 高度变小
 * 3. 动态调整底栏位置，使其始终贴齐可视区底部
 */
export const useVisualViewport = (
  elementRef: RefObject<HTMLElement | null> | MutableRefObject<HTMLElement | null>
) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 检查浏览器是否支持 VisualViewport API
    if (!window.visualViewport) {
      console.warn('VisualViewport API not supported');
      return;
    }

    const vv = window.visualViewport;
    let rafId: number | null = null;

    const updatePosition = () => {
      if (!element) return;

      // 使用 requestAnimationFrame 优化性能
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        const viewportHeight = vv.height;
        const offsetTop = vv.offsetTop;
        
        // 计算底栏应该在的位置
        // offsetTop 是视口顶部相对于布局视口的偏移（键盘弹出时为正值）
        const bottomPosition = viewportHeight + offsetTop;

        // 使用 transform 而不是 top，性能更好
        element.style.transform = `translateY(${bottomPosition - window.innerHeight}px)`;
        
        // 调试日志（生产环境可删除）
        if (import.meta.env && import.meta.env.DEV) {
          console.log('[VisualViewport]', {
            viewportHeight,
            offsetTop,
            bottomPosition,
            innerHeight: window.innerHeight,
            transform: `translateY(${bottomPosition - window.innerHeight}px)`
          });
        }
      });
    };

    // 初始化位置
    updatePosition();

    // 监听视口变化
    vv.addEventListener('resize', updatePosition);
    vv.addEventListener('scroll', updatePosition);

    // 清理
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      vv.removeEventListener('resize', updatePosition);
      vv.removeEventListener('scroll', updatePosition);
    };
  }, [elementRef]);
};
