import React, { useRef, useState, useEffect } from 'react';
import {
  Link2,
  StickyNote,
  Highlighter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize2
} from 'lucide-react';
import {
  ActiveTool,
  AreaAnnotation,
  ContinuousExcerpt,
  ExcerptSegment,
  HighlightColor,
  InPageTextBox,
  MarginComment,
} from '../types/pdf';
import { BuiltinDocument, DocumentPageContent } from '../data/sampleDocuments';
import { SelectionPopover } from './SelectionPopover';
import { InPageCommentBox } from './InPageCommentBox';

interface PdfViewerProps {
  document: BuiltinDocument;
  currentPage: number;
  onPageChange: (page: number) => void;
  zoom: number;
  viewMode: 'single' | 'continuous' | 'two-page';
  isInvertedDocument: boolean;
  excerpts: ContinuousExcerpt[];
  comments: MarginComment[];
  textBoxes?: InPageTextBox[];
  areas: AreaAnnotation[];
  activeExcerpt?: ContinuousExcerpt;
  activeColor: HighlightColor;
  onColorChange: (color: HighlightColor) => void;
  isContinuousMode: boolean;
  activeTool?: ActiveTool;
  onAppendSegmentToExcerpt: (excerptId: string, segment: { text: string; pageNumber: number; startOffset?: number; endOffset?: number; sectionId?: string; style?: 'highlight' | 'underline' }) => void;
  onCreateNewExcerptWithSegment: (segment: { text: string; pageNumber: number; color: HighlightColor; startOffset?: number; endOffset?: number; sectionId?: string; style?: 'highlight' | 'underline' }) => void;
  onSetActiveExcerpt: (id: string | undefined) => void;
  onAddComment: (comment: Omit<MarginComment, 'id' | 'createdAt'>) => void;
  onAddTextBox?: (box: Omit<InPageTextBox, 'id' | 'createdAt'>) => void;
  onUpdateTextBox?: (box: InPageTextBox) => void;
  onDeleteTextBox?: (id: string) => void;
  customPdfPages?: string[]; // data URLs if a custom PDF is uploaded
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  document,
  currentPage,
  onPageChange,
  zoom,
  viewMode,
  isInvertedDocument,
  excerpts,
  comments,
  textBoxes = [],
  areas,
  activeExcerpt,
  activeColor,
  onColorChange,
  isContinuousMode,
  activeTool = 'highlight',
  onAppendSegmentToExcerpt,
  onCreateNewExcerptWithSegment,
  onSetActiveExcerpt,
  onAddComment,
  onAddTextBox,
  onUpdateTextBox,
  onDeleteTextBox,
  customPdfPages,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [popoverState, setPopoverState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
    pageNumber: number;
    startOffset?: number;
    endOffset?: number;
    sectionId?: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    text: '',
    pageNumber: 1,
  });

  const [hoveredExcerptId, setHoveredExcerptId] = useState<string | null>(null);

  // Handle text selection in the document
  const handleMouseUp = (pageNumber: number) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const text = selection.toString().trim();
    if (!text || text.length < 2) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Calculate section and character offsets
    const sectionEl = (selection.anchorNode?.parentElement?.closest('[data-section-id]') ||
      selection.focusNode?.parentElement?.closest('[data-section-id]')) as HTMLElement | null;
    const sectionId = sectionEl?.getAttribute('data-section-id') || undefined;
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;

    // If Continuous Mode is ON:
    // Automatically join the current continuous excerpt (or start one)!
    const segmentStyle: 'highlight' | 'underline' = activeTool === 'underline' ? 'underline' : 'highlight';

    if (isContinuousMode) {
      if (activeExcerpt) {
        onAppendSegmentToExcerpt(activeExcerpt.id, {
          text,
          pageNumber,
          startOffset,
          endOffset,
          sectionId,
          style: segmentStyle,
        });
      } else {
        onCreateNewExcerptWithSegment({
          text,
          pageNumber,
          color: activeColor,
          startOffset,
          endOffset,
          sectionId,
          style: segmentStyle,
        });
      }
      selection.removeAllRanges();
      setPopoverState(prev => ({ ...prev, visible: false }));
      return;
    }

    // If Continuous Mode is OFF, show the floating popover right above the selection
    setPopoverState({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      text,
      pageNumber,
      startOffset,
      endOffset,
      sectionId,
    });
  };

  const handleAppendFromPopover = () => {
    if (!activeExcerpt) return;
    onAppendSegmentToExcerpt(activeExcerpt.id, {
      text: popoverState.text,
      pageNumber: popoverState.pageNumber,
      startOffset: popoverState.startOffset,
      endOffset: popoverState.endOffset,
      sectionId: popoverState.sectionId,
    });
    setPopoverState(prev => ({ ...prev, visible: false }));
    window.getSelection()?.removeAllRanges();
  };

  const handleStartNewFromPopover = () => {
    onCreateNewExcerptWithSegment({
      text: popoverState.text,
      pageNumber: popoverState.pageNumber,
      color: activeColor,
      startOffset: popoverState.startOffset,
      endOffset: popoverState.endOffset,
      sectionId: popoverState.sectionId,
    });
    setPopoverState(prev => ({ ...prev, visible: false }));
    window.getSelection()?.removeAllRanges();
  };

  const handleStandaloneHighlightFromPopover = () => {
    onCreateNewExcerptWithSegment({
      text: popoverState.text,
      pageNumber: popoverState.pageNumber,
      color: activeColor,
      startOffset: popoverState.startOffset,
      endOffset: popoverState.endOffset,
      sectionId: popoverState.sectionId,
      style: 'highlight',
    });
    setPopoverState(prev => ({ ...prev, visible: false }));
    window.getSelection()?.removeAllRanges();
  };

  const handleUnderlineFromPopover = () => {
    onCreateNewExcerptWithSegment({
      text: popoverState.text,
      pageNumber: popoverState.pageNumber,
      color: activeColor,
      startOffset: popoverState.startOffset,
      endOffset: popoverState.endOffset,
      sectionId: popoverState.sectionId,
      style: 'underline',
    });
    setPopoverState(prev => ({ ...prev, visible: false }));
    window.getSelection()?.removeAllRanges();
  };

  const handleAddTextBoxFromPopover = () => {
    if (onAddTextBox) {
      onAddTextBox({
        pageNumber: popoverState.pageNumber,
        x: 55,
        y: 20,
        text: `"${popoverState.text.substring(0, 80)}"`,
        isBold: false,
        isItalic: true,
        isUnderline: false,
        fontFamily: 'sans',
        fontSize: 'sm',
        color: '#1e1e1e',
        bgColor: '#fef9c3',
        borderColor: '#fde047',
      });
    }
    setPopoverState(prev => ({ ...prev, visible: false }));
    window.getSelection()?.removeAllRanges();
  };

  const handleAddMarginNoteFromPopover = () => {
    onCreateNewExcerptWithSegment({
      text: popoverState.text,
      pageNumber: popoverState.pageNumber,
      color: activeColor,
      startOffset: popoverState.startOffset,
      endOffset: popoverState.endOffset,
      sectionId: popoverState.sectionId,
    });
    setPopoverState(prev => ({ ...prev, visible: false }));
    window.getSelection()?.removeAllRanges();
  };

  // Determine pages to display according to viewMode
  let pagesToRender: DocumentPageContent[] = [];
  if (viewMode === 'single') {
    const single = document.pages.find(p => p.pageNumber === currentPage);
    pagesToRender = single ? [single] : [document.pages[0]];
  } else if (viewMode === 'two-page') {
    const p1 = document.pages.find(p => p.pageNumber === currentPage);
    const p2 = document.pages.find(p => p.pageNumber === currentPage + 1);
    pagesToRender = [p1, p2].filter(Boolean) as DocumentPageContent[];
  } else {
    // continuous scroll
    pagesToRender = document.pages;
  }

  // Helper to render text with continuous excerpt highlights embedded
  const renderParagraphWithHighlights = (content: string, pageNumber: number, sectionId: string) => {
    // Find all excerpt segments on this page that match parts of this content
    const pageExcerpts = excerpts.filter(e => e.segments.some(s => s.pageNumber === pageNumber));

    interface HighlightOccurrence {
      excerptId: string;
      segmentId: string;
      title: string;
      color: HighlightColor;
      start: number;
      end: number;
      segmentIndex: number;
      totalSegments: number;
      style?: 'highlight' | 'underline';
    }

    const occurrences: HighlightOccurrence[] = [];

    pageExcerpts.forEach(exc => {
      exc.segments.forEach((seg, sIdx) => {
        if (seg.pageNumber === pageNumber && seg.text.length > 5) {
          const matchIndex = content.indexOf(seg.text);
          if (matchIndex !== -1) {
            occurrences.push({
              excerptId: exc.id,
              segmentId: seg.id,
              title: exc.title,
              color: exc.color,
              start: matchIndex,
              end: matchIndex + seg.text.length,
              segmentIndex: sIdx + 1,
              totalSegments: exc.segments.length,
              style: seg.style || 'highlight',
            });
          }
        }
      });
    });

    if (occurrences.length === 0) {
      return <span>{content}</span>;
    }

    // Sort by start position
    occurrences.sort((a, b) => a.start - b.start);

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    occurrences.forEach((occ, oIdx) => {
      if (occ.start > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>{content.substring(lastIndex, occ.start)}</span>
        );
      }

      const isHovered = hoveredExcerptId === occ.excerptId;
      const isActiveThread = activeExcerpt?.id === occ.excerptId;

      elements.push(
        <mark
          key={`highlight-${occ.segmentId}-${oIdx}`}
          onMouseEnter={() => setHoveredExcerptId(occ.excerptId)}
          onMouseLeave={() => setHoveredExcerptId(null)}
          onClick={() => onSetActiveExcerpt(occ.excerptId)}
          className={`${
            occ.style === 'underline' ? `underline-${occ.color}` : `highlight-${occ.color}`
          } px-0.5 rounded-xs cursor-pointer relative group transition-all duration-150 ${
            isHovered || isActiveThread ? 'highlight-pulse ring-2 ring-[var(--accent)] font-medium' : ''
          }`}
          title={`Continuous Excerpt: "${occ.title}" (Part ${occ.segmentIndex} of ${occ.totalSegments}). Click to select thread.`}
        >
          {content.substring(occ.start, occ.end)}

          {/* Continuous Link Badge */}
          {occ.totalSegments > 1 && (
            <span
              className="inline-flex items-center gap-0.5 ml-1 px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-black/10 dark:bg-white/20 text-[var(--text-primary)] align-middle select-none"
            >
              <Link2 className="w-2.5 h-2.5" />
              <span>{occ.segmentIndex}/{occ.totalSegments}</span>
            </span>
          )}
        </mark>
      );

      lastIndex = occ.end;
    });

    if (lastIndex < content.length) {
      elements.push(<span key={`text-end`}>{content.substring(lastIndex)}</span>);
    }

    return <>{elements}</>;
  };

  // Handle direct click on PDF page to place comment box
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => {
    if (activeTool !== 'text-box' || !onAddTextBox) return;
    const target = e.target as HTMLElement;
    if (target.closest('textarea, button, select, input, [role="button"], [title="Drag note across page"]')) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    onAddTextBox({
      pageNumber,
      x: Math.max(4, Math.min(68, clickX)),
      y: Math.max(4, Math.min(80, clickY)),
      text: '',
      isBold: false,
      isItalic: false,
      isUnderline: false,
      fontFamily: 'sans',
      fontSize: 'base',
      color: '#1e1e1e',
      bgColor: '#fef9c3', // Pale yellow default note
      borderColor: '#fde047',
    });
  };

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-auto bg-[var(--bg-app)] p-4 sm:p-8 flex justify-center items-start transition-colors relative ${
        isInvertedDocument ? 'invert contrast-125' : ''
      }`}
      aria-label="PDF Document Canvas"
    >
      {/* Floating Selection Popover */}
      {popoverState.visible && (
        <SelectionPopover
          position={{ x: popoverState.x, y: popoverState.y }}
          selectedText={popoverState.text}
          activeExcerpt={activeExcerpt}
          activeColor={activeColor}
          onColorChange={onColorChange}
          onAppendToActiveExcerpt={handleAppendFromPopover}
          onStartNewContinuousExcerpt={handleStartNewFromPopover}
          onStandaloneHighlight={handleStandaloneHighlightFromPopover}
          onUnderline={handleUnderlineFromPopover}
          onAddTextBox={handleAddTextBoxFromPopover}
          onAddMarginNote={handleAddMarginNoteFromPopover}
          onClose={() => setPopoverState(prev => ({ ...prev, visible: false }))}
        />
      )}

      {/* Pages Container */}
      <div
        className={`flex ${
          viewMode === 'two-page' ? 'flex-row gap-6' : 'flex-col gap-8'
        } items-center justify-center`}
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
      >
        {pagesToRender.map(page => {
          const pageExcerpts = excerpts.filter(e =>
            e.segments.some(s => s.pageNumber === page.pageNumber)
          );
          const pageComments = comments.filter(c => c.pageNumber === page.pageNumber);

          return (
            <div
              key={page.pageNumber}
              onMouseUp={() => handleMouseUp(page.pageNumber)}
              onClick={e => handlePageClick(e, page.pageNumber)}
              className={`w-full max-w-[740px] min-h-[700px] sm:min-h-[960px] bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-xl rounded-md p-6 sm:p-14 relative flex flex-col justify-between transition-shadow select-text ${
                activeTool === 'text-box' ? 'cursor-crosshair ring-2 ring-[var(--accent)]/30' : ''
              }`}
              data-page-number={page.pageNumber}
            >
              {/* In-Page Text Boxes / Comment Boxes directly on the PDF */}
              {textBoxes
                .filter(tb => tb.pageNumber === page.pageNumber)
                .map(box => (
                  <InPageCommentBox
                    key={box.id}
                    box={box}
                    onUpdate={onUpdateTextBox || (() => {})}
                    onDelete={onDeleteTextBox || (() => {})}
                  />
                ))}

              {/* PDF Running Header */}
              <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] border-b border-[var(--border-subtle)] pb-2 mb-6 select-none">
                <span className="truncate max-w-sm uppercase tracking-wider font-semibold">
                  {document.meta.title}
                </span>
                <span>Page {page.pageNumber} of {document.meta.totalPages}</span>
              </div>

              {/* Page Body Content */}
              <div className="space-y-4 text-xs leading-relaxed flex-1">
                {page.sections.map(section => {
                  if (section.type === 'heading') {
                    return (
                      <h1
                        key={section.id}
                        className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 pt-1"
                      >
                        {section.content as string}
                      </h1>
                    );
                  }

                  if (section.type === 'subheading') {
                    return (
                      <h2
                        key={section.id}
                        className="text-sm font-semibold text-[var(--accent)] tracking-tight pt-2"
                      >
                        {section.content as string}
                      </h2>
                    );
                  }

                  if (section.type === 'quote') {
                    return (
                      <blockquote
                        key={section.id}
                        className="border-l-3 border-[var(--accent)] pl-3 py-1 text-xs italic text-[var(--text-primary)] opacity-90 my-2"
                      >
                        {renderParagraphWithHighlights(
                          section.content as string,
                          page.pageNumber,
                          section.id
                        )}
                      </blockquote>
                    );
                  }

                  if (section.type === 'callout') {
                    return (
                      <div
                        key={section.id}
                        className="p-3 rounded-md bg-[var(--accent-light)]/50 border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] my-2"
                      >
                        {renderParagraphWithHighlights(
                          section.content as string,
                          page.pageNumber,
                          section.id
                        )}
                      </div>
                    );
                  }

                  if (section.type === 'bullet_list') {
                    const items = section.content as string[];
                    return (
                      <ul key={section.id} className="list-disc pl-5 space-y-1 text-xs my-2">
                        {items.map((item, i) => (
                          <li key={i}>
                            {renderParagraphWithHighlights(item, page.pageNumber, `${section.id}-${i}`)}
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  return (
                    <p key={section.id} className="text-xs leading-relaxed text-[var(--text-primary)]">
                      {renderParagraphWithHighlights(
                        section.content as string,
                        page.pageNumber,
                        section.id
                      )}
                    </p>
                  );
                })}
              </div>

              {/* PDF Running Footer */}
              <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-3 mt-6 select-none">
                <span>FluentPDF Windows Reader · Confidential Research Digest</span>
                <span className="font-mono">{page.pageNumber}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
