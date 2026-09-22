/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LabelDimensions, SnapOptions } from '../types/zpl';
import { dotsToMm } from '../engine/units';

interface StatusBarProps {
  dimensions: LabelDimensions;
  elementCount: number;
  selectedCount: number;
  zoom: number;
  cursorPos: { x: number; y: number } | null;
  snapOptions: SnapOptions;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  dimensions,
  elementCount,
  selectedCount,
  zoom,
  cursorPos,
  snapOptions,
}) => {
  const widthMm = dotsToMm(dimensions.widthDots, dimensions.dpi);
  const heightMm = dotsToMm(dimensions.heightDots, dimensions.dpi);

  return (
    <footer className="h-6 bg-zinc-900 border-t border-zinc-800 px-3 flex items-center justify-between text-[11px] text-zinc-400 font-mono select-none shrink-0 z-30">
      {/* Left items: Engine & Selection & Coordinates */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-semibold text-zinc-200">ZPL II</span>
        </div>

        <span className="text-zinc-700">|</span>

        <span>
          {selectedCount > 0 ? (
            <span className="text-emerald-400">
              {selectedCount} selected ({elementCount} total)
            </span>
          ) : (
            <span>{elementCount} element{elementCount > 1 ? 's' : ''}</span>
          )}
        </span>

        {cursorPos && (
          <>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-300">
              X: <strong className="text-zinc-100 font-medium">{cursorPos.x}</strong> pt ({dotsToMm(cursorPos.x, dimensions.dpi)} mm)
              {'  '}
              Y: <strong className="text-zinc-100 font-medium">{cursorPos.y}</strong> pt ({dotsToMm(cursorPos.y, dimensions.dpi)} mm)
            </span>
          </>
        )}
      </div>

      {/* Right items: Format, DPI, Zoom, Grid, Encoding */}
      <div className="flex items-center gap-3">
        <span>
          {dimensions.widthDots}×{dimensions.heightDots} pt ({widthMm}×{heightMm} mm)
        </span>

        <span className="text-zinc-700">|</span>

        <span>
          {dimensions.dpi} DPI ({dimensions.dpi === 203 ? '8' : dimensions.dpi === 300 ? '12' : '24'} dpmm)
        </span>

        <span className="text-zinc-700">|</span>

        <span>{Math.round(zoom * 100)}%</span>

        <span className="text-zinc-700">|</span>

        <span>Grid: {snapOptions.gridSize}pt</span>

        <span className="text-zinc-700">|</span>

        <span className="text-zinc-500 uppercase">UTF-8</span>
      </div>
    </footer>
  );
};
