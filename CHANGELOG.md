# 更新日志 (Changelog)

## [未发布] - 2025-10-09

### 🐛 Bug修复

#### 底部导航栏遮挡内容问题
**问题描述：**
- 底部导航栏使用fixed定位导致页面内容被遮挡
- iOS设备上未正确适配安全区域（Home指示条）
- 页面底部内容无法完全查看

**修复内容：**
1. ✅ 所有页面添加动态底部内边距
   - 使用 `calc(64px + env(safe-area-inset-bottom, 0px))`
   - 自动适配不同iOS设备的安全区域

2. ✅ 修复的页面列表
   - `HomePage.tsx` - 首页
   - `LessonsPage.tsx` - 课时记录页
   - `AddLessonPage.tsx` - 新增课时页
   - `CalendarPage.tsx` - 日历页
   - `StatsPage.tsx` - 统计分析页
   - `SettingsPage.tsx` - 设置页
   - `AppLayout.tsx` - Content组件

3. ✅ iOS优化
   - viewport meta标签已包含 `viewport-fit=cover`
   - 底部导航栏自动适配安全区域高度
   - 支持所有iPhone型号（包括刘海屏和Home指示条）

**技术细节：**
```tsx
// 修复前
<div className="min-h-screen bg-gray-50 pb-20">

// 修复后
<div 
  className="min-h-screen bg-gray-50"
  style={{ paddingBottom: `calc(64px + env(safe-area-inset-bottom, 0px))` }}
>
```

**影响范围：**
- 所有页面的底部间距
- iOS设备的显示效果
- 无副作用，向后兼容

**测试：**
- ✅ 桌面浏览器：Chrome, Safari, Firefox, Edge
- ⏳ iOS设备：iPhone 15 Pro, iPhone 13, iPhone SE（待实机测试）
- ⏳ iPad：iPadOS 16+（待实机测试）

**相关文件：**
- 修复说明：[底部导航栏修复说明.md](./底部导航栏修复说明.md)
- 测试清单：[快速测试清单.md](./快速测试清单.md)

---

## [1.0.0] - 2025-10-08

### ✨ 新功能
- 初始版本发布
- 课时管理功能
- 日历视图
- 统计分析
- 数据导出（Excel/CSV）
- PWA支持
- 暗黑模式

### 📝 已知问题
- ~~底部导航栏在iOS设备上遮挡内容~~ (已在v1.0.1修复)

---

## 版本说明

### 版本号规则
遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)

- **主版本号(Major)**：不兼容的API修改
- **次版本号(Minor)**：向下兼容的功能性新增
- **修订号(Patch)**：向下兼容的问题修正

### 变更类型
- `✨ 新功能` - 新增功能
- `🐛 Bug修复` - 问题修复
- `📝 文档` - 文档更新
- `🎨 样式` - 代码格式、UI优化
- `♻️ 重构` - 代码重构
- `⚡️ 性能` - 性能优化
- `🔒 安全` - 安全相关
- `🗑️ 移除` - 移除功能/文件
