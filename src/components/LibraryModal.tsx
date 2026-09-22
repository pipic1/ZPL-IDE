/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  FolderOpen,
  Save,
  Trash2,
  Copy,
  Edit2,
  Download,
  HardDrive,
  Search,
  Check,
  Plus,
  Calendar,
  Layers,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { LabelProject, LabelDimensions } from '../types/zpl';
import {
  getSavedProjects,
  saveProject,
  deleteProject,
  duplicateProject,
  renameProject,
  saveToDisk,
} from '../engine/storage';
import { dotsToMm } from '../engine/units';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentZpl: string;
  currentDimensions: LabelDimensions;
  currentElementCount: number;
  onLoadProject: (project: LabelProject) => void;
  onNotify: (msg: string) => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  currentZpl,
  currentDimensions,
  currentElementCount,
  onLoadProject,
  onNotify,
}) => {
  const [projects, setProjects] = useState<LabelProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newLabelName, setNewLabelName] = useState('');
  const [isSavingCurrent, setIsSavingCurrent] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load projects from storage on open
  useEffect(() => {
    if (isOpen) {
      refreshList();
      setEditingId(null);
      setDeleteConfirmId(null);
      setNewLabelName(`Label ${new Date().toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
    }
  }, [isOpen]);

  const refreshList = () => {
    const list = getSavedProjects();
    setProjects(list);
  };

  if (!isOpen) return null;

  const currentLineCount = currentZpl ? currentZpl.split('\n').length : 0;

  // Handle Save Current Label to Library
  const handleSaveCurrent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newLabelName.trim() || 'Untitled Label';
    
    const newProj: LabelProject = {
      id: `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      updatedAt: Date.now(),
      zplCode: currentZpl,
      dimensions: { ...currentDimensions },
      elementCount: currentElementCount,
      lineCount: currentLineCount,
    };

    saveProject(newProj);
    refreshList();
    setIsSavingCurrent(false);
    onNotify(`Saved "${name}" to Local Storage Library!`);
  };

  // Handle Save on Disk
  const handleSaveOnDisk = async (project: { name: string; zplCode: string }) => {
    const success = await saveToDisk(project.name, project.zplCode);
    if (success) {
      onNotify(`Saved "${project.name}.zpl" to disk!`);
    }
  };

  // Handle Duplicate
  const handleDuplicate = (id: string) => {
    const duplicated = duplicateProject(id);
    if (duplicated) {
      refreshList();
      onNotify(`Duplicated "${duplicated.name}"!`);
    }
  };

  // Handle Rename
  const handleStartRename = (project: LabelProject) => {
    setEditingId(project.id);
    setEditingName(project.name);
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      renameProject(id, editingName.trim());
      refreshList();
      onNotify('Label renamed!');
    }
    setEditingId(null);
  };

  // Handle Delete
  const handleDelete = (id: string, name: string) => {
    deleteProject(id);
    setDeleteConfirmId(null);
    refreshList();
    onNotify(`Deleted "${name}" from Local Storage.`);
  };

  // Filter projects by query
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Local Storage Label Library
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {projects.length} {projects.length === 1 ? 'file' : 'files'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Manage and restore multiple labels stored directly in your browser or save them to disk.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSaveOnDisk({ name: 'current_label', zplCode: currentZpl })}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 transition"
              title="Save current label directly to disk as .zpl file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save on Disk</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Save Current Action Bar */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
              Save Active Workspace to Library:
            </span>
          </div>

          <form onSubmit={handleSaveCurrent} className="flex items-center gap-2 flex-1 max-w-md">
            <input
              type="text"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="e.g. Shipping 4x6, Barcode Pallet, etc."
              className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-xs transition shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save to Library</span>
            </button>
          </form>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-5 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 flex items-center justify-between gap-4 shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved labels..."
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded pl-8 pr-2.5 py-1 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
            {filteredProjects.length} of {projects.length} shown
          </div>
        </div>

        {/* Library Files List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 dark:text-zinc-500">
              <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No saved labels found</p>
              <p className="text-xs mt-1">
                {searchQuery ? 'Try another search query.' : 'Use the form above to save your first label to the local library.'}
              </p>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const isEditing = editingId === project.id;
              const isConfirmingDelete = deleteConfirmId === project.id;
              const widthMm = dotsToMm(project.dimensions.widthDots, project.dimensions.dpi);
              const heightMm = dotsToMm(project.dimensions.heightDots, project.dimensions.dpi);

              return (
                <div
                  key={project.id}
                  className="group p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 bg-white dark:bg-zinc-950/60 hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(project.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                            className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveRename(project.id)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                            title="Save name"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3
                            onClick={() => {
                              onLoadProject(project);
                              onClose();
                            }}
                            className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer truncate"
                            title="Click to load into editor"
                          >
                            {project.name}
                          </h3>
                          <button
                            onClick={() => handleStartRename(project)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 opacity-70" />
                        {new Date(project.updatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <span>•</span>

                      <span>
                        {widthMm}×{heightMm} mm ({project.dimensions.widthDots}×{project.dimensions.heightDots} pt @ {project.dimensions.dpi} DPI)
                      </span>

                      <span>•</span>

                      <span className="flex items-center gap-1">
                        <FileCode className="w-3 h-3 opacity-70" />
                        {project.lineCount || project.zplCode.split('\n').length} lines
                      </span>

                      {project.elementCount !== undefined && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3 opacity-70" />
                            {project.elementCount} elements
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        onLoadProject(project);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-2xs"
                      title="Load this label into the workspace"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Open</span>
                    </button>

                    <button
                      onClick={() => handleSaveOnDisk(project)}
                      className="p-1.5 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition"
                      title="Save to computer disk (.zpl)"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(project.id)}
                      className="p-1.5 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition"
                      title="Duplicate in library"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 p-0.5 rounded border border-rose-200 dark:border-rose-900">
                        <button
                          onClick={() => handleDelete(project.id, project.name)}
                          className="px-2 py-0.5 rounded bg-rose-600 text-white text-[11px] font-semibold hover:bg-rose-500 transition"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-0.5 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 text-[11px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(project.id)}
                        className="p-1.5 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 transition"
                        title="Delete from local storage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Stored in browser LocalStorage</span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
