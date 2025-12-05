# ⏰ EasyTime - 智能课时管理系统

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/yourname/easytime)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/yourname/easytime)

一个现代化的课时管理 PWA 应用，专为教师和教育工作者设计，提供课程记录、统计分析、数据导出等功能。

## ✨ 核心特性

### 📚 课时管理
- **课程记录** - 快速记录课时信息（学生、日期、时长、费用）
- **状态管理** - 支持已完成、计划中、已取消三种状态
- **冲突检测** - 自动检测时间冲突，避免重复预约
- **智能验证** - 完善的表单验证，确保数据质量

### 📊 数据统计
- **月度统计** - 总课时数、总收入、完成率等
- **学生分析** - 最活跃学生、取消最多等洞察
- **收入分析** - 毛收入、税后净收入计算
- **Excel 导出** - 一键导出月度数据和统计报告

### 📅 日历视图
- **月历展示** - 直观查看所有课程安排
- **快速筛选** - 按状态筛选课程
- **日期导航** - 快速切换月份
- **视觉标记** - 不同状态用不同颜色标识

### 🎨 用户体验
- **主题切换** - 深色/浅色/跟随系统三种模式
- **PWA 支持** - 可安装为独立应用，支持离线使用
- **响应式设计** - 完美适配手机、平板、电脑
- **性能优化** - React.memo + useMemo，流畅体验
- **数据分页** - 大数据量下依然高效

### 🔧 数据管理
- **数据备份** - 导出所有数据为 JSON 文件
- **数据恢复** - 从备份文件恢复数据
- **存储监控** - 查看空间使用情况
- **数据验证** - 备份文件格式验证

### 📈 性能监控
- **Core Web Vitals** - LCP, INP, CLS, FCP, TTFB 实时监控
- **性能评级** - 自动评估性能表现
- **优化建议** - 基于指标提供改进建议
- **性能报告** - 详细的性能数据展示

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 📦 技术栈

### 核心框架
- **React 18** - 前端框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **React Router** - 路由管理

### 状态管理
- **Zustand** - 轻量级状态管理
- **LocalStorage** - 数据持久化

### UI 组件
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库
- **Radix UI** - 无障碍组件基础

### 功能库
- **date-fns** - 日期处理
- **xlsx** - Excel 导出
- **web-vitals** - 性能监控
- **vite-plugin-pwa** - PWA 支持

## 📂 项目结构

```
src/
├── components/          # 组件
│   ├── calendar/       # 日历组件
│   ├── forms/          # 表单组件
│   ├── layout/         # 布局组件
│   ├── lessons/        # 课时组件
│   ├── stats/          # 统计组件
│   └── ui/             # UI 基础组件
├── contexts/           # React 上下文
│   └── ThemeContext.tsx
├── hooks/              # 自定义 Hooks
│   └── usePagination.ts
├── pages/              # 页面组件
├── services/           # 服务层
│   ├── dataBackup.ts
│   ├── excelExport.ts
│   └── performanceMonitor.ts
├── stores/             # 状态管理
│   └── lessonStore.ts
├── types/              # 类型定义
│   └── lesson.ts
└── utils/              # 工具函数
    ├── errorHandler.ts
    └── validation.ts
```

## 🎯 主要功能

### 1. 课时管理
- 添加/编辑/删除课程
- 状态切换（已完成/计划中/已取消）
- 时间冲突检测
- 表单验证

### 2. 数据统计
- 月度统计数据
- 学生分析
- 收入计算
- Excel 导出

### 3. 日历视图
- 月历展示
- 状态筛选
- 快速导航

### 4. 主题模式
- 浅色模式
- 深色模式
- 跟随系统

### 5. PWA 功能
- 离线访问
- 可安装应用
- Service Worker 缓存

### 6. 数据备份
- JSON 导出
- 文件导入
- 格式验证

### 7. 性能监控
- Core Web Vitals
- 性能评级
- 优化建议

## 🔨 开发指南

### 添加新课程

```typescript
const { addLesson } = useLessonStore();

addLesson({
  studentName: '张三',
  date: '2025-10-09',
  startTime: '14:00',
  duration: 1.5,
  fee: 300,
  lessonType: 'online',
  status: 'completed',
  notes: '表现优秀'
});
```

### 导出数据

```typescript
import { exportToExcel } from '@/services/excelExport';

// 导出所有课程
exportToExcel(lessons);

// 导出月度数据
exportMonthlyLessonsToExcel(lessons, year, month);
```

### 使用主题

```typescript
import { useTheme } from '@/contexts/ThemeContext';

const { theme, setTheme, effectiveTheme } = useTheme();

// 切换主题
setTheme('dark'); // 'light' | 'dark' | 'system'
```

### 性能监控

```typescript
import { PerformanceMonitor } from '@/services/performanceMonitor';

// 获取性能报告
const report = PerformanceMonitor.getReport();

// 自定义性能测量
PerformanceMonitor.mark('operation-start');
// ... 执行操作
PerformanceMonitor.measure('my-operation', 'operation-start', 'operation-end');
```

## 📊 性能指标

### Core Web Vitals 目标
- **LCP** (Largest Contentful Paint): < 2.5s
- **INP** (Interaction to Next Paint): < 200ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTFB** (Time to First Byte): < 800ms

## 🎨 主题定制

### 修改主题颜色

编辑 `src/index.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... 其他颜色变量 */
}

.dark {
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  /* ... 深色模式颜色 */
}
```

## 🔐 数据安全

### 备份数据

1. 进入设置页面
2. 点击"备份数据"
3. 下载 JSON 文件

### 恢复数据

1. 进入设置页面
2. 点击"恢复数据"
3. 选择备份的 JSON 文件
4. 确认恢复

## 📱 PWA 安装

### 桌面端
1. 访问应用
2. 点击浏览器地址栏的安装图标
3. 确认安装

### 移动端
1. 访问应用
2. 点击"添加到主屏幕"
3. 确认安装

## 🐛 故障排除

### 构建错误

```bash
# 清除缓存
rm -rf node_modules dist
npm install
npm run build
```

### 数据丢失

1. 使用备份文件恢复
2. 检查浏览器存储设置
3. 确保不在无痕模式

### PWA 不工作

1. 确保使用 HTTPS
2. 检查 Service Worker 注册
3. 清除浏览器缓存

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Lucide Icons](https://lucide.dev/)

## 📞 联系方式

- 作者：Your Name
- 邮箱：your.email@example.com
- GitHub：[@yourname](https://github.com/yourname)

---

**Made with ❤️ by AI Code Assistant**

**版本**: v2.0.0 | **更新时间**: 2025-10-09
