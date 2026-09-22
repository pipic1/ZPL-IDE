/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { ZplDocumentAST } from '../types/zpl';
import { dotsToMm } from './units';

/**
 * Downloads a string as a text file (ZPL)
 */
export function downloadZplFile(zpl: string, filename: string = 'label.zpl'): void {
  const blob = new Blob([zpl], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads an SVG element as an .svg vector file
 */
export function downloadSvg(svgElement: SVGSVGElement, filename: string = 'label.svg'): void {
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svgElement);
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Renders SVG to PNG with thermal printer crispness and downloads it
 */
export function downloadPng(
  svgElement: SVGSVGElement,
  ast: ZplDocumentAST,
  filename: string = 'label.png',
  scale: number = 2
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URLObj = window.URL || window.webkitURL || window;
      const blobURL = URLObj.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const width = ast.dimensions.widthDots * scale;
        const height = ast.dimensions.heightDots * scale;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // Fill background white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Render image crisply (disable image smoothing for thermal print feel)
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(image, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to generate PNG blob'));
            return;
          }
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
          URLObj.revokeObjectURL(blobURL);
          resolve();
        }, 'image/png');
      };

      image.onerror = (e) => {
        URLObj.revokeObjectURL(blobURL);
        reject(e);
      };

      image.src = blobURL;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates an exact dimensioned PDF label using jsPDF
 */
export async function downloadPdf(
  svgElement: SVGSVGElement,
  ast: ZplDocumentAST,
  filename: string = 'label.pdf'
): Promise<void> {
  const widthMm = dotsToMm(ast.dimensions.widthDots, ast.dimensions.dpi);
  const heightMm = dotsToMm(ast.dimensions.heightDots, ast.dimensions.dpi);

  // Convert SVG to data URL
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const URLObj = window.URL || window.webkitURL || window;
  const blobURL = URLObj.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = ast.dimensions.widthDots * 2;
      canvas.height = ast.dimensions.heightDots * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imgData = canvas.toDataURL('image/png');
      const orientation = widthMm > heightMm ? 'l' : 'p';
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: [widthMm, heightMm],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm);
      pdf.save(filename);
      URLObj.revokeObjectURL(blobURL);
      resolve();
    };
    img.onerror = (e) => reject(e);
    img.src = blobURL;
  });
}
