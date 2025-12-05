import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { ErrorHandler } from '@/utils/errorHandler';

interface PerformanceMetrics {
  CLS?: number; // Cumulative Layout Shift
  INP?: number; // Interaction to Next Paint (替代 FID)
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  TTFB?: number; // Time to First Byte
}

/**
 * 性能监控服务
 */
export class PerformanceMonitor {
  private static metrics: PerformanceMetrics = {};
  private static readonly STORAGE_KEY = 'performance-metrics';

  /**
   * 初始化性能监控
   */
  static init(): void {
    try {
      // 监控 Core Web Vitals
      onCLS(this.handleMetric.bind(this));
      onINP(this.handleMetric.bind(this)); // INP 替代了 FID
      onFCP(this.handleMetric.bind(this));
      onLCP(this.handleMetric.bind(this));
      onTTFB(this.handleMetric.bind(this));

      console.log('✅ 性能监控已启动');
    } catch (error) {
      ErrorHandler.handle(error, 'PerformanceMonitor.init');
    }
  }

  /**
   * 处理性能指标
   */
  private static handleMetric(metric: Metric): void {
    try {
      const { name, value } = metric;
      
      // 保存指标
      this.metrics[name as keyof PerformanceMetrics] = value;

      // 评级
      const rating = this.getRating(name, value);
      
      // 输出到控制台
      console.log(`📊 ${name}: ${value.toFixed(2)}ms (${rating})`);

      // 保存到 localStorage
      this.saveMetrics();

      // 发送到分析服务（如果需要）
      // this.sendToAnalytics(metric);
    } catch (error) {
      ErrorHandler.handle(error, 'PerformanceMonitor.handleMetric');
    }
  }

  /**
   * 获取性能评级
   */
  private static getRating(name: string, value: number): string {
    const thresholds: Record<string, { good: number; needsImprovement: number }> = {
      CLS: { good: 0.1, needsImprovement: 0.25 },
      INP: { good: 200, needsImprovement: 500 }, // INP 替代 FID
      FCP: { good: 1800, needsImprovement: 3000 },
      LCP: { good: 2500, needsImprovement: 4000 },
      TTFB: { good: 800, needsImprovement: 1800 },
    };

    const threshold = thresholds[name];
    if (!threshold) return '未知';

    if (value <= threshold.good) return '优秀 ✅';
    if (value <= threshold.needsImprovement) return '需改进 ⚠️';
    return '较差 ❌';
  }

  /**
   * 保存指标到 localStorage
   */
  private static saveMetrics(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.metrics));
    } catch (error) {
      ErrorHandler.handle(error, 'PerformanceMonitor.saveMetrics');
    }
  }

  /**
   * 获取保存的指标
   */
  static getMetrics(): PerformanceMetrics {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      ErrorHandler.handle(error, 'PerformanceMonitor.getMetrics');
      return {};
    }
  }

  /**
   * 获取性能报告
   */
  static getReport(): {
    metrics: PerformanceMetrics;
    summary: string;
    recommendations: string[];
  } {
    const metrics = this.getMetrics();
    const recommendations: string[] = [];

    // 分析并提供建议
    if (metrics.LCP && metrics.LCP > 2500) {
      recommendations.push('优化最大内容绘制 (LCP)：压缩图片、使用CDN、优化服务器响应时间');
    }
    if (metrics.INP && metrics.INP > 200) {
      recommendations.push('优化交互响应 (INP)：减少JavaScript执行时间、代码分割、优化事件处理');
    }
    if (metrics.CLS && metrics.CLS > 0.1) {
      recommendations.push('优化累积布局偏移 (CLS)：为图片和视频设置尺寸、避免动态插入内容');
    }
    if (metrics.FCP && metrics.FCP > 1800) {
      recommendations.push('优化首次内容绘制 (FCP)：优化关键渲染路径、移除阻塞渲染的资源');
    }
    if (metrics.TTFB && metrics.TTFB > 800) {
      recommendations.push('优化首字节时间 (TTFB)：优化服务器性能、使用CDN、启用缓存');
    }

    const summary = recommendations.length === 0 
      ? '性能表现优秀！' 
      : `发现 ${recommendations.length} 个可优化项`;

    return {
      metrics,
      summary,
      recommendations,
    };
  }

  /**
   * 清除性能数据
   */
  static clear(): void {
    try {
      this.metrics = {};
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('性能数据已清除');
    } catch (error) {
      ErrorHandler.handle(error, 'PerformanceMonitor.clear');
    }
  }

  /**
   * 获取导航时序信息
   */
  static getNavigationTiming(): PerformanceNavigationTiming | null {
    try {
      const [timing] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return timing || null;
    } catch (error) {
      ErrorHandler.handle(error, 'PerformanceMonitor.getNavigationTiming');
      return null;
    }
  }

  /**
   * 获取资源加载信息
   */
  static getResourceTiming(): PerformanceResourceTiming[] {
    try {
      return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    } catch (error) {
      ErrorHandler.handle(error, 'PerformanceMonitor.getResourceTiming');
      return [];
    }
  }

  /**
   * 测量自定义性能
   */
  static measure(name: string, startMark: string, endMark: string): number | null {
    try {
      performance.mark(endMark);
      performance.measure(name, startMark, endMark);
      
      const measures = performance.getEntriesByName(name, 'measure');
      const duration = measures[0]?.duration || 0;
      
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      
      // 清理标记
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(name);
      
      return duration;
    } catch (error) {
      ErrorHandler.handle(error, 'PerformanceMonitor.measure');
      return null;
    }
  }

  /**
   * 创建性能标记
   */
  static mark(name: string): void {
    try {
      performance.mark(name);
    } catch (error) {
      ErrorHandler.handle(error, 'PerformanceMonitor.mark');
    }
  }
}

