/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  FileCode,
  AlertCircle,
  Wand2,
  Copy,
  Check,
  Terminal,
} from 'lucide-react';
import { parseZpl } from '../engine/zplParser';
import { generateZpl } from '../engine/zplGenerator';

interface CodeEditorProps {
  zplCode: string;
  onChangeZpl: (code: string) => void;
  parseError: string | null;
  fullScreen?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  zplCode,
  onChangeZpl,
  parseError,
  fullScreen = false,
}) => {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = zplCode.split('\n');

  // Sync scrolling between line numbers and textarea
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(zplCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormat = () => {
    const { ast } = parseZpl(zplCode);
    const cleaned = generateZpl(ast);
    onChangeZpl(cleaned);
  };

  const insertSnippet = (snippet: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const current = zplCode;
    const updated = current.substring(0, start) + snippet + current.substring(end);
    onChangeZpl(updated);
  };

  return (
    <div
      className={`flex flex-col select-none bg-zinc-950 transition-all ${
        fullScreen
          ? 'w-full h-full flex-1'
          : 'w-96 border-l border-zinc-800 bg-zinc-950 shrink-0'
      }`}
    >
      {/* VS Code Tab Bar Header */}
      <div className="h-8 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between pl-0 pr-2 shrink-0 select-none">
        {/* Active Tab */}
        <div className="h-full px-3 bg-zinc-900 border-r border-zinc-800 border-t-2 border-t-emerald-500 flex items-center gap-1.5 text-xs font-mono text-zinc-200">
          <FileCode className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium">etiquette.zpl</span>
          <span className="text-[10px] text-zinc-500">({lines.length} l.)</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleFormat}
            className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono border border-zinc-700/80 transition"
            title="Formater et réordonner le code ZPL"
          >
            <Wand2 className="w-3 h-3 text-emerald-400" />
            <span>Formater</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono border border-zinc-700/80 transition"
            title="Copier le code"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copié</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-zinc-400" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Syntax Error Banner */}
      {parseError && (
        <div className="bg-rose-950/40 border-b border-rose-800/40 px-3 py-1.5 flex items-center gap-2 text-rose-300 text-xs font-mono">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate">{parseError}</span>
        </div>
      )}

      {/* Quick Snippets Bar */}
      <div className="h-6.5 px-2 bg-[#161618] border-b border-zinc-800 flex items-center gap-1 overflow-x-auto text-[10px] font-mono shrink-0">
        <span className="text-zinc-500 uppercase text-[9px] shrink-0 font-sans font-bold px-1">
          Insérer :
        </span>
        <button
          onClick={() => insertSnippet('\n^FO100,100^A0N,32,32^FDTexte simple^FS\n')}
          className="px-1.5 py-0.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition shrink-0"
        >
          ^A0 (Texte)
        </button>
        <button
          onClick={() => insertSnippet('\n^FO100,100^BY2,3,70^BCN,70,Y,N,N^FDEXP-123456^FS\n')}
          className="px-1.5 py-0.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition shrink-0"
        >
          ^BC (128)
        </button>
        <button
          onClick={() => insertSnippet('\n^FO100,100^BQN,2,5,M^FDQA,https://example.com^FS\n')}
          className="px-1.5 py-0.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition shrink-0"
        >
          ^BQ (QR)
        </button>
        <button
          onClick={() => insertSnippet('\n^FO100,100^GB300,120,4,B,0^FS\n')}
          className="px-1.5 py-0.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition shrink-0"
        >
          ^GB (Cadre)
        </button>
        <button
          onClick={() => insertSnippet('\n^FO100,100^FR^A0N,32,32^FDTEXTE INVERSÉ^FS\n')}
          className="px-1.5 py-0.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition shrink-0"
        >
          ^FR (Inversé)
        </button>
      </div>

      {/* Code Textarea with Line Numbers (VS Code styling) */}
      <div className="flex-1 flex overflow-hidden bg-zinc-950 font-mono text-xs leading-5">
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          className="w-10 py-3 bg-zinc-950 text-zinc-600 select-none text-right pr-2 shrink-0 border-r border-zinc-900 overflow-hidden font-mono text-xs"
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={zplCode}
          onChange={(e) => onChangeZpl(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-emerald-400 font-mono text-xs leading-5 resize-none focus:outline-none overflow-auto whitespace-pre selection:bg-emerald-950/80"
          placeholder="Entrez votre code ZPL (^XA ... ^XZ)"
        />
      </div>
    </div>
  );
};
