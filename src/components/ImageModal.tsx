/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Sliders,
  Check,
  X,
  RefreshCw,
  Copy,
  FileImage,
  Layers,
} from 'lucide-react';
import { ZplGraphicElement, LabelDimensions } from '../types/zpl';
import { imageToZplGraphic } from '../engine/imageConverter';
import { dotsToMm } from '../engine/units';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertGraphic: (element: ZplGraphicElement) => void;
  dimensions: LabelDimensions;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  onInsertGraphic,
  dimensions,
}) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [naturalWidth, setNaturalWidth] = useState<number>(0);
  const [naturalHeight, setNaturalHeight] = useState<number>(0);

  // Settings
  const [targetWidth, setTargetWidth] = useState<number>(240);
  const [targetHeight, setTargetHeight] = useState<number>(240);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [threshold, setThreshold] = useState<number>(128);
  const [invert, setInvert] = useState<boolean>(false);
  const [dither, setDither] = useState<boolean>(false);

  // Preview state
  const [convertedGraphic, setConvertedGraphic] = useState<ZplGraphicElement | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [base64Input, setBase64Input] = useState<string>('');
  const [showBase64Input, setShowBase64Input] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset when opened
  useEffect(() => {
    if (!isOpen) {
      setSourceImage(null);
      setConvertedGraphic(null);
      setShowBase64Input(false);
      setBase64Input('');
    }
  }, [isOpen]);

  // Clipboard paste support inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleFileSelect(blob);
            e.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  // Load selected file
  const handleFileSelect = (file: File | Blob) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSourceImage(result);

      // Measure natural dimensions
      const img = new Image();
      img.onload = () => {
        setNaturalWidth(img.naturalWidth);
        setNaturalHeight(img.naturalHeight);

        // Set default reasonable size on label
        let defW = img.naturalWidth;
        let defH = img.naturalHeight;
        const maxDim = Math.min(dimensions.widthDots * 0.6, 320);

        if (defW > maxDim || defH > maxDim) {
          const ratio = defW / defH;
          if (defW > defH) {
            defW = Math.round(maxDim);
            defH = Math.round(maxDim / ratio);
          } else {
            defH = Math.round(maxDim);
            defW = Math.round(maxDim * ratio);
          }
        }

        setTargetWidth(defW);
        setTargetHeight(defH);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Width change handler maintaining aspect ratio
  const handleWidthChange = (val: number) => {
    const w = Math.max(8, val);
    setTargetWidth(w);
    if (lockAspect && naturalWidth > 0 && naturalHeight > 0) {
      const ratio = naturalHeight / naturalWidth;
      setTargetHeight(Math.max(8, Math.round(w * ratio)));
    }
  };

  // Height change handler maintaining aspect ratio
  const handleHeightChange = (val: number) => {
    const h = Math.max(8, val);
    setTargetHeight(h);
    if (lockAspect && naturalWidth > 0 && naturalHeight > 0) {
      const ratio = naturalWidth / naturalHeight;
      setTargetWidth(Math.max(8, Math.round(h * ratio)));
    }
  };

  // Re-generate thermal monochrome preview when options change
  const reprocess = useCallback(async () => {
    if (!sourceImage) return;
    setIsProcessing(true);
    try {
      const gfx = await imageToZplGraphic(sourceImage, {
        targetWidthDots: targetWidth,
        targetHeightDots: targetHeight,
        threshold,
        invert,
        dither,
      });
      setConvertedGraphic(gfx);
    } catch (err) {
      console.error('Image conversion error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [sourceImage, targetWidth, targetHeight, threshold, invert, dither]);

  useEffect(() => {
    if (sourceImage) {
      const timer = setTimeout(reprocess, 120);
      return () => clearTimeout(timer);
    }
  }, [sourceImage, targetWidth, targetHeight, threshold, invert, dither, reprocess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 select-none backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-10 px-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-xs">
            <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Import Image / Logo (^GF Graphic Field)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {!sourceImage ? (
            /* Upload drop zone */
            <div className="space-y-3">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2.5 ${
                  isDraggingOver
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/50 hover:border-zinc-400 dark:hover:border-zinc-600'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Click to select or drag & drop an image
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                    PNG, JPG, SVG, WebP, GIF, or paste from clipboard (Ctrl+V)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Paste Base64 toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowBase64Input(!showBase64Input)}
                  className="text-[11px] text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-mono underline"
                >
                  {showBase64Input ? 'Hide Base64 input' : 'Or paste a Base64 data URL / image URL'}
                </button>
              </div>

              {showBase64Input && (
                <div className="space-y-2 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-sm border border-zinc-200 dark:border-zinc-800">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Base64 Data URL (data:image/png;base64,...)
                  </label>
                  <textarea
                    rows={3}
                    value={base64Input}
                    onChange={(e) => setBase64Input(e.target.value)}
                    placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-sm p-2 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    disabled={!base64Input.trim()}
                    onClick={() => {
                      if (base64Input.trim()) {
                        setSourceImage(base64Input.trim());
                      }
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-sm text-xs font-medium transition"
                  >
                    Load Base64 Image
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Adjustment & Preview layout */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Conversion Controls */}
              <div className="space-y-3.5">
                {/* Size in dots & mm */}
                <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-sm border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      Dimensions on Label
                    </span>
                    <label className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lockAspect}
                        onChange={(e) => setLockAspect(e.target.checked)}
                        className="rounded-xs text-emerald-600"
                      />
                      Lock aspect ratio
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-zinc-500 font-mono block mb-0.5">Width (dots)</label>
                      <input
                        type="number"
                        min="8"
                        max={dimensions.widthDots}
                        value={targetWidth}
                        onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 8)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-sm px-2 py-1 text-xs font-mono text-zinc-900 dark:text-white"
                      />
                      <span className="text-[9px] text-zinc-500 font-mono">
                        ≈ {dotsToMm(targetWidth, dimensions.dpi)} mm
                      </span>
                    </div>

                    <div>
                      <label className="text-[9px] text-zinc-500 font-mono block mb-0.5">Height (dots)</label>
                      <input
                        type="number"
                        min="8"
                        max={dimensions.heightDots}
                        value={targetHeight}
                        onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 8)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-sm px-2 py-1 text-xs font-mono text-zinc-900 dark:text-white"
                      />
                      <span className="text-[9px] text-zinc-500 font-mono">
                        ≈ {dotsToMm(targetHeight, dimensions.dpi)} mm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thermal 1-bit adjustments */}
                <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-sm border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block">
                    Thermal Conversion
                  </span>

                  {/* Threshold Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-600 dark:text-zinc-400 mb-1">
                      <span>B&W Threshold:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{threshold} / 255</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="254"
                      value={threshold}
                      onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  {/* Checkboxes: Invert & Dithering */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                    <label className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer font-mono">
                      <input
                        type="checkbox"
                        checked={invert}
                        onChange={(e) => setInvert(e.target.checked)}
                        className="rounded-xs text-emerald-600"
                      />
                      Invert Colors
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer font-mono">
                      <input
                        type="checkbox"
                        checked={dither}
                        onChange={(e) => setDither(e.target.checked)}
                        className="rounded-xs text-emerald-600"
                      />
                      Dithering (Photos)
                    </label>
                  </div>
                </div>

                {/* Info summary */}
                {convertedGraphic && (
                  <div className="text-[10px] font-mono text-zinc-500 space-y-0.5 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-sm border border-zinc-200 dark:border-zinc-800">
                    <div>ZPL Command: <span className="font-bold text-emerald-600 dark:text-emerald-400">^GFA,{convertedGraphic.binaryByteCount},{convertedGraphic.graphicFieldCount},{convertedGraphic.bytesPerRow},...</span></div>
                    <div>Bytes: {convertedGraphic.binaryByteCount} bytes ({convertedGraphic.bytesPerRow} bytes/row)</div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSourceImage(null);
                    setConvertedGraphic(null);
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline font-mono"
                >
                  Choose another image
                </button>
              </div>

              {/* Right Column: Thermal Preview Box */}
              <div className="flex flex-col items-center justify-center p-4 bg-zinc-200/60 dark:bg-zinc-950/80 rounded-sm border border-zinc-200 dark:border-zinc-800 min-h-[220px]">
                <div className="text-[10px] font-mono text-zinc-500 mb-2">
                  1-Bit Thermal Output Preview ({targetWidth}×{targetHeight} dots)
                </div>

                <div className="p-4 bg-white border border-zinc-300 dark:border-zinc-700 rounded-xs shadow-md flex items-center justify-center max-w-full max-h-[260px] overflow-hidden">
                  {convertedGraphic?.previewUrl ? (
                    <img
                      src={convertedGraphic.previewUrl}
                      alt="Thermal preview"
                      style={{
                        width: `${Math.min(260, targetWidth)}px`,
                        height: 'auto',
                        imageRendering: 'pixelated',
                      }}
                      className="block select-none"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                      <span>Generating monochrome bitmap...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="h-12 px-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-sm border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            Cancel
          </button>

          <button
            disabled={!convertedGraphic || isProcessing}
            onClick={() => {
              if (convertedGraphic) {
                onInsertGraphic(convertedGraphic);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition"
          >
            <Check className="w-4 h-4" />
            <span>Insert Image on Label</span>
          </button>
        </div>
      </div>
    </div>
  );
};
