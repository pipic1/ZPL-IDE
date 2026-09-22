/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Type,
  Barcode,
  QrCode,
  Square,
  Layers,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Sliders,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import {
  ZplElement,
  ZplTextElement,
  ZplBoxElement,
  ZplQrCodeElement,
  ZplGraphicElement,
  LabelDimensions,
  Orientation,
} from '../types/zpl';
import { dotsToMm } from '../engine/units';

interface PropertiesSidebarProps {
  selectedElement: ZplElement | null;
  elements: ZplElement[];
  dimensions: LabelDimensions;
  onUpdateElement: (id: string, updates: Partial<ZplElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onSelectElement: (id: string) => void;
  onReorderElements: (elements: ZplElement[]) => void;
  onBackToLabelProps?: () => void;
}

export const PropertiesSidebar: React.FC<PropertiesSidebarProps> = ({
  selectedElement,
  elements,
  dimensions,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onSelectElement,
  onReorderElements,
  onBackToLabelProps,
}) => {
  if (!selectedElement) {
    // Render Label Overview & Layer list when nothing is selected
    return (
      <aside className="w-64 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col shrink-0 select-none overflow-y-auto">
        <div className="h-8 px-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950/60 flex items-center gap-2 text-zinc-800 dark:text-zinc-300 shrink-0">
          <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Label Properties
          </span>
        </div>

        <div className="p-2.5 space-y-3">
          {/* Dimension specs */}
          <div className="bg-white dark:bg-zinc-950 rounded-sm p-2.5 border border-zinc-200 dark:border-zinc-800 space-y-1.5 font-mono text-xs shadow-2xs">
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Dimensions:</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                {dimensions.widthDots}×{dimensions.heightDots} pt
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Physical Size:</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                {dotsToMm(dimensions.widthDots, dimensions.dpi)}×{dotsToMm(dimensions.heightDots, dimensions.dpi)} mm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Resolution:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{dimensions.dpi} DPI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Elements:</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">{elements.length} items</span>
            </div>
          </div>

          {/* List of layers */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 px-0.5 text-zinc-500 dark:text-zinc-400">
              <Layers className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Layers ({elements.length})
              </span>
            </div>

            <div className="space-y-0.5">
              {elements.length === 0 ? (
                <div className="text-center py-6 text-zinc-400 dark:text-zinc-500 text-xs font-mono">
                  No elements on label
                </div>
              ) : (
                elements.map((el) => (
                  <button
                    key={el.id}
                    onClick={() => onSelectElement(el.id)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-sm bg-white hover:bg-zinc-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700 transition text-left shadow-2xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getElementIcon(el.type)}
                      <span className="truncate text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                        {el.name || el.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono shrink-0">
                      {el.x},{el.y}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Active Element Inspector
  const updateProp = (key: string, value: any) => {
    onUpdateElement(selectedElement.id, { [key]: value });
  };

  // Layer ordering helpers
  const currentIndex = elements.findIndex((e) => e.id === selectedElement.id);

  const moveLayer = (direction: 'up' | 'down' | 'top' | 'bottom') => {
    if (currentIndex < 0) return;
    const newItems = [...elements];
    const item = newItems.splice(currentIndex, 1)[0];

    if (direction === 'top') {
      newItems.push(item);
    } else if (direction === 'bottom') {
      newItems.unshift(item);
    } else if (direction === 'up') {
      const newPos = Math.min(newItems.length, currentIndex + 1);
      newItems.splice(newPos, 0, item);
    } else if (direction === 'down') {
      const newPos = Math.max(0, currentIndex - 1);
      newItems.splice(newPos, 0, item);
    }

    onReorderElements(newItems);
  };

  return (
    <aside className="w-64 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col shrink-0 select-none overflow-y-auto">
      {/* Header */}
      <div className="h-9 px-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950/60 flex items-center justify-between shrink-0 gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {onBackToLabelProps && (
            <button
              onClick={onBackToLabelProps}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/80 dark:text-emerald-400 dark:bg-emerald-950/70 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-800/80 transition shrink-0 shadow-2xs"
              title="Retour aux propriétés de l'étiquette (Désélectionner)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center gap-1.5 truncate">
            {getElementIcon(selectedElement.type)}
            <span className="text-[10px] font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider truncate">
              {selectedElement.name || selectedElement.type}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onDuplicateElement(selectedElement.id)}
            className="p-1 rounded-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition"
            title="Duplicate element"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteElement(selectedElement.id)}
            className="p-1 rounded-sm text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-200 dark:hover:bg-zinc-800 transition"
            title="Delete element"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-2.5 space-y-3">
        {/* Position & Alignment */}
        <div>
          <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
            Position (dots / mm)
          </span>
          <div className="grid grid-cols-2 gap-1.5 mb-1.5">
            <div>
              <label className="text-[9px] text-zinc-500 dark:text-zinc-400 block mb-0.5 font-mono">X (dots)</label>
              <input
                type="number"
                value={selectedElement.x}
                onChange={(e) => updateProp('x', parseInt(e.target.value, 10) || 0)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm px-2 py-1 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-zinc-500"
              />
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">
                ≈ {dotsToMm(selectedElement.x, dimensions.dpi)} mm
              </span>
            </div>
            <div>
              <label className="text-[9px] text-zinc-500 dark:text-zinc-400 block mb-0.5 font-mono">Y (dots)</label>
              <input
                type="number"
                value={selectedElement.y}
                onChange={(e) => updateProp('y', parseInt(e.target.value, 10) || 0)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm px-2 py-1 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-zinc-500"
              />
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">
                ≈ {dotsToMm(selectedElement.y, dimensions.dpi)} mm
              </span>
            </div>
          </div>

          {/* Quick align to label */}
          <div className="flex gap-1">
            <button
              onClick={() => updateProp('x', Math.round((dimensions.widthDots - 200) / 2))}
              className="flex-1 py-0.5 px-1.5 rounded-sm bg-white hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-700 dark:text-zinc-300 font-mono whitespace-nowrap shadow-2xs"
            >
              Center X
            </button>
            <button
              onClick={() => updateProp('y', Math.round((dimensions.heightDots - 100) / 2))}
              className="flex-1 py-0.5 px-1.5 rounded-sm bg-white hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-700 dark:text-zinc-300 font-mono whitespace-nowrap shadow-2xs"
            >
              Center Y
            </button>
          </div>
        </div>

        {/* Orientation */}
        {'orientation' in selectedElement && (
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
              Orientation (^A/B/G)
            </span>
            <div className="grid grid-cols-4 gap-1">
              {[
                { label: '0°', val: 'N' },
                { label: '90°', val: 'R' },
                { label: '180°', val: 'I' },
                { label: '270°', val: 'B' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => updateProp('orientation', item.val as Orientation)}
                  className={`py-0.5 text-xs font-mono font-semibold rounded-sm border transition ${
                    (selectedElement as any).orientation === item.val
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-zinc-800 dark:border-emerald-500 dark:text-emerald-400'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 shadow-2xs'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text specific props */}
        {selectedElement.type === 'text' && (
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                Text Content (^FD)
              </label>
              <textarea
                value={(selectedElement as ZplTextElement).text || ''}
                onChange={(e) => updateProp('text', e.target.value)}
                rows={2}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm p-1.5 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[9px] text-zinc-500 dark:text-zinc-400 block mb-0.5 font-mono">Font Height</label>
                <input
                  type="number"
                  value={(selectedElement as ZplTextElement).fontHeight}
                  onChange={(e) =>
                    updateProp('fontHeight', Math.max(8, parseInt(e.target.value, 10) || 10))
                  }
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm px-2 py-1 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 dark:text-zinc-400 block mb-0.5 font-mono">Font Width</label>
                <input
                  type="number"
                  value={(selectedElement as ZplTextElement).fontWidth}
                  onChange={(e) =>
                    updateProp('fontWidth', Math.max(6, parseInt(e.target.value, 10) || 10))
                  }
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm px-2 py-1 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="check-inverted"
                checked={!!(selectedElement as ZplTextElement).inverted}
                onChange={(e) => updateProp('inverted', e.target.checked)}
                className="rounded-sm bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-0"
              />
              <label htmlFor="check-inverted" className="text-xs text-zinc-700 dark:text-zinc-300 font-mono">
                Inverted Text (^FR)
              </label>
            </div>
          </div>
        )}

        {/* Box / Line specific props */}
        {(selectedElement.type === 'box' || selectedElement.type === 'line') && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[9px] text-zinc-500 dark:text-zinc-400 block mb-0.5 font-mono">Width (dots)</label>
                <input
                  type="number"
                  value={(selectedElement as ZplBoxElement).width}
                  onChange={(e) =>
                    updateProp('width', Math.max(2, parseInt(e.target.value, 10) || 2))
                  }
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm px-2 py-1 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 dark:text-zinc-400 block mb-0.5 font-mono">Height (dots)</label>
                <input
                  type="number"
                  value={(selectedElement as ZplBoxElement).height}
                  onChange={(e) =>
                    updateProp('height', Math.max(2, parseInt(e.target.value, 10) || 2))
                  }
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm px-2 py-1 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] text-zinc-500 dark:text-zinc-400 block mb-0.5 font-mono">Border Thickness</label>
              <input
                type="number"
                value={(selectedElement as ZplBoxElement).borderThickness}
                onChange={(e) =>
                  updateProp('borderThickness', Math.max(1, parseInt(e.target.value, 10) || 1))
                }
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm px-2 py-1 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
              />
            </div>

            {selectedElement.type === 'box' && (
              <div>
                <label className="text-[9px] text-zinc-500 dark:text-zinc-400 block mb-0.5 font-mono">Corner Rounding (0 to 8)</label>
                <input
                  type="number"
                  min="0"
                  max="8"
                  value={(selectedElement as ZplBoxElement).rounding || 0}
                  onChange={(e) =>
                    updateProp(
                      'rounding',
                      Math.min(8, Math.max(0, parseInt(e.target.value, 10) || 0))
                    )
                  }
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm px-2 py-1 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        {/* Barcode 128 / 39 props */}
        {(selectedElement.type === 'barcode128' || selectedElement.type === 'barcode39') && (
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                Barcode Data (^FD)
              </label>
              <input
                type="text"
                value={(selectedElement as any).data || ''}
                onChange={(e) => updateProp('data', e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm px-2 py-1 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[9px] text-zinc-500 dark:text-zinc-400 block mb-0.5 font-mono">Bar Height</label>
                <input
                  type="number"
                  value={(selectedElement as any).height}
                  onChange={(e) =>
                    updateProp('height', Math.max(20, parseInt(e.target.value, 10) || 40))
                  }
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm px-2 py-1 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 dark:text-zinc-400 block mb-0.5 font-mono">Module Width</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={(selectedElement as any).moduleWidth || 2}
                  onChange={(e) =>
                    updateProp('moduleWidth', Math.max(1, parseInt(e.target.value, 10) || 2))
                  }
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm px-2 py-1 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="check-human-read"
                checked={!!(selectedElement as any).printInterpretationLine}
                onChange={(e) => updateProp('printInterpretationLine', e.target.checked)}
                className="rounded-sm bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-0"
              />
              <label htmlFor="check-human-read" className="text-xs text-zinc-700 dark:text-zinc-300 font-mono">
                Human-readable Text
              </label>
            </div>
          </div>
        )}

        {/* QR Code specific props */}
        {selectedElement.type === 'qrcode' && (
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                QR Code Data (^FD)
              </label>
              <textarea
                value={(selectedElement as ZplQrCodeElement).data || ''}
                onChange={(e) => updateProp('data', e.target.value)}
                rows={2}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm p-1.5 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between text-[9px] text-zinc-500 dark:text-zinc-400 mb-0.5 font-mono">
                <span>Magnification:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{(selectedElement as ZplQrCodeElement).magnification}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={(selectedElement as ZplQrCodeElement).magnification}
                onChange={(e) => updateProp('magnification', parseInt(e.target.value, 10) || 4)}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <label className="text-[9px] text-zinc-500 dark:text-zinc-400 block mb-1 font-mono">Error Correction</label>
              <div className="grid grid-cols-4 gap-1">
                {['L', 'M', 'Q', 'H'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => updateProp('errorCorrection', lvl)}
                    className={`py-0.5 text-xs font-mono font-bold rounded-sm border transition ${
                      (selectedElement as ZplQrCodeElement).errorCorrection === lvl
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-zinc-800 dark:border-emerald-500 dark:text-emerald-400'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 shadow-2xs'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Graphic / Image props */}
        {selectedElement.type === 'graphic' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[9px] text-zinc-500 dark:text-zinc-400 block mb-0.5 font-mono">Width (dots)</label>
                <input
                  type="number"
                  value={(selectedElement as ZplGraphicElement).width}
                  onChange={(e) =>
                    updateProp('width', Math.max(8, parseInt(e.target.value, 10) || 8))
                  }
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm px-2 py-1 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 dark:text-zinc-400 block mb-0.5 font-mono">Height (dots)</label>
                <input
                  type="number"
                  value={(selectedElement as ZplGraphicElement).height}
                  onChange={(e) =>
                    updateProp('height', Math.max(8, parseInt(e.target.value, 10) || 8))
                  }
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm px-2 py-1 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="p-2 bg-zinc-100 dark:bg-zinc-950 rounded-sm border border-zinc-200 dark:border-zinc-800">
              <div className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">Graphic Info</div>
              <div className="text-[10px] font-mono text-zinc-700 dark:text-zinc-300">
                Bytes: {(selectedElement as ZplGraphicElement).binaryByteCount}B ({(selectedElement as ZplGraphicElement).bytesPerRow} B/row)
              </div>
              {(selectedElement as ZplGraphicElement).previewUrl && (
                <div className="mt-2 flex items-center justify-center p-2 bg-white dark:bg-zinc-900 rounded-xs border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={(selectedElement as ZplGraphicElement).previewUrl}
                    alt="Preview"
                    className="max-h-20 max-w-full object-contain [image-rendering:pixelated]"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Layer reordering */}
        <div>
          <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
            Layer Order
          </span>
          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={() => moveLayer('up')}
              className="py-1 rounded-sm bg-white hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shadow-2xs"
              title="Bring forward"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => moveLayer('down')}
              className="py-1 rounded-sm bg-white hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shadow-2xs"
              title="Send backward"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => moveLayer('top')}
              className="py-1 rounded-sm bg-white hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shadow-2xs"
              title="Bring to front"
            >
              <ChevronsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => moveLayer('bottom')}
              className="py-1 rounded-sm bg-white hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shadow-2xs"
              title="Send to back"
            >
              <ChevronsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

function getElementIcon(type: string) {
  switch (type) {
    case 'text':
      return <Type className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    case 'box':
    case 'line':
      return <Square className="w-3.5 h-3.5 text-zinc-300 shrink-0" />;
    case 'barcode128':
    case 'barcode39':
    case 'barcodeEAN13':
      return <Barcode className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
    case 'qrcode':
      return <QrCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    default:
      return <Sparkles className="w-3.5 h-3.5 text-zinc-400 shrink-0" />;
  }
}
