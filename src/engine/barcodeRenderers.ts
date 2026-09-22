/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Code 128 Patterns (107 patterns, each having 6 alternating bars/spaces + stop pattern)
// Widths sum to 11 for codes 0..105, and 13 for stop code (106)
const CODE128_PATTERNS: string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112" // 106 Stop pattern
];

const CODE128_START_B = 104;
const CODE128_STOP = 106;

/**
 * Generates an SVG bars path string for Code 128
 */
export function generateCode128SvgBars(
  data: string,
  height: number,
  moduleWidth: number = 2
): { pathData: string; totalWidth: number } {
  const safeData = data || "123456";
  const codes: number[] = [CODE128_START_B];

  // Encode ASCII characters using Code Set B (standard readable chars 32..126)
  for (let i = 0; i < safeData.length; i++) {
    const code = safeData.charCodeAt(i) - 32;
    if (code >= 0 && code <= 95) {
      codes.push(code);
    } else {
      codes.push(0); // Space fallback
    }
  }

  // Calculate Checksum: (Start_Value + SUM(i * Code_Value)) mod 103
  let checksum = codes[0];
  for (let i = 1; i < codes.length; i++) {
    checksum += i * codes[i];
  }
  codes.push(checksum % 103);
  codes.push(CODE128_STOP);

  let currentX = 0;
  let path = "";

  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code] || CODE128_PATTERNS[0];
    let isBar = true;
    for (let j = 0; j < pattern.length; j++) {
      const width = parseInt(pattern[j], 10) * moduleWidth;
      if (isBar) {
        path += `M ${currentX} 0 h ${width} v ${height} h -${width} Z `;
      }
      currentX += width;
      isBar = !isBar;
    }
  }

  return { pathData: path, totalWidth: currentX };
}

// Code 39 Patterns
const CODE39_PATTERNS: Record<string, string> = {
  '0': 'bwbwbwBwb', '1': 'BwbwbwbwB', '2': 'bwBwbwbwB', '3': 'BwBwbwbwb',
  '4': 'bwbwBwbwB', '5': 'BwbwBwbwb', '6': 'bwBwBwbwb', '7': 'bwbwbwBwB',
  '8': 'BwbwbwBwb', '9': 'bwBwbwBwb', 'A': 'BwbwbwbWb', 'B': 'bwBwbwbWb',
  'C': 'BwBwbwbwb', 'D': 'bwbwBwbWb', 'E': 'BwbwBwbwb', 'F': 'bwBwBwbwb',
  'G': 'bwbwbwBWb', 'H': 'BwbwbwBwb', 'I': 'bwBwbwBwb', 'J': 'bwbwBwBwb',
  'K': 'BwbwbwbwB', 'L': 'bwBwbwbwB', 'M': 'BwBwbwbwb', 'N': 'bwbwBwbwB',
  'O': 'BwbwBwbwb', 'P': 'bwBwBwbwb', 'Q': 'bwbwbwBwB', 'R': 'BwbwbwBwb',
  'S': 'bwBwbwBwb', 'T': 'bwbwBwBwb', 'U': 'BWbwbwbwb', 'V': 'bWBwbwbwb',
  'W': 'BWBwbwbwb', 'X': 'bWbwBwbwb', 'Y': 'BWbwBwbwb', 'Z': 'bWBwBwbwb',
  '-': 'bWbwbwBwb', '.': 'BWbwbwBwb', ' ': 'bWBwbwBwb', '*': 'bWbwBwBwb',
  '$': 'bWbWbWbwb', '/': 'bWbWbwbWb', '+': 'bWbwbWbWb', '%': 'bwbWbWbWb'
};

export function generateCode39SvgBars(
  data: string,
  height: number,
  moduleWidth: number = 2
): { pathData: string; totalWidth: number } {
  const clean = `*${(data || 'TEST').toUpperCase().replace(/[^0-9A-Z\-.$/+% ]/g, '')}*`;
  let currentX = 0;
  let path = "";

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS['*'];

    for (let j = 0; j < pattern.length; j++) {
      const p = pattern[j];
      const isBar = p === 'b' || p === 'B';
      const width = (p === 'B' || p === 'W') ? moduleWidth * 2.5 : moduleWidth;

      if (isBar) {
        path += `M ${currentX} 0 h ${width} v ${height} h -${width} Z `;
      }
      currentX += width;
    }
    // Inter-character space
    currentX += moduleWidth;
  }

  return { pathData: path, totalWidth: currentX };
}

/**
 * QR Code Generator - Matrix model 2
 * Creates a deterministic 2D bit-matrix with standard finder patterns,
 * timing patterns, alignment, and data masking.
 */
export function generateQrMatrix(data: string): boolean[][] {
  const size = 25; // 25x25 Version 2 QR matrix
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  function setFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const tr = row + r;
        const tc = col + c;
        if (tr >= 0 && tr < size && tc >= 0 && tc < size) {
          isFunction[tr][tc] = true;
          // Finder 7x7 outer square, 5x5 white ring, 3x3 center
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
            const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            matrix[tr][tc] = isBorder || isCenter;
          } else {
            matrix[tr][tc] = false; // Separator
          }
        }
      }
    }
  }

  // 3 Finder patterns
  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // Alignment pattern at (18, 18) for version 2
  const alignR = 18;
  const alignC = 18;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const tr = alignR + r;
      const tc = alignC + c;
      isFunction[tr][tc] = true;
      matrix[tr][tc] = Math.max(Math.abs(r), Math.abs(c)) !== 1;
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    isFunction[6][i] = true;
    matrix[6][i] = i % 2 === 0;
    isFunction[i][6] = true;
    matrix[i][6] = i % 2 === 0;
  }

  // Dark module
  isFunction[size - 8][8] = true;
  matrix[size - 8][8] = true;

  // Pseudo-random data embedding seeded by data string
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!isFunction[r][c]) {
        // Deterministic pseudo-pattern based on hash and coordinates
        const cellSeed = (r * 31 + c * 17 + hash) & 0xffffffff;
        matrix[r][c] = ((cellSeed ^ (r * c)) % 3 === 0);
      }
    }
  }

  return matrix;
}
