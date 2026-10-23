export type ThemeMode =
  | 'win11-light'
  | 'win11-dark'
  | 'sepia'
  | 'nord'
  | 'high-contrast'
  | 'macos-glass';

export type HighlightColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink';

export type PriorityLevel = 'P1-Critical' | 'P2-Important' | 'P3-Standard' | 'P4-Review';

export interface PriorityInfo {
  level: PriorityLevel;
  label: string;
  color: HighlightColor;
  description: string;
}

export interface BoundingBox {
  x: number; // percentage (0-100) or pixels
  y: number;
  width: number;
  height: number;
}

export interface TextLocation {
  pageNumber: number;
  sectionId?: string;
  startOffset: number;
  endOffset: number;
  startLabel: string;
  endLabel: string;
}

export interface ExcerptSegment {
  id: string;
  pageNumber: number;
  text: string;
  color: HighlightColor;
  createdAt: string;
  rects?: BoundingBox[];
  startOffset?: number;
  endOffset?: number;
  sectionId?: string;
  location?: TextLocation;
  style?: 'highlight' | 'underline';
}

export interface SubComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  isResolved?: boolean;
}

export interface ContinuousExcerpt {
  id: string;
  title: string;
  pageNumber: number;
  segments: ExcerptSegment[];
  marginNote: string;
  tags: string[];
  color: HighlightColor;
  priority?: PriorityLevel;
  comments?: SubComment[]; // Threaded discussion / comments directly inside the margin note
  createdAt: string;
  updatedAt: string;
  spanSummary?: string;
}

export interface MarginComment {
  id: string;
  excerptId?: string; // linked to a continuous excerpt or standalone
  pageNumber: number;
  yPosition: number; // top percentage on page (0-100)
  author: string;
  content: string;
  createdAt: string;
  type: 'note' | 'question' | 'idea' | 'todo';
  isResolved?: boolean;
}

export type FontFamily = 'sans' | 'serif' | 'mono' | 'handwriting';
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';

export interface InPageTextBox {
  id: string;
  pageNumber: number;
  x: number; // percentage (0-100) or px
  y: number; // percentage (0-100) or px
  width?: number;
  text: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  fontFamily: FontFamily;
  fontSize: FontSize;
  color: string;      // text color hex
  bgColor: string;    // box background color hex or rgba
  borderColor?: string;
  createdAt: string;
  isMinimized?: boolean;
}

export interface AreaAnnotation {
  id: string;
  pageNumber: number;
  box: BoundingBox;
  title: string;
  comment?: string;
  color: HighlightColor;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  pageNumber: number;
  title: string;
  createdAt: string;
}

export interface DocumentMeta {
  id: string;
  title: string;
  author: string;
  year?: string;
  totalPages: number;
  source: 'builtin' | 'uploaded';
  filename?: string;
}

export type ActiveTool =
  | 'select'
  | 'highlight'
  | 'underline'
  | 'continuous'
  | 'margin-note'
  | 'text-box'
  | 'area'
  | 'eraser';

export interface SearchResult {
  pageNumber: number;
  matchIndex: number;
  preview: string;
  exactMatch: string;
}
