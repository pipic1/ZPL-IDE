/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DpiResolution, MeasurementUnit } from '../types/zpl';

export const DPI_FACTORS: Record<DpiResolution, number> = {
  203: 8, // 8 dots / mm (~203.2 dpi)
  300: 11.811, // ~11.8 dots / mm
  600: 23.622, // ~23.6 dots / mm
};

/**
 * Converts dots to millimeters based on DPI
 */
export function dotsToMm(dots: number, dpi: DpiResolution = 203): number {
  const mm = dots / (dpi / 25.4);
  return Math.round(mm * 10) / 10;
}

/**
 * Converts millimeters to dots based on DPI
 */
export function mmToDots(mm: number, dpi: DpiResolution = 203): number {
  return Math.round(mm * (dpi / 25.4));
}

/**
 * Converts dots to inches based on DPI
 */
export function dotsToInches(dots: number, dpi: DpiResolution = 203): number {
  const inch = dots / dpi;
  return Math.round(inch * 100) / 100;
}

/**
 * Converts inches to dots based on DPI
 */
export function inchesToDots(inches: number, dpi: DpiResolution = 203): number {
  return Math.round(inches * dpi);
}

/**
 * Formats dots into the requested user unit with label (e.g. "101.6 mm")
 */
export function formatMeasurement(dots: number, unit: MeasurementUnit, dpi: DpiResolution = 203): string {
  switch (unit) {
    case 'mm':
      return `${dotsToMm(dots, dpi)} mm`;
    case 'inch':
      return `${dotsToInches(dots, dpi)}"`;
    case 'dots':
    default:
      return `${Math.round(dots)} pt`;
  }
}
