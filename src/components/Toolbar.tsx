/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Magnet,
  Download,
  Copy,
  Check,
  FileCode,
  Image as ImageIcon,
  FileText,
  LayoutTemplate,
  Layers,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  ChevronDown,
} from 'lucide-react';
import { DpiResolution, LabelDimensions, SnapOptions } from '../types/zpl';
import { dotsToMm } from '../engine/units';

interface ToolbarProps {
  dimensions: LabelDimensions;
  onUpdateDimensions: (dim: Partial<LabelDimensions>) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomChange: (z: number) => void;
  snapOptions: SnapOptions;
  onUpdateSnapOptions: (opts: Partial<SnapOptions>) => void;
  onOpenTemplates: () => void;
  onExportZpl: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportPdf: () => void;
  onCopyZpl: () => void;
  copiedZpl: boolean;
  selectedCount: number;
  onAlign: (type: 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom') => void;
  activeView: 'both' | 'canvas' | 'code';
  onChangeView: (view: 'both' | 'canvas' | 'code') => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  dimensions,
  onUpdateDimensions,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomChange,
  snapOptions,
  onUpdateSnapOptions,
  onOpenTemplates,
  onExportZpl,
  onExportPng,
  onExportSvg,
  onExportPdf,
  onCopyZpl,
  copiedZpl,
  selectedCount,
  onAlign,
  activeView,
  onChangeView,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSnapMenu, setShowSnapMenu] = useState(false);
  const [showDimModal, setShowDimModal] = useState(false);

  const widthMm = dotsToMm(dimensions.widthDots, dimensions.dpi);
  const heightMm = dotsToMm(dimensions.heightDots, dimensions.dpi);

  return (
    <header className="h-10 border-b border-zinc-800 bg-zinc-900 px-3 flex items-center justify-between shrink-0 select-none z-40 text-xs">
      {/* Brand & Document Specs */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-zinc-950 border border-zinc-700 flex items-center justify-center">
            <span className="font-mono text-emerald-400 font-bold text-xs tracking-tighter">^Z</span>
          </div>
          <span className="text-xs font-semibold text-zinc-100 tracking-tight">ZPL Studio</span>
          <span className="text-[11px] text-zinc-500 font-mono hidden md:inline-block">
            [{dimensions.widthDots}×{dimensions.heightDots} • {dimensions.dpi} DPI]
          </span>
        </div>

        <div className="h-4 w-px bg-zinc-800 mx-0.5" />

        {/* Templates Button */}
        <button
          id="toolbar-open-templates-btn"
          onClick={onOpenTemplates}
          className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-750 transition"
          title="Charger un modèle d'étiquette standard"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-emerald-400" />
          <span>Modèles</span>
        </button>

        {/* Dimensions modal trigger */}
        <button
          id="toolbar-dimensions-btn"
          onClick={() => setShowDimModal(true)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs border border-zinc-750 transition"
          title="Modifier dimensions et résolution DPI"
        >
          <Sliders className="w-3.5 h-3.5 text-zinc-400" />
          <span>Format & DPI</span>
        </button>
      </div>

      {/* Center Tools: History, Snapping, Alignment, Zoom, View modes */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-zinc-950 p-0.5 rounded-sm border border-zinc-800">
          <button
            id="toolbar-undo-btn"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1 rounded-sm text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition"
            title="Annuler (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            id="toolbar-redo-btn"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1 rounded-sm text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition"
            title="Rétablir (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Magnetic Snapping & Grid Dropdown Options */}
        <div className="relative">
          <button
            id="toolbar-snap-options-btn"
            onClick={() => setShowSnapMenu(!showSnapMenu)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-mono transition border ${
              snapOptions.snapToGrid || snapOptions.snapToLabelEdges || snapOptions.snapToElements
                ? 'bg-zinc-800 text-emerald-400 border-zinc-700'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
            title="Options de Grille, Règles et Aimantation magnétique"
          >
            <Magnet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Grille ({snapOptions.gridSize}pt)</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {showSnapMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSnapMenu(false)}
              />
              <div className="absolute left-0 mt-1 w-60 rounded-md bg-zinc-900 border border-zinc-800 p-2.5 shadow-2xl z-50 text-zinc-200">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono mb-2">
                  Grille & Aimantation
                </div>

                {/* Snap to grid switch */}
                <label className="flex items-center justify-between py-1 cursor-pointer hover:text-white text-xs">
                  <span>Aimantation Grille</span>
                  <input
                    type="checkbox"
                    checked={snapOptions.snapToGrid}
                    onChange={(e) => onUpdateSnapOptions({ snapToGrid: e.target.checked })}
                    className="rounded-sm bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-0"
                  />
                </label>

                {/* Grid Step Size */}
                <div className="py-1">
                  <span className="text-[10px] text-zinc-400 block mb-1 font-mono">Pas de la grille :</span>
                  <div className="grid grid-cols-5 gap-1 text-[10px] font-mono">
                    {[4, 8, 16, 24, 32].map((size) => (
                      <button
                        key={size}
                        onClick={() => onUpdateSnapOptions({ gridSize: size })}
                        className={`py-0.5 rounded-sm border transition ${
                          snapOptions.gridSize === size
                            ? 'bg-emerald-600 border-emerald-500 text-white font-bold'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750'
                        }`}
                      >
                        {size}pt
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid style: Dots vs Lines */}
                <div className="py-1">
                  <span className="text-[10px] text-zinc-400 block mb-1 font-mono">Style de grille :</span>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <button
                      onClick={() => onUpdateSnapOptions({ gridStyle: 'dots' })}
                      className={`py-1 rounded-sm border transition ${
                        snapOptions.gridStyle === 'dots'
                          ? 'bg-zinc-800 border-emerald-500 text-emerald-400 font-semibold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Points
                    </button>
                    <button
                      onClick={() => onUpdateSnapOptions({ gridStyle: 'lines' })}
                      className={`py-1 rounded-sm border transition ${
                        snapOptions.gridStyle === 'lines'
                          ? 'bg-zinc-800 border-emerald-500 text-emerald-400 font-semibold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Lignes
                    </button>
                  </div>
                </div>

                <div className="h-px bg-zinc-800 my-1.5" />

                {/* Smart snapping */}
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono mb-1">
                  Alignements
                </div>

                <label className="flex items-center justify-between py-1 cursor-pointer hover:text-white text-xs">
                  <span>Bords & Centre</span>
                  <input
                    type="checkbox"
                    checked={snapOptions.snapToLabelEdges}
                    onChange={(e) => onUpdateSnapOptions({ snapToLabelEdges: e.target.checked })}
                    className="rounded-sm bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between py-1 cursor-pointer hover:text-white text-xs">
                  <span>Entre objets</span>
                  <input
                    type="checkbox"
                    checked={snapOptions.snapToElements}
                    onChange={(e) => onUpdateSnapOptions({ snapToElements: e.target.checked })}
                    className="rounded-sm bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-0"
                  />
                </label>

                <div className="h-px bg-zinc-800 my-1.5" />

                {/* Rulers Toggle */}
                <label className="flex items-center justify-between py-1 cursor-pointer hover:text-white text-xs">
                  <span>Afficher les règles</span>
                  <input
                    type="checkbox"
                    checked={snapOptions.showRulers}
                    onChange={(e) => onUpdateSnapOptions({ showRulers: e.target.checked })}
                    className="rounded-sm bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-0"
                  />
                </label>

                <div className="flex items-center justify-between py-1 text-xs">
                  <span className="text-zinc-400">Unité des règles :</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onUpdateSnapOptions({ rulerUnit: 'dots' })}
                      className={`px-1.5 py-0.5 rounded-sm text-[10px] font-mono border ${
                        snapOptions.rulerUnit === 'dots'
                          ? 'bg-zinc-800 border-emerald-500 text-emerald-400 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      pt
                    </button>
                    <button
                      onClick={() => onUpdateSnapOptions({ rulerUnit: 'mm' })}
                      className={`px-1.5 py-0.5 rounded-sm text-[10px] font-mono border ${
                        snapOptions.rulerUnit === 'mm'
                          ? 'bg-zinc-800 border-emerald-500 text-emerald-400 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      mm
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Alignment tools (if element selected) */}
        {selectedCount > 0 && (
          <div className="flex items-center bg-zinc-950 p-0.5 rounded-sm border border-zinc-800">
            <button
              onClick={() => onAlign('left')}
              className="p-1 rounded-sm text-zinc-400 hover:text-white"
              title="Aligner à gauche"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onAlign('centerX')}
              className="p-1 rounded-sm text-zinc-400 hover:text-white"
              title="Centrer horizontalement"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onAlign('right')}
              className="p-1 rounded-sm text-zinc-400 hover:text-white"
              title="Aligner à droite"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <div className="h-3 w-px bg-zinc-800 mx-0.5" />
            <button
              onClick={() => onAlign('centerY')}
              className="p-1 rounded-sm text-zinc-400 hover:text-white"
              title="Centrer verticalement sur l'étiquette"
            >
              <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Zoom controls */}
        <div className="flex items-center bg-zinc-950 p-0.5 rounded-sm border border-zinc-800 font-mono">
          <button
            onClick={() => onZoomChange(Math.max(0.2, zoom - 0.1))}
            className="p-1 rounded-sm text-zinc-400 hover:text-white"
            title="Zoom arrière"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] text-zinc-300 w-11 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
            className="p-1 rounded-sm text-zinc-400 hover:text-white"
            title="Zoom avant"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onZoomChange(1)}
            className="p-1 rounded-sm text-zinc-400 hover:text-white"
            title="Réinitialiser zoom (100%)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View mode toggle (VS Code layout tabs style) */}
        <div className="flex items-center bg-zinc-950 p-0.5 rounded-sm border border-zinc-800 text-xs">
          <button
            onClick={() => onChangeView('both')}
            className={`px-2 py-0.5 rounded-sm font-medium transition ${
              activeView === 'both' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Affichage partagé Canevas + Code"
          >
            Mixte
          </button>
          <button
            onClick={() => onChangeView('canvas')}
            className={`px-2 py-0.5 rounded-sm font-medium transition ${
              activeView === 'canvas' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Mode Canevas Visuel"
          >
            Visuel
          </button>
          <button
            onClick={() => onChangeView('code')}
            className={`px-2 py-0.5 rounded-sm font-medium transition ${
              activeView === 'code' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Mode Code ZPL"
          >
            Code
          </button>
        </div>
      </div>

      {/* Right Actions: Copy, Export */}
      <div className="flex items-center gap-1.5">
        <button
          id="toolbar-copy-zpl-btn"
          onClick={onCopyZpl}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition"
          title="Copier le code ZPL dans le presse-papier"
        >
          {copiedZpl ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copié !</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copier ZPL</span>
            </>
          )}
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            id="toolbar-export-dropdown-btn"
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold transition"
          >
            <Download className="w-3.5 h-3.5 text-zinc-950" />
            <span>Exporter</span>
          </button>

          {showExportMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowExportMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-44 rounded-md bg-zinc-900 border border-zinc-800 py-1 shadow-2xl z-50">
                <button
                  onClick={() => {
                    onExportZpl();
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 transition"
                >
                  <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Code ZPL (.zpl)</span>
                </button>

                <button
                  onClick={() => {
                    onExportPng();
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 transition"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Image PNG</span>
                </button>

                <button
                  onClick={() => {
                    onExportSvg();
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 transition"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Vectoriel SVG</span>
                </button>

                <button
                  onClick={() => {
                    onExportPdf();
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Document PDF</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Format & Dimensions Modal */}
      {showDimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-md bg-zinc-900 border border-zinc-800 p-5 shadow-2xl text-zinc-100 animate-in fade-in-50 zoom-in-95">
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider mb-3 text-zinc-200">
              Format d'étiquette & Résolution
            </h3>

            {/* Presets */}
            <div className="mb-3">
              <label className="text-xs text-zinc-400 font-medium block mb-1.5">Formats standards :</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    onUpdateDimensions({
                      widthDots: 812,
                      heightDots: 1218,
                      dpi: 203,
                    });
                  }}
                  className="p-2 rounded-sm bg-zinc-950 hover:bg-zinc-800 text-left border border-zinc-800 transition"
                >
                  <div className="text-xs font-bold text-white">4" × 6" (100 × 150 mm)</div>
                  <div className="text-[10px] text-zinc-400 font-mono">812×1218 pts (Expédition)</div>
                </button>
                <button
                  onClick={() => {
                    onUpdateDimensions({
                      widthDots: 812,
                      heightDots: 812,
                      dpi: 203,
                    });
                  }}
                  className="p-2 rounded-sm bg-zinc-950 hover:bg-zinc-800 text-left border border-zinc-800 transition"
                >
                  <div className="text-xs font-bold text-white">4" × 4" (100 × 100 mm)</div>
                  <div className="text-[10px] text-zinc-400 font-mono">812×812 pts (Colis carré)</div>
                </button>
                <button
                  onClick={() => {
                    onUpdateDimensions({
                      widthDots: 609,
                      heightDots: 406,
                      dpi: 203,
                    });
                  }}
                  className="p-2 rounded-sm bg-zinc-950 hover:bg-zinc-800 text-left border border-zinc-800 transition"
                >
                  <div className="text-xs font-bold text-white">3" × 2" (76 × 51 mm)</div>
                  <div className="text-[10px] text-zinc-400 font-mono">609×406 pts (Carton/Palette)</div>
                </button>
                <button
                  onClick={() => {
                    onUpdateDimensions({
                      widthDots: 406,
                      heightDots: 203,
                      dpi: 203,
                    });
                  }}
                  className="p-2 rounded-sm bg-zinc-950 hover:bg-zinc-800 text-left border border-zinc-800 transition"
                >
                  <div className="text-xs font-bold text-white">2" × 1" (51 × 25 mm)</div>
                  <div className="text-[10px] text-zinc-400 font-mono">406×203 pts (Inventaire)</div>
                </button>
              </div>
            </div>

            {/* DPI Selector */}
            <div className="mb-3">
              <label className="text-xs text-zinc-400 font-medium block mb-1.5 font-mono">
                Résolution tête thermique (DPI) :
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[203, 300, 600].map((dpiVal) => (
                  <button
                    key={dpiVal}
                    onClick={() => onUpdateDimensions({ dpi: dpiVal as DpiResolution })}
                    className={`py-1.5 px-2 rounded-sm text-xs font-mono font-bold border transition ${
                      dimensions.dpi === dpiVal
                        ? 'bg-zinc-800 border-emerald-500 text-emerald-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {dpiVal} DPI ({dpiVal === 203 ? '8 dpmm' : dpiVal === 300 ? '12 dpmm' : '24 dpmm'})
                  </button>
                ))}
              </div>
            </div>

            {/* Custom dimensions */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1 font-mono">Largeur (pt) :</label>
                <input
                  type="number"
                  value={dimensions.widthDots}
                  onChange={(e) => onUpdateDimensions({ widthDots: Math.max(100, parseInt(e.target.value, 10) || 100) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-2.5 py-1 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
                />
                <span className="text-[10px] text-zinc-500 mt-0.5 block font-mono">≈ {dotsToMm(dimensions.widthDots, dimensions.dpi)} mm</span>
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1 font-mono">Hauteur (pt) :</label>
                <input
                  type="number"
                  value={dimensions.heightDots}
                  onChange={(e) => onUpdateDimensions({ heightDots: Math.max(100, parseInt(e.target.value, 10) || 100) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-2.5 py-1 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
                />
                <span className="text-[10px] text-zinc-500 mt-0.5 block font-mono">≈ {dotsToMm(dimensions.heightDots, dimensions.dpi)} mm</span>
              </div>
            </div>

            <button
              onClick={() => setShowDimModal(false)}
              className="w-full py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-sm text-xs transition"
            >
              Appliquer et fermer
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
