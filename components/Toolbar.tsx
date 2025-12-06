import React, { useRef } from 'react';
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
  Redo
} from 'lucide-react';
import { ViewMode, AiActionType } from '../types';

interface ToolbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onDownload: () => void;
  onUpload: (content: string) => void;
  onClear: () => void;
  onAiAction: (action: AiActionType) => void;
  isAiLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  viewMode,
  setViewMode,
  onDownload,
  onUpload,
  onClear,
  onAiAction,
  isAiLoading,
  searchTerm,
  onSearchChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="h-14 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4 select-none shrink-0">
      <div className="flex items-center space-x-2">
        <span className="text-blue-400 font-bold text-lg mr-4 tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5" /> MD Studio
        </span>
        
        {/* View Toggles */}
        <div className="flex bg-gray-800 rounded-lg p-1 space-x-1">
          <button
            onClick={() => setViewMode(ViewMode.EDIT)}
            className={`p-1.5 rounded-md transition-colors ${viewMode === ViewMode.EDIT ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Edit Only"
          >
            <FileText size={16} />
          </button>
          <button
            onClick={() => setViewMode(ViewMode.SPLIT)}
            className={`p-1.5 rounded-md transition-colors hidden md:block ${viewMode === ViewMode.SPLIT ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Split View"
          >
            <Columns size={16} />
          </button>
          <button
            onClick={() => setViewMode(ViewMode.PREVIEW)}
            className={`p-1.5 rounded-md transition-colors ${viewMode === ViewMode.PREVIEW ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Preview Only"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
         {/* Undo/Redo */}
         <div className="flex items-center space-x-1 mr-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-md transition-colors ${canUndo ? 'text-gray-300 hover:bg-gray-600 hover:text-white' : 'text-gray-600 cursor-not-allowed'}`}
              title="Undo (Ctrl+Z)"
            >
              <Undo size={16} />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-md transition-colors ${canRedo ? 'text-gray-300 hover:bg-gray-600 hover:text-white' : 'text-gray-600 cursor-not-allowed'}`}
              title="Redo (Ctrl+Y)"
            >
              <Redo size={16} />
            </button>
         </div>

         {/* Search Bar */}
         <div className="relative group mx-2 hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-1.5 border border-gray-700 rounded-md leading-5 bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
            placeholder="Find text..."
          />
        </div>

        {/* AI Actions Dropdown Group */}
        <div className="relative group mr-2">
          <button 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isAiLoading ? 'bg-purple-900/50 text-purple-300 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
            disabled={isAiLoading}
          >
            <Sparkles size={16} />
            <span className="hidden sm:inline">{isAiLoading ? 'Thinking...' : 'AI Assist'}</span>
            <span className="sm:hidden">{isAiLoading ? '...' : 'AI'}</span>
          </button>
          
          {!isAiLoading && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-xl overflow-hidden z-50 hidden group-hover:block">
              <button onClick={() => onAiAction(AiActionType.PROOFREAD)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                Proofread & Fix
              </button>
              <button onClick={() => onAiAction(AiActionType.CONTINUE)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                Continue Writing
              </button>
              <button onClick={() => onAiAction(AiActionType.SUMMARIZE)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                Generate Summary
              </button>
               <button onClick={() => onAiAction(AiActionType.FORMAT)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                Format Document
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-700 mx-2" />

        <button 
          onClick={onClear}
          className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-md hover:bg-gray-800"
          title="Clear Editor"
        >
          <Trash2 size={18} />
        </button>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-blue-400 transition-colors rounded-md hover:bg-gray-800"
          title="Open Markdown File"
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
          onClick={onDownload}
          className="p-2 text-gray-400 hover:text-green-400 transition-colors rounded-md hover:bg-gray-800"
          title="Save to Disk"
        >
          <Download size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;