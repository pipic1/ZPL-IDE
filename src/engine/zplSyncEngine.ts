/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  HistoryItem,
  LabelDimensions,
  SyncEngineState,
  SyncOrigin,
  ZplDocumentAST,
  ZplElement,
} from '../types/zpl';
import { parseZpl } from './zplParser';
import { generateZpl } from './zplGenerator';

export const DEFAULT_INITIAL_ZPL = `^XA
^CI28
^PW812
^LL1218

^FO50,50
^GB712,1118,6,B,0^FS

^FO80,80
^GB652,100,100,B,0^FS

^FO100,110
^A0N,44,44
^FR
^FDEXPRESS LOGISTICS^FS

^FO80,220
^A0N,28,28
^FDSHIP TO:^FS

^FO80,260
^A0N,36,36
^FDJOHN DOE^FS

^FO80,310
^A0N,28,28
^FD100 MAIN STREET\\&SPRINGFIELD, IL 62701 - USA^FS

^FO80,390
^GB652,4,4,B,0^FS

^FO80,420
^A0N,26,26
^FDINTERNATIONAL TRACKING NUMBER:^FS

^FO80,460
^BY3,3,110
^BCN,110,Y,N,N
^FDEXP-789456123-US^FS

^FO80,630
^GB652,4,4,B,0^FS

^FO80,660
^BQN,2,6,M
^FDQA,https://zplstudio.app/track/EXP-789456123-US^FS

^FO270,680
^A0N,32,32
^FDELECTRONIC SIGNATURE^FS

^FO270,725
^A0N,24,24
^FDScan QR Code to verify\\&and confirm parcel receipt.^FS

^FO270,800
^GB320,60,2,B,2^FS

^FO290,818
^A0N,26,26
^FDVERIFICATION ZONE^FS

^FO80,910
^GB652,4,4,B,0^FS

^FO80,940
^A0N,24,24
^FDWeight: 4.25 KG  |  Service: PRIORITY NEXT DAY  |  Hub: ORD-01^FS

^FO80,980
^A0N,22,22
^FDRendered with ZPL Studio - High-Precision Thermal Engine^FS

^XZ`;

export function useZplSynchronizer(initialZpl: string = DEFAULT_INITIAL_ZPL) {
  // Parse initial ZPL into AST
  const initialParse = parseZpl(initialZpl);

  const [state, setState] = useState<SyncEngineState>({
    zplCode: initialZpl,
    ast: initialParse.ast,
    selectedElementIds: [],
    lastModifiedBy: 'system',
    version: 1,
    parseError: null,
  });

  // Undo / Redo stacks
  const historyRef = useRef<HistoryItem[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isInternalUpdateRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<number | null>(null);

  // Initialize history
  useEffect(() => {
    historyRef.current = [
      {
        zplCode: state.zplCode,
        ast: state.ast,
        selectedElementIds: [],
      },
    ];
    historyIndexRef.current = 0;
  }, []);

  // Helper to push history
  const pushHistory = useCallback((ast: ZplDocumentAST, zplCode: string, selectedIds: string[]) => {
    // Truncate redo history
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push({
      ast,
      zplCode,
      selectedElementIds: selectedIds,
    });
    // Cap at 50 items
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
  }, []);

  /**
   * CANVAS MUTATION -> Generates ZPL and updates AST
   * This is called when user drags, resizes, adds, or changes element properties on canvas
   */
  const updateFromCanvas = useCallback(
    (
      updater: (prevAst: ZplDocumentAST) => {
        newAst: ZplDocumentAST;
        selectedIds?: string[];
      }
    ) => {
      setState((prev) => {
        const { newAst, selectedIds } = updater(prev.ast);
        const newZpl = generateZpl(newAst);
        const nextSelected = selectedIds !== undefined ? selectedIds : prev.selectedElementIds;

        pushHistory(newAst, newZpl, nextSelected);

        return {
          zplCode: newZpl,
          ast: newAst,
          selectedElementIds: nextSelected,
          lastModifiedBy: 'canvas',
          version: prev.version + 1,
          parseError: null,
        };
      });
    },
    [pushHistory]
  );

  /**
   * CODE EDITOR MUTATION -> Parses ZPL to AST and reconciles elements
   * Called when user types into ZPL code editor
   */
  const updateFromCode = useCallback(
    (newCode: string, immediate: boolean = false) => {
      // Clear any pending debounce
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Update code text immediately so editor never feels lagged or janky
      setState((prev) => ({
        ...prev,
        zplCode: newCode,
        lastModifiedBy: 'code',
      }));

      const executeParse = () => {
        const result = parseZpl(newCode);

        setState((prev) => {
          // If AST is identical or parsing failed, maintain current AST
          if (result.errors.length > 0) {
            return {
              ...prev,
              parseError: result.errors[0],
            };
          }

          // Try to preserve selection for elements that still exist
          const newIds = new Set(result.ast.elements.map((e) => e.id));
          const preservedSelection = prev.selectedElementIds.filter((id) => newIds.has(id));

          pushHistory(result.ast, newCode, preservedSelection);

          return {
            ...prev,
            ast: result.ast,
            selectedElementIds: preservedSelection,
            version: prev.version + 1,
            parseError: null,
          };
        });
      };

      if (immediate) {
        executeParse();
      } else {
        debounceTimerRef.current = window.setTimeout(executeParse, 180);
      }
    },
    [pushHistory]
  );

  /**
   * Selection management
   */
  const setSelectedElementIds = useCallback((ids: string[]) => {
    setState((prev) => ({
      ...prev,
      selectedElementIds: ids,
    }));
  }, []);

  const selectElement = useCallback((id: string, multi: boolean = false) => {
    setState((prev) => {
      if (multi) {
        const isSelected = prev.selectedElementIds.includes(id);
        const next = isSelected
          ? prev.selectedElementIds.filter((item) => item !== id)
          : [...prev.selectedElementIds, id];
        return { ...prev, selectedElementIds: next };
      }
      return { ...prev, selectedElementIds: [id] };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedElementIds: [],
    }));
  }, []);

  /**
   * Undo & Redo
   */
  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const target = historyRef.current[historyIndexRef.current];
      setState((prev) => ({
        ...prev,
        zplCode: target.zplCode,
        ast: target.ast,
        selectedElementIds: target.selectedElementIds,
        lastModifiedBy: 'system',
        version: prev.version + 1,
        parseError: null,
      }));
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const target = historyRef.current[historyIndexRef.current];
      setState((prev) => ({
        ...prev,
        zplCode: target.zplCode,
        ast: target.ast,
        selectedElementIds: target.selectedElementIds,
        lastModifiedBy: 'system',
        version: prev.version + 1,
        parseError: null,
      }));
    }
  }, []);

  /**
   * Element Manipulation Shortcuts
   */
  const updateElement = useCallback(
    (id: string, updates: Partial<ZplElement>) => {
      updateFromCanvas((prevAst) => ({
        newAst: {
          ...prevAst,
          elements: prevAst.elements.map((el) => {
            if (el.id === id) {
              return { ...el, ...updates } as ZplElement;
            }
            return el;
          }),
        },
      }));
    },
    [updateFromCanvas]
  );

  const addElement = useCallback(
    (newElement: ZplElement) => {
      updateFromCanvas((prevAst) => ({
        newAst: {
          ...prevAst,
          elements: [...prevAst.elements, newElement],
        },
        selectedIds: [newElement.id],
      }));
    },
    [updateFromCanvas]
  );

  const deleteSelectedElements = useCallback(() => {
    updateFromCanvas((prevAst) => {
      const selectedSet = new Set(state.selectedElementIds);
      return {
        newAst: {
          ...prevAst,
          elements: prevAst.elements.filter((el) => !selectedSet.has(el.id)),
        },
        selectedIds: [],
      };
    });
  }, [state.selectedElementIds, updateFromCanvas]);

  const duplicateSelectedElements = useCallback(() => {
    if (state.selectedElementIds.length === 0) return;
    updateFromCanvas((prevAst) => {
      const selectedSet = new Set(state.selectedElementIds);
      const duplicated: ZplElement[] = [];
      const newSelectedIds: string[] = [];

      for (const el of prevAst.elements) {
        if (selectedSet.has(el.id)) {
          const newId = `el_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
          const clone: ZplElement = {
            ...el,
            id: newId,
            x: el.x + 20,
            y: el.y + 20,
            name: `${el.name || 'Elément'} (Copie)`,
          };
          duplicated.push(clone);
          newSelectedIds.push(newId);
        }
      }

      return {
        newAst: {
          ...prevAst,
          elements: [...prevAst.elements, ...duplicated],
        },
        selectedIds: newSelectedIds,
      };
    });
  }, [state.selectedElementIds, updateFromCanvas]);

  const updateLabelDimensions = useCallback(
    (dimensions: Partial<LabelDimensions>) => {
      updateFromCanvas((prevAst) => ({
        newAst: {
          ...prevAst,
          dimensions: {
            ...prevAst.dimensions,
            ...dimensions,
          },
        },
      }));
    },
    [updateFromCanvas]
  );

  const loadTemplate = useCallback(
    (zpl: string) => {
      const parsed = parseZpl(zpl);
      pushHistory(parsed.ast, zpl, []);
      setState({
        zplCode: zpl,
        ast: parsed.ast,
        selectedElementIds: [],
        lastModifiedBy: 'system',
        version: Date.now(),
        parseError: null,
      });
    },
    [pushHistory]
  );

  return {
    state,
    updateFromCanvas,
    updateFromCode,
    setSelectedElementIds,
    selectElement,
    clearSelection,
    updateElement,
    addElement,
    deleteSelectedElements,
    duplicateSelectedElements,
    updateLabelDimensions,
    loadTemplate,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
