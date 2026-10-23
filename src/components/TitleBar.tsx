import React, { useState } from 'react';
import {
  FileText,
  Minus,
  Square,
  X,
  Palette,
  FolderOpen,
  Sparkles,
  Link2,
  ChevronDown,
  Check,
  Maximize2,
  RefreshCw,
  Cloud,
  CheckCircle2,
  LogIn,
  LogOut,
  User as UserIcon,
  Database
} from 'lucide-react';
import { DocumentMeta, ThemeMode } from '../types/pdf';

interface TitleBarProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  documentMeta: DocumentMeta;
  activeExcerptTitle?: string;
  isContinuousMode: boolean;
  onToggleContinuousMode: () => void;
  onOpenFileClick: () => void;
  currentPage: number;
  totalPages: number;
  saveStatus?: 'saved' | 'saving' | 'ready';
  lastSavedTime?: Date | null;
  onManualSave?: () => void;
  user?: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  cloudSyncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
  onManualCloudSync?: () => void;
  lastCloudSyncTime?: Date | null;
}

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: string; previewBg: string; previewText: string }[] = [
  { id: 'win11-light', label: 'Windows 11 Light', icon: '🪟', previewBg: '#ffffff', previewText: '#1e1e1e' },
  { id: 'win11-dark', label: 'Windows 11 Dark', icon: '🌙', previewBg: '#232326', previewText: '#f4f4f5' },
  { id: 'macos-glass', label: 'macOS Liquid Glass', icon: '💎', previewBg: 'rgba(255, 255, 255, 0.85)', previewText: '#007aff' },
  { id: 'sepia', label: 'Warm Sepia Paper', icon: '📜', previewBg: '#fefbf3', previewText: '#382e25' },
  { id: 'nord', label: 'Nord Deep Blue', icon: '❄️', previewBg: '#2e3440', previewText: '#eceff4' },
  { id: 'high-contrast', label: 'Obsidian High Contrast', icon: '🖤', previewBg: '#000000', previewText: '#ffff00' },
];

export const TitleBar: React.FC<TitleBarProps> = ({
  theme,
  onThemeChange,
  documentMeta,
  activeExcerptTitle,
  isContinuousMode,
  onToggleContinuousMode,
  onOpenFileClick,
  currentPage,
  totalPages,
  saveStatus = 'saved',
  lastSavedTime,
  onManualSave,
  user,
  onSignIn,
  onSignOut,
  cloudSyncStatus = 'idle',
  onManualCloudSync,
  lastCloudSyncTime,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const handleToggleMaximize = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsMaximized(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsMaximized(false);
    }
  };

  return (
    <header
      className={`h-10 select-none flex items-center justify-between px-3 border-b border-[var(--border-subtle)] bg-[var(--bg-titlebar)] text-[var(--text-primary)] text-xs font-medium z-40 transition-colors ${
        theme === 'macos-glass'
          ? 'backdrop-blur-2xl bg-white/50 border-white/40 shadow-xs'
          : ''
      }`}
      role="banner"
    >
      {/* Left section: App Brand & Window controls */}
      <div className="flex items-center gap-2 min-w-0">
        {theme === 'macos-glass' ? (
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] inline-block shadow-xs transition-transform hover:scale-110" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24] inline-block shadow-xs transition-transform hover:scale-110" />
            <span className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] inline-block shadow-xs transition-transform hover:scale-110" />
          </div>
        ) : null}

        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${
          theme === 'macos-glass' ? 'liquid-glass-pill text-[var(--text-primary)]' : 'hover:bg-black/5 dark:hover:bg-white/5'
        } cursor-pointer`}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[var(--accent)] text-white shadow-xs">
            <FileText className="w-3 h-3" />
          </div>
          <span className="font-semibold tracking-tight text-[var(--text-primary)]">FluentPDF</span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 text-[var(--accent)] bg-[var(--accent-light)] rounded-full">
            {theme === 'macos-glass' ? 'macOS Glass' : 'Win11'}
          </span>
        </div>

        <span className="text-[var(--text-secondary)] opacity-50 hidden sm:inline">|</span>

        {/* Document Title & Page */}
        <div className="hidden sm:flex items-center gap-1.5 truncate text-[11px] text-[var(--text-secondary)] max-w-sm">
          <span className="truncate font-medium text-[var(--text-primary)]">{documentMeta.title}</span>
          <span>·</span>
          <span className="whitespace-nowrap">Page {currentPage} of {totalPages}</span>
        </div>

        {/* Auto-Save Visual Indicator */}
        <button
          onClick={onManualSave}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] transition-all cursor-pointer ${
            theme === 'macos-glass'
              ? 'liquid-glass-pill bg-white/60 hover:bg-white/80'
              : 'bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] hover:bg-black/10'
          }`}
          title={`Auto-saving every 30 seconds to localStorage.${
            lastSavedTime ? ' Last saved: ' + lastSavedTime.toLocaleTimeString() : ''
          }. Click to save manually now.`}
          aria-label="Auto-save status"
        >
          {saveStatus === 'saving' ? (
            <>
              <RefreshCw className="w-3 h-3 text-[var(--accent)] animate-spin" />
              <span className="text-[var(--accent)] font-semibold">Auto-saving...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[var(--text-secondary)] font-medium">
                {lastSavedTime
                  ? `Saved ${lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                  : 'Auto-saved'}
              </span>
            </>
          )}
        </button>

        {/* Continuous Excerpt Mode pill indicator */}
        {isContinuousMode && (
          <button
            onClick={onToggleContinuousMode}
            className={`hidden lg:flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
              theme === 'macos-glass'
                ? 'liquid-glass-pill bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-400/40'
                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
            } animate-pulse hover:opacity-90 transition-all`}
            title="Continuous Excerpt Highlighting is active! Highlights will merge automatically into one excerpt."
            aria-label="Continuous Excerpt Mode is Active"
          >
            <Link2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="truncate max-w-[130px]">
              Continuous: {activeExcerptTitle ? `"${activeExcerptTitle}"` : 'Active'}
            </span>
          </button>
        )}
      </div>

      {/* Middle/Right Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Open PDF button */}
        <button
          onClick={onOpenFileClick}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-primary)] transition-colors"
          aria-label="Open PDF Document"
        >
          <FolderOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="hidden sm:inline">Open PDF</span>
        </button>

        {/* Theme Selector Popover */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]"
            aria-label="Change Application Theme"
            aria-expanded={showThemeMenu}
          >
            <Palette className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="hidden sm:inline capitalize">
              {THEME_OPTIONS.find(t => t.id === theme)?.label || 'Theme'}
            </span>
            <ChevronDown className="w-3 h-3 text-[var(--text-secondary)]" />
          </button>

          {showThemeMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowThemeMenu(false)}
              />
              <div
                className="absolute right-0 mt-1.5 w-56 rounded-lg bg-[var(--card-bg)] border border-[var(--border-subtle)] shadow-xl p-1.5 z-50 text-[var(--text-primary)]"
                role="menu"
              >
                <div className="px-2 py-1 text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Windows Themes
                </div>
                {THEME_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onThemeChange(opt.id);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      theme === opt.id
                        ? 'bg-[var(--accent-light)] text-[var(--accent)] font-semibold'
                        : 'hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 inline-block"
                        style={{ backgroundColor: opt.previewBg }}
                      />
                      {theme === opt.id && <Check className="w-3.5 h-3.5 text-[var(--accent)]" />}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Cloud Sync & User Account */}
        <div className="relative">
          {user ? (
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]"
              aria-label="Cloud Account and Sync"
              aria-expanded={showUserMenu}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-4 h-4 rounded-full border border-black/20"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[9px] font-bold flex items-center justify-center">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex items-center gap-1">
                {cloudSyncStatus === 'syncing' ? (
                  <RefreshCw className="w-3 h-3 text-[var(--accent)] animate-spin" />
                ) : cloudSyncStatus === 'synced' ? (
                  <Cloud className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Cloud className="w-3 h-3 text-[var(--text-secondary)]" />
                )}
                <span className="hidden md:inline max-w-[90px] truncate">
                  {user.displayName?.split(' ')[0] || 'Account'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-[var(--text-secondary)]" />
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-[var(--accent)] hover:opacity-90 text-white transition-all shadow-xs cursor-pointer"
              title="Sign in with Google to sync annotations to Cloud SQL"
              aria-label="Sign In with Google for Cloud Sync"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In & Sync</span>
            </button>
          )}

          {/* User Account Popover */}
          {user && showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div
                className="absolute right-0 mt-1.5 w-64 rounded-lg bg-[var(--card-bg)] border border-[var(--border-subtle)] shadow-xl p-3 z-50 text-[var(--text-primary)]"
                role="menu"
              >
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-[var(--border-subtle)] mb-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-9 h-9 rounded-full border border-black/20 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[var(--accent)] text-white text-sm font-bold flex items-center justify-center shrink-0">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs truncate text-[var(--text-primary)]">
                      {user.displayName || 'Authenticated User'}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  {/* Cloud SQL connection status badge */}
                  <div className="flex items-center justify-between p-1.5 rounded bg-black/5 dark:bg-white/5 text-[10px]">
                    <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <Database className="w-3 h-3 text-emerald-500" />
                      <span>PostgreSQL Cloud SQL</span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Connected
                    </span>
                  </div>

                  {/* Cloud Sync Status */}
                  <div className="flex items-center justify-between p-1.5 rounded bg-black/5 dark:bg-white/5 text-[10px]">
                    <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <Cloud className="w-3 h-3 text-[var(--accent)]" />
                      <span>Sync Status</span>
                    </span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {cloudSyncStatus === 'syncing'
                        ? 'Syncing...'
                        : cloudSyncStatus === 'synced'
                        ? 'Synced ✓'
                        : cloudSyncStatus === 'error'
                        ? 'Sync Failed'
                        : 'Up to date'}
                    </span>
                  </div>

                  {lastCloudSyncTime && (
                    <p className="text-[9px] text-[var(--text-secondary)] text-right px-1">
                      Last sync: {lastCloudSyncTime.toLocaleTimeString()}
                    </p>
                  )}

                  {/* Manual Sync Now Button */}
                  <button
                    onClick={() => {
                      onManualCloudSync?.();
                      setShowUserMenu(false);
                    }}
                    className="mt-1 w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-[var(--accent)] hover:opacity-90 text-white font-medium text-xs transition-all shadow-xs cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${cloudSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                    <span>Sync with Cloud Now</span>
                  </button>

                  {/* Sign Out Button */}
                  <button
                    onClick={() => {
                      onSignOut?.();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Windows Standard Window Buttons */}
        <div className="flex items-center ml-2 border-l border-[var(--border-subtle)] pl-1">
          <button
            onClick={() => {}}
            className="w-8 h-8 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Minimize"
            aria-label="Minimize Window"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleToggleMaximize}
            className="w-8 h-8 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title={isMaximized ? 'Restore Down' : 'Maximize'}
            aria-label={isMaximized ? 'Restore Down' : 'Maximize'}
          >
            {isMaximized ? <Maximize2 className="w-3 h-3" /> : <Square className="w-3 h-3" />}
          </button>
          <button
            onClick={() => {
              if (window.confirm('Reset current document annotations?')) {
                window.location.reload();
              }
            }}
            className="w-8 h-8 flex items-center justify-center hover:bg-red-600 hover:text-white text-[var(--text-secondary)] transition-colors"
            title="Close / Reset Session"
            aria-label="Close Window"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
