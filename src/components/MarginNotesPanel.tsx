import React, { useState } from 'react';
import {
  Link2,
  Trash2,
  Edit2,
  Check,
  Plus,
  StickyNote,
  HelpCircle,
  Lightbulb,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  FileText,
  Search,
  MessageSquare,
  Send,
  Flag,
  Sparkles,
  Save
} from 'lucide-react';
import {
  ContinuousExcerpt,
  HighlightColor,
  MarginComment,
  PriorityLevel,
} from '../types/pdf';
import { formatMergedExcerptText, getColorPriority } from '../utils/excerptManager';

interface MarginNotesPanelProps {
  excerpts: ContinuousExcerpt[];
  comments: MarginComment[];
  activeExcerptId?: string;
  onSetActiveExcerpt: (id: string | undefined) => void;
  onUpdateExcerptNote: (id: string, note: string) => void;
  onUpdateExcerptTitle: (id: string, title: string) => void;
  onAddExcerptTag: (id: string, tag: string) => void;
  onRemoveExcerptTag: (id: string, tag: string) => void;
  onRemoveSegment: (excerptId: string, segmentId: string) => void;
  onDeleteExcerpt: (id: string) => void;
  onAddComment: (comment: Omit<MarginComment, 'id' | 'createdAt'>) => void;
  onDeleteComment: (id: string) => void;
  onToggleCommentResolved: (id: string) => void;
  onAddSubCommentToExcerpt: (excerptId: string, content: string, author?: string) => void;
  onDeleteSubCommentFromExcerpt: (excerptId: string, commentId: string) => void;
  onToggleSubCommentResolved: (excerptId: string, commentId: string) => void;
  onUpdateExcerptPriority: (excerptId: string, priority: PriorityLevel) => void;
  onUpdateExcerptColor: (excerptId: string, color: HighlightColor) => void;
  currentPage: number;
  onJumpToPage: (page: number) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onManualSave?: () => void;
}

const COMMON_TAGS = ['Key Point', 'Architecture', 'Question', 'Todo', 'Summary', 'NotionReady'];

const PRIORITY_OPTIONS: { level: PriorityLevel; label: string; color: HighlightColor; badgeBg: string }[] = [
  { level: 'P1-Critical', label: 'P1 Critical', color: 'red', badgeBg: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30' },
  { level: 'P2-Important', label: 'P2 Important', color: 'orange', badgeBg: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30' },
  { level: 'P3-Standard', label: 'P3 Standard', color: 'yellow', badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30' },
  { level: 'P4-Review', label: 'P4 Review', color: 'green', badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' },
];

export const MarginNotesPanel: React.FC<MarginNotesPanelProps> = ({
  excerpts,
  comments,
  activeExcerptId,
  onSetActiveExcerpt,
  onUpdateExcerptNote,
  onUpdateExcerptTitle,
  onAddExcerptTag,
  onRemoveExcerptTag,
  onRemoveSegment,
  onDeleteExcerpt,
  onAddComment,
  onDeleteComment,
  onToggleCommentResolved,
  onAddSubCommentToExcerpt,
  onDeleteSubCommentFromExcerpt,
  onToggleSubCommentResolved,
  onUpdateExcerptPriority,
  onUpdateExcerptColor,
  currentPage,
  onJumpToPage,
  isOpen,
  onToggleOpen,
  onManualSave,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'currentPage'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | PriorityLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const [expandedSegments, setExpandedSegments] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentType, setNewCommentType] = useState<MarginComment['type']>('note');
  const [showAddCommentForm, setShowAddCommentForm] = useState(false);
  const [subCommentInputs, setSubCommentInputs] = useState<Record<string, string>>({});
  const [savedThoughtId, setSavedThoughtId] = useState<string | null>(null);

  const handleSaveThought = (excerptId: string) => {
    onManualSave?.();
    setSavedThoughtId(excerptId);
    setTimeout(() => {
      setSavedThoughtId(prev => (prev === excerptId ? null : prev));
    }, 2500);
  };

  // Filter excerpts by page, priority, and search
  const filteredExcerpts = excerpts.filter(e => {
    if (filterMode === 'currentPage' && e.pageNumber !== currentPage) return false;
    const itemPriority = e.priority || getColorPriority(e.color);
    if (priorityFilter !== 'all' && itemPriority !== priorityFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = e.title.toLowerCase().includes(q);
    const noteMatch = (e.marginNote || '').toLowerCase().includes(q);
    const textMatch = e.segments.some(s => s.text.toLowerCase().includes(q));
    const tagMatch = e.tags.some(t => t.toLowerCase().includes(q));
    const commentMatch = (e.comments || []).some(c => c.content.toLowerCase().includes(q));
    return titleMatch || noteMatch || textMatch || tagMatch || commentMatch;
  });

  const filteredComments = comments.filter(c => {
    if (filterMode === 'currentPage' && c.pageNumber !== currentPage) return false;
    if (!searchQuery.trim()) return true;
    return c.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const toggleSegmentView = (id: string) => {
    setExpandedSegments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartEditTitle = (e: ContinuousExcerpt) => {
    setEditingTitleId(e.id);
    setTempTitle(e.title);
  };

  const handleSaveTitle = (id: string) => {
    if (tempTitle.trim()) {
      onUpdateExcerptTitle(id, tempTitle.trim());
    }
    setEditingTitleId(null);
  };

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment({
      pageNumber: currentPage,
      yPosition: 50,
      author: 'Reader',
      content: newCommentText.trim(),
      type: newCommentType,
      isResolved: false,
    });
    setNewCommentText('');
    setShowAddCommentForm(false);
  };

  const handleAddSubComment = (excerptId: string) => {
    const text = (subCommentInputs[excerptId] || '').trim();
    if (!text) return;
    onAddSubCommentToExcerpt(excerptId, text, 'Reader');
    setSubCommentInputs(prev => ({ ...prev, [excerptId]: '' }));
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed right-0 top-24 z-30 bg-[var(--card-bg)] text-[var(--text-primary)] border-l-2 border-y border-l-[var(--accent)] border-y-[var(--border-subtle)] px-2 py-3 rounded-l-md shadow-md flex flex-col items-center gap-1.5 text-xs hover:bg-[var(--accent-light)] transition-all"
        title="Open Margin Notes & Continuous Excerpts"
        aria-label="Open Margin Notes"
      >
        <StickyNote className="w-4 h-4 text-[var(--accent)]" />
        <span className="[writing-mode:vertical-rl] font-semibold tracking-wider text-[11px]">
          Margin Notes ({excerpts.length})
        </span>
      </button>
    );
  }

  return (
    <aside
      className="w-84 sm:w-96 max-w-[90vw] border-l border-[var(--border-subtle)] bg-[var(--gutter-bg)] flex flex-col h-full shrink-0 z-30 text-[var(--text-primary)] text-xs select-none transition-all shadow-sm max-lg:fixed max-lg:right-0 max-lg:top-10 max-lg:bottom-0 max-lg:shadow-2xl"
      aria-label="Margin Notes and Excerpts Gutter"
    >
      {/* Top Header */}
      <div className="p-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-ribbon)] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <StickyNote className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="font-semibold text-xs tracking-tight text-[var(--text-primary)]">
            Margin Notes & Discussion
          </h2>
          <span className="text-[10px] bg-[var(--accent-light)] text-[var(--accent)] px-1.5 py-0.2 rounded font-mono font-bold">
            {excerpts.length}
          </span>
        </div>

        <button
          onClick={onToggleOpen}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)]"
          title="Collapse Panel"
          aria-label="Collapse Margin Notes Panel"
        >
          <ChevronDown className="w-4 h-4 rotate-90" />
        </button>
      </div>

      {/* Filter Tabs, Priority Selector & Search */}
      <div className="p-2 border-b border-[var(--border-subtle)] bg-[var(--bg-ribbon)] flex flex-col gap-1.5">
        <div className="flex items-center gap-1">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notes, quotes, comments..."
              className="w-full pl-7 pr-2 py-1 text-[11px] rounded bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex items-center p-0.5 rounded bg-black/5 dark:bg-white/5 text-[11px]">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2 py-0.5 rounded ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-black/40 text-[var(--accent)] font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode('currentPage')}
              className={`px-2 py-0.5 rounded ${
                filterMode === 'currentPage'
                  ? 'bg-white dark:bg-black/40 text-[var(--accent)] font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              P.{currentPage}
            </button>
          </div>
        </div>

        {/* Priority Filter Bar */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-[10px]">
          <span className="text-[var(--text-secondary)] font-medium shrink-0 flex items-center gap-0.5">
            <Flag className="w-2.5 h-2.5" />
            <span>Priority:</span>
          </span>
          <button
            onClick={() => setPriorityFilter('all')}
            className={`px-1.5 py-0.2 rounded border ${
              priorityFilter === 'all'
                ? 'bg-[var(--accent)] text-white font-semibold border-transparent'
                : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            All
          </button>
          {PRIORITY_OPTIONS.map(opt => (
            <button
              key={opt.level}
              onClick={() => setPriorityFilter(opt.level)}
              className={`px-1.5 py-0.2 rounded border whitespace-nowrap transition-all ${
                priorityFilter === opt.level
                  ? 'bg-[var(--accent)] text-white font-semibold border-transparent'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Quick Add Standalone Margin Note button */}
        <button
          onClick={() => setShowAddCommentForm(!showAddCommentForm)}
          className="flex items-center justify-center gap-1 py-1 rounded border border-dashed border-[var(--border-strong)] text-[11px] text-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Add Standalone Margin Note on Page {currentPage}</span>
        </button>

        {showAddCommentForm && (
          <form onSubmit={handleCreateComment} className="p-2 rounded bg-[var(--card-bg)] border border-[var(--border-subtle)] flex flex-col gap-1.5 mt-1 shadow-sm">
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-[var(--text-secondary)]">Type:</span>
              {(['note', 'idea', 'question', 'todo'] as const).map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setNewCommentType(t)}
                  className={`px-1.5 py-0.5 rounded capitalize ${
                    newCommentType === t ? 'bg-[var(--accent)] text-white font-medium' : 'bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <textarea
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              placeholder="Write your margin reflection or question..."
              rows={2}
              className="w-full p-1.5 text-xs rounded bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-hidden"
              autoFocus
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setShowAddCommentForm(false)}
                className="px-2 py-0.5 rounded text-[11px] text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-0.5 rounded text-[11px] bg-[var(--accent)] text-white font-medium"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Main Scrollable Cards List */}
      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-3">
        {filteredExcerpts.length === 0 && filteredComments.length === 0 ? (
          <div className="py-12 text-center text-[var(--text-secondary)] flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 opacity-30" />
            <p className="font-medium text-xs">No matching notes or excerpts</p>
            <p className="text-[11px] max-w-[200px] opacity-75">
              Select text on any page to create continuous excerpts or add margin notes.
            </p>
          </div>
        ) : null}

        {/* Excerpt Cards */}
        {filteredExcerpts.map(excerpt => {
          const isActiveThread = activeExcerptId === excerpt.id;
          const mergedText = formatMergedExcerptText(excerpt.segments, ' [...] ');
          const isMultiSegment = excerpt.segments.length > 1;
          const isExpanded = expandedSegments[excerpt.id] ?? false;
          const currentPriority = excerpt.priority || getColorPriority(excerpt.color);
          const priorityMeta = PRIORITY_OPTIONS.find(p => p.level === currentPriority) || PRIORITY_OPTIONS[2];
          const subComments = excerpt.comments || [];

          return (
            <article
              key={excerpt.id}
              className={`rounded-lg border bg-[var(--card-bg)] p-2.5 shadow-xs transition-all flex flex-col gap-2 relative ${
                isActiveThread
                  ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30'
                  : 'border-[var(--margin-note-border)] hover:border-[var(--border-strong)]'
              }`}
            >
              {/* Card Header: Title + Priority + Actions */}
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex-1 min-w-0">
                  {editingTitleId === excerpt.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={tempTitle}
                        onChange={e => setTempTitle(e.target.value)}
                        className="w-full text-xs font-semibold px-1 py-0.5 rounded bg-[var(--bg-app)] border border-[var(--accent)] text-[var(--text-primary)]"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveTitle(excerpt.id);
                          if (e.key === 'Escape') setEditingTitleId(null);
                        }}
                      />
                      <button
                        onClick={() => handleSaveTitle(excerpt.id)}
                        className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                        title="Save title"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 group">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 highlight-${excerpt.color} border border-black/20`}
                      />
                      <h3
                        className="font-semibold text-xs text-[var(--text-primary)] truncate cursor-pointer hover:text-[var(--accent)]"
                        onClick={() => handleStartEditTitle(excerpt)}
                        title="Click to rename excerpt"
                      >
                        {excerpt.title}
                      </h3>
                      <button
                        onClick={() => handleStartEditTitle(excerpt)}
                        className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Metadata line: Page + Continuous Segment Count + Priority badge */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-[var(--text-secondary)]">
                    <button
                      onClick={() => onJumpToPage(excerpt.pageNumber)}
                      className="hover:underline hover:text-[var(--accent)] font-medium"
                      title="Jump to page"
                    >
                      P.{excerpt.pageNumber}
                    </button>
                    <span>·</span>
                    <span className="font-medium text-[var(--accent)]">
                      {isMultiSegment ? `${excerpt.segments.length} segments` : '1 highlight'}
                    </span>
                    <span>·</span>
                    {/* Priority Selector Pill */}
                    <select
                      value={currentPriority}
                      onChange={e => onUpdateExcerptPriority(excerpt.id, e.target.value as PriorityLevel)}
                      className={`text-[9px] font-bold px-1 py-0.2 rounded border uppercase tracking-wider ${priorityMeta.badgeBg}`}
                      title="Change priority level"
                    >
                      {PRIORITY_OPTIONS.map(opt => (
                        <option key={opt.level} value={opt.level}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    {isActiveThread && (
                      <span className="px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider text-[9px]">
                        Active Thread
                      </span>
                    )}
                  </div>
                </div>

                {/* Top Action Icons */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => onSetActiveExcerpt(isActiveThread ? undefined : excerpt.id)}
                    className={`p-1 rounded text-xs transition-colors ${
                      isActiveThread
                        ? 'bg-[var(--accent)] text-white'
                        : 'hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)]'
                    }`}
                    title={
                      isActiveThread
                        ? 'Active Continuous Thread. Click to stop appending.'
                        : 'Set as Active Continuous Thread to append more highlights to this excerpt.'
                    }
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteExcerpt(excerpt.id)}
                    className="p-1 rounded hover:bg-red-50 hover:text-red-600 text-[var(--text-secondary)] transition-colors"
                    title="Delete continuous excerpt"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Merged Continuous Excerpt Quote Box */}
              <div
                className={`p-2 rounded text-[11px] leading-relaxed border-l-2 bg-black/5 dark:bg-white/5 border-[var(--accent)] text-[var(--text-primary)] select-text`}
              >
                <div className="italic">
                  "{mergedText}"
                </div>

                {/* Continuous Segments Breakdown Toggle */}
                {isMultiSegment && (
                  <div className="mt-1.5 pt-1.5 border-t border-[var(--border-subtle)]">
                    <button
                      onClick={() => toggleSegmentView(excerpt.id)}
                      className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      <span>
                        {isExpanded ? 'Hide' : 'Inspect'} {excerpt.segments.length} separate highlights
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="mt-1 flex flex-col gap-1 pl-1">
                        {excerpt.segments.map((seg, sIdx) => {
                          const start = seg.startOffset ?? 0;
                          const end = seg.endOffset ?? (start + seg.text.length);
                          return (
                            <div
                              key={seg.id}
                              className="flex items-start justify-between gap-1 p-1.5 rounded bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[10px]"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 font-semibold text-[var(--accent)] mb-0.5">
                                  <span>Part {sIdx + 1} (P.{seg.pageNumber})</span>
                                  <span className="font-mono text-[9px] text-[var(--text-secondary)] bg-black/5 dark:bg-white/10 px-1 py-0.2 rounded">
                                    offsets {start}–{end}
                                  </span>
                                </div>
                                <span className="italic text-[var(--text-secondary)]">"{seg.text}"</span>
                              </div>
                              <button
                                onClick={() => onRemoveSegment(excerpt.id, seg.id)}
                                className="text-[var(--text-secondary)] hover:text-red-500 p-0.5 shrink-0"
                                title="Remove only this segment from continuous excerpt"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Margin Note Editor */}
              <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  <span className="flex items-center gap-1 text-[var(--text-primary)]">
                    <StickyNote className="w-3 h-3 text-[var(--accent)]" />
                    <span>Margin Note / Thought</span>
                  </span>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                    Notion Ready ✓
                  </span>
                </div>
                <textarea
                  value={excerpt.marginNote || ''}
                  onChange={e => onUpdateExcerptNote(excerpt.id, e.target.value)}
                  onKeyDown={e => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveThought(excerpt.id);
                    }
                  }}
                  placeholder="Write your margin reflection, argument, or summary here..."
                  rows={2}
                  className="w-full p-2 text-xs rounded bg-[var(--card-bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent)] leading-relaxed resize-y"
                />
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[9px] text-[var(--text-secondary)]">
                    Press <kbd className="px-1 py-0.2 rounded bg-black/5 dark:bg-white/10 font-mono text-[8px]">Ctrl+Enter</kbd> to save
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSaveThought(excerpt.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-all shadow-xs cursor-pointer ${
                      savedThoughtId === excerpt.id
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-[var(--accent)] hover:opacity-90 text-white'
                    }`}
                    title="Save this margin note/thought"
                    aria-label="Save Margin Note or Thought"
                  >
                    {savedThoughtId === excerpt.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved ✓</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Note</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Threaded Comments / Discussion directly inside this Margin Note */}
              <div className="flex flex-col gap-1.5 border-t border-[var(--border-subtle)] pt-1.5">
                <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-medium">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-[var(--accent)]" />
                    <span>Comments on Note ({subComments.length})</span>
                  </span>
                </div>

                {/* List of sub-comments */}
                {subComments.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {subComments.map(sc => (
                      <div
                        key={sc.id}
                        className={`p-1.5 rounded bg-[var(--bg-app)] border text-[11px] flex items-start justify-between gap-1.5 ${
                          sc.isResolved ? 'opacity-60 border-dashed border-[var(--border-subtle)]' : 'border-[var(--border-subtle)]'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 text-[9px] text-[var(--text-secondary)] mb-0.5">
                            <span className="font-semibold text-[var(--text-primary)]">{sc.author}</span>
                            <span>·</span>
                            <span>{new Date(sc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {sc.isResolved && (
                              <span className="text-emerald-600 font-bold ml-1">Resolved ✓</span>
                            )}
                          </div>
                          <p className={`text-[11px] leading-tight ${sc.isResolved ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                            {sc.content}
                          </p>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={() => onToggleSubCommentResolved(excerpt.id, sc.id)}
                            className="p-0.5 hover:text-emerald-600 text-[var(--text-secondary)]"
                            title={sc.isResolved ? 'Mark active' : 'Mark resolved'}
                          >
                            <CheckSquare className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteSubCommentFromExcerpt(excerpt.id, sc.id)}
                            className="p-0.5 hover:text-red-500 text-[var(--text-secondary)]"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Sub-comment input box */}
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    type="text"
                    value={subCommentInputs[excerpt.id] || ''}
                    onChange={e => setSubCommentInputs(prev => ({ ...prev, [excerpt.id]: e.target.value }))}
                    placeholder="Comment on this note..."
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddSubComment(excerpt.id);
                    }}
                    className="flex-1 px-2 py-0.5 text-[11px] rounded bg-[var(--bg-app)] border border-[var(--border-subtle)] focus:outline-hidden focus:border-[var(--accent)]"
                  />
                  <button
                    onClick={() => handleAddSubComment(excerpt.id)}
                    className="p-1 rounded bg-[var(--accent)] text-white hover:opacity-90 shrink-0"
                    title="Post comment"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Tags Section */}
              <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-[var(--border-subtle)]">
                {excerpt.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => onRemoveExcerptTag(excerpt.id, tag)}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}

                {/* Common tags quick add pills */}
                <div className="flex items-center gap-1 text-[9px] text-[var(--text-secondary)] ml-auto">
                  {COMMON_TAGS.filter(t => !excerpt.tags.includes(t))
                    .slice(0, 2)
                    .map(t => (
                      <button
                        key={t}
                        onClick={() => onAddExcerptTag(excerpt.id, t)}
                        className="px-1 py-0.5 rounded border border-[var(--border-subtle)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        +{t}
                      </button>
                    ))}
                </div>
              </div>
            </article>
          );
        })}

        {/* Standalone Margin Comments Section */}
        {filteredComments.length > 0 && (
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[var(--border-subtle)]">
            <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Standalone Margin Comments ({filteredComments.length})
            </h4>

            {filteredComments.map(c => {
              const Icon =
                c.type === 'question'
                  ? HelpCircle
                  : c.type === 'idea'
                  ? Lightbulb
                  : c.type === 'todo'
                  ? CheckSquare
                  : StickyNote;

              return (
                <div
                  key={c.id}
                  className={`p-2 rounded-lg border bg-[var(--card-bg)] text-xs flex flex-col gap-1 ${
                    c.isResolved
                      ? 'opacity-60 border-dashed border-[var(--border-subtle)]'
                      : 'border-[var(--border-subtle)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1">
                      <Icon className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span className="capitalize font-semibold">{c.type}</span>
                      <span>·</span>
                      <button
                        onClick={() => onJumpToPage(c.pageNumber)}
                        className="hover:underline hover:text-[var(--accent)]"
                      >
                        Page {c.pageNumber}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleCommentResolved(c.id)}
                        className={`text-[9px] px-1 py-0.2 rounded border ${
                          c.isResolved ? 'bg-emerald-500 text-white' : 'hover:border-[var(--accent)]'
                        }`}
                      >
                        {c.isResolved ? 'Resolved' : 'Resolve'}
                      </button>
                      <button
                        onClick={() => onDeleteComment(c.id)}
                        className="text-[var(--text-secondary)] hover:text-red-500 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed text-[var(--text-primary)]">
                    {c.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
