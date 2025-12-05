import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLessonStore } from '@/stores/lessonStore';
import { exportToExcel, exportToCSV } from '@/services/excelExport';
import { DataBackupService } from '@/services/dataBackup';
import { useToast } from '@/components/ui/toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PerformanceReport } from '@/components/PerformanceReport';
import type { NewStudent } from '@/types/student';

export const SettingsPage = () => {
  const { lessons, settings, updateSettings, students, addStudent, updateStudent, deleteStudent } = useLessonStore();
  const [exporting, setExporting] = useState(false);
  const [hourlyRateInput, setHourlyRateInput] = useState(settings.hourlyRate.toString());
  const [storageInfo, setStorageInfo] = useState<{ used: string; quota: string; percentage: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // 学生管理本地状态
  const [newStudent, setNewStudent] = useState<NewStudent>({ studentId: '', name: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<NewStudent>({ studentId: '', name: '' });

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
      try {
        DataBackupService.clearAllData();
        toast.success('数据已清除');
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        toast.error('清除数据失败');
      }
    }
  };

  const handleBackupData = () => {
    try {
      DataBackupService.exportData();
      toast.success('数据备份成功');
    } catch {
      toast.error('数据备份失败');
    }
  };

  const handleRestoreData = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const isValid = await DataBackupService.validateBackupFile(file);
      if (!isValid) {
        toast.error('无效的备份文件');
        return;
      }

      if (confirm('恢复数据将覆盖当前所有数据，是否继续？')) {
        await DataBackupService.importData(file);
        toast.success('数据恢复成功，即将刷新页面');
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      toast.error('数据恢复失败');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const checkStorage = async () => {
    const info = await DataBackupService.checkStorageUsage();
    setStorageInfo(info);
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: `calc(64px + env(safe-area-inset-bottom, 0px))` }}>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">设置</h1>
          <p className="text-gray-600">管理应用设置和数据</p>
        </div>

        <div className="space-y-6">
          {/* 学生管理 */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">学生数据管理</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="学号"
                value={newStudent.studentId}
                onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="学生姓名"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-2 mb-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={() => {
                  if (!newStudent.studentId.trim() || !newStudent.name.trim()) {
                    toast.error('请输入学号和姓名');
                    return;
                  }
                  addStudent(newStudent);
                  setNewStudent({ studentId: '', name: '' });
                  toast.success('已添加学生');
                }}
              >
                添加学生
              </button>
            </div>

            <div className="divide-y">
              {students.length === 0 ? (
                <p className="text-sm text-gray-500">暂无学生数据</p>
              ) : (
                students.map((s) => (
                  <div key={s.id} className="py-2 flex items-center justify-between">
                    {editingId === s.id ? (
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editingStudent.studentId}
                          onChange={(e) => setEditingStudent({ ...editingStudent, studentId: e.target.value })}
                          className="px-3 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          value={editingStudent.name}
                          onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                          className="px-3 py-2 border rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">{s.studentId} - {s.name}</div>
                        <div className="text-xs text-gray-500">创建于 {new Date(s.createdAt).toLocaleString()}</div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {editingId === s.id ? (
                        <>
                          <button
                            className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
                            onClick={() => {
                              updateStudent(s.id, editingStudent);
                              setEditingId(null);
                              toast.success('已更新学生');
                            }}
                          >
                            保存
                          </button>
                          <button
                            className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm"
                            onClick={() => setEditingId(null)}
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                            onClick={() => { setEditingId(s.id); setEditingStudent({ studentId: s.studentId, name: s.name }); }}
                          >
                            编辑
                          </button>
                          <button
                            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
                            onClick={() => { deleteStudent(s.id); toast.success('已删除学生'); }}
                          >
                            删除
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        {/* 主题设置 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">外观设置</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">主题模式</p>
              <ThemeToggle />
            </div>
          </div>
        </div>

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
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        {/* 数据备份与恢复 */}
        {/* iOS 测试入口 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">📱 iOS Safari 测试</h2>
          <p className="text-sm text-blue-700 mb-4">测试底部导航栏在 iOS Safari 的固定效果</p>
          <Link to="/test-ios-bottom">
            <Button variant="outline" className="border-blue-400 text-blue-700 hover:bg-blue-100">
              进入测试页面
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">数据备份与恢复</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">备份您的数据到本地文件</p>
              <Button 
                onClick={handleBackupData}
                variant="outline"
                className="w-full sm:w-auto"
              >
                备份数据
              </Button>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">从备份文件恢复数据</p>
              <Button 
                onClick={handleRestoreData}
                variant="outline"
                className="w-full sm:w-auto"
              >
                恢复数据
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">存储空间使用情况</p>
              <Button 
                onClick={checkStorage}
                variant="outline"
                size="sm"
                className="mb-2"
              >
                检查存储
              </Button>
              {storageInfo && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <div>已用: {storageInfo.used}</div>
                  <div>配额: {storageInfo.quota}</div>
                  <div>使用率: {storageInfo.percentage}</div>
                </div>
              )}
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

        {/* 性能监控 */}
        <PerformanceReport />

        {/* 应用信息 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">应用信息</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>应用名称:</span>
              <span className="font-medium text-gray-900">EasyTime</span>
            </div>
            <div className="flex justify-between">
              <span>版本:</span>
              <span className="font-medium text-gray-900">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>开发者:</span>
              <span className="font-medium text-gray-900">EasyTime Team</span>
            </div>
            <div className="flex justify-between">
              <span>最后更新:</span>
              <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
