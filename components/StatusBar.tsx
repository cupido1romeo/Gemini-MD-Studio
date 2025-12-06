import React, { useMemo } from 'react';
import { Theme } from '../types';

interface StatusBarProps {
  content: string;
  theme: Theme;
}

const StatusBar: React.FC<StatusBarProps> = ({ content, theme }) => {
  const { words, chars } = useMemo(() => {
    const text = content.trim();
    const w = text ? text.split(/\s+/).length : 0;
    const c = content.length;
    return { words: w, chars: c };
  }, [content]);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const textColor = isDark ? 'text-gray-500' : 'text-gray-400';
  const valColor = isDark ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className={`h-7 border-t flex items-center justify-end px-4 text-xs font-mono gap-4 shrink-0 select-none transition-colors duration-300 ${bgColor} ${borderColor} ${textColor}`}>
      <div className="flex items-center" title="Word Count">
        <span className={`${valColor} font-semibold mr-1`}>{words}</span> words
      </div>
      <div className={`w-px h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
      <div className="flex items-center" title="Character Count">
        <span className={`${valColor} font-semibold mr-1`}>{chars}</span> chars
      </div>
    </div>
  );
};

export default StatusBar;