import React, { useState } from 'react';
import {
  Layers,
  Link2,
  Info,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { ContinuousExcerpt, DocumentMeta } from '../types/pdf';

interface LeftSidebarProps {
  documentMeta: DocumentMeta;
  totalPages: number;
  currentPage: number;
  onSelectPage: (page: number) => void;
  excerpts: ContinuousExcerpt[];
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  documentMeta,
  totalPages,
  currentPage,
  onSelectPage,
  excerpts,
  isOpen,
  onToggleOpen,
}) => {
  const [activeTab, setActiveTab] = useState<'pages' | 'excerpts' | 'info'>('pages');

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed left-0 top-24 z-30 bg-[var(--card-bg)] text-[var(--text-primary)] border-r-2 border-y border-r-[var(--accent)] border-y-[var(--border-subtle)] px-2 py-3 rounded-r-md shadow-md flex flex-col items-center gap-1.5 text-xs hover:bg-[var(--accent-light)] transition-all"
        title="Open Navigation & Thumbnails"
        aria-label="Open Navigation Sidebar"
      >
        <Layers className="w-4 h-4 text-[var(--accent)]" />
        <span className="[writing-mode:vertical-rl] font-semibold tracking-wider text-[11px]">
          Pages ({totalPages})
        </span>
      </button>
    );
  }

  return (
    <aside
      className="w-56 sm:w-64 border-r border-[var(--border-subtle)] bg-[var(--card-bg)] flex flex-col h-full shrink-0 z-30 text-[var(--text-primary)] text-xs select-none transition-all shadow-xs max-lg:fixed max-lg:left-0 max-lg:top-10 max-lg:bottom-0 max-lg:shadow-2xl"
      aria-label="Document Navigation Sidebar"
    >
      {/* Top Header & Tab Buttons */}
      <div className="p-2 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-0.5 rounded text-[11px]">
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium ${
              activeTab === 'pages'
                ? 'bg-white dark:bg-black/40 text-[var(--accent)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Pages</span>
          </button>
          <button
            onClick={() => setActiveTab('excerpts')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium ${
              activeTab === 'excerpts'
                ? 'bg-white dark:bg-black/40 text-[var(--accent)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Link2 className="w-3 h-3" />
            <span>Excerpts</span>
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium ${
              activeTab === 'info'
                ? 'bg-white dark:bg-black/40 text-[var(--accent)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Info className="w-3 h-3" />
            <span>Info</span>
          </button>
        </div>

        <button
          onClick={onToggleOpen}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)]"
          title="Collapse Navigation"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Pages Thumbnails Grid */}
        {activeTab === 'pages' && (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
              const isSelected = currentPage === pageNum;
              const pageExcerpts = excerpts.filter(e => e.pageNumber === pageNum);

              return (
                <button
                  key={pageNum}
                  onClick={() => onSelectPage(pageNum)}
                  className={`w-full flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--accent-light)]/40 ring-1 ring-[var(--accent)]'
                      : 'border-[var(--border-subtle)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {/* Miniature page representation */}
                  <div
                    className={`w-12 h-16 rounded border bg-[var(--bg-page)] shadow-xs flex flex-col justify-between p-1 shrink-0 ${
                      isSelected ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : 'border-[var(--border-subtle)]'
                    }`}
                  >
                    <div className="w-6 h-1 bg-black/20 dark:bg-white/20 rounded-xs mb-1" />
                    <div className="space-y-0.5">
                      <div className="w-full h-0.5 bg-black/15 dark:bg-white/15 rounded-xs" />
                      <div className="w-3/4 h-0.5 bg-black/15 dark:bg-white/15 rounded-xs" />
                      <div className="w-5/6 h-0.5 bg-black/15 dark:bg-white/15 rounded-xs" />
                    </div>
                    {pageExcerpts.length > 0 && (
                      <div className="flex items-center gap-0.5">
                        {pageExcerpts.slice(0, 3).map(pe => (
                          <span
                            key={pe.id}
                            className={`w-1.5 h-1.5 rounded-full highlight-${pe.color}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Page details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[var(--text-primary)]">
                        Page {pageNum}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] text-[var(--accent)] font-medium">Viewing</span>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] truncate">
                      {pageExcerpts.length > 0
                        ? `${pageExcerpts.length} highlight${pageExcerpts.length > 1 ? 's' : ''}`
                        : 'No highlights'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Continuous Excerpts Index */}
        {activeTab === 'excerpts' && (
          <div className="flex flex-col gap-2">
            <div className="text-[11px] text-[var(--text-secondary)] font-medium px-1">
              {excerpts.length} Continuous Excerpt{excerpts.length !== 1 ? 's' : ''}
            </div>
            {excerpts.map((exc, idx) => (
              <button
                key={exc.id}
                onClick={() => onSelectPage(exc.pageNumber)}
                className="p-2 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent)] bg-[var(--bg-app)] text-left flex flex-col gap-1 transition-all"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[var(--text-primary)] truncate max-w-[140px]">
                    {idx + 1}. {exc.title}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)]">P.{exc.pageNumber}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--accent)] font-medium">
                  <Link2 className="w-3 h-3" />
                  <span>{exc.segments.length} segment{exc.segments.length > 1 ? 's' : ''}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Document Metadata Info */}
        {activeTab === 'info' && (
          <div className="flex flex-col gap-3 p-1">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--text-secondary)]">
                Title
              </span>
              <p className="font-semibold text-xs leading-snug">{documentMeta.title}</p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--text-secondary)]">
                Author
              </span>
              <p className="text-xs text-[var(--text-secondary)]">{documentMeta.author}</p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--text-secondary)]">
                Pages & Type
              </span>
              <p className="text-xs text-[var(--text-secondary)]">
                {totalPages} Pages · {documentMeta.source === 'builtin' ? 'Curated Document' : 'User Upload'}
              </p>
            </div>

            <div className="p-2 rounded bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] leading-relaxed">
              💡 <strong>Continuous Highlighting:</strong> Highlight disjoint lines across the page and FluentPDF will seamlessly bind them into a unified, Notion-ready continuous quote.
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
