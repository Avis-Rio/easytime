import { useEffect, useRef, RefObject } from 'react';

/**
 * iOS Safari 底部固定栏优化 Hook
 * 
 * 功能：
 * 1. 监听 VisualViewport 变化（键盘弹出/收起）
 * 2. 动态调整底部导航栏位置
 * 3. 防止底栏被键盘遮挡或上移
 * 
 * @returns bottomRef - 需要绑定到底部导航栏元素的 ref
 */
export const useIOSBottomBar = (): RefObject<HTMLElement> => {
  const bottomRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const bottomBar = bottomRef.current;
    if (!bottomBar) return;

    // 检查是否支持 VisualViewport API
    if (!window.visualViewport) {
      console.warn('VisualViewport API not supported');
      return;
    }

    const visualViewport = window.visualViewport;
    
    /**
     * 调整底部栏位置
     * 当键盘弹出时，将底部栏固定在可视区域底部
     */
    const updateBottomBarPosition = () => {
      if (!bottomBar || !visualViewport) return;

      const viewportHeight = visualViewport.height;
      const windowHeight = window.innerHeight;
      
      // 计算键盘高度
      const keyboardHeight = windowHeight - viewportHeight;
      
      if (keyboardHeight > 100) {
        // 键盘弹出：将底栏移到可视区域底部
        // 使用 translate 进行位置调整，避免影响布局流
        const translateY = -keyboardHeight;
        bottomBar.style.transform = `translateY(${translateY}px) translateZ(0)`;
        bottomBar.style.transition = 'transform 0.3s ease-out';
      } else {
        // 键盘收起：恢复原位
        bottomBar.style.transform = 'translateY(0) translateZ(0)';
        bottomBar.style.transition = 'transform 0.3s ease-out';
      }
    };

    // 监听 resize 和 scroll 事件
    visualViewport.addEventListener('resize', updateBottomBarPosition);
    visualViewport.addEventListener('scroll', updateBottomBarPosition);
    
    // 初始化位置
    updateBottomBarPosition();

    // 清理事件监听
    return () => {
      visualViewport.removeEventListener('resize', updateBottomBarPosition);
      visualViewport.removeEventListener('scroll', updateBottomBarPosition);
    };
  }, []);

  return bottomRef;
};

/**
 * 获取安全区域 insets 值（兼容性处理）
 * 
 * @returns 安全区域的 bottom 值（像素）
 */
export const getSafeAreaInsetBottom = (): number => {
  // 尝试从 CSS 环境变量中读取
  if (typeof getComputedStyle !== 'undefined') {
    const style = getComputedStyle(document.documentElement);
    const inset = style.getPropertyValue('env(safe-area-inset-bottom)');
    if (inset) {
      return parseInt(inset, 10) || 0;
    }
  }
  
  // iOS Safari 默认安全区域（大约 34px for iPhone X+）
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS && window.screen.height >= 812) {
    return 34;
  }
  
  return 0;
};

