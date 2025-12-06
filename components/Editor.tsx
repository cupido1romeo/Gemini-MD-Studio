import React from 'react';
import Editor from 'react-simple-code-editor';

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  visible: boolean;
  searchTerm?: string;
  onUndo: () => void;
  onRedo: () => void;
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
  onRedo
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
        // Prism returns HTML strings (e.g. <span class="token...">text</span>).
        // By splitting with `/(<[^>]*>)/g`, the array will contain ["text", "<tag>", "text", ...].
        return html.split(/(<[^>]*>)/g).map((part) => {
          // If it looks like a tag, return it as is
          if (part.startsWith('<')) {
            return part;
          }
          // Otherwise it is text content, safe to replace
          return part.replace(regex, '<mark style="background-color: #d97706; color: white; border-radius: 2px;">$1</mark>');
        }).join('');
      } catch (e) {
        console.error("Highlight error", e);
        return html;
      }
    }

    return html;
  };

  return (
    <div 
      className="h-full w-full bg-gray-900 flex flex-col overflow-hidden editor-container"
      onKeyDown={handleKeyDown}
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={highlight}
          padding={24}
          className="font-mono text-sm min-h-full"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: 14,
            lineHeight: '1.5rem',
            backgroundColor: 'transparent', 
            color: '#e2e8f0'
          }}
          textareaClassName="focus:outline-none"
          placeholder="# Start writing..."
        />
      </div>
    </div>
  );
};

export default MarkdownEditor;