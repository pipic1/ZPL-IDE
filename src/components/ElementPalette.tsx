/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Type,
  Barcode,
  QrCode,
  Square,
  Minus,
  PanelLeftClose,
  PanelLeftOpen,
  Wrench,
  Image as ImageIcon,
} from 'lucide-react';
import { ZplElement } from '../types/zpl';

interface ElementPaletteProps {
  onAddElement: (el: ZplElement) => void;
  nextElementPosition: { x: number; y: number };
  onOpenImageModal?: () => void;
}

export const ElementPalette: React.FC<ElementPaletteProps> = ({
  onAddElement,
  nextElementPosition,
  onOpenImageModal,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const createId = () => `el_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  const addText = (text: string, height: number, inverted: boolean = false) => {
    const id = createId();
    onAddElement({
      id,
      type: 'text',
      name: text,
      x: nextElementPosition.x,
      y: nextElementPosition.y,
      text,
      fontName: '0',
      orientation: 'N',
      fontHeight: height,
      fontWidth: height,
      inverted,
    });
  };

  const addBarcode128 = () => {
    const id = createId();
    onAddElement({
      id,
      type: 'barcode128',
      name: 'Code 128 (TRACK-01)',
      x: nextElementPosition.x,
      y: nextElementPosition.y,
      data: 'EXP-12345678',
      orientation: 'N',
      height: 90,
      printInterpretationLine: true,
      printInterpretationAbove: false,
      moduleWidth: 2,
    });
  };

  const addBarcode39 = () => {
    const id = createId();
    onAddElement({
      id,
      type: 'barcode39',
      name: 'Code 39 (PARCEL)',
      x: nextElementPosition.x,
      y: nextElementPosition.y,
      data: 'PARCEL99',
      orientation: 'N',
      height: 70,
      printInterpretationLine: true,
      moduleWidth: 2,
    });
  };

  const addQrCode = () => {
    const id = createId();
    onAddElement({
      id,
      type: 'qrcode',
      name: 'QR Code URL',
      x: nextElementPosition.x,
      y: nextElementPosition.y,
      data: 'https://zplstudio.app/verify',
      orientation: 'N',
      model: 2,
      magnification: 5,
      errorCorrection: 'M',
    });
  };

  const addBox = (filled: boolean = false, rounded: boolean = false) => {
    const id = createId();
    onAddElement({
      id,
      type: 'box',
      name: filled ? 'Filled Block' : rounded ? 'Rounded Box' : 'Frame',
      x: nextElementPosition.x,
      y: nextElementPosition.y,
      width: 250,
      height: filled ? 60 : 120,
      borderThickness: filled ? 60 : 3,
      color: 'B',
      rounding: rounded ? 4 : 0,
    });
  };

  const addLine = (orientation: 'horizontal' | 'vertical') => {
    const id = createId();
    onAddElement({
      id,
      type: 'line',
      name: orientation === 'horizontal' ? 'Horiz. Line' : 'Vert. Line',
      x: nextElementPosition.x,
      y: nextElementPosition.y,
      width: orientation === 'horizontal' ? 300 : 3,
      height: orientation === 'horizontal' ? 3 : 200,
      borderThickness: 3,
      color: 'B',
      rounding: 0,
    });
  };

  // Activity Bar Mode (Collapsed)
  if (isCollapsed) {
    return (
      <aside className="w-10 h-full bg-zinc-100 border-r border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 flex flex-col items-center py-2 shrink-0 select-none z-20">
        <button
          id="expand-toolbox-btn"
          onClick={() => setIsCollapsed(false)}
          className="w-7 h-7 rounded-sm text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 flex items-center justify-center transition"
          title="Expand toolbox"
        >
          <PanelLeftOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </button>

        <div className="w-6 h-px bg-zinc-300 dark:bg-zinc-800 my-2" />

        <div className="flex flex-col gap-1">
          <button
            onClick={() => addText('TITLE', 40)}
            className="w-7 h-7 rounded-sm text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 flex items-center justify-center transition"
            title="Text (^A0)"
          >
            <Type className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </button>

          <button
            onClick={addBarcode128}
            className="w-7 h-7 rounded-sm text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 flex items-center justify-center transition"
            title="Code 128 (^BC)"
          >
            <Barcode className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
          </button>

          <button
            onClick={addQrCode}
            className="w-7 h-7 rounded-sm text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 flex items-center justify-center transition"
            title="QR Code (^BQ)"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          </button>

          <button
            onClick={() => addBox(false, false)}
            className="w-7 h-7 rounded-sm text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 flex items-center justify-center transition"
            title="Box Frame (^GB)"
          >
            <Square className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          </button>

          <button
            onClick={() => addLine('horizontal')}
            className="w-7 h-7 rounded-sm text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 flex items-center justify-center transition"
            title="Horiz. Line (^GB)"
          >
            <Minus className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          </button>

          {onOpenImageModal && (
            <button
              onClick={onOpenImageModal}
              className="w-7 h-7 rounded-sm text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 flex items-center justify-center transition"
              title="Image / Logo (^GF)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            </button>
          )}
        </div>
      </aside>
    );
  }

  // Primary Sidebar Mode (Expanded)
  return (
    <aside className="w-52 h-full bg-zinc-50 border-r border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 flex flex-col shrink-0 select-none z-20">
      {/* Titlebar */}
      <div className="h-8 px-3 border-b border-zinc-200 bg-zinc-100/80 dark:border-zinc-800 dark:bg-zinc-950/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-700 dark:text-zinc-300 uppercase">
            ZPL Tools
          </span>
        </div>

        <button
          id="collapse-toolbox-btn"
          onClick={() => setIsCollapsed(true)}
          className="p-1 rounded-sm text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition"
          title="Collapse"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* Texts */}
        <div>
          <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider px-1 block mb-1">
            Typography
          </span>
          <div className="space-y-0.5">
            <button
              onClick={() => addText('TITLE HEADING', 48)}
              className="w-full h-7 px-2 rounded-sm bg-white hover:bg-zinc-100 text-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-800 dark:text-zinc-200 text-xs flex items-center justify-between border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700 transition shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Type className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-[11px] truncate">Heading (48pt)</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">^A0</span>
            </button>

            <button
              onClick={() => addText('Standard text', 28)}
              className="w-full h-7 px-2 rounded-sm bg-white hover:bg-zinc-100 text-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-800 dark:text-zinc-200 text-xs flex items-center justify-between border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700 transition shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Type className="w-3 h-3 text-zinc-500 dark:text-zinc-400 shrink-0" />
                <span className="text-[11px] truncate">Body Text (28pt)</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">^A0</span>
            </button>

            <button
              onClick={() => addText('Small label', 18)}
              className="w-full h-7 px-2 rounded-sm bg-white hover:bg-zinc-100 text-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-800 dark:text-zinc-200 text-xs flex items-center justify-between border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700 transition shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Type className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
                <span className="text-[11px] truncate">Small (18pt)</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">^A0</span>
            </button>

            <button
              onClick={() => addText('INVERTED TEXT', 30, true)}
              className="w-full h-7 px-2 rounded-sm bg-white hover:bg-zinc-100 text-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-800 dark:text-zinc-200 text-xs flex items-center justify-between border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700 transition shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-3 h-3 rounded-xs bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-950 text-[7px] font-mono font-black flex items-center justify-center shrink-0">
                  FR
                </span>
                <span className="text-[11px] truncate">Inverted Text</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">^FR</span>
            </button>
          </div>
        </div>

        {/* Barcodes */}
        <div>
          <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider px-1 block mb-1">
            Barcodes
          </span>
          <div className="space-y-0.5">
            <button
              onClick={addBarcode128}
              className="w-full h-7 px-2 rounded-sm bg-white hover:bg-zinc-100 text-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-800 dark:text-zinc-200 text-xs flex items-center justify-between border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700 transition shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Barcode className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
                <span className="text-[11px] truncate">Code 128</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">^BC</span>
            </button>

            <button
              onClick={addBarcode39}
              className="w-full h-7 px-2 rounded-sm bg-white hover:bg-zinc-100 text-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-800 dark:text-zinc-200 text-xs flex items-center justify-between border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700 transition shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Barcode className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="text-[11px] truncate">Code 39</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">^B3</span>
            </button>

            <button
              onClick={addQrCode}
              className="w-full h-7 px-2 rounded-sm bg-white hover:bg-zinc-100 text-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-800 dark:text-zinc-200 text-xs flex items-center justify-between border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700 transition shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <QrCode className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-[11px] truncate">QR Code</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">^BQ</span>
            </button>
          </div>
        </div>

        {/* Graphics */}
        <div>
          <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider px-1 block mb-1">
            Shapes & Frames
          </span>
          <div className="space-y-0.5">
            <button
              onClick={() => addBox(false, false)}
              className="w-full h-7 px-2 rounded-sm bg-white hover:bg-zinc-100 text-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-800 dark:text-zinc-200 text-xs flex items-center justify-between border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700 transition shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Square className="w-3 h-3 text-zinc-500 dark:text-zinc-400 shrink-0" />
                <span className="text-[11px] truncate">Rectangle Frame</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">^GB</span>
            </button>

            <button
              onClick={() => addBox(false, true)}
              className="w-full h-7 px-2 rounded-sm bg-white hover:bg-zinc-100 text-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-800 dark:text-zinc-200 text-xs flex items-center justify-between border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700 transition shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-3 h-3 border border-zinc-600 dark:border-zinc-400 rounded-xs shrink-0" />
                <span className="text-[11px] truncate">Rounded Box</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">^GB</span>
            </button>

            <button
              onClick={() => addBox(true, false)}
              className="w-full h-7 px-2 rounded-sm bg-white hover:bg-zinc-100 text-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-800 dark:text-zinc-200 text-xs flex items-center justify-between border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700 transition shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-3 h-3 bg-zinc-700 dark:bg-zinc-300 rounded-none shrink-0" />
                <span className="text-[11px] truncate">Filled Block</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">^GB</span>
            </button>

            <button
              onClick={() => addLine('horizontal')}
              className="w-full h-7 px-2 rounded-sm bg-white hover:bg-zinc-100 text-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-800 dark:text-zinc-200 text-xs flex items-center justify-between border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700 transition shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Minus className="w-3 h-3 text-zinc-500 dark:text-zinc-400 shrink-0" />
                <span className="text-[11px] truncate">Horiz. Line</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">^GB</span>
            </button>

            <button
              onClick={() => addLine('vertical')}
              className="w-full h-7 px-2 rounded-sm bg-white hover:bg-zinc-100 text-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-800 dark:text-zinc-200 text-xs flex items-center justify-between border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700 transition shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-0.5 h-3 bg-zinc-600 dark:bg-zinc-400 shrink-0" />
                <span className="text-[11px] truncate">Vert. Line</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">^GB</span>
            </button>

            {onOpenImageModal && (
              <button
                onClick={onOpenImageModal}
                className="w-full h-7 px-2 rounded-sm bg-white hover:bg-zinc-100 text-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-800 dark:text-zinc-200 text-xs flex items-center justify-between border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700 transition shadow-2xs mt-1"
              >
                <div className="flex items-center gap-2 truncate">
                  <ImageIcon className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span className="text-[11px] truncate">Image / Logo</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">^GF</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
