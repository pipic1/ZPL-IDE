/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  AlignmentGuide,
  Orientation,
  SnapOptions,
  ZplBarcode128Element,
  ZplBarcode39Element,
  ZplBoxElement,
  ZplDocumentAST,
  ZplElement,
  ZplQrCodeElement,
  ZplTextElement,
} from '../types/zpl';
import { generateCode128SvgBars, generateCode39SvgBars, generateQrMatrix } from '../engine/barcodeRenderers';
import { dotsToMm } from '../engine/units';
import { Rulers } from './Rulers';

interface CanvasProps {
  ast: ZplDocumentAST;
  selectedElementIds: string[];
  onSelectElement: (id: string, multi?: boolean) => void;
  onClearSelection: () => void;
  onUpdateElement: (id: string, updates: Partial<ZplElement>) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  snapOptions: SnapOptions;
  onToggleRulerUnit: () => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  onCursorChange?: (pos: { x: number; y: number } | null) => void;
  onContextMenu?: (pos: { x: number; y: number }, element: ZplElement | null) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  ast,
  selectedElementIds,
  onSelectElement,
  onClearSelection,
  onUpdateElement,
  onDeleteSelected,
  onDuplicateSelected,
  onUndo,
  onRedo,
  zoom,
  snapOptions,
  onToggleRulerUnit,
  svgRef,
  onCursorChange,
  onContextMenu,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [activeGuides, setActiveGuides] = useState<AlignmentGuide[]>([]);

  // Panning state for Space+drag or middle-click drag
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [panState, setPanState] = useState<{
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);

  // Dragging state
  const [dragState, setDragState] = useState<{
    elementId: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialWidth?: number;
    initialHeight?: number;
    handle?: string; // 'drag' or 'nw', 'ne', 'se', 'sw', etc.
  } | null>(null);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          onDeleteSelected();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onDuplicateSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          onRedo();
        } else {
          onUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        onRedo();
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
          const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;

          for (const id of selectedElementIds) {
            const el = ast.elements.find((item) => item.id === id);
            if (el) {
              onUpdateElement(id, {
                x: Math.max(0, el.x + dx),
                y: Math.max(0, el.y + dy),
              });
            }
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setPanState(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedElementIds, ast.elements, onDeleteSelected, onDuplicateSelected, onUndo, onRedo, onUpdateElement]);

  // Calculate smart magnetic snapping & visual alignment guides
  const applySnapping = useCallback(
    (
      currentElId: string,
      rawX: number,
      rawY: number,
      width: number,
      height: number
    ): { snappedX: number; snappedY: number; guides: AlignmentGuide[] } => {
      let snappedX = rawX;
      let snappedY = rawY;
      const guides: AlignmentGuide[] = [];
      const SNAP_THRESHOLD = 8; // Snap distance threshold in points

      // 1. Grid Snapping (if enabled)
      if (snapOptions.snapToGrid) {
        snappedX = Math.round(snappedX / snapOptions.gridSize) * snapOptions.gridSize;
        snappedY = Math.round(snappedY / snapOptions.gridSize) * snapOptions.gridSize;
      }

      // 2. Snap to Label Edges & Centers
      if (snapOptions.snapToLabelEdges) {
        const labelW = ast.dimensions.widthDots;
        const labelH = ast.dimensions.heightDots;

        // Horizontal targets on label: Left edge (0), Center (labelW/2), Right edge (labelW)
        const elementCenterX = snappedX + width / 2;
        const elementRightX = snappedX + width;

        // Check Left edge to 0
        if (Math.abs(snappedX - 0) <= SNAP_THRESHOLD) {
          snappedX = 0;
          guides.push({ orientation: 'vertical', position: 0, label: 'Bord Gauche' });
        }
        // Check Center to label Center
        else if (Math.abs(elementCenterX - labelW / 2) <= SNAP_THRESHOLD) {
          snappedX = Math.round(labelW / 2 - width / 2);
          guides.push({ orientation: 'vertical', position: labelW / 2, label: 'Centre H' });
        }
        // Check Right edge to label Right
        else if (Math.abs(elementRightX - labelW) <= SNAP_THRESHOLD) {
          snappedX = labelW - width;
          guides.push({ orientation: 'vertical', position: labelW, label: 'Bord Droit' });
        }

        // Vertical targets on label: Top (0), Center (labelH/2), Bottom (labelH)
        const elementCenterY = snappedY + height / 2;
        const elementBottomY = snappedY + height;

        if (Math.abs(snappedY - 0) <= SNAP_THRESHOLD) {
          snappedY = 0;
          guides.push({ orientation: 'horizontal', position: 0, label: 'Bord Haut' });
        } else if (Math.abs(elementCenterY - labelH / 2) <= SNAP_THRESHOLD) {
          snappedY = Math.round(labelH / 2 - height / 2);
          guides.push({ orientation: 'horizontal', position: labelH / 2, label: 'Centre V' });
        } else if (Math.abs(elementBottomY - labelH) <= SNAP_THRESHOLD) {
          snappedY = labelH - height;
          guides.push({ orientation: 'horizontal', position: labelH, label: 'Bord Bas' });
        }
      }

      // 3. Snap to other Elements (Smart Guides)
      if (snapOptions.snapToElements) {
        const otherElements = ast.elements.filter((e) => e.id !== currentElId);

        for (const other of otherElements) {
          const otherBounds = getElementBounds(other);
          const otherLeft = otherBounds.x;
          const otherCenterX = otherBounds.x + otherBounds.w / 2;
          const otherRight = otherBounds.x + otherBounds.w;

          const myLeft = snappedX;
          const myCenterX = snappedX + width / 2;
          const myRight = snappedX + width;

          // X alignments: Left-to-Left
          if (Math.abs(myLeft - otherLeft) <= SNAP_THRESHOLD) {
            snappedX = otherLeft;
            guides.push({ orientation: 'vertical', position: otherLeft });
            break;
          }
          // Center-to-Center X
          if (Math.abs(myCenterX - otherCenterX) <= SNAP_THRESHOLD) {
            snappedX = Math.round(otherCenterX - width / 2);
            guides.push({ orientation: 'vertical', position: otherCenterX });
            break;
          }
          // Right-to-Right
          if (Math.abs(myRight - otherRight) <= SNAP_THRESHOLD) {
            snappedX = otherRight - width;
            guides.push({ orientation: 'vertical', position: otherRight });
            break;
          }
        }

        for (const other of otherElements) {
          const otherBounds = getElementBounds(other);
          const otherTop = otherBounds.y;
          const otherCenterY = otherBounds.y + otherBounds.h / 2;
          const otherBottom = otherBounds.y + otherBounds.h;

          const myTop = snappedY;
          const myCenterY = snappedY + height / 2;
          const myBottom = snappedY + height;

          // Y alignments: Top-to-Top
          if (Math.abs(myTop - otherTop) <= SNAP_THRESHOLD) {
            snappedY = otherTop;
            guides.push({ orientation: 'horizontal', position: otherTop });
            break;
          }
          // Center-to-Center Y
          if (Math.abs(myCenterY - otherCenterY) <= SNAP_THRESHOLD) {
            snappedY = Math.round(otherCenterY - height / 2);
            guides.push({ orientation: 'horizontal', position: otherCenterY });
            break;
          }
          // Bottom-to-Bottom
          if (Math.abs(myBottom - otherBottom) <= SNAP_THRESHOLD) {
            snappedY = otherBottom - height;
            guides.push({ orientation: 'horizontal', position: otherBottom });
            break;
          }
        }
      }

      return { snappedX, snappedY, guides };
    },
    [snapOptions, ast.dimensions, ast.elements]
  );

  // Mouse move on canvas to track coordinates
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left) / zoom;
      const rawY = (e.clientY - rect.top) / zoom;

      const currentX = Math.round(Math.max(0, Math.min(ast.dimensions.widthDots, rawX)));
      const currentY = Math.round(Math.max(0, Math.min(ast.dimensions.heightDots, rawY)));
      setCursorPos({ x: currentX, y: currentY });
      onCursorChange?.({ x: currentX, y: currentY });

      // Handle element dragging / resizing
      if (dragState) {
        const deltaX = (e.clientX - dragState.startX) / zoom;
        const deltaY = (e.clientY - dragState.startY) / zoom;

        const el = ast.elements.find((item) => item.id === dragState.elementId);
        if (!el) return;

        const bounds = getElementBounds(el);

        if (dragState.handle === 'drag') {
          const rawTargetX = dragState.initialX + deltaX;
          const rawTargetY = dragState.initialY + deltaY;

          const { snappedX, snappedY, guides } = applySnapping(
            dragState.elementId,
            rawTargetX,
            rawTargetY,
            bounds.w,
            bounds.h
          );

          setActiveGuides(guides);
          onUpdateElement(dragState.elementId, {
            x: Math.max(0, Math.round(snappedX)),
            y: Math.max(0, Math.round(snappedY)),
          });
        } else if (dragState.handle && dragState.initialWidth !== undefined && dragState.initialHeight !== undefined) {
          // Resizing element
          let newW = dragState.initialWidth;
          let newH = dragState.initialHeight;
          let newX = el.x;
          let newY = el.y;

          if (dragState.handle.includes('e')) {
            newW = Math.max(10, dragState.initialWidth + deltaX);
          }
          if (dragState.handle.includes('s')) {
            newH = Math.max(10, dragState.initialHeight + deltaY);
          }
          if (dragState.handle.includes('w')) {
            const potentialW = dragState.initialWidth - deltaX;
            if (potentialW > 10) {
              newW = potentialW;
              newX = dragState.initialX + deltaX;
            }
          }
          if (dragState.handle.includes('n')) {
            const potentialH = dragState.initialHeight - deltaY;
            if (potentialH > 10) {
              newH = potentialH;
              newY = dragState.initialY + deltaY;
            }
          }

          if (snapOptions.snapToGrid) {
            newW = Math.round(newW / snapOptions.gridSize) * snapOptions.gridSize;
            newH = Math.round(newH / snapOptions.gridSize) * snapOptions.gridSize;
            newX = Math.round(newX / snapOptions.gridSize) * snapOptions.gridSize;
            newY = Math.round(newY / snapOptions.gridSize) * snapOptions.gridSize;
          }

          if (el.type === 'box' || el.type === 'line' || el.type === 'graphic') {
            onUpdateElement(dragState.elementId, {
              x: Math.max(0, Math.round(newX)),
              y: Math.max(0, Math.round(newY)),
              width: Math.max(8, Math.round(newW)),
              height: Math.max(8, Math.round(newH)),
            });
          } else if (el.type === 'barcode128' || el.type === 'barcode39' || el.type === 'barcodeEAN13') {
            onUpdateElement(dragState.elementId, {
              x: Math.max(0, Math.round(newX)),
              y: Math.max(0, Math.round(newY)),
              height: Math.max(20, Math.round(newH)),
            });
          } else if (el.type === 'text') {
            onUpdateElement(dragState.elementId, {
              x: Math.max(0, Math.round(newX)),
              y: Math.max(0, Math.round(newY)),
              fontHeight: Math.max(12, Math.round(newH)),
              fontWidth: Math.max(10, Math.round(newW)),
            });
          }
        }
      }
    },
    [zoom, ast.dimensions, dragState, snapOptions, ast.elements, onUpdateElement, applySnapping, svgRef]
  );

  const handleMouseUp = () => {
    setDragState(null);
    setActiveGuides([]);
  };

  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isMulti = e.shiftKey || e.metaKey || e.ctrlKey;
    onSelectElement(id, isMulti);

    const el = ast.elements.find((item) => item.id === id);
    if (!el) return;

    setDragState({
      elementId: id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: el.x,
      initialY: el.y,
      handle: 'drag',
    });
  };

  const handleResizeHandleMouseDown = (e: React.MouseEvent, id: string, handle: string) => {
    e.stopPropagation();
    const el = ast.elements.find((item) => item.id === id);
    if (!el) return;

    const w = 'width' in el ? (el as ZplBoxElement).width : 'fontWidth' in el ? (el as ZplTextElement).fontWidth : 100;
    const h = 'height' in el ? (el as any).height : 'fontHeight' in el ? (el as ZplTextElement).fontHeight : 50;

    setDragState({
      elementId: id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: el.x,
      initialY: el.y,
      initialWidth: w,
      initialHeight: h,
      handle,
    });
  };

  const labelW = ast.dimensions.widthDots;
  const labelH = ast.dimensions.heightDots;

  // Selected element for bounding box
  const primarySelectedEl =
    selectedElementIds.length === 1 ? ast.elements.find((e) => e.id === selectedElementIds[0]) : null;

  // Render the inner SVG label
  const renderLabelContent = () => (
    <div
      id="canvas-outer-wrapper"
      className="relative shadow-md dark:shadow-[0_4px_30px_rgba(0,0,0,0.85)] border border-zinc-300 dark:border-zinc-700 rounded-none transition-transform duration-75"
      style={{
        width: `${labelW * zoom}px`,
        height: `${labelH * zoom}px`,
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${labelW} ${labelH}`}
        width={labelW * zoom}
        height={labelH * zoom}
        className="w-full h-full bg-white block overflow-hidden cursor-crosshair"
        onMouseMove={handleMouseMove}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu?.({ x: e.clientX, y: e.clientY }, null);
        }}
      >
        {/* Defs: Dotted and Lined Grid Patterns */}
        <defs>
          {/* Dots pattern */}
          <pattern
            id="gridDotsPattern"
            width={snapOptions.gridSize}
            height={snapOptions.gridSize}
            patternUnits="userSpaceOnUse"
          >
            <rect width={snapOptions.gridSize} height={snapOptions.gridSize} fill="none" />
            <circle
              cx={snapOptions.gridSize / 2}
              cy={snapOptions.gridSize / 2}
              r="1"
              fill="#cbd5e1"
            />
          </pattern>

          {/* Lines pattern */}
          <pattern
            id="gridLinesPattern"
            width={snapOptions.gridSize}
            height={snapOptions.gridSize}
            patternUnits="userSpaceOnUse"
          >
            <rect width={snapOptions.gridSize} height={snapOptions.gridSize} fill="none" />
            <line
              x1="0"
              y1="0"
              x2={snapOptions.gridSize}
              y2="0"
              stroke="#e2e8f0"
              strokeWidth="0.8"
            />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={snapOptions.gridSize}
              stroke="#e2e8f0"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>

        {/* Magnetic Grid Background */}
        {snapOptions.snapToGrid && (
          <rect
            width={labelW}
            height={labelH}
            fill={snapOptions.gridStyle === 'lines' ? 'url(#gridLinesPattern)' : 'url(#gridDotsPattern)'}
            pointerEvents="none"
          />
        )}

        {/* Render Elements */}
        {ast.elements.map((el) => {
          const isSelected = selectedElementIds.includes(el.id);
          return (
            <g
              key={el.id}
              id={`zpl-el-${el.id}`}
              className="cursor-move group"
              onMouseDown={(e) => handleElementMouseDown(e, el.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectElement(el.id, false);
                onContextMenu?.({ x: e.clientX, y: e.clientY }, el);
              }}
            >
              {renderElementSvg(el)}

              {/* Selection border indicator */}
              {isSelected && (
                <rect
                  x={getElementBounds(el).x - 2}
                  y={getElementBounds(el).y - 2}
                  width={getElementBounds(el).w + 4}
                  height={getElementBounds(el).h + 4}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={2 / zoom}
                  strokeDasharray="4 2"
                  pointerEvents="none"
                />
              )}
            </g>
          );
        })}

        {/* Active Smart Alignment Guide Lines */}
        {activeGuides.map((guide, idx) => {
          if (guide.orientation === 'vertical') {
            return (
              <g key={`guide-v-${idx}`}>
                <line
                  x1={guide.position}
                  y1={0}
                  x2={guide.position}
                  y2={labelH}
                  stroke="#06b6d4"
                  strokeWidth={1.5 / zoom}
                  strokeDasharray="4 3"
                />
                {guide.label && (
                  <text
                    x={guide.position + 4}
                    y={16}
                    fill="#0891b2"
                    fontSize={10 / zoom}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {guide.label}
                  </text>
                )}
              </g>
            );
          } else {
            return (
              <g key={`guide-h-${idx}`}>
                <line
                  x1={0}
                  y1={guide.position}
                  x2={labelW}
                  y2={guide.position}
                  stroke="#06b6d4"
                  strokeWidth={1.5 / zoom}
                  strokeDasharray="4 3"
                />
                {guide.label && (
                  <text
                    x={10}
                    y={guide.position - 4}
                    fill="#0891b2"
                    fontSize={10 / zoom}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {guide.label}
                  </text>
                )}
              </g>
            );
          }
        })}

        {/* Transform & Resize Handles for Single Selection */}
        {primarySelectedEl && (
          <TransformBox
            bounds={getElementBounds(primarySelectedEl)}
            zoom={zoom}
            onHandleMouseDown={(e, handle) =>
              handleResizeHandleMouseDown(e, primarySelectedEl.id, handle)
            }
          />
        )}
      </svg>
    </div>
  );

  // Canvas Viewport Pan handlers
  const handleViewportMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || isSpacePressed) {
      e.preventDefault();
      if (containerRef.current) {
        setPanState({
          startX: e.clientX,
          startY: e.clientY,
          scrollLeft: containerRef.current.scrollLeft,
          scrollTop: containerRef.current.scrollTop,
        });
      }
    }
  };

  const handleViewportMouseMove = (e: React.MouseEvent) => {
    if (panState && containerRef.current) {
      e.preventDefault();
      const dx = e.clientX - panState.startX;
      const dy = e.clientY - panState.startY;
      containerRef.current.scrollLeft = panState.scrollLeft - dx;
      containerRef.current.scrollTop = panState.scrollTop - dy;
    }
  };

  const handleViewportMouseUp = () => {
    setPanState(null);
    handleMouseUp();
  };

  return (
    <div
      ref={containerRef}
      id="canvas-viewport"
      className={`flex-1 bg-zinc-200/50 dark:bg-[#121214] overflow-auto relative select-none ${
        isSpacePressed ? (panState ? 'cursor-grabbing' : 'cursor-grab') : ''
      }`}
      onMouseDown={handleViewportMouseDown}
      onMouseMove={handleViewportMouseMove}
      onMouseUp={handleViewportMouseUp}
      onMouseLeave={() => {
        handleViewportMouseUp();
        setCursorPos(null);
        onCursorChange?.(null);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu?.({ x: e.clientX, y: e.clientY }, null);
      }}
    >
      <div
        id="canvas-scroll-inner"
        className="min-w-full min-h-full p-12 md:p-16 flex items-center justify-center w-max h-max"
        onClick={(e) => {
          if (
            e.target === e.currentTarget ||
            (e.target as HTMLElement).id === 'canvas-scroll-inner' ||
            (e.target as HTMLElement).id === 'canvas-viewport'
          ) {
            onClearSelection();
          }
        }}
      >
        {/* Rulers or Naked Canvas */}
        {snapOptions.showRulers ? (
          <Rulers
            widthDots={labelW}
            heightDots={labelH}
            dpi={ast.dimensions.dpi}
            zoom={zoom}
            cursorPos={cursorPos}
            unit={snapOptions.rulerUnit}
            onToggleUnit={onToggleRulerUnit}
          >
            {renderLabelContent()}
          </Rulers>
        ) : (
          renderLabelContent()
        )}
      </div>
    </div>
  );
};

/**
 * Calculates visual bounding box in dots for any element
 */
function getElementBounds(el: ZplElement): { x: number; y: number; w: number; h: number } {
  switch (el.type) {
    case 'text': {
      const text = el.text || 'Texte';
      const lines = text.split('\n');
      const maxLineLen = Math.max(...lines.map((l) => l.length), 1);
      const w = el.blockConfig ? el.blockConfig.width : maxLineLen * (el.fontWidth * 0.65);
      const h = lines.length * (el.fontHeight * 1.1);
      return { x: el.x, y: el.y, w: Math.max(20, w), h: Math.max(14, h) };
    }
    case 'box':
    case 'line': {
      return { x: el.x, y: el.y, w: el.width, h: el.height };
    }
    case 'graphic': {
      return { x: el.x, y: el.y, w: el.width, h: el.height };
    }
    case 'barcode128': {
      const { totalWidth } = generateCode128SvgBars(el.data, el.height, el.moduleWidth);
      return {
        x: el.x,
        y: el.y,
        w: Math.max(50, totalWidth),
        h: el.height + (el.printInterpretationLine ? 22 : 0),
      };
    }
    case 'barcode39': {
      const { totalWidth } = generateCode39SvgBars(el.data, el.height, el.moduleWidth);
      return {
        x: el.x,
        y: el.y,
        w: Math.max(50, totalWidth),
        h: el.height + (el.printInterpretationLine ? 20 : 0),
      };
    }
    case 'barcodeEAN13': {
      const { totalWidth } = generateCode128SvgBars(el.data, el.height, el.moduleWidth);
      return {
        x: el.x,
        y: el.y,
        w: Math.max(50, totalWidth),
        h: el.height + (el.printInterpretationLine ? 20 : 0),
      };
    }
    case 'qrcode': {
      const matrixSize = 25;
      const size = matrixSize * (el.magnification || 4);
      return { x: el.x, y: el.y, w: size, h: size };
    }
    case 'datamatrix': {
      const size = el.height || 60;
      return { x: el.x, y: el.y, w: size, h: size };
    }
    case 'raw': {
      return { x: el.x, y: el.y, w: 100, h: 40 };
    }
  }
}

/**
 * Pure monochrome SVG renderer for each ZPL element type
 */
function renderElementSvg(el: ZplElement) {
  const getRotationAngle = (orient?: Orientation) => {
    switch (orient) {
      case 'R':
        return 90;
      case 'I':
        return 180;
      case 'B':
        return 270;
      default:
        return 0;
    }
  };

  const transform = `rotate(${getRotationAngle((el as any).orientation)}, ${el.x}, ${el.y})`;

  switch (el.type) {
    case 'text': {
      const text = el.text || '';
      const lines = text.split('\n');
      const fontSize = el.fontHeight;
      const lineHeight = fontSize * 1.1;

      return (
        <g transform={transform}>
          {lines.map((line, idx) => (
            <text
              key={idx}
              x={el.x}
              y={el.y + fontSize * 0.85 + idx * lineHeight}
              fill={el.inverted ? '#ffffff' : '#000000'}
              fontSize={fontSize}
              fontFamily="'JetBrains Mono', monospace, sans-serif"
              fontWeight="900"
              letterSpacing="0.02em"
              style={{
                fontSmooth: 'never',
                shapeRendering: 'crispEdges',
              }}
            >
              {line}
            </text>
          ))}
        </g>
      );
    }

    case 'box':
    case 'line': {
      const isFilled = el.borderThickness >= Math.min(el.width, el.height) / 2;
      const fill = isFilled ? (el.color === 'W' ? '#ffffff' : '#000000') : 'none';
      const stroke = isFilled ? 'none' : el.color === 'W' ? '#ffffff' : '#000000';
      const rx = (el.rounding / 8) * (Math.min(el.width, el.height) / 2);

      return (
        <rect
          x={el.x}
          y={el.y}
          width={el.width}
          height={el.height}
          fill={fill}
          stroke={stroke}
          strokeWidth={isFilled ? 0 : el.borderThickness}
          rx={rx}
          ry={rx}
          style={{ shapeRendering: 'crispEdges' }}
        />
      );
    }

    case 'barcode128': {
      const { pathData, totalWidth } = generateCode128SvgBars(
        el.data,
        el.height,
        el.moduleWidth || 2
      );

      return (
        <g transform={`translate(${el.x}, ${el.y}) ${transform}`}>
          {/* Barcode Bars */}
          <path d={pathData} fill="#000000" style={{ shapeRendering: 'crispEdges' }} />

          {/* Human readable interpretation line below */}
          {el.printInterpretationLine && (
            <text
              x={totalWidth / 2}
              y={el.height + 16}
              textAnchor="middle"
              fill="#000000"
              fontSize={Math.max(12, (el.moduleWidth || 2) * 6)}
              fontFamily="monospace"
              fontWeight="bold"
            >
              {el.data}
            </text>
          )}
        </g>
      );
    }

    case 'barcode39': {
      const { pathData, totalWidth } = generateCode39SvgBars(
        el.data,
        el.height,
        el.moduleWidth || 2
      );

      return (
        <g transform={`translate(${el.x}, ${el.y}) ${transform}`}>
          <path d={pathData} fill="#000000" style={{ shapeRendering: 'crispEdges' }} />
          {el.printInterpretationLine && (
            <text
              x={totalWidth / 2}
              y={el.height + 15}
              textAnchor="middle"
              fill="#000000"
              fontSize={14}
              fontFamily="monospace"
              fontWeight="bold"
            >
              {el.data}
            </text>
          )}
        </g>
      );
    }

    case 'barcodeEAN13': {
      const { pathData, totalWidth } = generateCode128SvgBars(
        el.data,
        el.height,
        el.moduleWidth || 2
      );

      return (
        <g transform={`translate(${el.x}, ${el.y}) ${transform}`}>
          <path d={pathData} fill="#000000" style={{ shapeRendering: 'crispEdges' }} />
          {el.printInterpretationLine && (
            <text
              x={totalWidth / 2}
              y={el.height + 15}
              textAnchor="middle"
              fill="#000000"
              fontSize={14}
              fontFamily="monospace"
              fontWeight="bold"
            >
              {el.data}
            </text>
          )}
        </g>
      );
    }

    case 'qrcode': {
      const matrix = generateQrMatrix(el.data || 'https://example.com');
      const moduleSize = el.magnification || 4;

      return (
        <g transform={`translate(${el.x}, ${el.y}) ${transform}`}>
          {matrix.map((row, r) =>
            row.map((isDark, c) =>
              isDark ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * moduleSize}
                  y={r * moduleSize}
                  width={moduleSize}
                  height={moduleSize}
                  fill="#000000"
                  style={{ shapeRendering: 'crispEdges' }}
                />
              ) : null
            )
          )}
        </g>
      );
    }

    case 'datamatrix': {
      const size = el.height || 60;
      return (
        <g transform={`translate(${el.x}, ${el.y})`}>
          <rect width={size} height={size} fill="none" stroke="#000000" strokeWidth="4" />
          <line x1="0" y1="0" x2="0" y2={size} stroke="#000000" strokeWidth="6" />
          <line x1="0" y1={size} x2={size} y2={size} stroke="#000000" strokeWidth="6" />
          <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize="10" fontFamily="monospace">
            DM
          </text>
        </g>
      );
    }

    case 'graphic': {
      return (
        <g transform={transform}>
          <image
            href={el.previewUrl || ''}
            x={el.x}
            y={el.y}
            width={el.width}
            height={el.height}
            preserveAspectRatio="none"
            style={{ imageRendering: 'pixelated' }}
          />
        </g>
      );
    }

    case 'raw': {
      return (
        <g transform={`translate(${el.x}, ${el.y})`}>
          <rect width="100" height="40" fill="#f43f5e" opacity="0.2" rx="4" />
          <text x="6" y="24" fontSize="11" fill="#e11d48" fontFamily="monospace">
            RAW ZPL
          </text>
        </g>
      );
    }
  }
}

/**
 * 8-handle transformation and resize box
 */
function TransformBox({
  bounds,
  zoom,
  onHandleMouseDown,
}: {
  bounds: { x: number; y: number; w: number; h: number };
  zoom: number;
  onHandleMouseDown: (e: React.MouseEvent, handle: string) => void;
}) {
  const handleSize = 8 / zoom;
  const half = handleSize / 2;

  const handles = [
    { id: 'nw', x: bounds.x - half, y: bounds.y - half, cursor: 'nwse-resize' },
    { id: 'n', x: bounds.x + bounds.w / 2 - half, y: bounds.y - half, cursor: 'ns-resize' },
    { id: 'ne', x: bounds.x + bounds.w - half, y: bounds.y - half, cursor: 'nesw-resize' },
    { id: 'e', x: bounds.x + bounds.w - half, y: bounds.y + bounds.h / 2 - half, cursor: 'ew-resize' },
    { id: 'se', x: bounds.x + bounds.w - half, y: bounds.y + bounds.h - half, cursor: 'nwse-resize' },
    { id: 's', x: bounds.x + bounds.w / 2 - half, y: bounds.y + bounds.h - half, cursor: 'ns-resize' },
    { id: 'sw', x: bounds.x - half, y: bounds.y + bounds.h - half, cursor: 'nesw-resize' },
    { id: 'w', x: bounds.x - half, y: bounds.y + bounds.h / 2 - half, cursor: 'ew-resize' },
  ];

  return (
    <g className="transform-handles">
      {handles.map((h) => (
        <rect
          key={h.id}
          x={h.x}
          y={h.y}
          width={handleSize}
          height={handleSize}
          fill="#ffffff"
          stroke="#10b981"
          strokeWidth={1.5 / zoom}
          style={{ cursor: h.cursor }}
          onMouseDown={(e) => onHandleMouseDown(e, h.id)}
        />
      ))}
    </g>
  );
}
