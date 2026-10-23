import React from 'react';
import {
  Link2,
  Plus,
  Highlighter,
  Underline,
  Type,
  StickyNote,
  Copy,
  X
} from 'lucide-react';
import { ContinuousExcerpt, HighlightColor } from '../types/pdf';

interface SelectionPopoverProps {
  position: { x: number; y: number };
  selectedText: string;
  activeExcerpt?: ContinuousExcerpt;
  activeColor: HighlightColor;
  onColorChange: (color: HighlightColor) => void;
  onAppendToActiveExcerpt: () => void;
  onStartNewContinuousExcerpt: () => void;
  onStandaloneHighlight: () => void;
  onUnderline?: () => void;
  onAddTextBox?: () => void;
  onAddMarginNote: () => void;
  onClose: () => void;
}

const COLORS: HighlightColor[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];

export const SelectionPopover: React.FC<SelectionPopoverProps> = ({
  position,
  selectedText,
  activeExcerpt,
  activeColor,
  onColorChange,
  onAppendToActiveExcerpt,
  onStartNewContinuousExcerpt,
  onStandaloneHighlight,
  onUnderline,
  onAddTextBox,
  onAddMarginNote,
  onClose,
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText);
    onClose();
  };

  return (
    <div
      className="fixed z-50 transform -translate-x-1/2 -translate-y-full -mt-2 bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-xl rounded-lg p-1.5 flex flex-col gap-1.5 min-w-[280px] max-w-[340px] animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      role="dialog"
      aria-label="Text Selection Actions"
    >
      {/* Top Header: Truncated quote preview & close */}
      <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] px-1 border-b border-[var(--border-subtle)] pb-1">
        <span className="truncate italic max-w-[240px]">"{selectedText.trim()}"</span>
        <button
          onClick={onClose}
          className="hover:text-[var(--text-primary)] p-0.5 rounded"
          aria-label="Close Popover"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Main Action Buttons */}
      <div className="flex flex-col gap-1 text-xs">
        {/* Append to active continuous excerpt (Key Feature) */}
        {activeExcerpt ? (
          <button
            onClick={onAppendToActiveExcerpt}
            className="flex items-center justify-between px-2 py-1.5 rounded-md bg-[var(--accent)] text-white hover:opacity-95 font-medium transition-all text-left shadow-xs"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Link2 className="w-3.5 h-3.5 shrink-0" />
              <div className="truncate">
                <span className="font-semibold">Append to Excerpt:</span>{' '}
                <span className="opacity-90 italic">"{activeExcerpt.title}"</span>
              </div>
            </div>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono shrink-0 ml-1">
              Part {activeExcerpt.segments.length + 1}
            </span>
          </button>
        ) : null}

        {/* Start new continuous excerpt */}
        <button
          onClick={onStartNewContinuousExcerpt}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-left transition-colors font-medium text-[var(--text-primary)]"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Start New Continuous Excerpt</span>
        </button>

        {/* Standalone highlight */}
        <button
          onClick={onStandaloneHighlight}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-left transition-colors text-[var(--text-primary)]"
        >
          <Highlighter className="w-3.5 h-3.5 text-amber-500" />
          <span>Highlight Selection</span>
        </button>

        {/* Underline text */}
        {onUnderline && (
          <button
            onClick={onUnderline}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-left transition-colors text-[var(--text-primary)]"
          >
            <Underline className="w-3.5 h-3.5 text-blue-500" />
            <span>Underline Text</span>
          </button>
        )}

        {/* Add Text / Comment Box directly */}
        {onAddTextBox && (
          <button
            onClick={onAddTextBox}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-left transition-colors text-[var(--text-primary)]"
          >
            <Type className="w-3.5 h-3.5 text-purple-500" />
            <span>Add Comment Box on PDF</span>
          </button>
        )}

        {/* Add Margin Note directly */}
        <button
          onClick={onAddMarginNote}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-left transition-colors text-[var(--text-primary)]"
        >
          <StickyNote className="w-3.5 h-3.5 text-emerald-500" />
          <span>Create with Margin Note</span>
        </button>
      </div>

      {/* Bottom Color Bar & Quick Copy */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)] px-1">
        <div className="flex items-center gap-1">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              className={`w-4 h-4 rounded-full transition-transform ${
                activeColor === c ? 'scale-125 ring-2 ring-[var(--accent)]' : 'hover:scale-110 opacity-70'
              } highlight-${c}`}
              aria-label={`Highlight with ${c}`}
            />
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-1.5 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Copy className="w-3 h-3" />
          <span>Copy</span>
        </button>
      </div>
    </div>
  );
};
