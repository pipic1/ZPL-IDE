/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import {
  Copy,
  Scissors,
  Clipboard,
  CopyPlus,
  Trash2,
  AlignCenter,
  AlignVerticalJustifyCenter,
  AlignLeft,
  AlignRight,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Type,
  Square,
  Minus,
  Barcode,
  QrCode,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sliders,
  SunMoon,
  Undo2,
  Redo2,
} from 'lucide-react';
import { ZplElement, ZplElementType } from '../types/zpl';

export interface ContextMenuPosition {
  x: number;
  y: number;
}

interface ContextMenuProps {
  isOpen: boolean;
  position: ContextMenuPosition;
  onClose: () => void;
  targetElement: ZplElement | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  hasClipboard: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  onAlign: (type: 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom') => void;
  onOrder: (action: 'bringToFront' | 'sendToBack' | 'bringForward' | 'sendBackward') => void;
  onInsert: (type: ZplElementType) => void;
  onOpenImageModal: () => void;
  onOpenDimensionsModal: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  onClose,
  targetElement,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  hasClipboard,
  onDuplicate,
  onDelete,
  onAlign,
  onOrder,
  onInsert,
  onOpenImageModal,
  onOpenDimensionsModal,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Esc
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Viewport containment: ensure menu doesn't clip off bottom or right
  const menuWidth = 220;
  const menuHeight = targetElement ? 380 : 320;
  const left = Math.min(position.x, window.innerWidth - menuWidth - 10);
  const top = Math.min(position.y, window.innerHeight - menuHeight - 10);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      id="canvas-context-menu"
      style={{ left: `${Math.max(10, left)}px`, top: `${Math.max(10, top)}px` }}
      className="fixed z-50 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-xl p-1 select-none text-xs text-zinc-700 dark:text-zinc-300 font-sans backdrop-blur-xs"
      onClick={(e) => e.stopPropagation()}
    >
      {targetElement ? (
        /* Element-Specific Context Menu */
        <>
          <div className="px-2 py-1 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 font-medium truncate border-b border-zinc-100 dark:border-zinc-800 mb-1">
            {targetElement.name || targetElement.type.toUpperCase()}
          </div>

          {/* Cut / Copy / Duplicate / Delete */}
          <button
            onClick={() => handleAction(onCut)}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
          >
            <span className="flex items-center gap-2">
              <Scissors className="w-3.5 h-3.5 text-zinc-500" />
              <span>Cut</span>
            </span>
            <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+X</kbd>
          </button>

          <button
            onClick={() => handleAction(onCopy)}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
          >
            <span className="flex items-center gap-2">
              <Copy className="w-3.5 h-3.5 text-zinc-500" />
              <span>Copy</span>
            </span>
            <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+C</kbd>
          </button>

          <button
            onClick={() => handleAction(onDuplicate)}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
          >
            <span className="flex items-center gap-2">
              <CopyPlus className="w-3.5 h-3.5 text-zinc-500" />
              <span>Duplicate</span>
            </span>
            <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+D</kbd>
          </button>

          <button
            onClick={() => handleAction(onDelete)}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-left transition"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              <span>Delete</span>
            </span>
            <kbd className="text-[10px] font-mono text-red-400">Del</kbd>
          </button>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

          {/* Quick Align */}
          <div className="px-2 py-1 text-[9px] font-mono uppercase text-zinc-600 dark:text-zinc-400 tracking-wider">
            Align on Label
          </div>

          <div className="grid grid-cols-2 gap-0.5 px-1">
            <button
              onClick={() => handleAction(() => onAlign('centerX'))}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-[11px]"
            >
              <AlignCenter className="w-3 h-3 text-zinc-500" />
              <span>Center X</span>
            </button>
            <button
              onClick={() => handleAction(() => onAlign('centerY'))}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-[11px]"
            >
              <AlignVerticalJustifyCenter className="w-3 h-3 text-zinc-500" />
              <span>Center Y</span>
            </button>
            <button
              onClick={() => handleAction(() => onAlign('left'))}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-[11px]"
            >
              <AlignLeft className="w-3 h-3 text-zinc-500" />
              <span>Left (50pt)</span>
            </button>
            <button
              onClick={() => handleAction(() => onAlign('right'))}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-[11px]"
            >
              <AlignRight className="w-3 h-3 text-zinc-500" />
              <span>Right</span>
            </button>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

          {/* Reordering */}
          <div className="px-2 py-1 text-[9px] font-mono uppercase text-zinc-600 dark:text-zinc-400 tracking-wider">
            Layer Order
          </div>

          <button
            onClick={() => handleAction(() => onOrder('bringToFront'))}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
          >
            <ChevronsUp className="w-3.5 h-3.5 text-zinc-500" />
            <span>Bring to Front</span>
          </button>
          <button
            onClick={() => handleAction(() => onOrder('sendToBack'))}
            className="w-full flex items-center gap-2 px-2 py-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
          >
            <ChevronsDown className="w-3.5 h-3.5 text-zinc-500" />
            <span>Send to Back</span>
          </button>
        </>
      ) : (
        /* Empty Canvas Context Menu */
        <>
          {/* Paste */}
          <button
            disabled={!hasClipboard}
            onClick={() => handleAction(onPaste)}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-left transition"
          >
            <span className="flex items-center gap-2">
              <Clipboard className="w-3.5 h-3.5 text-zinc-500" />
              <span>Paste Element</span>
            </span>
            <kbd className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">Ctrl+V</kbd>
          </button>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

          {/* Insert Quick Elements */}
          <div className="px-2 py-1 text-[9px] font-mono uppercase text-zinc-600 dark:text-zinc-400 tracking-wider">
            Insert Element
          </div>

          <button
            onClick={() => handleAction(() => onInsert('text'))}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
          >
            <Type className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Text Field (^A0)</span>
          </button>

          <button
            onClick={() => handleAction(() => onInsert('box'))}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
          >
            <Square className="w-3.5 h-3.5 text-blue-500" />
            <span>Box / Border (^GB)</span>
          </button>

          <button
            onClick={() => handleAction(() => onInsert('line'))}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
          >
            <Minus className="w-3.5 h-3.5 text-cyan-500" />
            <span>Divider Line (^GB)</span>
          </button>

          <button
            onClick={() => handleAction(() => onInsert('barcode128'))}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
          >
            <Barcode className="w-3.5 h-3.5 text-indigo-500" />
            <span>Barcode 128 (^BC)</span>
          </button>

          <button
            onClick={() => handleAction(() => onInsert('qrcode'))}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
          >
            <QrCode className="w-3.5 h-3.5 text-purple-500" />
            <span>QR Code (^BQ)</span>
          </button>

          <button
            onClick={() => handleAction(onOpenImageModal)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>Image / Graphic (^GF)...</span>
          </button>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

          {/* Zoom controls */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => handleAction(onZoomIn)}
              className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleAction(onResetZoom)}
              className="px-2 py-0.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 font-mono text-[11px]"
              title="Reset Zoom to 100%"
            >
              100%
            </button>
            <button
              onClick={() => handleAction(onZoomOut)}
              className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

          <button
            onClick={() => handleAction(onOpenDimensionsModal)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-500" />
            <span>Label Size & DPI Settings...</span>
          </button>
        </>
      )}
    </div>
  );
};
