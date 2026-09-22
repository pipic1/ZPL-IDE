/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ZplDocumentAST, ZplElement } from '../types/zpl';

/**
 * Serializes a ZPL AST back into clean, standard Zebra Programming Language code.
 */
export function generateZpl(ast: ZplDocumentAST): string {
  const lines: string[] = [];

  // Start format
  lines.push('^XA');

  // Charset (UTF-8 encoding support)
  if (ast.charset) {
    lines.push(ast.charset);
  } else {
    lines.push('^CI28');
  }

  // Label configuration
  lines.push(`^PW${Math.round(ast.dimensions.widthDots)}`);
  lines.push(`^LL${Math.round(ast.dimensions.heightDots)}`);

  if (ast.dimensions.labelHomeX || ast.dimensions.labelHomeY) {
    lines.push(`^LH${Math.round(ast.dimensions.labelHomeX || 0)},${Math.round(ast.dimensions.labelHomeY || 0)}`);
  }

  if (ast.dimensions.labelShift) {
    lines.push(`^LS${Math.round(ast.dimensions.labelShift)}`);
  }

  lines.push(''); // Blank line for readability

  // Elements
  for (const el of ast.elements) {
    lines.push(...serializeElement(el));
  }

  // End format
  lines.push('^XZ');

  return lines.join('\n');
}

/**
 * Serializes an individual element into ZPL commands
 */
function serializeElement(el: ZplElement): string[] {
  const lines: string[] = [];
  const x = Math.round(el.x);
  const y = Math.round(el.y);

  switch (el.type) {
    case 'text': {
      lines.push(`^FO${x},${y}`);
      const h = Math.round(el.fontHeight);
      const w = Math.round(el.fontWidth);
      lines.push(`^A${el.fontName || '0'}${el.orientation || 'N'},${h},${w}`);

      if (el.inverted) {
        lines.push('^FR');
      }

      if (el.blockConfig) {
        const bc = el.blockConfig;
        lines.push(`^FB${Math.round(bc.width)},${bc.maxLines},${bc.lineSpacing},${bc.alignment}`);
      }

      // Escape newlines as \& in ZPL
      const escapedText = (el.text || '').replace(/\n/g, '\\&');
      lines.push(`^FD${escapedText}^FS`);
      lines.push('');
      break;
    }

    case 'box':
    case 'line': {
      lines.push(`^FO${x},${y}`);
      const w = Math.round(el.width);
      const h = Math.round(el.height);
      const t = Math.round(el.borderThickness);
      const c = el.color || 'B';
      const r = Math.round(el.rounding || 0);

      lines.push(`^GB${w},${h},${t},${c},${r}^FS`);
      lines.push('');
      break;
    }

    case 'barcode128': {
      lines.push(`^FO${x},${y}`);
      const o = el.orientation || 'N';
      const h = Math.round(el.height || 80);
      const line = el.printInterpretationLine ? 'Y' : 'N';
      const above = el.printInterpretationAbove ? 'Y' : 'N';

      if (el.moduleWidth) {
        lines.push(`^BY${Math.round(el.moduleWidth)},3,${h}`);
      }
      lines.push(`^BC${o},${h},${line},${above},N`);
      lines.push(`^FD${el.data || '123456'}^FS`);
      lines.push('');
      break;
    }

    case 'barcode39': {
      lines.push(`^FO${x},${y}`);
      const o = el.orientation || 'N';
      const h = Math.round(el.height || 80);
      const line = el.printInterpretationLine ? 'Y' : 'N';

      if (el.moduleWidth) {
        lines.push(`^BY${Math.round(el.moduleWidth)},3,${h}`);
      }
      lines.push(`^B3${o},N,${h},${line},N`);
      lines.push(`^FD${el.data || 'ABC-123'}^FS`);
      lines.push('');
      break;
    }

    case 'barcodeEAN13': {
      lines.push(`^FO${x},${y}`);
      const o = el.orientation || 'N';
      const h = Math.round(el.height || 80);
      const line = el.printInterpretationLine ? 'Y' : 'N';

      if (el.moduleWidth) {
        lines.push(`^BY${Math.round(el.moduleWidth)},3,${h}`);
      }
      lines.push(`^BE${o},${h},${line},N`);
      lines.push(`^FD${el.data || '1234567890128'}^FS`);
      lines.push('');
      break;
    }

    case 'qrcode': {
      lines.push(`^FO${x},${y}`);
      const o = el.orientation || 'N';
      const model = el.model || 2;
      const mag = Math.round(el.magnification || 4);
      const err = el.errorCorrection || 'M';

      lines.push(`^BQ${o},${model},${mag},${err}`);
      lines.push(`^FDQA,${el.data || 'https://example.com'}^FS`);
      lines.push('');
      break;
    }

    case 'datamatrix': {
      lines.push(`^FO${x},${y}`);
      const o = el.orientation || 'N';
      const h = Math.round(el.height || 80);
      lines.push(`^BX${o},${h},200`);
      lines.push(`^FD${el.data || 'DATAMATRIX'}^FS`);
      lines.push('');
      break;
    }

    case 'graphic': {
      lines.push(`^FO${x},${y}`);
      const b = el.binaryByteCount || (el.bytesPerRow * el.height);
      const c = el.graphicFieldCount || b;
      const d = el.bytesPerRow || Math.ceil(el.width / 8);
      lines.push(`^GFA,${b},${c},${d},${el.data}^FS`);
      lines.push('');
      break;
    }

    case 'raw': {
      lines.push(el.rawZpl);
      lines.push('');
      break;
    }
  }

  return lines;
}
