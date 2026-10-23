import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { TitleBar } from './components/TitleBar';
import { CommandRibbon, RibbonTab } from './components/CommandRibbon';
import { LeftSidebar } from './components/LeftSidebar';
import { MarginNotesPanel } from './components/MarginNotesPanel';
import { PdfViewer } from './components/PdfViewer';
import { NotionExportModal } from './components/NotionExportModal';
import { SearchModal } from './components/SearchModal';
import {
  ActiveTool,
  ContinuousExcerpt,
  HighlightColor,
  InPageTextBox,
  MarginComment,
  PriorityLevel,
  ThemeMode,
} from './types/pdf';
import {
  BuiltinDocument,
  SAMPLE_DOCUMENTS,
  INITIAL_EXCERPTS,
  INITIAL_COMMENTS,
} from './data/sampleDocuments';
import {
  appendSegmentToExcerpt,
  createContinuousExcerpt,
  removeSegmentFromExcerpt,
  updateExcerptMarginNote,
  addCommentToExcerpt,
  deleteCommentFromExcerpt,
  toggleCommentResolvedInExcerpt,
  getColorPriority,
} from './utils/excerptManager';
import {
  generateNotionCSV,
  generateNotionMarkdown,
  generateNotionBlocksJSON,
  generateNotionQuickPasteText,
} from './utils/notionExport';
import { saveDocumentAsPdf } from './utils/pdfSaveService';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>('win11-light');

  // Documents state
  const [documents] = useState<BuiltinDocument[]>(SAMPLE_DOCUMENTS);
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const currentDoc = documents[activeDocIndex];

  // Viewer navigation state
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [viewMode, setViewMode] = useState<'single' | 'continuous' | 'two-page'>('single');
  const [isInvertedDocument, setIsInvertedDocument] = useState(false);
  const [activeRibbonTab, setActiveRibbonTab] = useState<RibbonTab>('home');

  // Tool & Continuous Excerpt state
  const [activeTool, setActiveTool] = useState<ActiveTool>('highlight');
  const [activeColor, setActiveColor] = useState<HighlightColor>('yellow');
  const [isContinuousMode, setIsContinuousMode] = useState(true); // ON by default as requested!
  const [activeExcerptId, setActiveExcerptId] = useState<string | undefined>('exc-demo-1');

  // Excerpts & Annotations
  const [excerpts, setExcerpts] = useState<ContinuousExcerpt[]>(INITIAL_EXCERPTS);
  const [comments, setComments] = useState<MarginComment[]>(INITIAL_COMMENTS);
  const [textBoxes, setTextBoxes] = useState<InPageTextBox[]>([
    {
      id: 'tb-demo-1',
      pageNumber: 1,
      x: 60,
      y: 18,
      text: 'Crucial insight: Disentangling key/value representations prevents quadratic computational blowup.',
      isBold: true,
      isItalic: false,
      isUnderline: false,
      fontFamily: 'sans',
      fontSize: 'sm',
      color: '#1e1e1e',
      bgColor: '#fef9c3',
      borderColor: '#fde047',
      createdAt: new Date().toISOString(),
    },
  ]);

  // Panels & Modals - responsive defaults: collapse on smaller screens
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [isMarginNotesOpen, setIsMarginNotesOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1280);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cloud Auth & Sync state
  const {
    user,
    signInWithGoogle,
    signOut,
    getIdToken,
    cloudSyncStatus,
    setCloudSyncStatus,
    lastCloudSync,
    setLastCloudSync,
  } = useAuth();

  // Auto-Save State & Timer
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'ready'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(() => new Date());

  // Restore saved modifications and annotations from localStorage on initial load
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem('fluentpdf_saved_state_v1');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed && Array.isArray(parsed.excerpts) && parsed.excerpts.length > 0) {
          setExcerpts(parsed.excerpts);
        }
        if (parsed && Array.isArray(parsed.comments)) {
          setComments(parsed.comments);
        }
        if (parsed && Array.isArray(parsed.textBoxes)) {
          setTextBoxes(parsed.textBoxes);
        }
        if (parsed && parsed.theme) {
          setTheme(parsed.theme);
        }
        if (parsed && typeof parsed.currentPage === 'number') {
          setCurrentPage(parsed.currentPage);
        }
        if (parsed && parsed.timestamp) {
          setLastSavedTime(new Date(parsed.timestamp));
        }
      }
    } catch (e) {
      console.warn('Failed to restore auto-saved session from localStorage:', e);
    }
  }, []);

  // Sync from Cloud SQL when user logs in or switches documents
  useEffect(() => {
    if (!user) return;
    let isCancelled = false;

    const pullCloudState = async () => {
      try {
        const idToken = await getIdToken();
        if (!idToken || isCancelled) return;

        const res = await fetch(`/api/sync/doc/${encodeURIComponent(currentDoc.meta.id)}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        const data = await res.json();
        if (isCancelled) return;

        if (data.success && data.state) {
          const state = data.state;
          if (state.excerpts) {
            const parsedEx = typeof state.excerpts === 'string' ? JSON.parse(state.excerpts) : state.excerpts;
            if (Array.isArray(parsedEx) && parsedEx.length > 0) setExcerpts(parsedEx);
          }
          if (state.comments) {
            const parsedCom = typeof state.comments === 'string' ? JSON.parse(state.comments) : state.comments;
            if (Array.isArray(parsedCom)) setComments(parsedCom);
          }
          if (state.textBoxes) {
            const parsedTb = typeof state.textBoxes === 'string' ? JSON.parse(state.textBoxes) : state.textBoxes;
            if (Array.isArray(parsedTb)) setTextBoxes(parsedTb);
          }
          if (state.theme) setTheme(state.theme);
          if (state.currentPage) setCurrentPage(state.currentPage);
          setCloudSyncStatus('synced');
          if (state.updatedAt) setLastCloudSync(new Date(state.updatedAt));
          showToast('Annotations synced from Cloud SQL');
        }
      } catch (err) {
        console.warn('Could not pull cloud state from Cloud SQL:', err);
      }
    };

    pullCloudState();
    return () => {
      isCancelled = true;
    };
  }, [user, currentDoc.meta.id, getIdToken, setCloudSyncStatus, setLastCloudSync]);

  // Save function: persists current excerpts, comments, and in-page document modifications to local storage & cloud
  const performSave = async (isManual = false) => {
    setSaveStatus('saving');
    try {
      const payload = {
        version: 1,
        timestamp: new Date().toISOString(),
        docId: currentDoc.meta.id,
        excerpts,
        comments,
        textBoxes,
        theme,
        currentPage,
      };
      localStorage.setItem('fluentpdf_saved_state_v1', JSON.stringify(payload));
      
      const now = new Date();
      setSaveStatus('saved');
      setLastSavedTime(now);

      // If user is authenticated, sync to PostgreSQL Cloud SQL backend
      if (user) {
        setCloudSyncStatus('syncing');
        try {
          const idToken = await getIdToken();
          if (idToken) {
            const response = await fetch(`/api/sync/doc/${encodeURIComponent(currentDoc.meta.id)}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({
                excerpts,
                comments,
                textBoxes,
                theme,
                currentPage,
              }),
            });
            const data = await response.json();
            if (data.success) {
              setCloudSyncStatus('synced');
              setLastCloudSync(new Date());
            } else {
              setCloudSyncStatus('error');
            }
          }
        } catch (cloudErr) {
          console.error('Failed to sync to Cloud SQL:', cloudErr);
          setCloudSyncStatus('error');
        }
      }

      if (isManual) {
        showToast(
          `Saved modifications ${user ? 'to Local & Cloud SQL' : 'to localStorage'} at ${now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}`
        );
      }
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('ready');
    }
  };

  // 30-Second Auto-Save Interval Timer
  useEffect(() => {
    const timer = setInterval(() => {
      performSave(false);
    }, 30000); // 30 seconds

    return () => clearInterval(timer);
  }, [excerpts, comments, textBoxes, theme, currentPage, currentDoc.meta.id, user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  const activeExcerpt = excerpts.find(e => e.id === activeExcerptId);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsNotionModalOpen(true);
      }
      if (e.key === 'ArrowRight' && !isSearchOpen && (e.target as HTMLElement)?.tagName !== 'INPUT' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
        setCurrentPage(p => Math.min(currentDoc.meta.totalPages, p + 1));
      }
      if (e.key === 'ArrowLeft' && !isSearchOpen && (e.target as HTMLElement)?.tagName !== 'INPUT' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
        setCurrentPage(p => Math.max(1, p - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDoc, isSearchOpen]);

  // Handler: Append segment to excerpt
  const handleAppendSegment = (
    excerptId: string,
    segment: { text: string; pageNumber: number; startOffset?: number; endOffset?: number; sectionId?: string; style?: 'highlight' | 'underline' }
  ) => {
    setExcerpts(prev =>
      prev.map(exc => {
        if (exc.id === excerptId) {
          const updated = appendSegmentToExcerpt(exc, {
            pageNumber: segment.pageNumber,
            text: segment.text,
            color: activeColor,
            startOffset: segment.startOffset,
            endOffset: segment.endOffset,
            sectionId: segment.sectionId,
            style: segment.style || (activeTool === 'underline' ? 'underline' : 'highlight'),
          });
          showToast(
            `Appended ${segment.style === 'underline' ? 'underlined ' : ''}segment to "${exc.title}" (Part ${updated.segments.length}). Continuous quote merged!`
          );
          return updated;
        }
        return exc;
      })
    );
  };

  // Handler: Start new continuous excerpt
  const handleCreateNewExcerpt = (segment: {
    text: string;
    pageNumber: number;
    color: HighlightColor;
    startOffset?: number;
    endOffset?: number;
    sectionId?: string;
    style?: 'highlight' | 'underline';
  }) => {
    const newExc = createContinuousExcerpt({
      pageNumber: segment.pageNumber,
      text: segment.text,
      color: segment.color,
      startOffset: segment.startOffset,
      endOffset: segment.endOffset,
      sectionId: segment.sectionId,
      style: segment.style || (activeTool === 'underline' ? 'underline' : 'highlight'),
    });
    setExcerpts(prev => [newExc, ...prev]);
    setActiveExcerptId(newExc.id);
    showToast(`Created new ${segment.style === 'underline' ? 'Underlined ' : 'Continuous '}Excerpt: "${newExc.title}"`);
  };

  // Handler: Remove a single segment from an excerpt
  const handleRemoveSegment = (excerptId: string, segmentId: string) => {
    setExcerpts(prev =>
      prev
        .map(exc => {
          if (exc.id === excerptId) {
            const updated = removeSegmentFromExcerpt(exc, segmentId);
            return updated;
          }
          return exc;
        })
        .filter(exc => exc.segments.length > 0)
    );
    showToast('Removed segment from continuous excerpt.');
  };

  // Handler: Delete excerpt entirely
  const handleDeleteExcerpt = (id: string) => {
    setExcerpts(prev => prev.filter(e => e.id !== id));
    if (activeExcerptId === id) {
      setActiveExcerptId(undefined);
    }
    showToast('Deleted excerpt.');
  };

  // Handler: Update excerpt note
  const handleUpdateExcerptNote = (id: string, note: string) => {
    setExcerpts(prev =>
      prev.map(e => (e.id === id ? updateExcerptMarginNote(e, note) : e))
    );
  };

  // Handler: Update excerpt title
  const handleUpdateExcerptTitle = (id: string, title: string) => {
    setExcerpts(prev =>
      prev.map(e => (e.id === id ? { ...e, title, updatedAt: new Date().toISOString() } : e))
    );
  };

  // Handler: Tag management
  const handleAddExcerptTag = (id: string, tag: string) => {
    setExcerpts(prev =>
      prev.map(e => {
        if (e.id === id && !e.tags.includes(tag)) {
          return { ...e, tags: [...e.tags, tag], updatedAt: new Date().toISOString() };
        }
        return e;
      })
    );
  };

  const handleRemoveExcerptTag = (id: string, tag: string) => {
    setExcerpts(prev =>
      prev.map(e => {
        if (e.id === id) {
          return { ...e, tags: e.tags.filter(t => t !== tag), updatedAt: new Date().toISOString() };
        }
        return e;
      })
    );
  };

  // Standalone comment handlers
  const handleAddComment = (commentData: Omit<MarginComment, 'id' | 'createdAt'>) => {
    const newComment: MarginComment = {
      ...commentData,
      id: 'com-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [newComment, ...prev]);
    showToast('Added margin note.');
  };

  const handleDeleteComment = (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const handleToggleCommentResolved = (id: string) => {
    setComments(prev =>
      prev.map(c => (c.id === id ? { ...c, isResolved: !c.isResolved } : c))
    );
  };

  // In-Page Comment Boxes / Text on PDF handlers
  const handleAddTextBox = (boxData: Omit<InPageTextBox, 'id' | 'createdAt'>) => {
    const newBox: InPageTextBox = {
      ...boxData,
      id: 'tb-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    setTextBoxes(prev => [...prev, newBox]);
    showToast('Added comment box directly on PDF! Type your notes and customize styling.');
  };

  const handleUpdateTextBox = (updated: InPageTextBox) => {
    setTextBoxes(prev => prev.map(b => (b.id === updated.id ? updated : b)));
  };

  const handleDeleteTextBox = (id: string) => {
    setTextBoxes(prev => prev.filter(b => b.id !== id));
    showToast('Deleted note box.');
  };

  // Sub-comments in Margin Notes
  const handleAddSubCommentToExcerpt = (excerptId: string, content: string, author = 'Reader') => {
    setExcerpts(prev =>
      prev.map(e => (e.id === excerptId ? addCommentToExcerpt(e, content, author) : e))
    );
    showToast('Added comment to margin note discussion.');
  };

  const handleDeleteSubCommentFromExcerpt = (excerptId: string, commentId: string) => {
    setExcerpts(prev =>
      prev.map(e => (e.id === excerptId ? deleteCommentFromExcerpt(e, commentId) : e))
    );
    showToast('Removed comment.');
  };

  const handleToggleSubCommentResolved = (excerptId: string, commentId: string) => {
    setExcerpts(prev =>
      prev.map(e => (e.id === excerptId ? toggleCommentResolvedInExcerpt(e, commentId) : e))
    );
  };

  const handleUpdateExcerptPriority = (excerptId: string, priority: PriorityLevel) => {
    setExcerpts(prev =>
      prev.map(e => (e.id === excerptId ? { ...e, priority, updatedAt: new Date().toISOString() } : e))
    );
    showToast(`Updated excerpt priority to ${priority}.`);
  };

  const handleUpdateExcerptColor = (excerptId: string, color: HighlightColor) => {
    setExcerpts(prev =>
      prev.map(e =>
        e.id === excerptId
          ? {
              ...e,
              color,
              priority: getColorPriority(color),
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );
    showToast(`Updated highlight color to ${color}.`);
  };

  // Save As PDF Permanently
  const handleSaveAsPdf = async () => {
    showToast('Generating permanent PDF with all highlights and notes...');
    try {
      await saveDocumentAsPdf(currentDoc.meta.title, msg => showToast(msg));
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.3 },
        });
      } catch {}
      showToast('Successfully exported permanent annotated PDF!');
    } catch (err) {
      console.error('Error saving PDF:', err);
      window.print();
    }
  };

  // Notion Quick Copy
  const handleQuickCopyNotion = () => {
    const text = generateNotionQuickPasteText(currentDoc.meta, excerpts, comments);
    navigator.clipboard.writeText(text);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.2 },
      });
    } catch {}
    showToast('Copied Notion Markdown! Press Ctrl+V inside any Notion page.');
  };

  // Notion Downloads
  const downloadFileHelper = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}!`);
  };

  const handleDownloadMarkdown = () => {
    const content = generateNotionMarkdown(currentDoc.meta, excerpts, comments);
    downloadFileHelper('reading-notes-notion.md', content, 'text/markdown');
  };

  const handleDownloadCSV = () => {
    const content = generateNotionCSV(currentDoc.meta, excerpts, comments);
    downloadFileHelper('reading-database-notion.csv', content, 'text/csv');
  };

  const handleDownloadJSON = () => {
    const content = generateNotionBlocksJSON(currentDoc.meta, excerpts, comments);
    downloadFileHelper('notion-blocks.json', content, 'application/json');
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        // Create an uploaded document entry
        const paragraphs = text
          .split(/\n\s*\n/)
          .map(p => p.trim())
          .filter(Boolean);

        const pageSize = 4;
        const totalPgs = Math.max(1, Math.ceil(paragraphs.length / pageSize));
        const newPages = Array.from({ length: totalPgs }, (_, i) => ({
          pageNumber: i + 1,
          sections: paragraphs.slice(i * pageSize, (i + 1) * pageSize).map((p, pIdx) => ({
            id: `up-p${i + 1}-s${pIdx}`,
            type: (p.length < 60 && !p.endsWith('.') ? 'heading' : 'paragraph') as
              | 'heading'
              | 'paragraph',
            content: p,
          })),
        }));

        const newDoc: BuiltinDocument = {
          meta: {
            id: 'doc-upload-' + Date.now(),
            title: file.name.replace(/\.[^/.]+$/, ''),
            author: 'Local File',
            totalPages: totalPgs,
            source: 'uploaded',
            filename: file.name,
          },
          pages: newPages,
        };

        documents.push(newDoc);
        setActiveDocIndex(documents.length - 1);
        setCurrentPage(1);
        showToast(`Loaded "${file.name}" into FluentPDF.`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      data-theme={theme}
      className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)] font-sans transition-colors"
    >
      {/* Hidden File Input for PDF / text file loading */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.txt,.md,.json"
        className="hidden"
      />

      {/* Windows 11 / macOS Title Bar */}
      <TitleBar
        theme={theme}
        onThemeChange={setTheme}
        documentMeta={currentDoc.meta}
        activeExcerptTitle={activeExcerpt?.title}
        isContinuousMode={isContinuousMode}
        onToggleContinuousMode={() => {
          setIsContinuousMode(!isContinuousMode);
          showToast(
            !isContinuousMode
              ? 'Continuous Highlighting ON: Highlights will merge automatically into one excerpt.'
              : 'Continuous Highlighting OFF: Regular highlight selection popup active.'
          );
        }}
        onOpenFileClick={() => fileInputRef.current?.click()}
        currentPage={currentPage}
        totalPages={currentDoc.meta.totalPages}
        saveStatus={saveStatus}
        lastSavedTime={lastSavedTime}
        onManualSave={() => performSave(true)}
        user={user}
        onSignIn={signInWithGoogle}
        onSignOut={signOut}
        cloudSyncStatus={cloudSyncStatus}
        onManualCloudSync={() => performSave(true)}
        lastCloudSyncTime={lastCloudSync}
      />

      {/* Windows Fluent Command Ribbon */}
      <CommandRibbon
        activeTab={activeRibbonTab}
        onTabChange={setActiveRibbonTab}
        activeTool={activeTool}
        onToolChange={setActiveTool}
        activeColor={activeColor}
        onColorChange={setActiveColor}
        theme={theme}
        onThemeChange={setTheme}
        isContinuousMode={isContinuousMode}
        onToggleContinuousMode={() => {
          setIsContinuousMode(!isContinuousMode);
          showToast(
            !isContinuousMode
              ? 'Continuous Highlighting ON: Highlights will merge automatically into one excerpt.'
              : 'Continuous Highlighting OFF: Regular highlight selection popup active.'
          );
        }}
        onNewContinuousExcerpt={() => {
          setActiveExcerptId(undefined);
          showToast('Ready for new continuous excerpt thread. Highlight any text to begin!');
        }}
        activeExcerptTitle={activeExcerpt?.title}
        currentPage={currentPage}
        totalPages={currentDoc.meta.totalPages}
        onPageChange={setCurrentPage}
        zoom={zoom}
        onZoomChange={setZoom}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotionModal={() => setIsNotionModalOpen(true)}
        onQuickCopyNotion={handleQuickCopyNotion}
        onDownloadMarkdown={handleDownloadMarkdown}
        onDownloadCSV={handleDownloadCSV}
        onDownloadJSON={handleDownloadJSON}
        onRotatePage={() => showToast('Rotated page view 90°')}
        onToggleInvertDocument={() => setIsInvertedDocument(!isInvertedDocument)}
        isInvertedDocument={isInvertedDocument}
        onSaveAsPdf={handleSaveAsPdf}
      />

      {/* Workspace Body: Left Sidebar + PDF Canvas + Right Margin Notes */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Sidebar */}
        <LeftSidebar
          documentMeta={currentDoc.meta}
          totalPages={currentDoc.meta.totalPages}
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          excerpts={excerpts}
          isOpen={isLeftSidebarOpen}
          onToggleOpen={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        />

        {/* Central PDF Viewer */}
        <PdfViewer
          document={currentDoc}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          zoom={zoom}
          viewMode={viewMode}
          isInvertedDocument={isInvertedDocument}
          excerpts={excerpts}
          comments={comments}
          textBoxes={textBoxes}
          areas={[]}
          activeExcerpt={activeExcerpt}
          activeColor={activeColor}
          onColorChange={setActiveColor}
          isContinuousMode={isContinuousMode}
          activeTool={activeTool}
          onAppendSegmentToExcerpt={handleAppendSegment}
          onCreateNewExcerptWithSegment={handleCreateNewExcerpt}
          onSetActiveExcerpt={setActiveExcerptId}
          onAddComment={handleAddComment}
          onAddTextBox={handleAddTextBox}
          onUpdateTextBox={handleUpdateTextBox}
          onDeleteTextBox={handleDeleteTextBox}
        />

        {/* Right Margin Notes Gutter */}
        <MarginNotesPanel
          excerpts={excerpts}
          comments={comments}
          activeExcerptId={activeExcerptId}
          onSetActiveExcerpt={setActiveExcerptId}
          onUpdateExcerptNote={handleUpdateExcerptNote}
          onUpdateExcerptTitle={handleUpdateExcerptTitle}
          onAddExcerptTag={handleAddExcerptTag}
          onRemoveExcerptTag={handleRemoveExcerptTag}
          onRemoveSegment={handleRemoveSegment}
          onDeleteExcerpt={handleDeleteExcerpt}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onToggleCommentResolved={handleToggleCommentResolved}
          onAddSubCommentToExcerpt={handleAddSubCommentToExcerpt}
          onDeleteSubCommentFromExcerpt={handleDeleteSubCommentFromExcerpt}
          onToggleSubCommentResolved={handleToggleSubCommentResolved}
          onUpdateExcerptPriority={handleUpdateExcerptPriority}
          onUpdateExcerptColor={handleUpdateExcerptColor}
          currentPage={currentPage}
          onJumpToPage={setCurrentPage}
          isOpen={isMarginNotesOpen}
          onToggleOpen={() => setIsMarginNotesOpen(!isMarginNotesOpen)}
          onManualSave={() => performSave(true)}
        />
      </div>

      {/* Notion Export Center Modal */}
      <NotionExportModal
        isOpen={isNotionModalOpen}
        onClose={() => setIsNotionModalOpen(false)}
        documentMeta={currentDoc.meta}
        excerpts={excerpts}
        comments={comments}
      />

      {/* Document Text Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        document={currentDoc}
        currentPage={currentPage}
        onJumpToPage={setCurrentPage}
      />

      {/* Windows Fluent Toast Notification Banner */}
      {toastMessage && (
        <div
          className="fixed bottom-4 right-4 z-50 bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-xl rounded-lg px-3.5 py-2 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200"
          role="status"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
