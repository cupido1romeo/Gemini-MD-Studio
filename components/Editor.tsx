import React from 'react';
import Editor from 'react-simple-code-editor';
import { Theme } from '../types';

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  visible: boolean;
  searchTerm?: string;
  onUndo: () => void;
  onRedo: () => void;
  theme: Theme;
  onSelectionChange: (text: string) => void;
}

// Access the global Prism object loaded via CDN
declare global {
  interface Window {
    Prism: any;
  }
}

const MarkdownEditor: React.FC<EditorProps> = ({ 
  value, 
  onChange, 
  visible, 
  searchTerm,
  onUndo,
  onRedo,
  theme,
  onSelectionChange
}) => {
  if (!visible) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Undo: Ctrl+Z or Cmd+Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      onUndo();
    }
    // Redo: Ctrl+Y, Cmd+Y, Ctrl+Shift+Z, Cmd+Shift+Z
    if (
      ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
    ) {
      e.preventDefault();
      onRedo();
    }
  };

  const handleSelectionCheck = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    
    if (start !== end) {
      onSelectionChange(value.substring(start, end));
    } else {
      onSelectionChange('');
    }
  };

  const highlight = (code: string) => {
    let html = code;
    
    // 1. Run standard syntax highlighting
    if (window.Prism && window.Prism.languages.markdown) {
      html = window.Prism.highlight(code, window.Prism.languages.markdown, 'markdown');
    }

    // 2. Run search highlighting if searchTerm exists
    if (searchTerm && searchTerm.length > 0) {
      try {
        // Escape regex special characters
        const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        
        // We split by HTML tags to ensure we only replace text content and not HTML attributes or tag names.
        return html.split(/(<[^>]*>)/g).map((part) => {
          if (part.startsWith('<')) {
            return part;
          }
          return part.replace(regex, '<mark style="background-color: #d97706; color: white; border-radius: 2px;">$1</mark>');
        }).join('');
      } catch (e) {
        console.error("Highlight error", e);
        return html;
      }
    }

    return html;
  };

  const isDark = theme === 'dark';

  return (
    <div 
      className={`h-full w-full flex flex-col overflow-hidden editor-container transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
      onKeyDown={handleKeyDown}
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={highlight}
          padding={24}
          onSelect={handleSelectionCheck}
          onKeyUp={handleSelectionCheck}
          onClick={handleSelectionCheck}
          aria-label="Markdown editor"
          className="font-mono text-sm min-h-full"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: 14,
            lineHeight: '1.5rem',
            backgroundColor: 'transparent', 
            color: isDark ? '#e2e8f0' : '#1f2937'
          }}
          textareaClassName="focus:outline-none"
          placeholder="# Start writing..."
        />
      </div>
    </div>
  );
};

export default MarkdownEditor;