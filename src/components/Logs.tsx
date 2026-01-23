/**
 * @fileoverview
 * Log viewer component
 *
 * Displays TCP and HTTP protocol logs with filtering capabilities.
 *
 * @packageDocumentation
 */

import { AlertCircle, AlertTriangle, Ban, Info, RefreshCw } from 'lucide-react';
import { type FunctionComponent, useState } from 'react';

export type LogEntry = {
  /** Unique ID for the entry */
  id: string;
  /** Timestamp of the log entry */
  timestamp: Date;
  /** Log type */
  type: 'tcp' | 'http' | 'system' | 'error';
  /** Log level */
  level: 'info' | 'warning' | 'error';
  /** Log message */
  message: string;
  /** Additional data */
  data?: unknown;
};

interface LogsProps {
  /** Log entries to display */
  logs: readonly LogEntry[];
  /** Callback to clear logs */
  onClear: () => void;
}

const LOG_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  tcp: { label: 'TCP', color: 'text-info bg-info/20' },
  http: { label: 'HTTP', color: 'text-success bg-success/20' },
  system: { label: 'System', color: 'text-neutral-400 bg-neutral-800' },
  error: { label: 'Error', color: 'text-error bg-error/20' },
};

type LogLevel = 'info' | 'warning' | 'error';

export const Logs: FunctionComponent<LogsProps> = ({ logs, onClear }) => {
  const [filter, setFilter] = useState<'all' | 'tcp' | 'http' | 'error'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | LogLevel>('all');

  const filteredLogs = logs.filter((log) => {
    if (filter !== 'all' && log.type !== filter) return false;
    if (levelFilter !== 'all' && log.level !== levelFilter) return false;
    return true;
  });

  const handleClear = () => {
    onClear();
  };

  const formatTimestamp = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  };

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-neutral-100">Protocol Logs</h2>
          <p className="mt-1 text-sm text-neutral-500">TCP and HTTP request/response log</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Clear Logs
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {/* Type Filter */}
        <div className="flex rounded-md border border-neutral-700 bg-neutral-800 p-1">
          {(['all', 'tcp', 'http', 'error'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={[
                'rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                filter === type
                  ? 'bg-neutral-700 text-neutral-100'
                  : 'text-neutral-500 hover:text-neutral-300',
              ].join(' ')}
            >
              {type === 'error' ? 'Errors' : type}
            </button>
          ))}
        </div>

        {/* Level Filter */}
        <div className="flex rounded-md border border-neutral-700 bg-neutral-800 p-1">
          {(['all', 'info', 'warning', 'error'] as const).map((level) => {
            const isSelected = levelFilter === level;
            const baseClass =
              'flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors';
            const selectedClass = isSelected
              ? 'bg-neutral-700 text-neutral-100'
              : 'text-neutral-500 hover:text-neutral-300';

            return (
              <button
                key={level}
                type="button"
                onClick={() => setLevelFilter(level === 'all' ? 'all' : (level as LogLevel))}
                className={[baseClass, selectedClass].join(' ')}
              >
                {level === 'error' && <AlertCircle className="h-3 w-3" />}
                {level === 'warning' && <AlertTriangle className="h-3 w-3" />}
                {level === 'info' && <Info className="h-3 w-3" />}
                {level}
              </button>
            );
          })}
        </div>

        {/* Log Count */}
        <div className="ml-auto flex items-center gap-1 text-sm text-neutral-500">
          <span className="font-medium text-neutral-300">{filteredLogs.length}</span>
          <span>entries</span>
        </div>
      </div>

      {/* Log Content */}
      <section className="flex-1 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
        {filteredLogs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Ban className="mb-3 h-12 w-12 text-neutral-700" />
            <p className="text-lg font-medium text-neutral-500">No logs to display</p>
            <p className="mt-1 text-sm text-neutral-600">
              Logs will appear here as the emulator processes commands
            </p>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
              <div className="flex flex-col gap-1">
                {filteredLogs.map((entry) => {
                  const typeConfig = LOG_TYPE_LABELS[entry.type] ?? LOG_TYPE_LABELS['system'];
                  if (!typeConfig) {
                    return null;
                  }

                  const iconColor =
                    entry.level === 'error'
                      ? 'text-error'
                      : entry.level === 'warning'
                        ? 'text-warning'
                        : 'text-info';

                  return (
                    <div key={entry.id} className="flex gap-3 rounded bg-neutral-800/50 px-3 py-2">
                      {/* Timestamp */}
                      <span className="shrink-0 text-neutral-600">
                        {formatTimestamp(entry.timestamp)}
                      </span>

                      {/* Type Badge */}
                      <span
                        className={[
                          'shrink-0 rounded px-1.5 py-0.5 text-xs font-medium',
                          typeConfig.color,
                        ].join(' ')}
                      >
                        {typeConfig.label}
                      </span>

                      {/* Level Icon */}
                      <span className="shrink-0">
                        {entry.level === 'error' && (
                          <AlertCircle className={`h-3.5 w-3.5 ${iconColor}`} />
                        )}
                        {entry.level === 'warning' && (
                          <AlertTriangle className={`h-3.5 w-3.5 ${iconColor}`} />
                        )}
                        {entry.level === 'info' && <Info className={`h-3.5 w-3.5 ${iconColor}`} />}
                      </span>

                      {/* Message */}
                      <span className="flex-1 text-neutral-300">{entry.message}</span>

                      {/* Data preview */}
                      {entry.data != null && (
                        <span className="shrink-0 text-neutral-600">
                          {JSON.stringify(entry.data)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

/**
 * Generate a unique log entry ID
 */
export function generateLogId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new log entry
 */
export function createLogEntry(
  type: LogEntry['type'],
  level: LogEntry['level'],
  message: string,
  data?: unknown
): LogEntry {
  return {
    id: generateLogId(),
    timestamp: new Date(),
    type,
    level,
    message,
    data,
  };
}
