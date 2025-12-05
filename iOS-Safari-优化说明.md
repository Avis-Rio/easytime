# iOS Safari 底栏固定优化说明

## 问题描述

在 iOS Safari 上，底部导航栏会出现以下问题：
1. **地址栏影响**: 滚动时地址栏显示/隐藏导致视口高度变化，`100vh` 不稳定
2. **键盘弹出**: 输入框获得焦点时，键盘弹出会推动底栏上移
3. **橡皮筋滚动**: iOS 特有的弹性滚动会影响 fixed 元素的定位

## 解决方案

### 1. 视口单位优化 (`src/index.css`)

```css
html, body {
  height: 100%;
  overflow: hidden; /* 禁止 body 滚动 */
  position: fixed; /* iOS 防止地址栏影响 */
  width: 100%;
}

#root {
  /* 使用动态视口单位（iOS 16+），降级到传统单位 */
  height: 100vh;
  height: 100dvh; /* 动态视口高度，跟随地址栏变化 */
  overflow: auto; /* root 承担滚动 */
  -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
  overscroll-behavior: contain; /* 防止边界回弹联动 */
}
```

**原理**:
- 将滚动责任从 `body` 转移到 `#root`
- 使用 `dvh` (dynamic viewport height) 动态适配地址栏
- `overscroll-behavior: contain` 防止橡皮筋滚动影响布局

### 2. VisualViewport API (`src/hooks/useVisualViewport.ts`)

```typescript
export const useVisualViewport = (elementRef: RefObject<HTMLElement>) => {
  useEffect(() => {
    const vv = window.visualViewport;
    
    const updatePosition = () => {
      const viewportHeight = vv.height;
      const offsetTop = vv.offsetTop;
      const bottomPosition = viewportHeight + offsetTop;
      
      element.style.transform = `translateY(${bottomPosition - window.innerHeight}px)`;
    };
    
    vv.addEventListener('resize', updatePosition);
    vv.addEventListener('scroll', updatePosition);
    
    return () => {
      vv.removeEventListener('resize', updatePosition);
      vv.removeEventListener('scroll', updatePosition);
    };
  }, [elementRef]);
};
```

**原理**:
- `visualViewport` 反映实际可见区域（扣除键盘、地址栏）
- 监听 `resize` 和 `scroll` 事件，动态调整底栏位置
- 使用 `transform` 而非 `top`，性能更好

### 3. 底部导航栏优化 (`src/components/layout/BottomNavigation.tsx`)

```typescript
export const BottomNavigation: React.FC = () => {
  const bottomNavRef = useRef<HTMLElement>(null);
  useVisualViewport(bottomNavRef); // 应用 hook
  
  return (
    <nav 
      ref={bottomNavRef}
      style={{
        height: `calc(64px + env(safe-area-inset-bottom, 0px))`,
        paddingBottom: `env(safe-area-inset-bottom, 0px)`,
        transform: 'translateZ(0)', // 硬件加速
        willChange: 'transform', // 性能优化
      }}
    >
      {/* ... */}
    </nav>
  );
};
```

**优化点**:
- 自动适配安全区域（刘海屏、Home 指示条）
- 硬件加速渲染，防止抖动
- 动态跟随键盘位置

## 测试清单

### iOS Safari 测试项目

- [ ] **地址栏测试**
  - [ ] 向下滚动时，地址栏隐藏，底栏保持固定
  - [ ] 向上滚动时，地址栏显示，底栏不跳动
  - [ ] 快速滑动时，底栏位置稳定

- [ ] **键盘测试**
  - [ ] 点击输入框，键盘弹出时底栏跟随上移
  - [ ] 收起键盘时，底栏平滑返回原位
  - [ ] 键盘弹出时，底栏不遮挡输入框

- [ ] **滚动测试**
  - [ ] 橡皮筋滚动时（下拉/上拉到边界），底栏不抖动
  - [ ] 惯性滚动流畅，无卡顿
  - [ ] 滚动到底部时，底栏不被内容遮挡

- [ ] **设备兼容性**
  - [ ] iPhone SE (小屏幕)
  - [ ] iPhone 14/15 (标准屏幕)
  - [ ] iPhone 14/15 Pro Max (大屏幕)
  - [ ] iPad Safari (横屏/竖屏)

- [ ] **iOS 版本兼容性**
  - [ ] iOS 15 (不支持 `dvh`，使用 `-webkit-fill-available`)
  - [ ] iOS 16+ (支持 `dvh`)

## 调试技巧

### 1. 远程调试

在 Mac 上使用 Safari 调试 iPhone：
1. iPhone 设置 → Safari → 高级 → 网页检查器（开启）
2. Mac Safari → 开发 → [你的 iPhone] → 选择页面
3. 打开控制台查看 `[VisualViewport]` 日志

### 2. 关键日志

开发环境会输出以下信息：
```javascript
[VisualViewport] {
  viewportHeight: 600,  // 可视区域高度（扣除键盘）
  offsetTop: 0,         // 键盘弹出时为正值
  bottomPosition: 600,  // 底栏应该在的位置
  innerHeight: 800,     // 窗口总高度
  transform: 'translateY(-200px)' // 应用的位移
}
```

### 3. 降级策略

如果 `visualViewport` 不可用：
```typescript
if (!window.visualViewport) {
  console.warn('VisualViewport API not supported');
  // 回退到基础 fixed 定位
  return;
}
```

## 性能优化

1. **硬件加速**: `transform: translateZ(0)` 启用 GPU 渲染
2. **requestAnimationFrame**: 避免频繁重排重绘
3. **will-change**: 提示浏览器优化特定属性
4. **事件防抖**: 使用 RAF 合并连续的 resize 事件

## 已知限制

1. **iOS 14 及更早版本**: 不支持 `dvh` 单位，使用 `-webkit-fill-available` 降级
2. **某些 WebView**: 可能不支持 `visualViewport` API
3. **横屏模式**: 需额外测试安全区域适配

## 相关文件

- `src/index.css` - 全局样式和视口优化
- `src/hooks/useVisualViewport.ts` - VisualViewport Hook
- `src/components/layout/BottomNavigation.tsx` - 底部导航栏
- `src/components/layout/AppLayout.tsx` - 应用布局

## 参考资料

- [Visual Viewport API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API)
- [CSS Environment Variables (env())](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
- [iOS Safari 100vh Bug](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

