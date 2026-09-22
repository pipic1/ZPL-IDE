/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LabelDimensions,
  Orientation,
  ZplBoxElement,
  ZplDocumentAST,
  ZplElement,
  ZplTextElement,
} from '../types/zpl';

/**
 * Robust ZPL Lexer / Parser
 * Converts raw ZPL string into typed AST document with label dimensions and elements.
 */
export function parseZpl(zpl: string): { ast: ZplDocumentAST; errors: string[] } {
  const errors: string[] = [];

  // Default dimensions: 4" x 6" label @ 203 DPI (812 x 1218 dots)
  const dimensions: LabelDimensions = {
    widthDots: 812,
    heightDots: 1218,
    dpi: 203,
    unit: 'dots',
    labelHomeX: 0,
    labelHomeY: 0,
    labelShift: 0,
  };

  const elements: ZplElement[] = [];
  const headerCommands: string[] = [];
  const footerCommands: string[] = [];
  let charset = '^CI28'; // default UTF-8

  // Clean and split lines / commands
  const cleanZpl = zpl.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Look for label configuration commands outside elements
  const pwMatch = cleanZpl.match(/\^PW\s*([0-9]+)/i);
  if (pwMatch) {
    dimensions.widthDots = parseInt(pwMatch[1], 10);
  }

  const llMatch = cleanZpl.match(/\^LL\s*([0-9]+)/i);
  if (llMatch) {
    dimensions.heightDots = parseInt(llMatch[1], 10);
  }

  const lhMatch = cleanZpl.match(/\^LH\s*([0-9]+)\s*,\s*([0-9]+)/i);
  if (lhMatch) {
    dimensions.labelHomeX = parseInt(lhMatch[1], 10);
    dimensions.labelHomeY = parseInt(lhMatch[2], 10);
  }

  const lsMatch = cleanZpl.match(/\^LS\s*([0-9\-]+)/i);
  if (lsMatch) {
    dimensions.labelShift = parseInt(lsMatch[1], 10);
  }

  const ciMatch = cleanZpl.match(/\^CI\s*([0-9]+)/i);
  if (ciMatch) {
    charset = `^CI${ciMatch[1]}`;
  }

  // Extract global default barcode settings if present: ^BY <width>,<ratio>,<height>
  let defaultModuleWidth = 2;
  const byMatch = cleanZpl.match(/\^BY\s*([0-9]+)(?:,([0-9.]+))?(?:,([0-9]+))?/i);
  if (byMatch && byMatch[1]) {
    defaultModuleWidth = parseInt(byMatch[1], 10) || 2;
  }

  // Split into fields delimited by ^FO or ^FT, up to ^FS
  // Matches all fields like: ^FO50,50 ... ^FS or ^FT50,50 ... ^FS
  const fieldRegex = /\^(FO|FT)\s*([0-9\-]+)\s*,\s*([0-9\-]+)([\s\S]*?)\^FS/gi;
  let match: RegExpExecArray | null;
  let elementIndex = 1;

  while ((match = fieldRegex.exec(cleanZpl)) !== null) {
    const isTypeset = match[1].toUpperCase() === 'FT';
    let x = parseInt(match[2], 10) || 0;
    let y = parseInt(match[3], 10) || 0;
    const content = match[4];

    // Compensate for ^FT baseline offset if needed (approx standard text height)
    if (isTypeset && y > 30) {
      y = Math.max(0, y - 25);
    }

    const id = `el_${Date.now().toString(36)}_${elementIndex++}`;

    // 1. Check for Graphic Box (^GB)
    const gbMatch = content.match(/\^GB\s*([0-9]+)?(?:\s*,\s*([0-9]+))?(?:\s*,\s*([0-9]+))?(?:\s*,\s*([BWbw]))?(?:\s*,\s*([0-8]))?/i);
    if (gbMatch) {
      const w = parseInt(gbMatch[1] || '1', 10);
      const h = parseInt(gbMatch[2] || '1', 10);
      const t = gbMatch[3] !== undefined ? parseInt(gbMatch[3], 10) : 1;
      const c = (gbMatch[4] || 'B').toUpperCase() as 'B' | 'W';
      const r = parseInt(gbMatch[5] || '0', 10);

      const isLine = (h <= 4 && w > 4) || (w <= 4 && h > 4);
      const boxEl: ZplBoxElement = {
        id,
        type: isLine ? 'line' : 'box',
        name: isLine ? 'Ligne' : (t >= Math.min(w, h) / 2 ? 'Rectangle plein' : 'Cadre'),
        x,
        y,
        width: Math.max(2, w),
        height: Math.max(2, h),
        borderThickness: t,
        color: c,
        rounding: Math.min(8, Math.max(0, r)),
      };
      elements.push(boxEl);
      continue;
    }

    // 2. Check for Code 128 Barcode (^BC)
    const bcMatch = content.match(/\^BC\s*([NRIBnrib])?(?:\s*,\s*([0-9]+))?(?:\s*,\s*([YNyn]))?(?:\s*,\s*([YNyn]))?(?:\s*,\s*([YNyn]))?/i);
    if (bcMatch) {
      const orient = (bcMatch[1] || 'N').toUpperCase() as Orientation;
      const height = parseInt(bcMatch[2] || '80', 10);
      const printLine = (bcMatch[3] || 'Y').toUpperCase() === 'Y';
      const printAbove = (bcMatch[4] || 'N').toUpperCase() === 'Y';

      // Extract field data
      const fdMatch = content.match(/\^FD([\s\S]*?)(?:\^FS|$)/i);
      const data = fdMatch ? fdMatch[1].trim() : '12345678';

      elements.push({
        id,
        type: 'barcode128',
        name: `Code 128 (${data.substring(0, 10)})`,
        x,
        y,
        orientation: orient,
        height: Math.max(20, height),
        printInterpretationLine: printLine,
        printInterpretationAbove: printAbove,
        moduleWidth: defaultModuleWidth,
        data,
      });
      continue;
    }

    // 3. Check for Code 39 Barcode (^B3)
    const b3Match = content.match(/\^B3\s*([NRIBnrib])?(?:\s*,\s*([YNyn]))?(?:\s*,\s*([0-9]+))?(?:\s*,\s*([YNyn]))?/i);
    if (b3Match) {
      const orient = (b3Match[1] || 'N').toUpperCase() as Orientation;
      const height = parseInt(b3Match[3] || '80', 10);
      const printLine = (b3Match[4] || 'Y').toUpperCase() === 'Y';
      const fdMatch = content.match(/\^FD([\s\S]*?)(?:\^FS|$)/i);
      const data = fdMatch ? fdMatch[1].trim() : 'ABC-123';

      elements.push({
        id,
        type: 'barcode39',
        name: `Code 39 (${data.substring(0, 10)})`,
        x,
        y,
        orientation: orient,
        height: Math.max(20, height),
        printInterpretationLine: printLine,
        moduleWidth: defaultModuleWidth,
        data,
      });
      continue;
    }

    // 4. Check for QR Code (^BQ)
    const bqMatch = content.match(/\^BQ\s*([NRIBnrib])?(?:\s*,\s*([12]))?(?:\s*,\s*([0-9]+))?(?:\s*,\s*([HQMLhqml]))?/i);
    if (bqMatch) {
      const orient = (bqMatch[1] || 'N').toUpperCase() as Orientation;
      const model = parseInt(bqMatch[2] || '2', 10) === 1 ? 1 : 2;
      const mag = parseInt(bqMatch[3] || '4', 10);
      const err = (bqMatch[4] || 'M').toUpperCase() as 'H' | 'Q' | 'M' | 'L';

      const fdMatch = content.match(/\^FD([\s\S]*?)(?:\^FS|$)/i);
      let data = fdMatch ? fdMatch[1].trim() : 'https://example.com';
      // In ZPL, QR codes often prepend QA, or LA, or B0001
      if (data.startsWith('QA,') || data.startsWith('LA,')) {
        data = data.substring(3);
      } else if (data.startsWith('MM,') || data.startsWith('QM,')) {
        data = data.substring(3);
      }

      elements.push({
        id,
        type: 'qrcode',
        name: 'QR Code',
        x,
        y,
        orientation: orient,
        model,
        magnification: Math.min(10, Math.max(1, mag)),
        errorCorrection: err,
        data,
      });
      continue;
    }

    // 5. Standard Text (^A...)
    // Pattern like ^A0N,30,30 or ^AC,40,40
    const aMatch = content.match(/\^A([0-9A-Z])([NRIBnrib])?(?:\s*,\s*([0-9]+))?(?:\s*,\s*([0-9]+))?/i);
    const fontName = aMatch ? aMatch[1].toUpperCase() : '0';
    const orient = (aMatch && aMatch[2] ? aMatch[2].toUpperCase() : 'N') as Orientation;
    const fontHeight = aMatch && aMatch[3] ? parseInt(aMatch[3], 10) : 32;
    const fontWidth = aMatch && aMatch[4] ? parseInt(aMatch[4], 10) : fontHeight;

    const fdMatch = content.match(/\^FD([\s\S]*?)(?:\^FS|$)/i);
    const textData = fdMatch ? fdMatch[1].replace(/\\&/g, '\n') : 'Texte';

    // Field reverse ^FR
    const inverted = /\^FR/i.test(content);

    // Field block ^FB
    let blockConfig: ZplTextElement['blockConfig'] = undefined;
    const fbMatch = content.match(/\^FB\s*([0-9]+)(?:\s*,\s*([0-9]+))?(?:\s*,\s*([0-9\-]+))?(?:\s*,\s*([LCRJlcrj]))?/i);
    if (fbMatch) {
      blockConfig = {
        width: parseInt(fbMatch[1], 10) || 300,
        maxLines: parseInt(fbMatch[2] || '1', 10),
        lineSpacing: parseInt(fbMatch[3] || '0', 10),
        alignment: (fbMatch[4] || 'L').toUpperCase() as 'L' | 'C' | 'R' | 'J',
      };
    }

    elements.push({
      id,
      type: 'text',
      name: textData.length > 15 ? `${textData.substring(0, 15)}...` : textData,
      x,
      y,
      text: textData,
      fontName,
      orientation: orient,
      fontHeight: Math.max(10, fontHeight),
      fontWidth: Math.max(8, fontWidth),
      inverted,
      blockConfig,
    });
  }

  // Preserve any other commands as header / footer
  if (!cleanZpl.includes('^XA')) {
    headerCommands.push('^XA');
  }

  return {
    ast: {
      dimensions,
      elements,
      headerCommands,
      footerCommands,
      charset,
    },
    errors,
  };
}
