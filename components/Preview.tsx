import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Theme } from '../types';

interface PreviewProps {
  content: string;
  visible: boolean;
  theme: Theme;
}

const Preview: React.FC<PreviewProps> = ({ content, visible, theme }) => {
  if (!visible) return null;

  const isDark = theme === 'dark';

  return (
    <div className={`h-full w-full overflow-y-auto custom-scrollbar p-6 md:p-10 transition-colors duration-300 ${isDark ? 'bg-gray-850' : 'bg-white'}`}>
      <div className={`prose prose-sm sm:prose-base lg:prose-lg max-w-none ${isDark ? 'prose-invert' : 'prose-light'}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default Preview;