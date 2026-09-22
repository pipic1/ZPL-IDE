/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  FolderOpen,
  Save,
  Download,
  Printer,
  Sliders,
  Undo2,
  Redo2,
  Scissors,
  Copy,
  Clipboard,
  CopyPlus,
  Trash2,
  CheckSquare,
  Square,
  Type,
  Barcode,
  QrCode,
  Minus,
  Image as ImageIcon,
  Columns,
  Eye,
  Code2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Ruler,
  Magnet,
  Sun,
  Moon,
  Monitor,
  HelpCircle,
  Keyboard,
  ExternalLink,
  ChevronRight,
  Check,
  HardDrive,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ZplElementType } from '../types/zpl';

interface MenuBarProps {
  onNew: () => void;
  onOpenTemplates: () => void;
  onOpenLibrary?: () => void;
  onImportFile: () => void;
  onOpenImageModal: () => void;
  onSaveLocal: () => void;
  onSaveToDisk?: () => void;
  onExportZpl: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
  onOpenDimensionsModal: () => void;

  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  hasClipboard: boolean;
  hasSelection: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;

  onInsert: (type: ZplElementType) => void;

  onAlign: (type: 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom') => void;

  activeView: 'both' | 'canvas' | 'code';
  onChangeView: (view: 'both' | 'canvas' | 'code') => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  showRulers: boolean;
  onToggleRulers: () => void;
  rulerUnit: 'dots' | 'mm';
  onToggleRulerUnit: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;

  onShowShortcuts: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onNew,
  onOpenTemplates,
  onOpenLibrary,
  onImportFile,
  onOpenImageModal,
  onSaveLocal,
  onSaveToDisk,
  onExportZpl,
  onExportPng,
  onExportSvg,
  onExportPdf,
  onPrint,
  onOpenDimensionsModal,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  hasClipboard,
  hasSelection,
  onDuplicate,
  onDelete,
  onSelectAll,
  onClearSelection,
  onInsert,
  onAlign,
  activeView,
  onChangeView,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  showRulers,
  onToggleRulers,
  rulerUnit,
  onToggleRulerUnit,
  snapToGrid,
  onToggleSnap,
  onShowShortcuts,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const menuBarRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleMenuClick = (name: string) => {
    setActiveMenu(activeMenu === name ? null : name);
  };

  const handleMenuHover = (name: string) => {
    if (activeMenu !== null) {
      setActiveMenu(name);
    }
  };

  const handleAction = (action: () => void) => {
    action();
    setActiveMenu(null);
  };

  return (
    <div
      ref={menuBarRef}
      className="flex items-center select-none text-[12px] font-sans text-zinc-700 dark:text-zinc-300 relative z-50"
    >
      {/* File Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('file')}
          onMouseEnter={() => handleMenuHover('file')}
          className={`px-2.5 py-1 rounded-xs transition ${
            activeMenu === 'file'
              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white'
              : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
          }`}
        >
          File
        </button>

        {activeMenu === 'file' && (
          <div className="absolute left-0 top-full mt-0.5 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-xl p-1 text-xs">
            <button
              onClick={() => handleAction(onNew)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                <span>New Label</span>
              </span>
              <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+Alt+N</kbd>
            </button>

            {onOpenLibrary && (
              <button
                onClick={() => handleAction(onOpenLibrary)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition text-emerald-600 dark:text-emerald-400 font-medium"
              >
                <span className="flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Label Library (LocalStorage)...</span>
                </span>
                <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+L</kbd>
              </button>
            )}

            <button
              onClick={() => handleAction(onOpenTemplates)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <FolderOpen className="w-3.5 h-3.5 text-zinc-500" />
                <span>Open Template...</span>
              </span>
            </button>

            <button
              onClick={() => handleAction(onImportFile)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <FolderOpen className="w-3.5 h-3.5 text-zinc-500" />
                <span>Import ZPL File...</span>
              </span>
              <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+O</kbd>
            </button>

            <button
              onClick={() => handleAction(onOpenImageModal)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                <span>Import Image / Logo (^GF)...</span>
              </span>
            </button>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

            {/* Save to Local Library */}
            <button
              onClick={() => handleAction(onSaveLocal)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Save className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Save to Local Library</span>
              </span>
              <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+S</kbd>
            </button>

            {/* Save directly on disk */}
            {onSaveToDisk && (
              <button
                onClick={() => handleAction(onSaveToDisk)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Save on Disk (.zpl)</span>
                </span>
                <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+Shift+S</kbd>
              </button>
            )}

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

            {/* Exports */}
            <div className="px-2 py-0.5 text-[9px] font-mono uppercase text-zinc-600 dark:text-zinc-400 tracking-wider">
              Export
            </div>

            <button
              onClick={() => handleAction(onExportZpl)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span>Export ZPL (.zpl)</span>
              </span>
            </button>

            <button
              onClick={() => handleAction(onExportPng)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span>Export PNG (High Res)</span>
              </span>
            </button>

            <button
              onClick={() => handleAction(onExportSvg)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span>Export SVG Vector</span>
              </span>
            </button>

            <button
              onClick={() => handleAction(onExportPdf)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span>Export Print-Ready PDF</span>
              </span>
            </button>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

            <button
              onClick={() => handleAction(onPrint)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Printer className="w-3.5 h-3.5 text-zinc-500" />
                <span>Print Directly...</span>
              </span>
              <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+P</kbd>
            </button>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

            <button
              onClick={() => handleAction(onOpenDimensionsModal)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                <span>Label Size & DPI Settings...</span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('edit')}
          onMouseEnter={() => handleMenuHover('edit')}
          className={`px-2.5 py-1 rounded-xs transition ${
            activeMenu === 'edit'
              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white'
              : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
          }`}
        >
          Edit
        </button>

        {activeMenu === 'edit' && (
          <div className="absolute left-0 top-full mt-0.5 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-xl p-1 text-xs">
            <button
              disabled={!canUndo}
              onClick={() => handleAction(onUndo)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Undo2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Undo</span>
              </span>
              <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+Z</kbd>
            </button>

            <button
              disabled={!canRedo}
              onClick={() => handleAction(onRedo)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Redo2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Redo</span>
              </span>
              <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+Y</kbd>
            </button>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

            <button
              disabled={!hasSelection}
              onClick={() => handleAction(onCut)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Scissors className="w-3.5 h-3.5 text-zinc-500" />
                <span>Cut</span>
              </span>
              <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+X</kbd>
            </button>

            <button
              disabled={!hasSelection}
              onClick={() => handleAction(onCopy)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Copy className="w-3.5 h-3.5 text-zinc-500" />
                <span>Copy</span>
              </span>
              <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+C</kbd>
            </button>

            <button
              disabled={!hasClipboard}
              onClick={() => handleAction(onPaste)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Clipboard className="w-3.5 h-3.5 text-zinc-500" />
                <span>Paste</span>
              </span>
              <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+V</kbd>
            </button>

            <button
              disabled={!hasSelection}
              onClick={() => handleAction(onDuplicate)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-left transition"
            >
              <span className="flex items-center gap-2">
                <CopyPlus className="w-3.5 h-3.5 text-zinc-500" />
                <span>Duplicate</span>
              </span>
              <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+D</kbd>
            </button>

            <button
              disabled={!hasSelection}
              onClick={() => handleAction(onDelete)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 disabled:opacity-40 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Delete</span>
              </span>
              <kbd className="text-[10px] font-mono text-red-400">Del</kbd>
            </button>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

            <button
              onClick={() => handleAction(onSelectAll)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-zinc-500" />
                <span>Select All</span>
              </span>
              <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+A</kbd>
            </button>

            <button
              onClick={() => handleAction(onClearSelection)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Square className="w-3.5 h-3.5 text-zinc-500" />
                <span>Deselect</span>
              </span>
              <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Esc</kbd>
            </button>
          </div>
        )}
      </div>

      {/* Insert Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('insert')}
          onMouseEnter={() => handleMenuHover('insert')}
          className={`px-2.5 py-1 rounded-xs transition ${
            activeMenu === 'insert'
              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white'
              : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
          }`}
        >
          Insert
        </button>

        {activeMenu === 'insert' && (
          <div className="absolute left-0 top-full mt-0.5 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-xl p-1 text-xs">
            <button
              onClick={() => handleAction(() => onInsert('text'))}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Type className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Text Field</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">^A0</span>
            </button>

            <button
              onClick={() => handleAction(() => onInsert('barcode128'))}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Barcode className="w-3.5 h-3.5 text-sky-500" />
                <span>Code 128 Barcode</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">^BC</span>
            </button>

            <button
              onClick={() => handleAction(() => onInsert('qrcode'))}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <QrCode className="w-3.5 h-3.5 text-amber-500" />
                <span>QR Code (2D)</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">^BQ</span>
            </button>

            <button
              onClick={() => handleAction(() => onInsert('box'))}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Square className="w-3.5 h-3.5 text-blue-500" />
                <span>Box Frame</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">^GB</span>
            </button>

            <button
              onClick={() => handleAction(() => onInsert('line'))}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Minus className="w-3.5 h-3.5 text-cyan-500" />
                <span>Divider Line</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">^GB</span>
            </button>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

            <button
              onClick={() => handleAction(onOpenImageModal)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                <span>Image / Graphic...</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">^GF</span>
            </button>
          </div>
        )}
      </div>

      {/* Align Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('align')}
          onMouseEnter={() => handleMenuHover('align')}
          className={`px-2.5 py-1 rounded-xs transition ${
            activeMenu === 'align'
              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white'
              : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
          }`}
        >
          Align
        </button>

        {activeMenu === 'align' && (
          <div className="absolute left-0 top-full mt-0.5 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-xl p-1 text-xs">
            <button
              disabled={!hasSelection}
              onClick={() => handleAction(() => onAlign('centerX'))}
              className="w-full flex items-center px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-left transition"
            >
              <span>Align Center (Horizontal)</span>
            </button>
            <button
              disabled={!hasSelection}
              onClick={() => handleAction(() => onAlign('centerY'))}
              className="w-full flex items-center px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-left transition"
            >
              <span>Align Center (Vertical)</span>
            </button>
            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
            <button
              disabled={!hasSelection}
              onClick={() => handleAction(() => onAlign('left'))}
              className="w-full flex items-center px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-left transition"
            >
              <span>Align Left Margin</span>
            </button>
            <button
              disabled={!hasSelection}
              onClick={() => handleAction(() => onAlign('right'))}
              className="w-full flex items-center px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-left transition"
            >
              <span>Align Right Margin</span>
            </button>
            <button
              disabled={!hasSelection}
              onClick={() => handleAction(() => onAlign('top'))}
              className="w-full flex items-center px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-left transition"
            >
              <span>Align Top Margin</span>
            </button>
            <button
              disabled={!hasSelection}
              onClick={() => handleAction(() => onAlign('bottom'))}
              className="w-full flex items-center px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-left transition"
            >
              <span>Align Bottom Margin</span>
            </button>
          </div>
        )}
      </div>

      {/* View Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('view')}
          onMouseEnter={() => handleMenuHover('view')}
          className={`px-2.5 py-1 rounded-xs transition ${
            activeMenu === 'view'
              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white'
              : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
          }`}
        >
          View
        </button>

        {activeMenu === 'view' && (
          <div className="absolute left-0 top-full mt-0.5 w-60 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-xl p-1 text-xs">
            <button
              onClick={() => handleAction(() => onChangeView('both'))}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Columns className="w-3.5 h-3.5 text-zinc-500" />
                <span>Split View (Canvas + Code)</span>
              </span>
              {activeView === 'both' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>

            <button
              onClick={() => handleAction(() => onChangeView('canvas'))}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-zinc-500" />
                <span>Canvas Only</span>
              </span>
              {activeView === 'canvas' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>

            <button
              onClick={() => handleAction(() => onChangeView('code'))}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>ZPL Code Only</span>
              </span>
              {activeView === 'code' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

            <button
              onClick={() => handleAction(onZoomIn)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <ZoomIn className="w-3.5 h-3.5 text-zinc-500" />
                <span>Zoom In</span>
              </span>
              <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl++</kbd>
            </button>

            <button
              onClick={() => handleAction(onZoomOut)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <ZoomOut className="w-3.5 h-3.5 text-zinc-500" />
                <span>Zoom Out</span>
              </span>
              <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+-</kbd>
            </button>

            <button
              onClick={() => handleAction(onResetZoom)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Maximize2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Reset Zoom (100%)</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">{Math.round(zoom * 100)}%</span>
            </button>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

            <button
              onClick={() => handleAction(onToggleRulers)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Ruler className="w-3.5 h-3.5 text-zinc-500" />
                <span>Rulers</span>
              </span>
              {showRulers && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>

            <button
              onClick={() => handleAction(onToggleRulerUnit)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2 pl-5">
                <span>Ruler Unit: {rulerUnit.toUpperCase()}</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">{rulerUnit}</span>
            </button>

            <button
              onClick={() => handleAction(onToggleSnap)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Magnet className="w-3.5 h-3.5 text-zinc-500" />
                <span>Snap to Grid</span>
              </span>
              {snapToGrid && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

            {/* Theme switcher sub-items */}
            <div className="px-2 py-0.5 text-[9px] font-mono uppercase text-zinc-600 dark:text-zinc-400 tracking-wider">
              Color Theme
            </div>

            <button
              onClick={() => handleAction(() => setTheme('auto'))}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5 text-zinc-500" />
                <span>System Auto</span>
              </span>
              {theme === 'auto' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>

            <button
              onClick={() => handleAction(() => setTheme('light'))}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </span>
              {theme === 'light' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>

            <button
              onClick={() => handleAction(() => setTheme('dark'))}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark</span>
              </span>
              {theme === 'dark' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          </div>
        )}
      </div>

      {/* Help Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('help')}
          onMouseEnter={() => handleMenuHover('help')}
          className={`px-2.5 py-1 rounded-xs transition ${
            activeMenu === 'help'
              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white'
              : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
          }`}
        >
          Help
        </button>

        {activeMenu === 'help' && (
          <div className="absolute left-0 top-full mt-0.5 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-xl p-1 text-xs">
            <button
              onClick={() => handleAction(onShowShortcuts)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <Keyboard className="w-3.5 h-3.5 text-zinc-500" />
                <span>Keyboard Shortcuts</span>
              </span>
              <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">?</kbd>
            </button>

            <a
              href="https://www.zebra.com/content/dam/zebra/manuals/printers/common/programming/zpl-zbi2-pm-en.pdf"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setActiveMenu(null)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                <span>Zebra ZPL II Manual</span>
              </span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
