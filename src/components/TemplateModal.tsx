/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, LayoutTemplate, Tag, Truck, ShoppingCart, Activity } from 'lucide-react';
import { BUILT_IN_TEMPLATES } from '../engine/storage';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (zpl: string) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 select-none">
      <div className="w-full max-w-xl rounded-md bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 p-4 shadow-2xl text-zinc-900 dark:text-zinc-100 flex flex-col max-h-[85vh] animate-in fade-in-50 zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              ZPL Label Templates
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-sm text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {BUILT_IN_TEMPLATES.map((tmpl, idx) => (
            <div
              key={idx}
              className="p-3 rounded-sm bg-zinc-50 hover:bg-zinc-100/90 border border-zinc-200 hover:border-zinc-300 dark:bg-zinc-950 dark:hover:bg-zinc-800/80 dark:border-zinc-800 dark:hover:border-zinc-700 transition flex items-center justify-between gap-3 group shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-7 h-7 rounded-sm bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-emerald-600 dark:text-zinc-400 dark:group-hover:text-emerald-400 transition shrink-0">
                  {tmpl.category === 'Logistics' ? (
                    <Truck className="w-3.5 h-3.5" />
                  ) : tmpl.category === 'Manufacturing' ? (
                    <Tag className="w-3.5 h-3.5" />
                  ) : tmpl.category === 'Retail' ? (
                    <ShoppingCart className="w-3.5 h-3.5" />
                  ) : (
                    <Activity className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{tmpl.name}</h3>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-sm bg-zinc-200/70 text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                      {tmpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 leading-snug">
                    {tmpl.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectTemplate(tmpl.zpl);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-sm bg-white hover:bg-zinc-100 text-emerald-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-mono text-xs border border-zinc-300 dark:border-zinc-700 transition shrink-0 whitespace-nowrap shadow-2xs"
              >
                Load
              </button>
            </div>
          ))}
        </div>

        <div className="pt-2.5 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300 dark:border-transparent dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 rounded-sm text-xs transition font-mono whitespace-nowrap"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
