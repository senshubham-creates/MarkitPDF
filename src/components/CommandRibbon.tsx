import React from 'react';
import {
  Highlighter,
  Link2,
  StickyNote,
  Scan,
  ZoomIn,
  ZoomOut,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Copy,
  RotateCw,
  Columns,
  BookOpen,
  FileCheck,
  PlusCircle,
  FileDown,
  Type,
  Printer,
  Underline
} from 'lucide-react';
import { ActiveTool, HighlightColor, ThemeMode } from '../types/pdf';

export type RibbonTab = 'home' | 'annotate' | 'view' | 'notion';

interface CommandRibbonProps {
  activeTab: RibbonTab;
  onTabChange: (tab: RibbonTab) => void;
  activeTool: ActiveTool;
  onToolChange: (tool: ActiveTool) => void;
  activeColor: HighlightColor;
  onColorChange: (color: HighlightColor) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  isContinuousMode: boolean;
  onToggleContinuousMode: () => void;
  onNewContinuousExcerpt: () => void;
  activeExcerptTitle?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  viewMode: 'single' | 'continuous' | 'two-page';
  onViewModeChange: (mode: 'single' | 'continuous' | 'two-page') => void;
  onOpenSearch: () => void;
  onOpenNotionModal: () => void;
  onQuickCopyNotion: () => void;
  onDownloadMarkdown: () => void;
  onDownloadCSV: () => void;
  onDownloadJSON: () => void;
  onRotatePage: () => void;
  onToggleInvertDocument: () => void;
  isInvertedDocument: boolean;
  onSaveAsPdf: () => void;
}

const COLOR_MAP: { id: HighlightColor; label: string; priorityLabel: string; bg: string; border: string }[] = [
  { id: 'red', label: 'Critical', priorityLabel: 'P1 Critical', bg: '#fecaca', border: '#ef4444' },
  { id: 'orange', label: 'Important', priorityLabel: 'P2 Important', bg: '#fed7aa', border: '#f97316' },
  { id: 'yellow', label: 'Standard', priorityLabel: 'P3 Standard', bg: '#fef08a', border: '#eab308' },
  { id: 'green', label: 'Verified', priorityLabel: 'P4 Verified', bg: '#bbf7d0', border: '#22c55e' },
  { id: 'blue', label: 'Concept', priorityLabel: 'Concept', bg: '#bfdbfe', border: '#3b82f6' },
  { id: 'purple', label: 'Insight', priorityLabel: 'Insight', bg: '#e9d5ff', border: '#a855f7' },
  { id: 'pink', label: 'Question', priorityLabel: 'Question', bg: '#fbcfe8', border: '#ec4899' },
];

export const CommandRibbon: React.FC<CommandRibbonProps> = ({
  activeTab,
  onTabChange,
  activeTool,
  onToolChange,
  activeColor,
  onColorChange,
  theme,
  onThemeChange,
  isContinuousMode,
  onToggleContinuousMode,
  onNewContinuousExcerpt,
  activeExcerptTitle,
  currentPage,
  totalPages,
  onPageChange,
  zoom,
  onZoomChange,
  viewMode,
  onViewModeChange,
  onOpenSearch,
  onOpenNotionModal,
  onQuickCopyNotion,
  onDownloadMarkdown,
  onDownloadCSV,
  onDownloadJSON,
  onRotatePage,
  onToggleInvertDocument,
  isInvertedDocument,
  onSaveAsPdf,
}) => {
  return (
    <nav
      className={`border-b border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors select-none ${
        theme === 'macos-glass'
          ? 'bg-white/40 backdrop-blur-2xl border-white/50 shadow-xs'
          : 'bg-[var(--bg-ribbon)]'
      }`}
      aria-label="Ribbon Navigation"
    >
      {/* Top Ribbon Tabs - Styled as Liquid Glass Pill in macOS theme */}
      <div className={`flex items-center gap-1 text-xs ${
        theme === 'macos-glass'
          ? 'px-3 pt-1.5'
          : 'px-3 pt-1 border-b border-[var(--border-subtle)]'
      }`}>
        <div className={`flex items-center gap-1 ${
          theme === 'macos-glass'
            ? 'liquid-glass-pill p-0.5 border border-white/70 shadow-xs'
            : ''
        }`}>
          <button
            onClick={() => onTabChange('home')}
            className={`px-3 py-1 font-medium transition-all rounded-full ${
              theme === 'macos-glass'
                ? activeTab === 'home'
                  ? 'liquid-glass-tab-active bg-white text-zinc-900 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-black'
                : activeTab === 'home'
                  ? 'border-b-2 border-[var(--accent)] text-[var(--accent)] font-semibold rounded-none'
                  : 'border-b-2 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-none'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onTabChange('annotate')}
            className={`px-3 py-1 font-medium transition-all rounded-full ${
              theme === 'macos-glass'
                ? activeTab === 'annotate'
                  ? 'liquid-glass-tab-active bg-white text-zinc-900 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-black'
                : activeTab === 'annotate'
                  ? 'border-b-2 border-[var(--accent)] text-[var(--accent)] font-semibold rounded-none'
                  : 'border-b-2 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-none'
            }`}
          >
            Annotate & Margins
          </button>
          <button
            onClick={() => onTabChange('view')}
            className={`px-3 py-1 font-medium transition-all rounded-full ${
              theme === 'macos-glass'
                ? activeTab === 'view'
                  ? 'liquid-glass-tab-active bg-white text-zinc-900 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-black'
                : activeTab === 'view'
                  ? 'border-b-2 border-[var(--accent)] text-[var(--accent)] font-semibold rounded-none'
                  : 'border-b-2 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-none'
            }`}
          >
            View & Layout
          </button>
          <button
            onClick={() => onTabChange('notion')}
            className={`px-3 py-1 font-medium transition-all rounded-full flex items-center gap-1.5 ${
              theme === 'macos-glass'
                ? activeTab === 'notion'
                  ? 'liquid-glass-tab-active bg-white text-zinc-900 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-black'
                : activeTab === 'notion'
                  ? 'border-b-2 border-[var(--accent)] text-[var(--accent)] font-semibold rounded-none'
                  : 'border-b-2 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-none'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Notion Export</span>
          </button>
        </div>
      </div>

      {/* Ribbon Command Strip */}
      <div className="px-3 py-1.5 flex items-center justify-between gap-3 overflow-x-auto min-h-[52px]">
        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <div className="flex items-center gap-3">
            {/* Continuous Excerpt Highlighting Special Feature */}
            <div className="flex items-center gap-2 p-1 rounded-lg bg-[var(--accent-light)]/60 border border-[var(--border-subtle)]">
              <button
                onClick={onToggleContinuousMode}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isContinuousMode
                    ? 'bg-[var(--accent)] text-white shadow-xs font-semibold'
                    : 'bg-white/80 dark:bg-black/30 text-[var(--text-primary)] hover:bg-white'
                }`}
                aria-pressed={isContinuousMode}
                title="When ON: Highlights made with text gaps merge into one continuous excerpt with [...] elisions automatically."
              >
                <Link2 className="w-4 h-4" />
                <span>Continuous Highlight:</span>
                <span className="font-bold uppercase tracking-wider text-[11px]">
                  {isContinuousMode ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                onClick={onNewContinuousExcerpt}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/60 dark:hover:bg-white/10"
                title="Start a new continuous excerpt thread"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>New Excerpt</span>
              </button>
            </div>

            <div className="h-6 w-px bg-[var(--border-subtle)]" />

            {/* Tool Selection */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onToolChange('highlight')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
                  activeTool === 'highlight' || activeTool === 'continuous'
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]'
                }`}
                title="Highlight text in selected priority color"
              >
                <Highlighter className="w-4 h-4" />
                <span>Highlight</span>
              </button>

              <button
                onClick={() => onToolChange('underline')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
                  activeTool === 'underline'
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]'
                }`}
                title="Underline text in selected priority color"
              >
                <Underline className="w-4 h-4" />
                <span>Underline</span>
              </button>

              <button
                onClick={() => onToolChange('text-box')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
                  activeTool === 'text-box'
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]'
                }`}
                title="Add comment box or text directly in the PDF with custom fonts, colors, and formatting"
              >
                <Type className="w-4 h-4" />
                <span>Text on PDF</span>
              </button>

              <button
                onClick={() => onToolChange('margin-note')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
                  activeTool === 'margin-note'
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]'
                }`}
              >
                <StickyNote className="w-4 h-4" />
                <span>Margin Note</span>
              </button>

              <button
                onClick={() => onToolChange('area')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
                  activeTool === 'area'
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]'
                }`}
              >
                <Scan className="w-4 h-4" />
                <span>Area Box</span>
              </button>
            </div>

            <div className="h-6 w-px bg-[var(--border-subtle)]" />

            {/* Color Swatches with Priority */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/5 dark:bg-white/5">
              <span className="text-[11px] text-[var(--text-secondary)] mr-0.5">Priority:</span>
              {COLOR_MAP.map(c => (
                <button
                  key={c.id}
                  onClick={() => onColorChange(c.id)}
                  style={{ backgroundColor: c.bg, borderColor: c.border }}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    activeColor === c.id ? 'scale-125 shadow-xs ring-2 ring-[var(--accent)] ring-offset-1' : 'hover:scale-110 opacity-80'
                  }`}
                  title={`${c.priorityLabel} (${c.label})`}
                  aria-label={`${c.label} color`}
                />
              ))}
            </div>

            <div className="h-6 w-px bg-[var(--border-subtle)]" />

            {/* Save As PDF Permanent Button */}
            <button
              onClick={onSaveAsPdf}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[var(--accent)] text-white hover:opacity-90 shadow-xs transition-all shrink-0"
              title="Save As PDF permanently with all annotations and notes baked into the file"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Save As PDF</span>
            </button>

            {/* Search */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]"
              title="Search in PDF (Ctrl+F)"
            >
              <Search className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>Search</span>
              <kbd className="text-[10px] bg-black/10 dark:bg-white/10 px-1 rounded text-[var(--text-secondary)]">Ctrl+F</kbd>
            </button>
          </div>
        )}

        {/* TAB: ANNOTATE */}
        {activeTab === 'annotate' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-1 rounded-lg bg-[var(--accent-light)]/60 border border-[var(--border-subtle)]">
              <button
                onClick={onToggleContinuousMode}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isContinuousMode ? 'bg-[var(--accent)] text-white shadow-xs' : 'bg-white/80 dark:bg-black/30'
                }`}
              >
                <Link2 className="w-4 h-4" />
                <span>Continuous Excerpt Mode: {isContinuousMode ? 'Active' : 'Standby'}</span>
              </button>

              <button
                onClick={onNewContinuousExcerpt}
                className="px-2 py-1 text-xs rounded bg-white/70 dark:bg-black/30 hover:bg-white font-medium text-[var(--accent)]"
              >
                + New Thread
              </button>
            </div>

            {/* Annotation Tools Selection in Annotation Bar */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onToolChange('highlight')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
                  activeTool === 'highlight' || activeTool === 'continuous'
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-semibold shadow-xs'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]'
                }`}
                title="Highlight tool"
              >
                <Highlighter className="w-4 h-4" />
                <span>Highlight</span>
              </button>

              <button
                onClick={() => onToolChange('underline')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
                  activeTool === 'underline'
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-semibold shadow-xs'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]'
                }`}
                title="Underline tool in priority colors"
              >
                <Underline className="w-4 h-4" />
                <span>Underline</span>
              </button>

              <button
                onClick={() => onToolChange('text-box')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
                  activeTool === 'text-box'
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-semibold shadow-xs'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]'
                }`}
                title="Text feature: Add rich text or comment box directly on PDF page"
              >
                <Type className="w-4 h-4" />
                <span>Text on PDF</span>
              </button>

              <button
                onClick={() => onToolChange('margin-note')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
                  activeTool === 'margin-note'
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-semibold shadow-xs'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]'
                }`}
                title="Margin note tool"
              >
                <StickyNote className="w-4 h-4" />
                <span>Margin Note</span>
              </button>

              <button
                onClick={() => onToolChange('area')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
                  activeTool === 'area'
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-semibold shadow-xs'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]'
                }`}
                title="Area Box tool"
              >
                <Scan className="w-4 h-4" />
                <span>Area Box</span>
              </button>
            </div>

            <div className="h-6 w-px bg-[var(--border-subtle)]" />

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[var(--text-secondary)]">Color:</span>
              {COLOR_MAP.map(c => (
                <button
                  key={c.id}
                  onClick={() => onColorChange(c.id)}
                  style={{ backgroundColor: c.bg, borderColor: c.border }}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    activeColor === c.id ? 'scale-125 shadow-xs ring-2 ring-[var(--accent)] ring-offset-1' : 'hover:scale-110 opacity-80'
                  }`}
                  title={`${c.label} color`}
                />
              ))}
            </div>

            <div className="h-6 w-px bg-[var(--border-subtle)]" />

            <div className="text-[11px] text-[var(--text-secondary)] max-w-sm leading-tight">
              💡 Tip: Highlight line 1-2, then highlight line 5-6 below to automatically merge them into a continuous excerpt separated by <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-[10px]">[...]</code>.
            </div>
          </div>
        )}

        {/* TAB: VIEW */}
        {activeTab === 'view' && (
          <div className="flex items-center gap-3">
            {/* View Mode */}
            <div className="flex items-center gap-1 p-0.5 rounded bg-black/5 dark:bg-white/5">
              <button
                onClick={() => onViewModeChange('single')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 ${
                  viewMode === 'single' ? 'bg-white dark:bg-black/40 text-[var(--accent)] font-semibold shadow-xs' : 'text-[var(--text-secondary)]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Single Page</span>
              </button>
              <button
                onClick={() => onViewModeChange('continuous')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 ${
                  viewMode === 'continuous' ? 'bg-white dark:bg-black/40 text-[var(--accent)] font-semibold shadow-xs' : 'text-[var(--text-secondary)]'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Continuous Scroll</span>
              </button>
              <button
                onClick={() => onViewModeChange('two-page')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 ${
                  viewMode === 'two-page' ? 'bg-white dark:bg-black/40 text-[var(--accent)] font-semibold shadow-xs' : 'text-[var(--text-secondary)]'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>2-Page Spread</span>
              </button>
            </div>

            <div className="h-6 w-px bg-[var(--border-subtle)]" />

            {/* Zoom presets */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onZoomChange(Math.max(0.5, zoom - 0.15))}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)]"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono w-12 text-center text-[var(--text-primary)]">
                {Math.round(zoom * 100)}%
              </span>

              <button
                onClick={() => onZoomChange(Math.min(2.5, zoom + 0.15))}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)]"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={() => onZoomChange(1.0)}
                className="px-2 py-0.5 rounded text-xs hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)]"
              >
                100%
              </button>
              <button
                onClick={() => onZoomChange(1.35)}
                className="px-2 py-0.5 rounded text-xs hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)]"
              >
                Fit Width
              </button>
            </div>

            <div className="h-6 w-px bg-[var(--border-subtle)]" />

            {/* Rotate & Document Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={onRotatePage}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)]"
                title="Rotate 90°"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate</span>
              </button>

              <button
                onClick={onToggleInvertDocument}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${
                  isInvertedDocument
                    ? 'border-[var(--accent)] text-[var(--accent)] font-semibold'
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'
                }`}
                title="Inverts page canvas for night reading"
              >
                <span>Night Page Filter: {isInvertedDocument ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="h-6 w-px bg-[var(--border-subtle)]" />

            {/* Quick One-Click Theme Switcher */}
            <div className="flex items-center gap-1 p-0.5 rounded bg-black/5 dark:bg-white/5">
              <span className="text-[11px] text-[var(--text-secondary)] px-1 font-medium">Theme:</span>
              <button
                onClick={() => onThemeChange('win11-light')}
                className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 transition-all ${
                  theme === 'win11-light' ? 'bg-white text-slate-900 font-semibold shadow-xs ring-1 ring-black/10' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Standard Light Theme"
              >
                <span>🪟 Light</span>
              </button>
              <button
                onClick={() => onThemeChange('win11-dark')}
                className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 transition-all ${
                  theme === 'win11-dark' ? 'bg-zinc-800 text-white font-semibold shadow-xs ring-1 ring-white/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Dark Theme for Low-Light Viewing"
              >
                <span>🌙 Dark</span>
              </button>
              <button
                onClick={() => onThemeChange('sepia')}
                className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 transition-all ${
                  theme === 'sepia' ? 'bg-[#fbf5e6] text-[#382e25] font-semibold shadow-xs ring-1 ring-amber-900/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Warm Sepia for Traditional Reading"
              >
                <span>📜 Sepia</span>
              </button>
              <button
                onClick={() => onThemeChange('nord')}
                className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 transition-all ${
                  theme === 'nord' ? 'bg-[#2e3440] text-[#88c0d0] font-semibold shadow-xs ring-1 ring-cyan-500/30' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Nord Theme"
              >
                <span>❄️ Nord</span>
              </button>
              <button
                onClick={() => onThemeChange('macos-glass')}
                className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 transition-all ${
                  theme === 'macos-glass' ? 'bg-white/90 text-[#0071e3] font-semibold shadow-xs ring-1 ring-blue-500/30' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="macOS Liquid Glass Theme"
              >
                <span>💎 Glass</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: NOTION EXPORT */}
        {activeTab === 'notion' && (
          <div className="flex items-center gap-3">
            <button
              onClick={onQuickCopyNotion}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
              title="Copies formatted Notion Callouts, Quotes, and Excerpts to clipboard. Ready to paste directly into Notion!"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy for Notion (Paste Ready)</span>
            </button>

            <button
              onClick={onDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--card-bg)] border border-[var(--border-subtle)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)] transition-colors"
              title="Download .md file formatted for Notion's native importer"
            >
              <FileDown className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Download Notion .md</span>
            </button>

            <button
              onClick={onDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--card-bg)] border border-[var(--border-subtle)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)] transition-colors"
              title="Download CSV formatted for Notion Databases"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span>Download Notion DB (.csv)</span>
            </button>

            <button
              onClick={onDownloadJSON}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[var(--card-bg)] border border-[var(--border-subtle)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] transition-colors"
              title="Official Notion Block Objects JSON format"
            >
              <span>Notion API (.json)</span>
            </button>

            <div className="h-6 w-px bg-[var(--border-subtle)]" />

            <button
              onClick={onOpenNotionModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-[var(--accent)] hover:underline font-medium"
            >
              <Maximize className="w-3.5 h-3.5" />
              <span>Open Notion Export Center</span>
            </button>
          </div>
        )}

        {/* Global Page Navigator (Right side of ribbon) */}
        <div className="flex items-center gap-1 text-xs shrink-0 pl-2 border-l border-[var(--border-subtle)]">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 font-mono text-[11px] px-1">
            <span className="font-semibold text-[var(--text-primary)]">{currentPage}</span>
            <span className="text-[var(--text-secondary)]">/</span>
            <span className="text-[var(--text-secondary)]">{totalPages}</span>
          </div>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};
