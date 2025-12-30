import React, { useState, useEffect, useRef } from 'react';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import Preview from './components/Preview';
import StatusBar from './components/StatusBar';
import { ViewMode, AiActionType, Theme, Layout } from './types';
import { performAiAction } from './services/geminiService';
import { Upload } from 'lucide-react';

const STORAGE_KEY = 'gemini_md_content';
const THEME_KEY = 'gemini_md_theme';
const LAYOUT_KEY = 'gemini_md_layout';

const getInitialContent = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? saved : DEFAULT_TEXT;
  } catch (e) {
    console.warn('Failed to load from localStorage', e);
    return DEFAULT_TEXT;
  }
};

const DEFAULT_TEXT = `# Welcome to Gemini Markdown Studio

This is a **lightweight**, **agile** editor enhanced with AI.

## Features
- Clean, distraction-free interface
- Real-time preview
- **Gemini AI** integration for:
  - Proofreading
  - Summarization
  - Content continuation
  - Formatting

## Try it out
1. Type some text on the left.
2. Click "AI Assist" in the toolbar to see magic happen.
3. Switch views using the icons in the top bar.

---
`;

const App: React.FC = () => {
  // Initialize content and history
  const [content, setContent] = useState<string>(getInitialContent);
  const [history, setHistory] = useState<string[]>([getInitialContent()]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SPLIT);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [notification, setNotification] = useState<{msg: string, type: 'error' | 'success'} | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('All changes saved');
  const [selectedText, setSelectedText] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Theme and Layout State
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(THEME_KEY) as Theme) || 'dark');
  const [layout, setLayout] = useState<Layout>(() => (localStorage.getItem(LAYOUT_KEY) as Layout) || 'horizontal');

  // Refs for debouncing history updates
  const historyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(historyIndex);

  // Sync ref with state
  useEffect(() => {
    indexRef.current = historyIndex;
  }, [historyIndex]);

  // Handle Theme Side Effects
  useEffect(() => {
    // 1. Swap Prism Stylesheet
    const link = document.getElementById('prism-theme') as HTMLLinkElement;
    if (link) {
      link.href = theme === 'dark' 
        ? 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css'
        : 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css';
    }

    // 2. Update Body Background
    document.body.style.backgroundColor = theme === 'dark' ? '#1a202c' : '#f9fafb';
    document.body.style.color = theme === 'dark' ? '#e2e8f0' : '#111827';
    
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Persist Layout
  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, layout);
  }, [layout]);

  // Autosave effect
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, content);
        setSaveStatus('All changes saved');
      } catch (e) {
        console.warn('Failed to save to localStorage', e);
        setSaveStatus('Error saving');
      }
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [content]);

  // Responsive default view
  useEffect(() => {
    const handleResize = () => {
      // Prevent SPLIT view on small screens
      if (window.innerWidth < 768 && viewMode === ViewMode.SPLIT) {
        setViewMode(ViewMode.EDIT);
      }
    };
    
    // Initial check: Only switch to EDIT if we are currently in SPLIT mode and on a small screen.
    // This allows users to stay in PREVIEW mode on mobile if they choose to.
    if (window.innerWidth < 768 && viewMode === ViewMode.SPLIT) {
      setViewMode(ViewMode.EDIT);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Global Drag and Drop Listeners
  useEffect(() => {
    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Check if we are dragging files to avoid triggering on text selection drags
      // types is a DOMStringList, usually contains "Files" when dragging files
      if (e.dataTransfer?.types?.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.types?.includes('Files')) {
         // Necessary to allow dropping
         e.dataTransfer.dropEffect = 'copy';
      }
    };

    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragover', handleWindowDragOver);

    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragover', handleWindowDragOver);
    };
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showToast = (msg: string, type: 'error' | 'success' = 'success') => {
    setNotification({ msg, type });
  };

  const handleEditorChange = (newVal: string) => {
    setContent(newVal);
    setSaveStatus('Unsaved changes...');

    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    historyTimeoutRef.current = setTimeout(() => {
      setHistory(prev => {
        const currentIdx = indexRef.current;
        const currentHistory = prev.slice(0, currentIdx + 1);
        if (currentHistory[currentHistory.length - 1] !== newVal) {
          return [...currentHistory, newVal];
        }
        return prev;
      });
      setHistoryIndex(prev => prev + 1);
    }, 700);
  };

  const handleUndo = () => {
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }

    const currentIndex = historyIndex;
    const currentHistoryContent = history[currentIndex];

    if (content !== currentHistoryContent) {
      const newHistory = [...history.slice(0, currentIndex + 1), content];
      setHistory(newHistory);
      setContent(currentHistoryContent);
      setSaveStatus('Unsaved changes...');
      return;
    }

    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
      setSaveStatus('Unsaved changes...');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
      setSaveStatus('Unsaved changes...');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('File downloaded successfully');
  };

  const handleUpload = (newContent: string) => {
    setContent(newContent);
    setSaveStatus('Unsaved changes...');
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newContent]);
    setHistoryIndex(prev => prev + 1);
    showToast('File loaded successfully');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      showToast('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy', err);
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleAiAction = async (action: AiActionType) => {
    if (!content.trim()) {
      showToast('Editor is empty', 'error');
      return;
    }

    setIsAiLoading(true);
    try {
      const result = await performAiAction(content, action);
      let newContent = content;

      if (action === AiActionType.SUMMARIZE) {
        newContent = `${content}\n\n## AI Summary\n\n${result}`;
        showToast('Summary appended to document');
      } else if (action === AiActionType.CONTINUE) {
        newContent = `${content}\n${result}`;
        showToast('Content generated');
      } else {
        newContent = result;
        showToast('Text updated by AI');
      }

      setContent(newContent);
      setSaveStatus('Unsaved changes...');
      setHistory(prev => [...prev.slice(0, historyIndex + 1), newContent]);
      setHistoryIndex(prev => prev + 1);

    } catch (error) {
      showToast(error instanceof Error ? error.message : "AI Action failed", 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Drag and Drop Handlers for the Overlay
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only close if we are leaving the overlay (which covers the screen)
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Simple extension check
      if (
        file.name.endsWith('.md') || 
        file.name.endsWith('.txt') || 
        file.name.endsWith('.markdown') || 
        file.type === 'text/markdown' || 
        file.type === 'text/plain'
      ) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            handleUpload(event.target.result as string);
          }
        };
        reader.readAsText(file);
      } else {
        showToast('Please drop a valid Markdown or Text file', 'error');
      }
    }
  };

  const canUndo = historyIndex > 0 || content !== history[historyIndex];
  const canRedo = historyIndex < history.length - 1 && content === history[historyIndex];
  const isDark = theme === 'dark';

  return (
    <div 
      className={`flex flex-col h-screen w-screen overflow-hidden transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-900'}`}
    >
      <Toolbar 
        viewMode={viewMode}
        setViewMode={setViewMode}
        onDownload={handleDownload}
        onUpload={handleUpload}
        onClear={() => {
          const empty = '';
          setContent(empty);
          setSaveStatus('Unsaved changes...');
          setHistory(prev => [...prev.slice(0, historyIndex + 1), empty]);
          setHistoryIndex(prev => prev + 1);
        }}
        onCopy={handleCopy}
        onAiAction={handleAiAction}
        isAiLoading={isAiLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        saveStatus={saveStatus}
        theme={theme}
        toggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        layout={layout}
        toggleLayout={() => setLayout(prev => prev === 'horizontal' ? 'vertical' : 'horizontal')}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex overflow-hidden relative ${layout === 'vertical' && viewMode === ViewMode.SPLIT ? 'flex-col' : 'flex-row'}`}>
        
        {/* Editor Pane */}
        <div className={`
          ${viewMode === ViewMode.SPLIT ? (layout === 'horizontal' ? 'w-1/2 border-r' : 'w-full h-1/2 border-b') : 'w-full'}
          ${viewMode === ViewMode.PREVIEW ? 'hidden' : 'block'}
          ${isDark ? 'border-gray-700' : 'border-gray-200'}
          transition-all duration-300 ease-in-out
        `}>
          <Editor 
            value={content} 
            onChange={handleEditorChange} 
            visible={true}
            searchTerm={searchTerm}
            onUndo={handleUndo}
            onRedo={handleRedo}
            theme={theme}
            onSelectionChange={setSelectedText}
          />
        </div>

        {/* Preview Pane */}
        <div className={`
          ${viewMode === ViewMode.SPLIT ? (layout === 'horizontal' ? 'w-1/2' : 'w-full h-1/2') : 'w-full'}
          ${viewMode === ViewMode.EDIT ? 'hidden' : 'block'}
          transition-all duration-300 ease-in-out
        `}>
          <Preview 
            content={content} 
            visible={true} 
            theme={theme}
            onNotify={showToast}
          />
        </div>
        
        {/* Notification Toast */}
        {notification && (
          <div className={`
            absolute bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50 animate-fade-in-up
            ${notification.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-green-500/90 text-white'}
          `}>
            {notification.msg}
          </div>
        )}
      </div>

      <StatusBar content={content} selectedText={selectedText} theme={theme} />

      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div 
          className="fixed inset-0 z-[200] bg-blue-500/10 backdrop-blur-sm border-4 border-blue-500 border-dashed m-4 rounded-xl flex items-center justify-center transition-all duration-200"
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className={`
            flex flex-col items-center gap-4 px-10 py-8 rounded-2xl shadow-2xl pointer-events-none
            ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          `}>
            <Upload size={48} className="text-blue-500 animate-bounce" />
            <span className="text-2xl font-bold">Drop Markdown file to open</span>
            <p className="text-sm text-gray-500">.md, .markdown, .txt files are supported</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;