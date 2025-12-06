import React, { useState, useEffect, useRef } from 'react';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { ViewMode, AiActionType } from './types';
import { performAiAction } from './services/geminiService';

const STORAGE_KEY = 'gemini_md_content';

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

  // Refs for debouncing history updates
  const historyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(historyIndex);

  // Sync ref with state
  useEffect(() => {
    indexRef.current = historyIndex;
  }, [historyIndex]);

  // Autosave effect: Saves content to localStorage 2 seconds after the last change
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, content);
      } catch (e) {
        console.warn('Failed to save to localStorage', e);
      }
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [content]);

  // Responsive default view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === ViewMode.SPLIT) {
        setViewMode(ViewMode.EDIT);
      }
    };
    
    if (window.innerWidth < 768) {
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

    // Debounce history update
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    historyTimeoutRef.current = setTimeout(() => {
      setHistory(prev => {
        const currentIdx = indexRef.current;
        const currentHistory = prev.slice(0, currentIdx + 1);
        // Avoid duplicate entries if value hasn't effectively changed
        if (currentHistory[currentHistory.length - 1] !== newVal) {
          return [...currentHistory, newVal];
        }
        return prev;
      });
      // We assume the effect above will update the history, so we update index relative to that
      // However, functional updates don't easily allow coordinated state updates.
      // We rely on the fact that if we push to history, we increment index.
      setHistoryIndex(prev => {
        // Need to check if we actually added something, but simpler to just increment 
        // if we know content changed.
        return prev + 1;
      });
    }, 700);
  };

  const handleUndo = () => {
    // If there is a pending history update, cancel it
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }

    const currentIndex = historyIndex;
    const currentHistoryContent = history[currentIndex];

    // If current content is different from history check point (dirty state),
    // we save the dirty state first, then revert to the checkpoint.
    // This ensures we don't lose the "dirty" text if the user wants to redo later.
    if (content !== currentHistoryContent) {
      const newHistory = [...history.slice(0, currentIndex + 1), content];
      setHistory(newHistory);
      // Index stays same, but content reverts to what was at the index
      setContent(currentHistoryContent);
      return;
    }

    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const handleRedo = () => {
    // If we are dirty, we usually can't redo because we are on a new branch, 
    // unless we treat the dirty state as the "next" step.
    // But in our logic, dirty implies we are ahead of history[index].
    // If we are clean (content === history[index]), we can redo.
    
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
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
    // Uploading a file resets history or adds a new entry? 
    // Usually resets for a new "session" or adds a major checkpoint.
    // Let's treat it as a new edit.
    setContent(newContent);
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

      // Update content and push to history immediately
      setContent(newContent);
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

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900 text-gray-200 overflow-hidden">
      <Toolbar 
        viewMode={viewMode}
        setViewMode={setViewMode}
        onDownload={handleDownload}
        onUpload={handleUpload}
        onClear={() => {
          const empty = '';
          setContent(empty);
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
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Editor Pane */}
        <div className={`
          ${viewMode === ViewMode.SPLIT ? 'w-1/2 border-r border-gray-700' : 'w-full'}
          ${viewMode === ViewMode.PREVIEW ? 'hidden' : 'block'}
          transition-all duration-300 ease-in-out
        `}>
          <Editor 
            value={content} 
            onChange={handleEditorChange} 
            visible={true}
            searchTerm={searchTerm}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
        </div>

        {/* Preview Pane */}
        <div className={`
          ${viewMode === ViewMode.SPLIT ? 'w-1/2' : 'w-full'}
          ${viewMode === ViewMode.EDIT ? 'hidden' : 'block'}
          transition-all duration-300 ease-in-out bg-gray-850
        `}>
          <Preview 
            content={content} 
            visible={true} 
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
    </div>
  );
};

export default App;