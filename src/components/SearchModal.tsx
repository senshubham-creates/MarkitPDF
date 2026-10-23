import React, { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { BuiltinDocument } from '../data/sampleDocuments';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: BuiltinDocument;
  currentPage: number;
  onJumpToPage: (page: number) => void;
}

interface SearchMatch {
  pageNumber: number;
  sectionId: string;
  snippet: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  document,
  currentPage,
  onJumpToPage,
}) => {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  useEffect(() => {
    if (!query.trim()) {
      setMatches([]);
      setActiveMatchIndex(0);
      return;
    }

    const q = query.toLowerCase();
    const found: SearchMatch[] = [];

    document.pages.forEach(p => {
      p.sections.forEach(s => {
        const text = Array.isArray(s.content) ? s.content.join(' ') : s.content;
        if (text.toLowerCase().includes(q)) {
          // extract surrounding snippet
          const idx = text.toLowerCase().indexOf(q);
          const start = Math.max(0, idx - 30);
          const end = Math.min(text.length, idx + q.length + 50);
          const snippet = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
          found.push({
            pageNumber: p.pageNumber,
            sectionId: s.id,
            snippet,
          });
        }
      });
    });

    setMatches(found);
    setActiveMatchIndex(0);
  }, [query, document]);

  const handleNext = () => {
    if (matches.length === 0) return;
    const nextIdx = (activeMatchIndex + 1) % matches.length;
    setActiveMatchIndex(nextIdx);
    onJumpToPage(matches[nextIdx].pageNumber);
  };

  const handlePrev = () => {
    if (matches.length === 0) return;
    const prevIdx = (activeMatchIndex - 1 + matches.length) % matches.length;
    setActiveMatchIndex(prevIdx);
    onJumpToPage(matches[prevIdx].pageNumber);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-14 right-8 z-50 bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-2xl rounded-lg p-2 flex flex-col gap-2 w-80 text-xs animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-1.5">
        <Search className="w-4 h-4 text-[var(--accent)] shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Find text in document..."
          className="flex-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs focus:outline-hidden focus:border-[var(--accent)]"
          autoFocus
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (e.shiftKey) handlePrev();
              else handleNext();
            }
            if (e.key === 'Escape') onClose();
          }}
        />
        <div className="text-[11px] font-mono text-[var(--text-secondary)] px-1 shrink-0">
          {matches.length > 0 ? `${activeMatchIndex + 1}/${matches.length}` : '0 results'}
        </div>
        <button
          onClick={handlePrev}
          disabled={matches.length === 0}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"
          title="Previous Match (Shift+Enter)"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleNext}
          disabled={matches.length === 0}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"
          title="Next Match (Enter)"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)]"
          title="Close (Esc)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {matches.length > 0 && (
        <div className="max-h-40 overflow-y-auto flex flex-col gap-1 border-t border-[var(--border-subtle)] pt-1.5">
          {matches.map((m, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveMatchIndex(i);
                onJumpToPage(m.pageNumber);
              }}
              className={`p-1.5 rounded text-left text-[11px] leading-tight transition-colors ${
                i === activeMatchIndex
                  ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)]'
              }`}
            >
              <span className="font-semibold mr-1">P.{m.pageNumber}:</span>
              <span>{m.snippet}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
