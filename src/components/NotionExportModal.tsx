import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  FileDown,
  Copy,
  Check,
  X,
  ExternalLink,
  Layers,
  Database,
  Code,
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react';
import { AreaAnnotation, ContinuousExcerpt, DocumentMeta, MarginComment } from '../types/pdf';
import {
  generateNotionMarkdown,
  generateNotionCSV,
  generateNotionBlocksJSON,
  generateNotionQuickPasteText,
} from '../utils/notionExport';
import { formatMergedExcerptText } from '../utils/excerptManager';

interface NotionExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentMeta: DocumentMeta;
  excerpts: ContinuousExcerpt[];
  comments: MarginComment[];
  areas?: AreaAnnotation[];
}

export const NotionExportModal: React.FC<NotionExportModalProps> = ({
  isOpen,
  onClose,
  documentMeta,
  excerpts,
  comments,
  areas = [],
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'markdown' | 'csv' | 'json'>('preview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const markdownContent = generateNotionMarkdown(documentMeta, excerpts, comments, areas);
  const csvContent = generateNotionCSV(documentMeta, excerpts, comments);
  const jsonContent = generateNotionBlocksJSON(documentMeta, excerpts, comments);

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore in test or headless env
    }
  };

  const handleCopyClipboard = () => {
    const text = generateNotionQuickPasteText(documentMeta, excerpts, comments);
    navigator.clipboard.writeText(text);
    setCopied(true);
    fireConfetti();
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    fireConfetti();
  };

  const safeTitle = documentMeta.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Notion Export Center"
    >
      <div className="bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-2xl rounded-xl w-full max-w-4xl h-[88vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-ribbon)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <span className="font-serif font-black text-sm">N</span>
            </div>
            <div>
              <h2 className="font-semibold text-sm leading-tight text-[var(--text-primary)]">
                Export to Notion Workspace
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Feed your continuous excerpts, margin notes, and digests directly into Notion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-secondary)]"
            aria-label="Close Notion Export Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar (Top CTA) */}
        <div className="px-4 py-3 bg-[var(--accent-light)]/40 border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyClipboard}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy for Notion (Instant Paste)'}</span>
            </button>

            <span className="text-xs text-[var(--text-secondary)]">or download format:</span>

            <button
              onClick={() => downloadFile(`${safeTitle}-notion.md`, markdownContent, 'text/markdown')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--card-bg)] border border-[var(--border-subtle)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Notion Markdown (.md)</span>
            </button>

            <button
              onClick={() => downloadFile(`${safeTitle}-database.csv`, csvContent, 'text/csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--card-bg)] border border-[var(--border-subtle)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-blue-500" />
              <span>Notion Database (.csv)</span>
            </button>

            <button
              onClick={() => downloadFile(`${safeTitle}-blocks.json`, jsonContent, 'application/json')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--card-bg)] border border-[var(--border-subtle)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
              <span>API Blocks (.json)</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-[var(--text-secondary)]">
            {excerpts.length} Excerpt{excerpts.length !== 1 ? 's' : ''} · {comments.length} Note{comments.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center px-4 pt-2 border-b border-[var(--border-subtle)] bg-[var(--bg-ribbon)] gap-2 text-xs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-[var(--accent)] text-[var(--accent)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Notion Render Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('markdown')}
            className={`px-3 py-1.5 font-medium border-b-2 transition-all ${
              activeTab === 'markdown'
                ? 'border-[var(--accent)] text-[var(--accent)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Raw Markdown (.md)
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`px-3 py-1.5 font-medium border-b-2 transition-all ${
              activeTab === 'csv'
                ? 'border-[var(--accent)] text-[var(--accent)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Notion Database CSV
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1.5 font-medium border-b-2 transition-all ${
              activeTab === 'json'
                ? 'border-[var(--accent)] text-[var(--accent)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Notion Blocks JSON
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-[var(--bg-app)]">
          {/* TAB 1: NOTION SIMULATED PREVIEW */}
          {activeTab === 'preview' && (
            <div className="max-w-3xl mx-auto bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm flex flex-col gap-4 text-xs">
              {/* Simulated Notion Page Header */}
              <div className="flex flex-col gap-1.5 border-b border-[var(--border-subtle)] pb-4">
                <span className="text-3xl">📖</span>
                <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                  {documentMeta.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
                  <span>Author: <strong>{documentMeta.author}</strong></span>
                  <span>·</span>
                  <span>Pages: <strong>{documentMeta.totalPages}</strong></span>
                  <span>·</span>
                  <span>Source: <strong>FluentPDF Windows Reader</strong></span>
                </div>
              </div>

              {/* Notion Callout Simulated */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-[var(--text-primary)]">
                <span className="text-lg">💡</span>
                <div className="flex-1">
                  <div className="font-semibold mb-0.5">Document Reading Digest</div>
                  <div className="text-[var(--text-secondary)] leading-relaxed">
                    This note synthesizes {excerpts.length} continuous excerpts and {comments.length} margin notes. Disjoint highlighted lines have been assembled with <code className="bg-black/10 dark:bg-white/10 px-1 py-0.2 rounded font-mono text-[10px]">[...]</code> elisions.
                  </div>
                </div>
              </div>

              {/* Excerpts Preview */}
              <div className="flex flex-col gap-4 mt-2">
                <h2 className="font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-1">
                  📑 Continuous Excerpts ({excerpts.length})
                </h2>

                {excerpts.length === 0 ? (
                  <p className="text-[var(--text-secondary)] italic">No excerpts recorded yet.</p>
                ) : (
                  excerpts.map((exc, i) => {
                    const merged = formatMergedExcerptText(exc.segments, ' [...] ');
                    const isMulti = exc.segments.length > 1;

                    return (
                      <div key={exc.id} className="flex flex-col gap-2 p-3 rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-[var(--text-primary)]">
                            {i + 1}. {exc.title}
                          </span>
                          <span className="text-[10px] text-[var(--text-secondary)]">
                            Page {exc.pageNumber} · {exc.segments.length} segment{isMulti ? 's' : ''}
                          </span>
                        </div>

                        {/* Blockquote simulation */}
                        <blockquote className="border-l-3 border-[var(--accent)] pl-3 py-1 italic text-xs text-[var(--text-primary)] leading-relaxed bg-black/5 dark:bg-white/5 rounded-r">
                          "{merged}"
                        </blockquote>

                        {/* Segment Spans breakdown */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[var(--text-secondary)] bg-black/5 dark:bg-white/5 p-1.5 rounded">
                          <span className="font-semibold text-[var(--accent)]">Spans & Offsets:</span>
                          {exc.segments.map((seg, sIdx) => {
                            const start = seg.startOffset ?? 0;
                            const end = seg.endOffset ?? (start + seg.text.length);
                            return (
                              <span key={seg.id} className="font-mono bg-[var(--card-bg)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                                Part {sIdx + 1} (P.{seg.pageNumber} @ {start}–{end})
                              </span>
                            );
                          })}
                        </div>

                        {/* Margin Note in Notion callout format */}
                        {exc.marginNote && (
                          <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-xs flex items-start gap-2">
                            <span>📝</span>
                            <div>
                              <span className="font-semibold mr-1">Margin Note:</span>
                              <span>{exc.marginNote}</span>
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {exc.tags && exc.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)]">
                            <span>Tags:</span>
                            {exc.tags.map(t => (
                              <span key={t} className="px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 font-mono">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Comments Preview */}
              {comments.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  <h2 className="font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-1">
                    ✍️ Standalone Margin Comments ({comments.length})
                  </h2>
                  {comments.map((c, i) => (
                    <div key={c.id} className="p-2.5 rounded bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-start gap-2">
                      <span>{c.type === 'question' ? '❓' : c.type === 'idea' ? '💡' : c.type === 'todo' ? '✅' : '📌'}</span>
                      <div className="flex-1">
                        <div className="text-[10px] text-[var(--text-secondary)]">
                          Page {c.pageNumber} · {c.author}
                        </div>
                        <p className="text-xs mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RAW MARKDOWN */}
          {activeTab === 'markdown' && (
            <div className="flex flex-col gap-2 h-full">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>Notion-compatible Markdown with Callouts and YAML frontmatter:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(markdownContent);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="hover:text-[var(--text-primary)] flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="flex-1 p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-subtle)] font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
                {markdownContent}
              </pre>
            </div>
          )}

          {/* TAB 3: CSV DATABASE */}
          {activeTab === 'csv' && (
            <div className="flex flex-col gap-2 h-full">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>CSV formatted for Notion Database Import (Columns: Name, Type, Page, Excerpt, Margin Note, Tags, Color):</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(csvContent);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="hover:text-[var(--text-primary)] flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied' : 'Copy CSV'}</span>
                </button>
              </div>
              <pre className="flex-1 p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-subtle)] font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
                {csvContent}
              </pre>
            </div>
          )}

          {/* TAB 4: JSON BLOCKS */}
          {activeTab === 'json' && (
            <div className="flex flex-col gap-2 h-full">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>Official Notion API Block Objects JSON:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(jsonContent);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="hover:text-[var(--text-primary)] flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="flex-1 p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-subtle)] font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
                {jsonContent}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer Instructions */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-ribbon)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>
              <strong>How to feed to Notion:</strong> Click <strong>Copy for Notion</strong> and paste into any Notion page, or use <strong>Import → Markdown & CSV</strong> in Notion.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[var(--bg-app)] hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-primary)] font-medium border border-[var(--border-subtle)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
