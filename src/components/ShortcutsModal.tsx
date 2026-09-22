/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { cat: 'General', items: [
      { key: 'Ctrl + S', desc: 'Save to Local Storage Library' },
      { key: 'Ctrl + Shift + S', desc: 'Save on Disk (.zpl file)' },
      { key: 'Ctrl + L', desc: 'Open Local Storage Label Library' },
      { key: 'Ctrl + P', desc: 'Print or export label' },
      { key: 'Ctrl + O', desc: 'Import ZPL file' },
      { key: 'Ctrl + Alt + N', desc: 'New blank label' },
      { key: '?', desc: 'Show this keyboard shortcuts modal' },
    ]},
    { cat: 'Editing & Canvas', items: [
      { key: 'Ctrl + Z', desc: 'Undo last change' },
      { key: 'Ctrl + Y / Ctrl+Shift+Z', desc: 'Redo last change' },
      { key: 'Ctrl + C', desc: 'Copy selected element' },
      { key: 'Ctrl + X', desc: 'Cut selected element' },
      { key: 'Ctrl + V', desc: 'Paste copied element' },
      { key: 'Ctrl + D', desc: 'Duplicate selected element' },
      { key: 'Delete / Backspace', desc: 'Delete selected element' },
      { key: 'Arrows', desc: 'Nudge element by 1 dot' },
      { key: 'Shift + Arrows', desc: 'Nudge element by 10 dots' },
      { key: 'Ctrl + A', desc: 'Select all elements' },
      { key: 'Escape', desc: 'Deselect / close active modal' },
    ]},
    { cat: 'Navigation & View', items: [
      { key: 'Space + Drag', desc: 'Pan / drag around the canvas' },
      { key: 'Middle Mouse Drag', desc: 'Pan canvas in any direction' },
      { key: 'Right Click', desc: 'Open context menu with quick actions' },
      { key: 'Ctrl + Wheel', desc: 'Zoom in / out on canvas' },
    ]}
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 max-h-[75vh] overflow-y-auto space-y-4">
          {shortcuts.map((group) => (
            <div key={group.cat}>
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                {group.cat}
              </h3>
              <div className="space-y-1">
                {group.items.map((sc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1 px-2 rounded-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-xs"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300">{sc.desc}</span>
                    <kbd className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-mono font-semibold rounded-xs text-zinc-800 dark:text-zinc-200">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
