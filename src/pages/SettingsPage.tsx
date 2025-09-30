import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLessonStore } from '@/stores/lessonStore';
import { exportToExcel, exportToCSV } from '@/lib/export';

export const SettingsPage = () => {
  const { lessons, settings, updateSettings } = useLessonStore();
  const [exporting, setExporting] = useState(false);
  const [hourlyRateInput, setHourlyRateInput] = useState(settings.hourlyRate.toString());

  const handleHourlyRateChange = (value: string) => {
    setHourlyRateInput(value);
    const rate = parseFloat(value);
    if (!isNaN(rate) && rate >= 0) {
      updateSettings({ hourlyRate: rate });
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      await exportToExcel(lessons);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      await exportToCSV(lessons);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">设置</h1>
        <p className="text-gray-600">管理应用设置和数据</p>
      </div>

      <div className="space-y-6">
        {/* 课时费设置 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">课时费设置</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="hourlyRate" className="text-sm font-medium text-gray-700">
                默认课时费 (元/小时)
              </label>
              <input
                id="hourlyRate"
                type="number"
                value={hourlyRateInput}
                onChange={(e) => handleHourlyRateChange(e.target.value)}
                min="0"
                step="1"
                placeholder="请输入课时费"
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                设置后，新建课时会自动填充此课时费
              </p>
            </div>
          </div>
        </div>

        {/* 数据导出 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">数据导出</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">导出所有课时记录到Excel文件</p>
              <Button 
                onClick={handleExportExcel}
                disabled={exporting || lessons.length === 0}
                className="w-full sm:w-auto"
              >
                {exporting ? '导出中...' : '导出Excel'}
              </Button>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">导出所有课时记录到CSV文件</p>
              <Button 
                onClick={handleExportCSV}
                disabled={exporting || lessons.length === 0}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {exporting ? '导出中...' : '导出CSV'}
              </Button>
            </div>
          </div>
        </div>

        {/* 数据管理 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">数据管理</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">当前数据概览</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium text-gray-900">总课时</div>
                  <div className="text-2xl font-bold text-blue-600">{lessons.length}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium text-gray-900">已完成</div>
                  <div className="text-2xl font-bold text-green-600">
                    {lessons.filter(l => l.status === 'completed').length}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-red-600 mb-2">⚠️ 清除所有数据（不可恢复）</p>
              <Button 
                onClick={handleClearData}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                清除所有数据
              </Button>
            </div>
          </div>
        </div>

        {/* 应用信息 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">应用信息</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>应用名称:</span>
              <span className="font-medium">EasyTime</span>
            </div>
            <div className="flex justify-between">
              <span>版本:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>开发者:</span>
              <span className="font-medium">EasyTime Team</span>
            </div>
            <div className="flex justify-between">
              <span>最后更新:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};