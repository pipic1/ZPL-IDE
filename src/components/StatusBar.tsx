/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { LabelDimensions, SnapOptions } from '../types/zpl';
import { dotsToMm } from '../engine/units';
import {
  calculateFitZoom,
  calculateFullWidthZoom,
  getNextZoomCycle,
  ZoomCycleMode,
} from '../engine/zoomUtils';

interface StatusBarProps {
  dimensions: LabelDimensions;
  elementCount: number;
  selectedCount: number;
  zoom: number;
  onZoomChange?: (z: number) => void;
  activeView?: 'both' | 'canvas' | 'code';
  onChangeView?: (view: 'both' | 'canvas' | 'code') => void;
  cursorPos: { x: number; y: number } | null;
  snapOptions: SnapOptions;
  zplCode?: string;
  lineCount?: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  dimensions,
  elementCount,
  selectedCount,
  zoom,
  onZoomChange,
  activeView,
  onChangeView,
  cursorPos,
  snapOptions,
  zplCode,
  lineCount,
}) => {
  const [zoomCycleMode, setZoomCycleMode] = useState<ZoomCycleMode>('100');

  const widthMm = dotsToMm(dimensions.widthDots, dimensions.dpi);
  const heightMm = dotsToMm(dimensions.heightDots, dimensions.dpi);
  const lines = lineCount !== undefined ? lineCount : (zplCode ? zplCode.split('\n').length : 0);

  // Dynamic zoom calculations
  const fitZoom = calculateFitZoom(dimensions.widthDots, dimensions.heightDots, snapOptions.showRulers);
  const fullWidthZoom = calculateFullWidthZoom(dimensions.widthDots, snapOptions.showRulers);

  const is100 = Math.abs(zoom - 1.0) < 0.02;
  const isFit = Math.abs(zoom - fitZoom) < 0.02;
  const isFullWidth = Math.abs(zoom - fullWidthZoom) < 0.02;

  let currentActiveMode: ZoomCycleMode = '100';
  if (isFit) {
    currentActiveMode = 'fit';
  } else if (isFullWidth) {
    currentActiveMode = 'full-width';
  } else if (is100) {
    currentActiveMode = '100';
  } else {
    currentActiveMode = zoomCycleMode;
  }

  const nextModeInCycle: ZoomCycleMode =
    currentActiveMode === '100' ? 'fit' : currentActiveMode === 'fit' ? 'full-width' : '100';

  const nextModeLabel =
    nextModeInCycle === 'fit' ? 'Fit (étiquette entière)' : nextModeInCycle === 'full-width' ? 'Full Width (pleine largeur)' : '100%';

  const handleCycleZoom = () => {
    if (!onZoomChange) return;
    const next = getNextZoomCycle(
      zoom,
      dimensions.widthDots,
      dimensions.heightDots,
      snapOptions.showRulers,
      currentActiveMode
    );
    onZoomChange(next.zoom);
    setZoomCycleMode(next.mode);
  };

  let selectValue: string;
  if (isFit) {
    selectValue = 'fit';
  } else if (isFullWidth) {
    selectValue = 'full-width';
  } else if ([25, 50, 75, 85, 100, 125, 150, 200, 250, 300].includes(Math.round(zoom * 100))) {
    selectValue = String(Math.round(zoom * 100));
  } else {
    selectValue = 'custom';
  }

  return (
    <footer className="h-7 bg-zinc-100 border-t border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 px-3 flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400 font-mono select-none shrink-0 z-30 gap-2">
      {/* Left items: Line count & Selection & Coordinates */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 shrink-0" title={`ZPL Document: ${lines} lines`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
            {lines} {lines === 1 ? 'line' : 'lines'}
          </span>
        </div>

        <span className="text-zinc-300 dark:text-zinc-700">|</span>

        <span className="truncate">
          {selectedCount > 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {selectedCount} selected ({elementCount} total)
            </span>
          ) : (
            <span>{elementCount} element{elementCount > 1 ? 's' : ''}</span>
          )}
        </span>

        {cursorPos && (
          <>
            <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">|</span>
            <span className="text-zinc-700 dark:text-zinc-300 hidden sm:inline truncate">
              X: <strong className="text-zinc-900 dark:text-zinc-100 font-medium">{cursorPos.x}</strong> pt ({dotsToMm(cursorPos.x, dimensions.dpi)} mm)
              {'  '}
              Y: <strong className="text-zinc-900 dark:text-zinc-100 font-medium">{cursorPos.y}</strong> pt ({dotsToMm(cursorPos.y, dimensions.dpi)} mm)
            </span>
          </>
        )}
      </div>

      {/* Right items: View Mode (Split|Code|Canvas), Zoom, Dimensions, DPI, Grid, UTF-8 */}
      <div className="flex items-center gap-2 shrink-0">
        {/* View Switcher: Split | Code | Canvas */}
        {onChangeView && activeView && (
          <div className="flex items-center bg-zinc-200/80 dark:bg-zinc-950 p-0.5 rounded border border-zinc-300 dark:border-zinc-800 text-[10px] shrink-0 font-sans">
            <button
              onClick={() => onChangeView('both')}
              className={`px-2 py-0.5 rounded font-medium transition whitespace-nowrap ${
                activeView === 'both'
                  ? 'bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-white font-semibold'
                  : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
              title="Split View (Visual Canvas + ZPL Code)"
            >
              Split
            </button>
            <button
              onClick={() => onChangeView('code')}
              className={`px-2 py-0.5 rounded font-medium transition whitespace-nowrap ${
                activeView === 'code'
                  ? 'bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-white font-semibold'
                  : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
              title="ZPL Code View"
            >
              Code
            </button>
            <button
              onClick={() => onChangeView('canvas')}
              className={`px-2 py-0.5 rounded font-medium transition whitespace-nowrap ${
                activeView === 'canvas'
                  ? 'bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-white font-semibold'
                  : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
              title="Visual Canvas View"
            >
              Canvas
            </button>
          </div>
        )}

        <span className="text-zinc-300 dark:text-zinc-700">|</span>

        {/* Zoom Controls */}
        {onZoomChange ? (
          <div className="flex items-center bg-zinc-200/80 dark:bg-zinc-950 p-0.5 rounded border border-zinc-300 dark:border-zinc-800 text-[10px] font-mono shrink-0">
            <button
              onClick={() => onZoomChange(Math.max(0.2, zoom - 0.1))}
              className="p-0.5 rounded text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition"
              title="Zoom Out (Ctrl+-)"
            >
              <ZoomOut className="w-3 h-3" />
            </button>

            <select
              value={selectValue}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'fit') {
                  const fz = calculateFitZoom(dimensions.widthDots, dimensions.heightDots, snapOptions.showRulers);
                  onZoomChange(fz);
                  setZoomCycleMode('fit');
                } else if (val === 'full-width') {
                  const fwz = calculateFullWidthZoom(dimensions.widthDots, snapOptions.showRulers);
                  onZoomChange(fwz);
                  setZoomCycleMode('full-width');
                } else {
                  const num = Number(val);
                  if (!isNaN(num)) {
                    onZoomChange(num / 100);
                    if (num === 100) setZoomCycleMode('100');
                  }
                }
              }}
              className="bg-transparent text-[10px] font-mono text-zinc-700 dark:text-zinc-300 px-1 py-0 rounded cursor-pointer hover:bg-zinc-300/50 dark:hover:bg-zinc-800 focus:outline-none appearance-none text-center min-w-[38px]"
              title="Select zoom level"
            >
              <option value="fit" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                Fit ({Math.round(fitZoom * 100)}%)
              </option>
              <option value="full-width" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                Full Width ({Math.round(fullWidthZoom * 100)}%)
              </option>
              <option disabled className="bg-zinc-200 dark:bg-zinc-800 text-zinc-400">
                ──────────
              </option>
              {[25, 50, 75, 85, 100, 125, 150, 200, 250, 300].map((pct) => (
                <option key={pct} value={String(pct)} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                  {pct}%
                </option>
              ))}
              {selectValue === 'custom' && (
                <option value="custom" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                  {Math.round(zoom * 100)}%
                </option>
              )}
            </select>

            <button
              onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
              className="p-0.5 rounded text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition"
              title="Zoom In (Ctrl++)"
            >
              <ZoomIn className="w-3 h-3" />
            </button>

            {/* Cycle Zoom Button: 100% -> fit -> full-width -> loop */}
            <button
              id="statusbar-zoom-cycle-btn"
              onClick={handleCycleZoom}
              className="flex items-center gap-1 px-1 py-0.5 rounded text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white transition hover:bg-zinc-300/50 dark:hover:bg-zinc-800 shrink-0"
              title={`Basculer zoom (100% → Fit → Full Width) — Actuel : ${
                isFit ? 'Fit (étiquette entière)' : isFullWidth ? 'Full Width (pleine largeur)' : `${Math.round(zoom * 100)}%`
              } — Cliquez pour : ${nextModeLabel}`}
            >
              <Maximize2 className="w-3 h-3 shrink-0" />
              <span className="text-[9px] font-semibold leading-none">
                {isFit ? 'Fit' : isFullWidth ? 'Width' : `${Math.round(zoom * 100)}%`}
              </span>
            </button>
          </div>
        ) : (
          <span>{Math.round(zoom * 100)}%</span>
        )}

        <span className="text-zinc-300 dark:text-zinc-700 hidden md:inline">|</span>

        <span className="hidden md:inline">
          {dimensions.widthDots}×{dimensions.heightDots} pt ({widthMm}×{heightMm} mm)
        </span>

        <span className="text-zinc-300 dark:text-zinc-700 hidden lg:inline">|</span>

        <span className="hidden lg:inline">
          {dimensions.dpi} DPI
        </span>

        <span className="text-zinc-300 dark:text-zinc-700 hidden xl:inline">|</span>

        <span className="hidden xl:inline">Grid: {snapOptions.gridSize}pt</span>

        <span className="text-zinc-300 dark:text-zinc-700">|</span>

        <span className="text-zinc-400 dark:text-zinc-500 uppercase">UTF-8</span>
      </div>
    </footer>
  );
};
