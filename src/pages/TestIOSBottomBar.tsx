import { useState } from 'react';

/**
 * iOS 底部导航栏测试页面
 * 
 * 测试场景：
 * 1. 输入框聚焦 - 键盘弹出
 * 2. 页面滚动 - 橡皮筋效果
 * 3. 地址栏显隐 - 视口变化
 */
export const TestIOSBottomBar = () => {
  const [inputValue, setInputValue] = useState('');
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部标题 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold text-gray-900">iOS 底栏测试</h1>
      </div>
      
      <div className="p-4 space-y-6">
        
        {/* 测试说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📱 测试指南</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. 点击输入框，键盘弹出时底栏应保持在可视区域底部</li>
            <li>2. 上下滚动页面，底栏不应跟随橡皮筋效果抖动</li>
            <li>3. 地址栏显隐时，底栏应稳定固定</li>
            <li>4. 在 iPhone X+ 设备，底栏应适配安全区域</li>
          </ul>
        </div>

        {/* 输入框测试区 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">键盘弹出测试</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              学生姓名
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="点击这里，观察键盘弹出时底栏位置"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备注
            </label>
            <textarea
              placeholder="多行文本输入测试"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日期
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 滚动测试区 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">滚动测试区</h3>
          
          {Array.from({ length: 20 }, (_, i) => (
            <div 
              key={i}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <p className="text-gray-600">测试项 #{i + 1}</p>
              <p className="text-sm text-gray-500 mt-1">
                向下滚动到底部，观察橡皮筋效果是否影响底栏
              </p>
            </div>
          ))}
        </div>

        {/* 视口信息显示 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">视口信息</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>窗口高度: <span className="font-mono">{window.innerHeight}px</span></p>
            <p>
              VisualViewport 支持: 
              <span className="font-mono ml-1">
                {window.visualViewport ? '✅ 是' : '❌ 否'}
              </span>
            </p>
            {window.visualViewport && (
              <p>
                可视高度: 
                <span className="font-mono ml-1" id="vv-height">
                  {window.visualViewport.height}px
                </span>
              </p>
            )}
          </div>
        </div>

        {/* 占位，确保内容不被底栏遮挡 */}
        <div style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }} />
      </div>
    </div>
  );
};

