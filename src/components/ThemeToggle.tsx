import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ value: 'light' | 'dark' | 'system'; icon: React.ReactNode; label: string }> = [
    { value: 'light', icon: <Sun className="h-4 w-4" />, label: '浅色' },
    { value: 'dark', icon: <Moon className="h-4 w-4" />, label: '深色' },
    { value: 'system', icon: <Monitor className="h-4 w-4" />, label: '跟随系统' },
  ];

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
      {themes.map(({ value, icon, label }) => (
        <Button
          key={value}
          variant={theme === value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme(value)}
          className={`flex items-center gap-2 ${
            theme === value 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'text-gray-700 hover:bg-gray-200'
          }`}
          title={label}
        >
          {icon}
          <span className="hidden sm:inline text-xs">{label}</span>
        </Button>
      ))}
    </div>
  );
};

