/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useZplSynchronizer } from './engine/zplSyncEngine';
import { Toolbar } from './components/Toolbar';
import { ElementPalette } from './components/ElementPalette';
import { Canvas } from './components/Canvas';
import { CodeEditor } from './components/CodeEditor';
import { PropertiesSidebar } from './components/PropertiesSidebar';
import { StatusBar } from './components/StatusBar';
import { TemplateModal } from './components/TemplateModal';
import {
  downloadZplFile,
  downloadPng,
  downloadSvg,
  downloadPdf,
} from './engine/exporter';
import { saveCurrentSession, getSavedSession } from './engine/storage';
import { SnapOptions, ZplElement } from './types/zpl';

export default function App() {
  // Check for auto-saved session
  const savedZpl = getSavedSession();
  const synchronizer = useZplSynchronizer(savedZpl || undefined);

  const {
    state,
    updateFromCanvas,
    updateFromCode,
    setSelectedElementIds,
    selectElement,
    clearSelection,
    updateElement,
    addElement,
    deleteSelectedElements,
    duplicateSelectedElements,
    updateLabelDimensions,
    loadTemplate,
    undo,
    redo,
    canUndo,
    canRedo,
  } = synchronizer;

  // View & Tool States
  const [zoom, setZoom] = useState<number>(0.85);
  const [activeView, setActiveView] = useState<'both' | 'canvas' | 'code'>('both');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [copiedZpl, setCopiedZpl] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Advanced Grid, Rulers & Magnetic Snap Options
  const [snapOptions, setSnapOptions] = useState<SnapOptions>({
    snapToGrid: true,
    gridSize: 16,
    gridStyle: 'dots',
    snapToLabelEdges: true,
    snapToElements: true,
    showRulers: true,
    rulerUnit: 'dots',
  });

  const handleUpdateSnapOptions = (opts: Partial<SnapOptions>) => {
    setSnapOptions((prev) => ({ ...prev, ...opts }));
  };

  const handleToggleRulerUnit = () => {
    setSnapOptions((prev) => ({
      ...prev,
      rulerUnit: prev.rulerUnit === 'dots' ? 'mm' : 'dots',
    }));
  };

  // SVG ref for exporting
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Auto-save session on change
  useEffect(() => {
    saveCurrentSession(state.zplCode);
  }, [state.zplCode]);

  // Primary selected element
  const primarySelectedElement =
    state.selectedElementIds.length === 1
      ? state.ast.elements.find((e) => e.id === state.selectedElementIds[0]) || null
      : null;

  // Next insertion position (centered or cascading)
  const nextPos = {
    x: 80 + (state.ast.elements.length % 5) * 20,
    y: 80 + (state.ast.elements.length % 5) * 20,
  };

  // Alignment helper
  const handleAlign = (type: 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom') => {
    if (state.selectedElementIds.length === 0) return;

    updateFromCanvas((prevAst) => {
      const selectedSet = new Set(state.selectedElementIds);
      const width = prevAst.dimensions.widthDots;
      const height = prevAst.dimensions.heightDots;

      return {
        newAst: {
          ...prevAst,
          elements: prevAst.elements.map((el) => {
            if (!selectedSet.has(el.id)) return el;

            const elW = 'width' in el ? (el as any).width : 100;
            const elH = 'height' in el ? (el as any).height : 50;

            let newX = el.x;
            let newY = el.y;

            switch (type) {
              case 'left':
                newX = 50;
                break;
              case 'centerX':
                newX = Math.round((width - elW) / 2);
                break;
              case 'right':
                newX = Math.max(0, width - elW - 50);
                break;
              case 'top':
                newY = 50;
                break;
              case 'centerY':
                newY = Math.round((height - elH) / 2);
                break;
              case 'bottom':
                newY = Math.max(0, height - elH - 50);
                break;
            }

            return { ...el, x: newX, y: newY } as ZplElement;
          }),
        },
      };
    });
  };

  // Reorder elements
  const handleReorderElements = (newElements: ZplElement[]) => {
    updateFromCanvas((prevAst) => ({
      newAst: {
        ...prevAst,
        elements: newElements,
      },
    }));
  };

  // Exports
  const handleExportZpl = () => {
    downloadZplFile(state.zplCode, `label_${Date.now()}.zpl`);
  };

  const handleExportPng = () => {
    if (svgRef.current) {
      downloadPng(svgRef.current, state.ast, `label_${Date.now()}.png`, 2);
    }
  };

  const handleExportSvg = () => {
    if (svgRef.current) {
      downloadSvg(svgRef.current, `label_${Date.now()}.svg`);
    }
  };

  const handleExportPdf = () => {
    if (svgRef.current) {
      downloadPdf(svgRef.current, state.ast, `label_${Date.now()}.pdf`);
    }
  };

  const handleCopyZpl = () => {
    navigator.clipboard.writeText(state.zplCode);
    setCopiedZpl(true);
    setTimeout(() => setCopiedZpl(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* Top Navigation & Action Toolbar */}
      <Toolbar
        dimensions={state.ast.dimensions}
        onUpdateDimensions={updateLabelDimensions}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        zoom={zoom}
        onZoomChange={setZoom}
        snapOptions={snapOptions}
        onUpdateSnapOptions={handleUpdateSnapOptions}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onExportZpl={handleExportZpl}
        onExportPng={handleExportPng}
        onExportSvg={handleExportSvg}
        onExportPdf={handleExportPdf}
        onCopyZpl={handleCopyZpl}
        copiedZpl={copiedZpl}
        selectedCount={state.selectedElementIds.length}
        onAlign={handleAlign}
        activeView={activeView}
        onChangeView={setActiveView}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Full Screen Code Mode: Takes 100% of workspace width & height */}
        {activeView === 'code' ? (
          <div className="w-full h-full flex flex-col">
            <CodeEditor
              zplCode={state.zplCode}
              onChangeZpl={(code) => updateFromCode(code)}
              parseError={state.parseError}
              fullScreen={true}
            />
          </div>
        ) : (
          <>
            {/* Floating Glassy Collapsible Left Toolbox */}
            <ElementPalette
              onAddElement={addElement}
              nextElementPosition={nextPos}
            />

            {/* Interactive WYSIWYG Thermal Canvas with Rulers & Guides */}
            <Canvas
              ast={state.ast}
              selectedElementIds={state.selectedElementIds}
              onSelectElement={selectElement}
              onClearSelection={clearSelection}
              onUpdateElement={updateElement}
              onDeleteSelected={deleteSelectedElements}
              onDuplicateSelected={duplicateSelectedElements}
              onUndo={undo}
              onRedo={redo}
              zoom={zoom}
              snapOptions={snapOptions}
              onToggleRulerUnit={handleToggleRulerUnit}
              svgRef={svgRef}
              onCursorChange={setCursorPos}
            />

            {/* Properties Sidebar (Visible when Canvas is active without split view) */}
            {activeView === 'canvas' && (
              <PropertiesSidebar
                selectedElement={primarySelectedElement}
                elements={state.ast.elements}
                dimensions={state.ast.dimensions}
                onUpdateElement={updateElement}
                onDeleteElement={deleteSelectedElements}
                onDuplicateElement={duplicateSelectedElements}
                onSelectElement={(id) => selectElement(id, false)}
                onReorderElements={handleReorderElements}
              />
            )}

            {/* Right: Synchronized ZPL Code Editor in split view mode */}
            {activeView === 'both' && (
              <CodeEditor
                zplCode={state.zplCode}
                onChangeZpl={(code) => updateFromCode(code)}
                parseError={state.parseError}
                fullScreen={false}
              />
            )}

            {/* Properties Sidebar in 'both' view: appears alongside code editor when element selected */}
            {activeView === 'both' && primarySelectedElement && (
              <PropertiesSidebar
                selectedElement={primarySelectedElement}
                elements={state.ast.elements}
                dimensions={state.ast.dimensions}
                onUpdateElement={updateElement}
                onDeleteElement={deleteSelectedElements}
                onDuplicateElement={duplicateSelectedElements}
                onSelectElement={(id) => selectElement(id, false)}
                onReorderElements={handleReorderElements}
              />
            )}
          </>
        )}
      </div>

      {/* VS Code Style Status Bar */}
      <StatusBar
        dimensions={state.ast.dimensions}
        elementCount={state.ast.elements.length}
        selectedCount={state.selectedElementIds.length}
        zoom={zoom}
        cursorPos={cursorPos}
        snapOptions={snapOptions}
      />

      {/* Templates Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={loadTemplate}
      />
    </div>
  );
}
