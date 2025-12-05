# iOS Safari 底部导航栏修复说明

## 📱 问题背景

在 iOS Safari 浏览器中，使用 `position: fixed` 的底部导航栏经常会遇到以下问题：

1. **地址栏显隐影响** - 地址栏收缩/展开时导航栏位置抖动
2. **软键盘遮挡** - 输入框聚焦时，键盘弹出遮挡底栏
3. **橡皮筋效果** - 滚动到顶部/底部时的回弹效果影响固定元素
4. **安全区域适配** - iPhone X+ 的 Home 指示条遮挡导航按钮

---

## ✅ 修复方案

### 1. HTML 配置

**文件**: `index.html`

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

✅ 已配置 `viewport-fit=cover`，启用安全区域环境变量

---

### 2. 全局 CSS 优化

**文件**: `src/index.css`

#### 防止橡皮筋滚动影响

```css
html, body {
  height: 100%;
  overflow: hidden; /* 防止橡皮筋滚动影响 fixed 元素 */
  position: fixed;   /* iOS Safari 额外保险 */
  width: 100%;
}
```

#### 使用动态视口单位

```css
#root {
  min-height: 100dvh; /* 动态视口高度（iOS 15.4+） */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* iOS 惯性滚动 */
  overscroll-behavior: contain;      /* 防止边界回弹联动 */
}

/* 旧版降级 */
@supports not (height: 100dvh) {
  #root {
    min-height: -webkit-fill-available;
  }
}
```

#### 底栏样式优化

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  -webkit-backdrop-filter: saturate(180%) blur(10px);
  backdrop-filter: saturate(180%) blur(10px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  transform: translateZ(0); /* 启用硬件加速 */
}
```

---

### 3. VisualViewport API Hook

**文件**: `src/hooks/useIOSBottomBar.ts`

创建自定义 Hook 监听键盘事件：

```typescript
export const useIOSBottomBar = () => {
  const bottomRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!window.visualViewport) return;
    
    const updatePosition = () => {
      const viewportHeight = visualViewport.height;
      const keyboardHeight = window.innerHeight - viewportHeight;
      
      if (keyboardHeight > 100) {
        // 键盘弹出：上移底栏
        bottomBar.style.transform = `translateY(${-keyboardHeight}px)`;
      } else {
        // 键盘收起：恢复原位
        bottomBar.style.transform = 'translateY(0)';
      }
    };
    
    visualViewport.addEventListener('resize', updatePosition);
    return () => visualViewport.removeEventListener('resize', updatePosition);
  }, []);

  return bottomRef;
};
```

---

### 4. BottomNavigation 组件集成

**文件**: `src/components/layout/BottomNavigation.tsx`

```tsx
export const BottomNavigation: React.FC = () => {
  const bottomRef = useIOSBottomBar(); // 应用 Hook

  return (
    <nav 
      ref={bottomRef}
      className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{
        height: `calc(64px + env(safe-area-inset-bottom, 0px))`,
        paddingBottom: `env(safe-area-inset-bottom, 0px)`,
        transform: 'translateZ(0)', // 硬件加速
        willChange: 'transform',
      }}
    >
      {/* 导航内容 */}
    </nav>
  );
};
```

---

## 🧪 测试页面

访问 `/test-ios-bottom` 路由进行测试：

### 测试场景

1. ✅ **键盘弹出测试**
   - 点击输入框，观察底栏是否跟随可视区域
   
2. ✅ **滚动测试**
   - 滚动到底部，触发橡皮筋效果，底栏不应抖动
   
3. ✅ **地址栏显隐**
   - 向下滚动页面隐藏地址栏，底栏应保持稳定
   
4. ✅ **安全区域适配**
   - 在 iPhone X+ 设备，检查 Home 指示条不遮挡导航按钮

---

## 📋 技术要点总结

### 核心原理

| 问题 | 解决方案 | 技术点 |
|------|----------|--------|
| 地址栏影响 | 动态视口单位 `100dvh` | iOS 15.4+ 支持 |
| 键盘遮挡 | VisualViewport API | 监听 `resize` 事件 |
| 橡皮筋抖动 | 限制滚动容器 | `overflow: hidden` on body |
| 安全区域 | CSS 环境变量 | `env(safe-area-inset-bottom)` |
| 性能优化 | 硬件加速 | `transform: translateZ(0)` |

---

### 兼容性

- ✅ **iOS 15.4+**: 完整支持（动态视口单位 + VisualViewport）
- ✅ **iOS 13-15.3**: 部分支持（VisualViewport + 降级方案）
- ✅ **iOS 11-12**: 基础支持（安全区域 + `-webkit-fill-available`）

---

## 🔍 调试技巧

### 在 Safari 开发者工具中检查

1. 连接 iPhone 到 Mac
2. Safari > 开发 > [你的 iPhone] > [页面]
3. 控制台运行：

```javascript
// 检查 VisualViewport 支持
console.log('VisualViewport:', window.visualViewport);

// 查看安全区域值
const style = getComputedStyle(document.documentElement);
console.log('Safe area bottom:', style.getPropertyValue('env(safe-area-inset-bottom)'));

// 监听视口变化
window.visualViewport?.addEventListener('resize', () => {
  console.log('Viewport height:', window.visualViewport.height);
  console.log('Window height:', window.innerHeight);
});
```

---

## 📚 参考资料

1. [MDN - env()](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
2. [MDN - VisualViewport API](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport)
3. [CSS Viewport Units (dvh/svh)](https://web.dev/viewport-units/)
4. [iOS Safari 固定元素最佳实践](https://www.bram.us/2016/05/02/prevent-overscroll-bounce-in-ios-mobilesafari-pure-css/)

---

## 🚀 下一步优化

如果仍有问题，可以考虑：

1. **完全隐藏底栏** - 键盘弹出时隐藏导航栏
2. **Sticky 方案** - 使用 `position: sticky` 替代 `fixed`
3. **容器内定位** - 使用 `absolute` 在滚动容器内定位

---

**修复完成时间**: 2025-10-09  
**测试路由**: `/test-ios-bottom`

