import React, { useState, useEffect } from 'react';
import { PerformanceMonitor } from '@/services/performanceMonitor';
import { Button } from './ui/button';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';

export const PerformanceReport: React.FC = () => {
  const [report, setReport] = useState<ReturnType<typeof PerformanceMonitor.getReport> | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = () => {
    const data = PerformanceMonitor.getReport();
    setReport(data);
  };

  const handleClear = () => {
    if (confirm('确定要清除性能数据吗？')) {
      PerformanceMonitor.clear();
      loadReport();
    }
  };

  if (!report) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">加载性能数据...</p>
      </div>
    );
  }

  const { metrics, summary, recommendations } = report;
  const hasMetrics = Object.keys(metrics).length > 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">性能监控</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '隐藏详情' : '查看详情'}
        </Button>
      </div>

      {!hasMetrics ? (
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">暂无性能数据</p>
          <p className="text-sm text-gray-500">刷新页面后将收集性能指标</p>
        </div>
      ) : (
        <>
          {/* 性能摘要 */}
          <div className="mb-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              recommendations.length === 0 
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {recommendations.length === 0 ? '✅' : '⚠️'} {summary}
            </div>
          </div>

          {/* 性能指标 */}
          {showDetails && (
            <>
              <div className="space-y-3 mb-4">
                {metrics.LCP && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">最大内容绘制 (LCP)</span>
                    <span className="text-sm font-medium text-gray-900">
                      {metrics.LCP.toFixed(0)}ms
                    </span>
                  </div>
                )}
                {metrics.INP && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">交互响应时间 (INP)</span>
                    <span className="text-sm font-medium text-gray-900">
                      {metrics.INP.toFixed(0)}ms
                    </span>
                  </div>
                )}
                {metrics.CLS && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">累积布局偏移 (CLS)</span>
                    <span className="text-sm font-medium text-gray-900">
                      {metrics.CLS.toFixed(3)}
                    </span>
                  </div>
                )}
                {metrics.FCP && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">首次内容绘制 (FCP)</span>
                    <span className="text-sm font-medium text-gray-900">
                      {metrics.FCP.toFixed(0)}ms
                    </span>
                  </div>
                )}
                {metrics.TTFB && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">首字节时间 (TTFB)</span>
                    <span className="text-sm font-medium text-gray-900">
                      {metrics.TTFB.toFixed(0)}ms
                    </span>
                  </div>
                )}
              </div>

              {/* 优化建议 */}
              {recommendations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <h3 className="text-sm font-medium text-gray-900">优化建议</h3>
                  </div>
                  <ul className="space-y-2">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600 pl-4">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* 操作按钮 */}
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadReport}
            >
              刷新数据
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
            >
              清除数据
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

