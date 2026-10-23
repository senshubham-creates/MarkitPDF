import { ContinuousExcerpt, ExcerptSegment, HighlightColor, PriorityLevel, SubComment, TextLocation } from '../types/pdf';

/**
 * Maps a highlight color to an analytical priority level.
 */
export function getColorPriority(color: HighlightColor): PriorityLevel {
  switch (color) {
    case 'red':
      return 'P1-Critical';
    case 'orange':
      return 'P2-Important';
    case 'yellow':
      return 'P3-Standard';
    case 'green':
      return 'P4-Review';
    case 'purple':
      return 'P2-Important';
    case 'pink':
      return 'P4-Review';
    case 'blue':
    default:
      return 'P3-Standard';
  }
}

/**
 * Merges continuous excerpt segments into a single string.
 * Non-contiguous segments are separated by "[...]" to indicate elisions,
 * matching academic and Notion best practices.
 */
export function formatMergedExcerptText(segments: ExcerptSegment[], separator = ' [...] '): string {
  if (!segments || segments.length === 0) return '';
  return segments
    .map(s => s.text.trim())
    .filter(Boolean)
    .join(separator);
}

/**
 * Computes a human-readable span summary for a multi-segment continuous excerpt.
 */
export function computeSpanSummary(segments: ExcerptSegment[]): string {
  if (!segments || segments.length === 0) return 'No highlights';
  const pages = Array.from(new Set(segments.map(s => s.pageNumber))).sort((a, b) => a - b);
  const pageStr = pages.length > 1 ? `Pages ${pages.join(' & ')}` : `Page ${pages[0]}`;
  return `${pageStr} · ${segments.length} segment${segments.length > 1 ? 's' : ''}`;
}

/**
 * Generates structured location metadata with start and end points.
 */
export function buildTextLocation(params: {
  pageNumber: number;
  text: string;
  startOffset?: number;
  endOffset?: number;
  sectionId?: string;
}): TextLocation {
  const start = params.startOffset ?? 0;
  const end = params.endOffset ?? (start + params.text.length);
  const sec = params.sectionId ? ` · Sec: ${params.sectionId}` : '';

  return {
    pageNumber: params.pageNumber,
    sectionId: params.sectionId,
    startOffset: start,
    endOffset: end,
    startLabel: `P.${params.pageNumber} @ offset ${start}${sec}`,
    endLabel: `P.${params.pageNumber} @ offset ${end}${sec}`,
  };
}

/**
 * Creates a new continuous excerpt with an initial segment and start/end points metadata.
 */
export function createContinuousExcerpt(params: {
  pageNumber: number;
  text: string;
  color?: HighlightColor;
  priority?: PriorityLevel;
  title?: string;
  marginNote?: string;
  tags?: string[];
  rects?: ExcerptSegment['rects'];
  startOffset?: number;
  endOffset?: number;
  sectionId?: string;
  style?: 'highlight' | 'underline';
}): ContinuousExcerpt {
  const initialText = params.text.trim();
  const segmentId = 'seg-' + Math.random().toString(36).substring(2, 9);
  const excerptId = 'exc-' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();
  const color = params.color || 'yellow';
  const priority = params.priority || getColorPriority(color);
  const style = params.style || 'highlight';

  // Generate an informative title if not provided
  const title = params.title || (initialText.length > 40 ? initialText.substring(0, 37) + '...' : initialText);

  const location = buildTextLocation({
    pageNumber: params.pageNumber,
    text: initialText,
    startOffset: params.startOffset,
    endOffset: params.endOffset,
    sectionId: params.sectionId,
  });

  const initialSegment: ExcerptSegment = {
    id: segmentId,
    pageNumber: params.pageNumber,
    text: initialText,
    color,
    createdAt: now,
    rects: params.rects,
    startOffset: location.startOffset,
    endOffset: location.endOffset,
    sectionId: params.sectionId,
    location,
    style,
  };

  const segments = [initialSegment];

  return {
    id: excerptId,
    title,
    pageNumber: params.pageNumber,
    segments,
    marginNote: params.marginNote || '',
    tags: params.tags || ['Key Point'],
    color,
    priority,
    comments: [],
    createdAt: now,
    updatedAt: now,
    spanSummary: computeSpanSummary(segments),
  };
}

/**
 * Appends a segment to an existing continuous excerpt, storing start and end points metadata.
 */
export function appendSegmentToExcerpt(
  excerpt: ContinuousExcerpt,
  params: {
    pageNumber: number;
    text: string;
    color?: HighlightColor;
    rects?: ExcerptSegment['rects'];
    startOffset?: number;
    endOffset?: number;
    sectionId?: string;
    style?: 'highlight' | 'underline';
  }
): ContinuousExcerpt {
  const trimmed = params.text.trim();
  if (!trimmed) return excerpt;

  const location = buildTextLocation({
    pageNumber: params.pageNumber,
    text: trimmed,
    startOffset: params.startOffset,
    endOffset: params.endOffset,
    sectionId: params.sectionId,
  });

  const newSegment: ExcerptSegment = {
    id: 'seg-' + Math.random().toString(36).substring(2, 9),
    pageNumber: params.pageNumber,
    text: trimmed,
    color: params.color || excerpt.color,
    createdAt: new Date().toISOString(),
    rects: params.rects,
    startOffset: location.startOffset,
    endOffset: location.endOffset,
    sectionId: params.sectionId,
    location,
    style: params.style || 'highlight',
  };

  const updatedSegments = [...excerpt.segments, newSegment];

  return {
    ...excerpt,
    segments: updatedSegments,
    updatedAt: new Date().toISOString(),
    spanSummary: computeSpanSummary(updatedSegments),
  };
}

/**
 * Removes a single segment from an excerpt
 */
export function removeSegmentFromExcerpt(
  excerpt: ContinuousExcerpt,
  segmentId: string
): ContinuousExcerpt {
  const remaining = excerpt.segments.filter(s => s.id !== segmentId);
  return {
    ...excerpt,
    segments: remaining,
    updatedAt: new Date().toISOString(),
    spanSummary: computeSpanSummary(remaining),
  };
}

/**
 * Updates an excerpt's margin note or tags
 */
export function updateExcerptMarginNote(
  excerpt: ContinuousExcerpt,
  marginNote: string
): ContinuousExcerpt {
  return {
    ...excerpt,
    marginNote,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Adds a threaded comment or reflection directly inside a margin note.
 */
export function addCommentToExcerpt(
  excerpt: ContinuousExcerpt,
  content: string,
  author = 'Reader'
): ContinuousExcerpt {
  const trimmed = content.trim();
  if (!trimmed) return excerpt;

  const newComment: SubComment = {
    id: 'subcom-' + Math.random().toString(36).substring(2, 9),
    author,
    content: trimmed,
    createdAt: new Date().toISOString(),
    isResolved: false,
  };

  return {
    ...excerpt,
    comments: [...(excerpt.comments || []), newComment],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Deletes a threaded comment from a margin note.
 */
export function deleteCommentFromExcerpt(
  excerpt: ContinuousExcerpt,
  commentId: string
): ContinuousExcerpt {
  return {
    ...excerpt,
    comments: (excerpt.comments || []).filter(c => c.id !== commentId),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Toggles resolved status of a comment in a margin note.
 */
export function toggleCommentResolvedInExcerpt(
  excerpt: ContinuousExcerpt,
  commentId: string
): ContinuousExcerpt {
  return {
    ...excerpt,
    comments: (excerpt.comments || []).map(c =>
      c.id === commentId ? { ...c, isResolved: !c.isResolved } : c
    ),
    updatedAt: new Date().toISOString(),
  };
}
