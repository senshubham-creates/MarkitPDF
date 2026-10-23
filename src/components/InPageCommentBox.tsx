import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Type,
  Palette,
  Trash2,
  Move,
  Minimize2,
  Maximize2,
  Check,
  MessageSquare
} from 'lucide-react';
import { FontFamily, FontSize, InPageTextBox } from '../types/pdf';

interface InPageCommentBoxProps {
  box: InPageTextBox;
  onUpdate: (updated: InPageTextBox) => void;
  onDelete: (id: string) => void;
  pageWidth?: number;
  pageHeight?: number;
  isReadOnly?: boolean;
}

const FONT_FAMILIES: { id: FontFamily; label: string; style: string }[] = [
  { id: 'sans', label: 'Sans (Segoe/SF)', style: 'font-sans' },
  { id: 'serif', label: 'Serif (Georgia)', style: 'font-serif' },
  { id: 'mono', label: 'Mono (Cascadia)', style: 'font-mono' },
  { id: 'handwriting', label: 'Handwriting', style: 'font-serif italic' },
];

const FONT_SIZES: { id: FontSize; label: string; className: string }[] = [
  { id: 'xs', label: '11px', className: 'text-[11px]' },
  { id: 'sm', label: '13px', className: 'text-[13px]' },
  { id: 'base', label: '15px', className: 'text-[15px]' },
  { id: 'lg', label: '18px', className: 'text-[18px]' },
  { id: 'xl', label: '22px', className: 'text-[22px]' },
];

const TEXT_COLORS = [
  { hex: '#1e1e1e', label: 'Black' },
  { hex: '#dc2626', label: 'Red' },
  { hex: '#2563eb', label: 'Blue' },
  { hex: '#16a34a', label: 'Green' },
  { hex: '#d97706', label: 'Amber' },
  { hex: '#7c3aed', label: 'Purple' },
];

const BG_COLORS = [
  { hex: '#fef9c3', border: '#fde047', label: 'Yellow Note' },
  { hex: '#ffffff', border: '#e2e8f0', label: 'White Card' },
  { hex: '#dbeafe', border: '#93c5fd', label: 'Soft Blue' },
  { hex: '#dcfce7', border: '#86efac', label: 'Mint Green' },
  { hex: '#fee2e2', border: '#fca5a5', label: 'Rose' },
  { hex: '#f3e8ff', border: '#d8b4fe', label: 'Lavender' },
  { hex: 'rgba(255,255,255,0.7)', border: 'rgba(255,255,255,0.9)', label: 'Glass' },
];

export const InPageCommentBox: React.FC<InPageCommentBoxProps> = ({
  box,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialBoxX: number; initialBoxY: number }>({
    startX: 0,
    startY: 0,
    initialBoxX: 0,
    initialBoxY: 0,
  });

  const getFontFamilyStyle = (family: FontFamily) => {
    switch (family) {
      case 'serif':
        return 'Georgia, serif';
      case 'mono':
        return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Cascadia Code, monospace';
      case 'handwriting':
        return 'Caveat, "Comic Sans MS", cursive, sans-serif';
      case 'sans':
      default:
        return 'Segoe UI, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", sans-serif';
    }
  };

  const getFontSizeClass = (size: FontSize) => {
    switch (size) {
      case 'xs':
        return 'text-[11px] leading-tight';
      case 'sm':
        return 'text-[13px] leading-snug';
      case 'lg':
        return 'text-[18px] leading-normal';
      case 'xl':
        return 'text-[22px] leading-relaxed';
      case 'base':
      default:
        return 'text-[15px] leading-normal';
    }
  };

  // Drag handlers
  const handleDragMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialBoxX: box.x,
      initialBoxY: box.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const parent = (e.currentTarget.closest('[data-page-number]') as HTMLElement);
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const deltaX = ((moveEvent.clientX - dragStartRef.current.startX) / rect.width) * 100;
      const deltaY = ((moveEvent.clientY - dragStartRef.current.startY) / rect.height) * 100;

      const newX = Math.max(2, Math.min(85, dragStartRef.current.initialBoxX + deltaX));
      const newY = Math.max(2, Math.min(90, dragStartRef.current.initialBoxY + deltaY));

      onUpdate({ ...box, x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10 });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Minimized view (compact sticky pin)
  if (box.isMinimized) {
    return (
      <div
        style={{ left: `${box.x}%`, top: `${box.y}%` }}
        className="absolute z-20 group cursor-pointer"
        onClick={e => {
          e.stopPropagation();
          onUpdate({ ...box, isMinimized: false });
        }}
        title={`Click to expand note: "${box.text.substring(0, 30)}..."`}
      >
        <div
          style={{ backgroundColor: box.bgColor, borderColor: box.borderColor || '#cbd5e1', color: box.color }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-md border hover:scale-105 transition-all text-xs font-medium"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="max-w-[120px] truncate">{box.text || 'Note'}</span>
          <Maximize2 className="w-3 h-3 opacity-60 ml-0.5" />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        left: `${box.x}%`,
        top: `${box.y}%`,
        backgroundColor: box.bgColor,
        borderColor: box.borderColor || '#e2e8f0',
        width: box.width ? `${box.width}px` : '240px',
      }}
      onClick={e => e.stopPropagation()}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => {
        if (!isEditing) setShowToolbar(false);
      }}
      className={`absolute z-20 rounded-lg shadow-lg border p-2.5 transition-all duration-150 backdrop-blur-xs select-text ${
        isDragging ? 'opacity-85 shadow-2xl scale-[1.02]' : ''
      }`}
    >
      {/* Top Header & Drag Handle */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-black/10 dark:border-white/10 select-none text-[11px] text-gray-500">
        <div
          onMouseDown={handleDragMouseDown}
          className="flex items-center gap-1 cursor-grab active:cursor-grabbing hover:text-black dark:hover:text-white"
          title="Drag note across page"
        >
          <Move className="w-3 h-3 text-[var(--accent)]" />
          <span className="font-semibold text-[10px] uppercase tracking-wider">Comment Box</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Minimize */}
          <button
            onClick={() => onUpdate({ ...box, isMinimized: true })}
            className="p-0.5 rounded hover:bg-black/10 text-gray-500 hover:text-gray-800"
            title="Minimize note pin"
          >
            <Minimize2 className="w-3 h-3" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(box.id)}
            className="p-0.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete comment box"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Formatting Ribbon for Text Box */}
      {showToolbar && (
        <div className="mb-2 p-1.5 rounded-md bg-white/95 dark:bg-zinc-900/95 shadow-md border border-black/10 dark:border-white/15 text-xs flex flex-wrap items-center gap-1 select-none animate-in fade-in duration-150">
          {/* Bold, Italic, Underline */}
          <button
            onClick={() => onUpdate({ ...box, isBold: !box.isBold })}
            className={`p-1 rounded ${box.isBold ? 'bg-[var(--accent)] text-white' : 'hover:bg-black/5 text-gray-700 dark:text-gray-300'}`}
            title="Bold"
          >
            <Bold className="w-3 h-3" />
          </button>

          <button
            onClick={() => onUpdate({ ...box, isItalic: !box.isItalic })}
            className={`p-1 rounded ${box.isItalic ? 'bg-[var(--accent)] text-white' : 'hover:bg-black/5 text-gray-700 dark:text-gray-300'}`}
            title="Italic"
          >
            <Italic className="w-3 h-3" />
          </button>

          <button
            onClick={() => onUpdate({ ...box, isUnderline: !box.isUnderline })}
            className={`p-1 rounded ${box.isUnderline ? 'bg-[var(--accent)] text-white' : 'hover:bg-black/5 text-gray-700 dark:text-gray-300'}`}
            title="Underline"
          >
            <Underline className="w-3 h-3" />
          </button>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-0.5" />

          {/* Font Family Selector */}
          <select
            value={box.fontFamily}
            onChange={e => onUpdate({ ...box, fontFamily: e.target.value as FontFamily })}
            className="text-[10px] bg-transparent border border-gray-300 dark:border-gray-700 rounded px-1 py-0.5 text-gray-800 dark:text-gray-200 outline-hidden"
            title="Font Family"
          >
            {FONT_FAMILIES.map(f => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Font Size Selector */}
          <select
            value={box.fontSize}
            onChange={e => onUpdate({ ...box, fontSize: e.target.value as FontSize })}
            className="text-[10px] bg-transparent border border-gray-300 dark:border-gray-700 rounded px-1 py-0.5 text-gray-800 dark:text-gray-200 outline-hidden"
            title="Font Size"
          >
            {FONT_SIZES.map(s => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-0.5" />

          {/* Text Color Picker */}
          <div className="flex items-center gap-0.5" title="Text Color">
            {TEXT_COLORS.map(c => (
              <button
                key={c.hex}
                onClick={() => onUpdate({ ...box, color: c.hex })}
                style={{ backgroundColor: c.hex }}
                className={`w-3.5 h-3.5 rounded-full border border-black/20 ${box.color === c.hex ? 'ring-2 ring-[var(--accent)] scale-110' : ''}`}
                title={c.label}
              />
            ))}
          </div>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-0.5" />

          {/* Background Note Color Picker */}
          <div className="flex items-center gap-0.5" title="Note Background">
            {BG_COLORS.map(b => (
              <button
                key={b.hex}
                onClick={() => onUpdate({ ...box, bgColor: b.hex, borderColor: b.border })}
                style={{ backgroundColor: b.hex }}
                className={`w-3.5 h-3.5 rounded-full border border-black/20 ${box.bgColor === b.hex ? 'ring-2 ring-[var(--accent)] scale-110' : ''}`}
                title={b.label}
              />
            ))}
          </div>
        </div>
      )}

      {/* In-Place Textarea Content */}
      <textarea
        value={box.text}
        onChange={e => onUpdate({ ...box, text: e.target.value })}
        onFocus={() => {
          setIsEditing(true);
          setShowToolbar(true);
        }}
        onBlur={() => setIsEditing(false)}
        placeholder="Type note or comment on PDF..."
        style={{
          fontFamily: getFontFamilyStyle(box.fontFamily),
          color: box.color,
        }}
        className={`w-full min-h-[58px] resize-y bg-transparent outline-hidden border-none p-1 placeholder:text-gray-400 ${getFontSizeClass(
          box.fontSize
        )} ${box.isBold ? 'font-bold' : 'font-normal'} ${box.isItalic ? 'italic' : ''} ${
          box.isUnderline ? 'underline' : ''
        }`}
      />
    </div>
  );
};
