/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { DpiResolution } from '../types/zpl';
import { dotsToMm, mmToDots } from '../engine/units';

interface RulersProps {
  widthDots: number;
  heightDots: number;
  dpi: DpiResolution;
  zoom: number;
  cursorPos: { x: number; y: number } | null;
  unit: 'dots' | 'mm';
  onToggleUnit: () => void;
  children: React.ReactNode;
}

export const Rulers: React.FC<RulersProps> = ({
  widthDots,
  heightDots,
  dpi,
  zoom,
  cursorPos,
  unit,
  onToggleUnit,
  children,
}) => {
  const RULER_THICKNESS = 24;

  // Generate top ruler ticks
  const horizontalTicks = useMemo(() => {
    const ticks: { posDots: number; label?: string; isMajor: boolean }[] = [];
    if (unit === 'dots') {
      const step = 50; // Every 50 dots
      for (let x = 0; x <= widthDots; x += 10) {
        const isMajor = x % step === 0;
        ticks.push({
          posDots: x,
          label: isMajor ? `${x}` : undefined,
          isMajor,
        });
      }
    } else {
      // Millimeters
      const totalMm = Math.ceil(dotsToMm(widthDots, dpi));
      const stepMm = totalMm > 80 ? 10 : 5; // Step in mm
      for (let mm = 0; mm <= totalMm; mm += 1) {
        const posDots = mmToDots(mm, dpi);
        if (posDots > widthDots) break;
        const isMajor = mm % stepMm === 0;
        ticks.push({
          posDots,
          label: isMajor ? `${mm}` : undefined,
          isMajor,
        });
      }
    }
    return ticks;
  }, [widthDots, dpi, unit]);

  // Generate left ruler ticks
  const verticalTicks = useMemo(() => {
    const ticks: { posDots: number; label?: string; isMajor: boolean }[] = [];
    if (unit === 'dots') {
      const step = 50;
      for (let y = 0; y <= heightDots; y += 10) {
        const isMajor = y % step === 0;
        ticks.push({
          posDots: y,
          label: isMajor ? `${y}` : undefined,
          isMajor,
        });
      }
    } else {
      const totalMm = Math.ceil(dotsToMm(heightDots, dpi));
      const stepMm = totalMm > 80 ? 10 : 5;
      for (let mm = 0; mm <= totalMm; mm += 1) {
        const posDots = mmToDots(mm, dpi);
        if (posDots > heightDots) break;
        const isMajor = mm % stepMm === 0;
        ticks.push({
          posDots,
          label: isMajor ? `${mm}` : undefined,
          isMajor,
        });
      }
    }
    return ticks;
  }, [heightDots, dpi, unit]);

  return (
    <div className="relative inline-flex flex-col select-none">
      {/* Top Row: Corner button + Horizontal Top Ruler */}
      <div className="flex h-6">
        {/* Unit toggle corner */}
        <button
          onClick={onToggleUnit}
          title={`Active unit: ${unit === 'dots' ? 'Dots (pt)' : 'Millimeters (mm)'}. Click to toggle.`}
          className="w-6 h-6 bg-zinc-900 hover:bg-zinc-800 border-r border-b border-zinc-700/80 text-[10px] font-bold font-mono text-emerald-400 flex items-center justify-center shrink-0 transition"
        >
          {unit === 'dots' ? 'pt' : 'mm'}
        </button>

        {/* Top Horizontal Ruler */}
        <div
          className="h-6 bg-zinc-900 border-b border-zinc-700/80 relative overflow-hidden shrink-0"
          style={{ width: `${widthDots * zoom}px` }}
        >
          <svg
            width={widthDots * zoom}
            height={RULER_THICKNESS}
            className="w-full h-full block"
          >
            {horizontalTicks.map((t, idx) => {
              const xPos = t.posDots * zoom;
              return (
                <g key={idx} transform={`translate(${xPos}, 0)`}>
                  <line
                    x1="0"
                    y1={t.isMajor ? 10 : 17}
                    x2="0"
                    y2={RULER_THICKNESS}
                    stroke="#52525b"
                    strokeWidth={t.isMajor ? 1 : 0.75}
                  />
                  {t.isMajor && t.label && (
                    <text
                      x="3"
                      y="10"
                      fill="#a1a1aa"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="500"
                    >
                      {t.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Mouse Tracking Indicator Hairpin */}
            {cursorPos && (
              <line
                x1={cursorPos.x * zoom}
                y1="0"
                x2={cursorPos.x * zoom}
                y2={RULER_THICKNESS}
                stroke="#10b981"
                strokeWidth="1.5"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Main Row: Left Vertical Ruler + Label Canvas */}
      <div className="flex">
        {/* Left Vertical Ruler */}
        <div
          className="w-6 bg-zinc-900 border-r border-zinc-700/80 relative overflow-hidden shrink-0"
          style={{ height: `${heightDots * zoom}px` }}
        >
          <svg
            width={RULER_THICKNESS}
            height={heightDots * zoom}
            className="w-full h-full block"
          >
            {verticalTicks.map((t, idx) => {
              const yPos = t.posDots * zoom;
              return (
                <g key={idx} transform={`translate(0, ${yPos})`}>
                  <line
                    x1={t.isMajor ? 10 : 17}
                    y1="0"
                    x2={RULER_THICKNESS}
                    y2="0"
                    stroke="#52525b"
                    strokeWidth={t.isMajor ? 1 : 0.75}
                  />
                  {t.isMajor && t.label && (
                    <text
                      x="2"
                      y="-2"
                      fill="#a1a1aa"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="500"
                    >
                      {t.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Mouse Tracking Indicator Hairpin */}
            {cursorPos && (
              <line
                x1="0"
                y1={cursorPos.y * zoom}
                x2={RULER_THICKNESS}
                y2={cursorPos.y * zoom}
                stroke="#10b981"
                strokeWidth="1.5"
              />
            )}
          </svg>
        </div>

        {/* Content Children (The Canvas) */}
        <div className="relative shrink-0">{children}</div>
      </div>
    </div>
  );
};
