/**
 * @fileoverview
 * File manager component
 *
 * Allows viewing, adding, and removing files from the printer storage.
 *
 * @packageDocumentation
 */

import {
  type PrinterFile,
  type PrinterState,
  canStartNewPrint,
  isStickyTerminalState,
} from '@shared/types/printer';
import { File, FolderOpen, Play, Plus, Trash2, Upload } from 'lucide-react';
import type { FunctionComponent } from 'react';

interface FileManagerProps {
  /** Current printer state */
  state: PrinterState;
  /** Callback to add a file */
  onAddFile: (file: PrinterFile) => void;
  /** Callback to remove a file */
  onRemoveFile: (filename: string) => void;
  /** Callback to start a print job */
  onStartPrint: (filename: string) => void;
}

export const FileManager: FunctionComponent<FileManagerProps> = ({
  state,
  onAddFile,
  onRemoveFile,
  onStartPrint,
}) => {
  const files = state.files;
  const canPrint = canStartNewPrint(state.machineStatus);
  const stickyTerminalState = isStickyTerminalState(state.machineStatus);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newFile: PrinterFile = {
      name: file.name, // Preserve full filename with extension
      path: `/data/${file.name}`,
      size: file.size,
      printTime: 3600, // Default 1 hour
      is3mf: file.name.endsWith('.3mf'),
      gcodeToolCnt: 1,
      gcodeToolDatas: [],
      useMatlStation: false,
      totalFilamentWeight: 0,
      thumbnail: '',
    };

    onAddFile(newFile);
    event.target.value = ''; // Reset input
  };

  const handleAddDemoFile = () => {
    const demoNames = [
      'Calibration Cube',
      'Benchy Boat',
      'Test Print',
      'Spiral Vase',
      'Support Test',
    ];
    const randomName = demoNames[Math.floor(Math.random() * demoNames.length)];
    const fileName = `${randomName}_${Date.now()}.gcode`;

    const newFile: PrinterFile = {
      name: fileName,
      path: `/data/${fileName}`,
      size: Math.floor(Math.random() * 10000000) + 1000000,
      printTime: Math.floor(Math.random() * 7200) + 1800,
      is3mf: false,
      gcodeToolCnt: 1,
      gcodeToolDatas: [],
      useMatlStation: false,
      totalFilamentWeight: 0,
      thumbnail: '',
    };

    onAddFile(newFile);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatPrintTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-neutral-100">File Manager</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Manage print files on the virtual printer storage
          </p>
          {!canPrint && (
            <p className="mt-2 text-sm text-warning">
              {stickyTerminalState
                ? 'Completed, cancelled, and error remain locked until you clear back to ready.'
                : 'A new job can only start while the printer is idle or ready.'}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            Upload File
            <input
              type="file"
              accept=".gcode,.gco,.gc,.3mf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={handleAddDemoFile}
            className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Demo File
          </button>
        </div>
      </div>

      {/* Files List */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="mb-3 h-12 w-12 text-neutral-700" />
            <p className="text-lg font-medium text-neutral-500">No files found</p>
            <p className="mt-1 text-sm text-neutral-600">
              Upload a G-code file or add a demo file to get started
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-500">
                  <th className="px-4 py-3 font-medium">File Name</th>
                  <th className="px-4 py-3 font-medium">Size</th>
                  <th className="px-4 py-3 font-medium">Est. Time</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {files.map((file) => (
                  <tr key={file.name} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-neutral-600" />
                        <span className="font-medium text-neutral-200">{file.name}</span>
                        {state.printJob.currentFile === file.name && (
                          <span className="rounded bg-primary-500/20 px-1.5 py-0.5 text-xs text-primary-500">
                            Current
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-400">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-400">
                      {formatPrintTime(file.printTime)}
                    </td>
                    <td className="px-4 py-3">
                      {file.is3mf ? (
                        <span className="rounded bg-info/20 px-1.5 py-0.5 text-xs text-info">
                          3MF
                        </span>
                      ) : (
                        <span className="rounded bg-neutral-700 px-1.5 py-0.5 text-xs text-neutral-400">
                          G-code
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {canPrint && state.printJob.currentFile !== file.name && (
                          <button
                            type="button"
                            onClick={() => onStartPrint(file.name)}
                            className="rounded border border-primary-500/30 bg-primary-500/10 p-1.5 text-primary-500 hover:bg-primary-500/20 transition-colors"
                            title="Start Print"
                          >
                            <Play className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onRemoveFile(file.name)}
                          className="rounded border border-error/30 bg-error/10 p-1.5 text-error hover:bg-error/20 transition-colors"
                          title="Delete File"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Storage Info */}
      <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">Storage Used:</span>
          <span className="font-medium text-neutral-300">
            {files.length} file{files.length !== 1 ? 's' : ''} |{' '}
            {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
          </span>
        </div>
      </section>
    </div>
  );
};
