import React, { useRef, useState, useEffect } from 'react';
import { 
  FileText, 
  Eye, 
  Columns, 
  Download, 
  Upload, 
  Sparkles, 
  Trash2,
  Search,
  Undo,
  Redo,
  Sun,
  Moon,
  Rows,
  Copy
} from 'lucide-react';
import { ViewMode, AiActionType, Theme, Layout } from '../types';

interface ToolbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onDownload: () => void;
  onUpload: (content: string) => void;
  onClear: () => void;
  onCopy: () => void;
  onAiAction: (action: AiActionType) => void;
  isAiLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: string;
  theme: Theme;
  toggleTheme: () => void;
  layout: Layout;
  toggleLayout: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  viewMode,
  setViewMode,
  onDownload,
  onUpload,
  onClear,
  onCopy,
  onAiAction,
  isAiLoading,
  searchTerm,
  onSearchChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  saveStatus,
  theme,
  toggleTheme,
  layout,
  toggleLayout
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiButtonRef = useRef<HTMLButtonElement>(null);
  
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [aiMenuPos, setAiMenuPos] = useState({ top: 0, left: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUpload(event.target.result as string);
      }
    };
    reader.readAsText(file);
    // Reset value so same file can be selected again
    e.target.value = '';
  };

  const toggleAiMenu = () => {
    if (isAiMenuOpen) {
      setIsAiMenuOpen(false);
      return;
    }

    if (aiButtonRef.current) {
      const rect = aiButtonRef.current.getBoundingClientRect();
      let left = rect.left;
      // Adjust if goes offscreen (w-48 is approx 192px)
      // We check if the menu would overflow the window width
      if (left + 192 > window.innerWidth) {
        left = window.innerWidth - 192 - 16; // 16px padding from right
      }
      // Ensure it doesn't go off the left edge either
      if (left < 0) left = 16;

      setAiMenuPos({
        top: rect.bottom + 6,
        left: left
      });
      setIsAiMenuOpen(true);
    }
  };

  // Close menu on scroll or resize
  useEffect(() => {
    const handleScroll = () => {
      if (isAiMenuOpen) setIsAiMenuOpen(false);
    };
    if (isAiMenuOpen) {
      window.addEventListener('scroll', handleScroll, { capture: true });
      window.addEventListener('resize', handleScroll);
    }
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('resize', handleScroll);
    };
  }, [isAiMenuOpen]);

  const handleAiActionClick = (action: AiActionType) => {
    onAiAction(action);
    setIsAiMenuOpen(false);
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const textColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const inputBg = isDark ? 'bg-gray-800' : 'bg-gray-100';
  const inputBorder = isDark ? 'border-gray-700' : 'border-gray-300';
  const hoverBg = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

  return (
    <>
      <div className={`h-14 ${bgColor} ${borderColor} border-b flex items-center justify-between px-4 select-none shrink-0 transition-colors duration-300 overflow-x-auto custom-scrollbar`}>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-blue-500 font-bold text-lg mr-2 tracking-tight flex items-center gap-2 shrink-0">
            <FileText className="w-5 h-5" /> 
            <span className="hidden sm:inline">MD Studio</span>
          </span>
          
          <span className={`text-xs italic hidden md:inline-block w-32 truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`} title={saveStatus}>
            {saveStatus}
          </span>

          {/* View Toggles */}
          <div className={`flex rounded-lg p-1 space-x-1 shrink-0 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <button
              onClick={() => setViewMode(ViewMode.EDIT)}
              className={`p-1.5 rounded-md transition-colors ${viewMode === ViewMode.EDIT ? (isDark ? 'bg-gray-600 text-white' : 'bg-white text-gray-900 shadow-sm') : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
              title="Edit Only"
              aria-label="Edit Only"
            >
              <FileText size={16} />
            </button>
            <button
              onClick={() => setViewMode(ViewMode.SPLIT)}
              className={`p-1.5 rounded-md transition-colors hidden md:block ${viewMode === ViewMode.SPLIT ? (isDark ? 'bg-gray-600 text-white' : 'bg-white text-gray-900 shadow-sm') : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
              title="Split View"
              aria-label="Split View"
            >
              <Columns size={16} />
            </button>
            <button
              onClick={() => setViewMode(ViewMode.PREVIEW)}
              className={`p-1.5 rounded-md transition-colors ${viewMode === ViewMode.PREVIEW ? (isDark ? 'bg-gray-600 text-white' : 'bg-white text-gray-900 shadow-sm') : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
              title="Preview Only"
              aria-label="Preview Only"
            >
              <Eye size={16} />
            </button>
          </div>

          {/* Layout Toggle (Only visible in Split View) */}
          {viewMode === ViewMode.SPLIT && (
             <button
               onClick={toggleLayout}
               className={`p-1.5 rounded-md transition-colors hidden md:block shrink-0 ${hoverBg} ${textColor}`}
               title={`Switch to ${layout === 'horizontal' ? 'Vertical' : 'Horizontal'} Layout`}
               aria-label={`Switch to ${layout === 'horizontal' ? 'Vertical' : 'Horizontal'} Layout`}
             >
               {layout === 'horizontal' ? <Rows size={16} /> : <Columns size={16} className="rotate-90" />}
             </button>
          )}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
           {/* Undo/Redo */}
           <div className={`flex items-center space-x-1 mr-2 rounded-lg p-1 shrink-0 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className={`p-1.5 rounded-md transition-colors ${canUndo ? (isDark ? 'text-gray-300 hover:bg-gray-600 hover:text-white' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm') : (isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')}`}
                title="Undo (Ctrl+Z)"
                aria-label="Undo (Ctrl+Z)"
              >
                <Undo size={16} />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className={`p-1.5 rounded-md transition-colors ${canRedo ? (isDark ? 'text-gray-300 hover:bg-gray-600 hover:text-white' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm') : (isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')}`}
                title="Redo (Ctrl+Y)"
                aria-label="Redo (Ctrl+Y)"
              >
                <Redo size={16} />
              </button>
           </div>

           {/* Search Bar */}
           <div className="relative group mx-2 hidden sm:block shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`block w-full pl-10 pr-3 py-1.5 border rounded-md leading-5 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors duration-200 ${inputBg} ${inputBorder} ${textColor} ${isDark ? 'placeholder-gray-500 focus:bg-gray-700' : 'placeholder-gray-400 focus:bg-white'}`}
              placeholder="Find text..."
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-md transition-colors shrink-0 ${hoverBg} ${isDark ? 'text-yellow-400' : 'text-gray-600'}`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* AI Actions Button */}
          <div className="relative mr-2 shrink-0">
            <button 
              ref={aiButtonRef}
              onClick={toggleAiMenu}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isAiLoading ? 'bg-purple-900/50 text-purple-300 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
              disabled={isAiLoading}
              aria-label={isAiLoading ? 'AI is thinking' : 'Open AI Assist menu'}
            >
              <Sparkles size={16} />
              <span className="hidden sm:inline">{isAiLoading ? 'Thinking...' : 'AI Assist'}</span>
              <span className="sm:hidden">{isAiLoading ? '...' : 'AI'}</span>
            </button>
          </div>

          <div className={`w-px h-6 mx-2 shrink-0 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />

          <button 
            onClick={onClear}
            className={`p-2 transition-colors rounded-md shrink-0 ${hoverBg} ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
            title="Clear Editor"
            aria-label="Clear Editor"
          >
            <Trash2 size={18} />
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 transition-colors rounded-md shrink-0 ${hoverBg} ${isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-500'}`}
            title="Open Markdown File"
            aria-label="Open Markdown File"
          >
            <Upload size={18} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".md,.txt,.markdown" 
            onChange={handleFileChange}
          />

          <button 
            onClick={onCopy}
            className={`p-2 transition-colors rounded-md shrink-0 ${hoverBg} ${isDark ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-500 hover:text-cyan-500'}`}
            title="Copy to Clipboard"
            aria-label="Copy to Clipboard"
          >
            <Copy size={18} />
          </button>

          <button 
            onClick={onDownload}
            className={`p-2 transition-colors rounded-md shrink-0 ${hoverBg} ${isDark ? 'text-gray-400 hover:text-green-400' : 'text-gray-500 hover:text-green-500'}`}
            title="Save to Disk"
            aria-label="Save to Disk"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* AI Dropdown Menu (Fixed Position) */}
      {isAiMenuOpen && !isAiLoading && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[99] bg-transparent" 
            onClick={() => setIsAiMenuOpen(false)} 
          />
          {/* Menu */}
          <div 
            className={`fixed w-48 border rounded-md shadow-xl overflow-hidden z-[100] animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            style={{ top: aiMenuPos.top, left: aiMenuPos.left }}
          >
            <button onClick={() => handleAiActionClick(AiActionType.PROOFREAD)} className={`w-full text-left px-4 py-2 text-sm transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
              Proofread & Fix
            </button>
            <button onClick={() => handleAiActionClick(AiActionType.CONTINUE)} className={`w-full text-left px-4 py-2 text-sm transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
              Continue Writing
            </button>
            <button onClick={() => handleAiActionClick(AiActionType.SUMMARIZE)} className={`w-full text-left px-4 py-2 text-sm transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
              Generate Summary
            </button>
             <button onClick={() => handleAiActionClick(AiActionType.FORMAT)} className={`w-full text-left px-4 py-2 text-sm transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
              Format Document
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default Toolbar;