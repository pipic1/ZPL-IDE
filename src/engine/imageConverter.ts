/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ZplGraphicElement } from '../types/zpl';

export interface ImageConversionOptions {
  targetWidthDots?: number;
  targetHeightDots?: number;
  threshold?: number; // 0 to 255 (default 128)
  invert?: boolean; // false = black text/lines on white label
  dither?: boolean; // Floyd-Steinberg dithering
}

/**
 * Converts any image (file, base64 data URL, or Blob) into a ZPL Graphic Field element (^GFA)
 */
export async function imageToZplGraphic(
  source: string | File | Blob,
  options: ImageConversionOptions = {}
): Promise<ZplGraphicElement> {
  const {
    targetWidthDots,
    targetHeightDots,
    threshold = 128,
    invert = false,
    dither = false,
  } = options;

  // 1. Load image into an HTMLImageElement
  const img = await loadImage(source);

  // 2. Compute target dimensions in dots
  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  if (targetWidthDots && targetHeightDots) {
    width = Math.round(targetWidthDots);
    height = Math.round(targetHeightDots);
  } else if (targetWidthDots && !targetHeightDots) {
    const scale = targetWidthDots / width;
    width = Math.round(targetWidthDots);
    height = Math.max(1, Math.round(height * scale));
  } else if (!targetWidthDots && targetHeightDots) {
    const scale = targetHeightDots / height;
    height = Math.round(targetHeightDots);
    width = Math.max(1, Math.round(width * scale));
  } else if (width > 600) {
    // Default cap to sensible label width if huge
    const scale = 600 / width;
    width = 600;
    height = Math.max(1, Math.round(height * scale));
  }

  // Ensure width is at least 1 and height is at least 1
  width = Math.max(1, width);
  height = Math.max(1, height);

  // 3. Draw on offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Could not get 2D canvas context for image conversion');
  }

  // White background for transparent PNG/SVG images
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const pixels = imgData.data;

  // 4. Convert to 1-bit monochrome (0 = white/off, 1 = black/on in ZPL thermal)
  // Zebra: 1 bit = 1 pixel. '1' = printed black dot, '0' = unprinted white.
  const bytesPerRow = Math.ceil(width / 8);
  const totalBytes = bytesPerRow * height;
  const binaryBits: Uint8Array = new Uint8Array(width * height);

  if (dither) {
    // Floyd-Steinberg error diffusion dithering
    const gray = new Float32Array(width * height);
    for (let i = 0; i < pixels.length; i += 4) {
      const idx = i / 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3] / 255;
      // Luminance with alpha blending on white
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) * a + 255 * (1 - a);
      gray[idx] = lum;
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const oldPixel = gray[idx];
        const newPixel = oldPixel < threshold ? 0 : 255;
        const err = oldPixel - newPixel;

        // Is it printed black (1) or white (0)?
        let isBlack = newPixel === 0;
        if (invert) isBlack = !isBlack;
        binaryBits[idx] = isBlack ? 1 : 0;

        // Distribute error
        if (x + 1 < width) gray[idx + 1] += (err * 7) / 16;
        if (x - 1 >= 0 && y + 1 < height) gray[(y + 1) * width + (x - 1)] += (err * 3) / 16;
        if (y + 1 < height) gray[(y + 1) * width + x] += (err * 5) / 16;
        if (x + 1 < width && y + 1 < height) gray[(y + 1) * width + (x + 1)] += (err * 1) / 16;
      }
    }
  } else {
    // Simple thresholding
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3] / 255;
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) * a + 255 * (1 - a);
        let isBlack = lum < threshold;
        if (invert) isBlack = !isBlack;
        binaryBits[y * width + x] = isBlack ? 1 : 0;
      }
    }
  }

  // 5. Pack into bytes row-by-row and format as hex string
  let hexString = '';
  for (let y = 0; y < height; y++) {
    for (let b = 0; b < bytesPerRow; b++) {
      let byteVal = 0;
      for (let bit = 0; bit < 8; bit++) {
        const x = b * 8 + bit;
        if (x < width) {
          const bitVal = binaryBits[y * width + x];
          if (bitVal) {
            byteVal |= 1 << (7 - bit);
          }
        }
      }
      hexString += byteVal.toString(16).padStart(2, '0').toUpperCase();
    }
  }

  // 6. Generate crisp monochrome preview data URL for SVG rendering
  const previewCanvas = document.createElement('canvas');
  previewCanvas.width = width;
  previewCanvas.height = height;
  const previewCtx = previewCanvas.getContext('2d');
  if (previewCtx) {
    const previewImgData = previewCtx.createImageData(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isBlack = binaryBits[y * width + x];
        const idx = (y * width + x) * 4;
        const color = isBlack ? 0 : 255;
        previewImgData.data[idx] = color;
        previewImgData.data[idx + 1] = color;
        previewImgData.data[idx + 2] = color;
        previewImgData.data[idx + 3] = isBlack ? 255 : 0; // Transparent for white so it sits on label
      }
    }
    previewCtx.putImageData(previewImgData, 0, 0);
  }
  const previewUrl = previewCanvas.toDataURL('image/png');

  const id = `el_gfx_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;

  return {
    id,
    type: 'graphic',
    name: `Image (${width}×${height})`,
    x: 40,
    y: 40,
    width,
    height,
    format: 'A',
    binaryByteCount: totalBytes,
    graphicFieldCount: totalBytes,
    bytesPerRow,
    data: hexString,
    previewUrl,
  };
}

/**
 * Converts raw ZPL ^GFA ASCII Hex bitmap into a clean PNG Data URL
 */
export function zplHexToDataUrl(bytesPerRow: number, height: number, hexData: string): string {
  try {
    const cleanHex = hexData.replace(/[^0-9A-Fa-f]/g, '');
    const width = bytesPerRow * 8;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imgData = ctx.createImageData(canvas.width, canvas.height);
    let hexOffset = 0;

    for (let y = 0; y < height; y++) {
      for (let b = 0; b < bytesPerRow; b++) {
        const hexByte = cleanHex.substr(hexOffset, 2);
        hexOffset += 2;
        const byteVal = parseInt(hexByte || '00', 16) || 0;

        for (let bit = 0; bit < 8; bit++) {
          const x = b * 8 + bit;
          if (x < canvas.width) {
            const isBlack = (byteVal & (1 << (7 - bit))) !== 0;
            const idx = (y * canvas.width + x) * 4;
            const color = isBlack ? 0 : 255;
            imgData.data[idx] = color;
            imgData.data[idx + 1] = color;
            imgData.data[idx + 2] = color;
            imgData.data[idx + 3] = isBlack ? 255 : 0;
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

/**
 * Helper to load an image source into HTMLImageElement
 */
function loadImage(source: string | File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image source: ' + String(err)));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(source);
    }
  });
}
