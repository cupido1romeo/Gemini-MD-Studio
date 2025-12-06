import React, { useState, useEffect, useRef } from 'react';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import Preview from './components/Preview';
import StatusBar from './components/StatusBar';
import { ViewMode, AiActionType, Theme, Layout } from './types';
import { performAiAction } from './services/geminiService';

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

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
    setNotification({ msg: 'File downloaded successfully', type: 'success' });
  };

  const handleUpload = (newContent: string) => {
    setContent(newContent);
    setSaveStatus('Unsaved changes...');
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newContent]);
    setHistoryIndex(prev => prev + 1);
    setNotification({ msg: 'File loaded successfully', type: 'success' });
  };

  const handleAiAction = async (action: AiActionType) => {
    if (!content.trim()) {
      setNotification({ msg: 'Editor is empty', type: 'error' });
      return;
    }

    setIsAiLoading(true);
    try {
      const result = await performAiAction(content, action);
      let newContent = content;

      if (action === AiActionType.SUMMARIZE) {
        newContent = `${content}\n\n## AI Summary\n\n${result}`;
        setNotification({ msg: 'Summary appended to document', type: 'success' });
      } else if (action === AiActionType.CONTINUE) {
        newContent = `${content}\n${result}`;
         setNotification({ msg: 'Content generated', type: 'success' });
      } else {
        newContent = result;
        setNotification({ msg: 'Text updated by AI', type: 'success' });
      }

      setContent(newContent);
      setSaveStatus('Unsaved changes...');
      setHistory(prev => [...prev.slice(0, historyIndex + 1), newContent]);
      setHistoryIndex(prev => prev + 1);

    } catch (error) {
      setNotification({ 
        msg: error instanceof Error ? error.message : "AI Action failed", 
        type: 'error' 
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const canUndo = historyIndex > 0 || content !== history[historyIndex];
  const canRedo = historyIndex < history.length - 1 && content === history[historyIndex];
  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-900'}`}>
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

      <StatusBar content={content} theme={theme} />
    </div>
  );
};

export default App;