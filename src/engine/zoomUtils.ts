/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ZoomCycleMode = '100' | 'fit' | 'full-width';

export function getCanvasViewportDimensions(): { width: number; height: number } {
  const el = document.getElementById('canvas-viewport');
  if (el && el.clientWidth > 0 && el.clientHeight > 0) {
    return { width: el.clientWidth, height: el.clientHeight };
  }
  return {
    width: typeof window !== 'undefined' ? window.innerWidth * 0.55 : 800,
    height: typeof window !== 'undefined' ? window.innerHeight * 0.65 : 600,
  };
}

/**
 * Calculates zoom factor so that the entire label fits completely inside the canvas viewport.
 */
export function calculateFitZoom(widthDots: number, heightDots: number, showRulers: boolean = true): number {
  const { width, height } = getCanvasViewportDimensions();
  const padX = showRulers ? 100 : 70;
  const padY = showRulers ? 100 : 70;
  const availW = Math.max(100, width - padX);
  const availH = Math.max(100, height - padY);

  const zoomW = availW / Math.max(1, widthDots);
  const zoomH = availH / Math.max(1, heightDots);
  const fit = Math.min(zoomW, zoomH);

  return Math.min(3.0, Math.max(0.15, Math.round(fit * 100) / 100));
}

/**
 * Calculates zoom factor so that the label width occupies the canvas viewport width.
 */
export function calculateFullWidthZoom(widthDots: number, showRulers: boolean = true): number {
  const { width } = getCanvasViewportDimensions();
  const padX = showRulers ? 100 : 70;
  const availW = Math.max(100, width - padX);

  const fullWidth = availW / Math.max(1, widthDots);
  return Math.min(3.0, Math.max(0.15, Math.round(fullWidth * 100) / 100));
}

/**
 * Determines next zoom step in the cycle: 100% -> fit -> full-width -> 100%
 */
export function getNextZoomCycle(
  currentZoom: number,
  widthDots: number,
  heightDots: number,
  showRulers: boolean = true,
  currentMode?: ZoomCycleMode
): { zoom: number; mode: ZoomCycleMode } {
  const fitZoom = calculateFitZoom(widthDots, heightDots, showRulers);
  const fullWidthZoom = calculateFullWidthZoom(widthDots, showRulers);

  // Check current match
  const is100 = Math.abs(currentZoom - 1.0) < 0.02;
  const isFit = Math.abs(currentZoom - fitZoom) < 0.02;
  const isFullWidth = Math.abs(currentZoom - fullWidthZoom) < 0.02;

  let nextMode: ZoomCycleMode;

  if (currentMode === '100' || (is100 && currentMode !== 'fit' && currentMode !== 'full-width')) {
    nextMode = 'fit';
  } else if (currentMode === 'fit' || (isFit && currentMode !== 'full-width')) {
    nextMode = 'full-width';
  } else if (currentMode === 'full-width' || isFullWidth) {
    nextMode = '100';
  } else {
    // If arbitrary zoom, start cycle with 'fit'
    nextMode = 'fit';
  }

  if (nextMode === 'fit') {
    return { zoom: fitZoom, mode: 'fit' };
  } else if (nextMode === 'full-width') {
    return { zoom: fullWidthZoom, mode: 'full-width' };
  } else {
    return { zoom: 1.0, mode: '100' };
  }
}
