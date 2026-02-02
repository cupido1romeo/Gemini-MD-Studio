import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Code, FileText, AlignLeft, Check } from 'lucide-react';
import { Theme } from '../types';

interface PreviewProps {
  content: string;
  visible: boolean;
  theme: Theme;
  onNotify?: (msg: string, type: 'success' | 'error') => void;
}

const Preview: React.FC<PreviewProps> = ({ content, visible, theme, onNotify }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!visible) return null;

  const isDark = theme === 'dark';

  const handleCopy = async (type: 'markdown' | 'html' | 'text') => {
    let textToCopy = '';
    let successMsg = '';

    try {
      switch (type) {
        case 'markdown':
          textToCopy = content;
          successMsg = 'Markdown copied';
          break;
        case 'html':
          if (contentRef.current) {
            // Get the innerHTML of the prose container
            const proseEl = contentRef.current.querySelector('.prose');
            if (proseEl) {
              textToCopy = proseEl.innerHTML;
              successMsg = 'HTML copied';
            }
          }
          break;
        case 'text':
          if (contentRef.current) {
             const proseEl = contentRef.current.querySelector('.prose') as HTMLElement;
             if (proseEl) {
               textToCopy = proseEl.innerText;
               successMsg = 'Plain text copied';
             }
          }
          break;
      }

      if (textToCopy) {
        await navigator.clipboard.writeText(textToCopy);
        if (onNotify) onNotify(successMsg, 'success');
      } else {
        if (onNotify) onNotify('Nothing to copy', 'error');
      }
    } catch (err) {
      console.error('Copy failed', err);
      if (onNotify) onNotify('Failed to copy', 'error');
    } finally {
      setIsMenuOpen(false);
    }
  };

  return (
    <div className={`relative h-full w-full group transition-colors duration-300 ${isDark ? 'bg-gray-850' : 'bg-white'}`}>
      
      {/* Floating Copy Button */}
      <div className="absolute top-4 right-6 z-10 flex flex-col items-end">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2 rounded-md shadow-sm transition-all duration-200 opacity-70 hover:opacity-100 ${
            isDark 
              ? 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700' 
              : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200'
          }`}
          title="Copy Options"
          aria-label="Copy options"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
        >
          <Copy size={18} />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
            <div
              className={`
                absolute top-10 right-0 w-48 rounded-md shadow-lg z-20 py-1 overflow-hidden border
                animate-fade-in
                ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}
              `}
              role="menu"
            >
              <button
                onClick={() => handleCopy('markdown')}
                className={`flex items-center w-full px-4 py-2 text-sm text-left transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                role="menuitem"
              >
                <FileText size={14} className="mr-2" />
                <span>Copy Markdown</span>
              </button>
              
              <button
                onClick={() => handleCopy('text')}
                className={`flex items-center w-full px-4 py-2 text-sm text-left transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                role="menuitem"
              >
                <AlignLeft size={14} className="mr-2" />
                <span>Copy Plain Text</span>
              </button>

              <button
                onClick={() => handleCopy('html')}
                className={`flex items-center w-full px-4 py-2 text-sm text-left transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                role="menuitem"
              >
                <Code size={14} className="mr-2" />
                <span>Copy HTML</span>
              </button>
            </div>
          </>
        )}
      </div>

      <div ref={contentRef} className="h-full w-full overflow-y-auto custom-scrollbar p-6 md:p-10">
        <div className={`prose prose-sm sm:prose-base lg:prose-lg max-w-none ${isDark ? 'prose-invert' : 'prose-light'}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Preview;