/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DpiResolution = 203 | 300 | 600;
export type MeasurementUnit = 'dots' | 'mm' | 'inch';
export type Orientation = 'N' | 'R' | 'I' | 'B'; // Normal, Rotated 90, Inverted 180, Bottom-up 270

export interface LabelDimensions {
  widthDots: number;
  heightDots: number;
  dpi: DpiResolution;
  unit: MeasurementUnit;
  labelHomeX?: number;
  labelHomeY?: number;
  labelShift?: number;
}

export type ZplElementType =
  | 'text'
  | 'box'
  | 'line'
  | 'barcode128'
  | 'barcode39'
  | 'barcodeEAN13'
  | 'qrcode'
  | 'datamatrix'
  | 'graphic'
  | 'raw';

export interface BaseZplElement {
  id: string;
  type: ZplElementType;
  x: number;
  y: number;
  selected?: boolean;
  locked?: boolean;
  name?: string;
}

export interface ZplTextElement extends BaseZplElement {
  type: 'text';
  text: string;
  fontName: string; // '0', 'A', 'B', 'D', 'E', 'F', 'G', 'H', etc.
  orientation: Orientation;
  fontHeight: number;
  fontWidth: number;
  inverted?: boolean; // ^FR
  blockConfig?: {
    width: number;
    maxLines: number;
    lineSpacing: number;
    alignment: 'L' | 'C' | 'R' | 'J';
  };
}

export interface ZplBoxElement extends BaseZplElement {
  type: 'box' | 'line';
  width: number;
  height: number;
  borderThickness: number;
  color: 'B' | 'W';
  rounding: number; // 0 to 8
}

export interface ZplBarcode128Element extends BaseZplElement {
  type: 'barcode128';
  data: string;
  orientation: Orientation;
  height: number;
  printInterpretationLine: boolean; // 'Y' | 'N'
  printInterpretationAbove: boolean; // 'Y' | 'N'
  moduleWidth: number; // 1 to 10
  ratio?: number;
}

export interface ZplBarcode39Element extends BaseZplElement {
  type: 'barcode39';
  data: string;
  orientation: Orientation;
  height: number;
  printInterpretationLine: boolean;
  moduleWidth: number;
}

export interface ZplBarcodeEAN13Element extends BaseZplElement {
  type: 'barcodeEAN13';
  data: string;
  orientation: Orientation;
  height: number;
  printInterpretationLine: boolean;
  moduleWidth: number;
}

export interface ZplQrCodeElement extends BaseZplElement {
  type: 'qrcode';
  data: string;
  orientation: Orientation;
  model: 1 | 2;
  magnification: number; // 1 to 10
  errorCorrection: 'H' | 'Q' | 'M' | 'L';
}

export interface ZplDataMatrixElement extends BaseZplElement {
  type: 'datamatrix';
  data: string;
  orientation: Orientation;
  height: number;
}

export interface ZplGraphicElement extends BaseZplElement {
  type: 'graphic';
  format: 'A';
  binaryByteCount: number;
  graphicFieldCount: number;
  bytesPerRow: number;
  data: string; // ASCII hex string
  width: number; // width in dots
  height: number; // height in dots
  previewUrl?: string; // data URL (base64 PNG) for fast rendering
}

export interface ZplRawElement extends BaseZplElement {
  type: 'raw';
  rawZpl: string;
}

export type ZplElement =
  | ZplTextElement
  | ZplBoxElement
  | ZplBarcode128Element
  | ZplBarcode39Element
  | ZplBarcodeEAN13Element
  | ZplQrCodeElement
  | ZplDataMatrixElement
  | ZplGraphicElement
  | ZplRawElement;

export interface ZplDocumentAST {
  dimensions: LabelDimensions;
  elements: ZplElement[];
  headerCommands: string[];
  footerCommands: string[];
  charset?: string; // e.g. ^CI28
}

export type SyncOrigin = 'canvas' | 'code' | 'system';

export interface SyncEngineState {
  zplCode: string;
  ast: ZplDocumentAST;
  selectedElementIds: string[];
  lastModifiedBy: SyncOrigin;
  version: number;
  parseError: string | null;
}

export interface HistoryItem {
  zplCode: string;
  ast: ZplDocumentAST;
  selectedElementIds: string[];
}

export interface LabelProject {
  id: string;
  name: string;
  updatedAt: number;
  zplCode: string;
  dimensions: LabelDimensions;
  thumbnail?: string;
  elementCount?: number;
  lineCount?: number;
}

export interface SnapOptions {
  snapToGrid: boolean;
  gridSize: number;
  gridStyle: 'dots' | 'lines';
  snapToLabelEdges: boolean;
  snapToElements: boolean;
  showRulers: boolean;
  rulerUnit: 'dots' | 'mm';
}

export interface AlignmentGuide {
  orientation: 'horizontal' | 'vertical';
  position: number;
  label?: string;
}
