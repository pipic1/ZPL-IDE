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
import { ContextMenu } from './components/ContextMenu';
import { ImageModal } from './components/ImageModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { LibraryModal } from './components/LibraryModal';
import {
  downloadZplFile,
  downloadPng,
  downloadSvg,
  downloadPdf,
} from './engine/exporter';
import { saveCurrentSession, getSavedSession, saveProject, saveToDisk } from './engine/storage';
import { SnapOptions, ZplElement, ZplElementType, ZplGraphicElement, LabelProject } from './types/zpl';
import { Save, HardDrive, Download } from 'lucide-react';

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
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState<boolean>(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [copiedZpl, setCopiedZpl] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Clipboard for copy / cut / paste
  const [clipboard, setClipboard] = useState<ZplElement | null>(null);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    targetElement: ZplElement | null;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    targetElement: null,
  });

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Layer ordering
  const handleOrder = (action: 'bringToFront' | 'sendToBack' | 'bringForward' | 'sendBackward') => {
    const target = contextMenu.targetElement || primarySelectedElement;
    if (!target) return;
    const idx = state.ast.elements.findIndex((e) => e.id === target.id);
    if (idx === -1) return;

    const newElements = [...state.ast.elements];
    const [item] = newElements.splice(idx, 1);

    if (action === 'bringToFront') {
      newElements.push(item);
    } else if (action === 'sendToBack') {
      newElements.unshift(item);
    } else if (action === 'bringForward') {
      const targetIdx = Math.min(newElements.length, idx + 1);
      newElements.splice(targetIdx, 0, item);
    } else if (action === 'sendBackward') {
      const targetIdx = Math.max(0, idx - 1);
      newElements.splice(targetIdx, 0, item);
    }

    handleReorderElements(newElements);
  };

  // Cut / Copy / Paste
  const handleCut = () => {
    const target = contextMenu.targetElement || primarySelectedElement;
    if (target) {
      setClipboard(target);
      deleteSelectedElements();
    }
  };

  const handleCopy = () => {
    const target = contextMenu.targetElement || primarySelectedElement;
    if (target) {
      setClipboard(target);
    }
  };

  const handlePaste = () => {
    if (clipboard) {
      const newEl = {
        ...clipboard,
        id: `el_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        x: clipboard.x + 24,
        y: clipboard.y + 24,
      } as ZplElement;
      addElement(newEl);
      selectElement(newEl.id, false);
    }
  };

  // Insert standard element helper
  const handleInsert = (type: ZplElementType) => {
    if (type === 'graphic') {
      setIsImageModalOpen(true);
      return;
    }
    const id = `el_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    let newElement: ZplElement;

    switch (type) {
      case 'text':
        newElement = {
          id,
          type: 'text',
          name: 'Text Field',
          x: nextPos.x,
          y: nextPos.y,
          text: 'NEW TEXT',
          fontName: '0',
          orientation: 'N',
          fontHeight: 32,
          fontWidth: 32,
          inverted: false,
        };
        break;
      case 'barcode128':
        newElement = {
          id,
          type: 'barcode128',
          name: 'Code 128',
          x: nextPos.x,
          y: nextPos.y,
          data: '12345678',
          orientation: 'N',
          height: 80,
          printInterpretationLine: true,
          printInterpretationAbove: false,
          moduleWidth: 2,
        };
        break;
      case 'barcode39':
        newElement = {
          id,
          type: 'barcode39',
          name: 'Code 39',
          x: nextPos.x,
          y: nextPos.y,
          data: 'CODE39',
          orientation: 'N',
          height: 70,
          printInterpretationLine: true,
          moduleWidth: 2,
        };
        break;
      case 'qrcode':
        newElement = {
          id,
          type: 'qrcode',
          name: 'QR Code',
          x: nextPos.x,
          y: nextPos.y,
          data: 'https://example.com',
          orientation: 'N',
          model: 2,
          magnification: 5,
          errorCorrection: 'M',
        };
        break;
      case 'datamatrix':
        newElement = {
          id,
          type: 'datamatrix',
          name: 'DataMatrix',
          x: nextPos.x,
          y: nextPos.y,
          data: 'DMX-12345',
          orientation: 'N',
          height: 60,
        };
        break;
      case 'line':
        newElement = {
          id,
          type: 'box',
          name: 'Divider Line',
          x: nextPos.x,
          y: nextPos.y,
          width: 240,
          height: 3,
          borderThickness: 3,
          color: 'B',
          rounding: 0,
        };
        break;
      case 'box':
      default:
        newElement = {
          id,
          type: 'box',
          name: 'Box Frame',
          x: nextPos.x,
          y: nextPos.y,
          width: 220,
          height: 110,
          borderThickness: 3,
          color: 'B',
          rounding: 0,
        };
        break;
    }

    addElement(newElement);
    selectElement(newElement.id, false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  // Local Storage Save
  const handleSaveLocal = () => {
    saveCurrentSession(state.zplCode);
    const lineCount = state.zplCode ? state.zplCode.split('\n').length : 0;
    const dateStr = new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    saveProject({
      id: `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      name: `Label ${dateStr}`,
      updatedAt: Date.now(),
      zplCode: state.zplCode,
      dimensions: { ...state.ast.dimensions },
      elementCount: state.ast.elements.length,
      lineCount,
    });
    showToast('Saved to Local Storage Library!');
  };

  // Save on Computer Disk
  const handleSaveToDisk = async () => {
    const success = await saveToDisk('label_design', state.zplCode);
    if (success) {
      showToast('Label saved to disk (.zpl)!');
    }
  };

  // Load Project from Library
  const handleLoadProject = (project: LabelProject) => {
    updateFromCode(project.zplCode);
    showToast(`Loaded "${project.name}"!`);
  };

  // New blank label
  const handleNew = () => {
    updateFromCanvas((prevAst) => ({
      newAst: {
        ...prevAst,
        elements: [],
      },
    }));
    clearSelection();
  };

  // Import ZPL file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        updateFromCode(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing inside inputs / textareas
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';

      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setIsShortcutsModalOpen(true);
        return;
      }

      // Save on Disk (Ctrl+Shift+S)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveToDisk();
        return;
      }

      // Save Local (Ctrl+S)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveLocal();
        return;
      }

      // Open Library (Ctrl+L)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsLibraryModalOpen(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNew();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleExportPdf();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.zplCode, state.ast]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans">
      {/* Hidden File Input for Importing .zpl */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".zpl,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Navigation & Action Toolbar with VS Code Style MenuBar */}
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
        onOpenLibrary={() => setIsLibraryModalOpen(true)}
        onSaveToDisk={handleSaveToDisk}
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
        onNew={handleNew}
        onImportFile={() => fileInputRef.current?.click()}
        onOpenImageModal={() => setIsImageModalOpen(true)}
        onSaveLocal={handleSaveLocal}
        onPrint={handleExportPdf}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePaste}
        hasClipboard={!!clipboard}
        onDuplicate={duplicateSelectedElements}
        onDelete={deleteSelectedElements}
        onSelectAll={() => setSelectedElementIds(state.ast.elements.map((e) => e.id))}
        onClearSelection={clearSelection}
        onInsert={handleInsert}
        onToggleRulerUnit={handleToggleRulerUnit}
        onShowShortcuts={() => setIsShortcutsModalOpen(true)}
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
              onOpenImageModal={() => setIsImageModalOpen(true)}
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
              onContextMenu={(pos, el) => {
                setContextMenu({
                  isOpen: true,
                  position: pos,
                  targetElement: el,
                });
              }}
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
                onBackToLabelProps={clearSelection}
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
                onBackToLabelProps={clearSelection}
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
        zplCode={state.zplCode}
      />

      {/* Right-Click Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={() => setContextMenu((prev) => ({ ...prev, isOpen: false }))}
        targetElement={contextMenu.targetElement}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePaste}
        hasClipboard={!!clipboard}
        onDuplicate={duplicateSelectedElements}
        onDelete={deleteSelectedElements}
        onAlign={handleAlign}
        onOrder={handleOrder}
        onInsert={handleInsert}
        onOpenImageModal={() => setIsImageModalOpen(true)}
        onOpenDimensionsModal={() => {
          // Open dimensions modal by triggering Toolbar's method or setting state
          const dimBtn = document.getElementById('toolbar-dimensions-btn');
          dimBtn?.click();
        }}
        onZoomIn={() => setZoom((prev) => Math.min(3, prev + 0.1))}
        onZoomOut={() => setZoom((prev) => Math.max(0.2, prev - 0.1))}
        onResetZoom={() => setZoom(1)}
      />

      {/* Graphic / Image Import Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsertGraphic={(graphicEl: ZplGraphicElement) => {
          addElement(graphicEl);
          selectElement(graphicEl.id, false);
          setIsImageModalOpen(false);
        }}
        dimensions={state.ast.dimensions}
      />

      {/* Templates Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={loadTemplate}
      />

      {/* Local Storage Label Library Modal */}
      <LibraryModal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
        currentZpl={state.zplCode}
        currentDimensions={state.ast.dimensions}
        currentElementCount={state.ast.elements.length}
        onLoadProject={handleLoadProject}
        onNotify={showToast}
      />

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-6 z-50 flex items-center gap-2 px-3.5 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-md shadow-2xl text-xs font-medium border border-zinc-700 dark:border-zinc-300 animate-in fade-in slide-in-from-bottom-2">
          <HardDrive className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
