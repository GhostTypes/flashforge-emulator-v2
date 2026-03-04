/**
 * @fileoverview
 * Real protocol log viewer for HTTP, TCP, discovery, and internal emulator events.
 *
 * @packageDocumentation
 */

import type { ProtocolLogEntry } from '@shared/types/printer';
import { AlertCircle, AlertTriangle, Ban, Info, RefreshCw, Search } from 'lucide-react';
import { type FunctionComponent, useMemo, useState } from 'react';

interface LogsProps {
  logs: readonly ProtocolLogEntry[];
  onClear: () => void;
}

const PROTOCOL_LABELS: Record<ProtocolLogEntry['protocol'], { label: string; color: string }> = {
  http: { label: 'HTTP', color: 'text-success bg-success/10' },
  tcp: { label: 'TCP', color: 'text-info bg-info/10' },
  discovery: { label: 'Discovery', color: 'text-warning bg-warning/10' },
  system: { label: 'System', color: 'text-neutral-300 bg-neutral-700/60' },
};

const DIRECTION_LABELS: Record<ProtocolLogEntry['direction'], string> = {
  incoming: 'IN',
  outgoing: 'OUT',
  internal: 'INT',
};

type LogLevel = ProtocolLogEntry['level'];

export const Logs: FunctionComponent<LogsProps> = ({ logs, onClear }) => {
  const [protocolFilter, setProtocolFilter] = useState<'all' | ProtocolLogEntry['protocol']>('all');
  const [directionFilter, setDirectionFilter] = useState<'all' | ProtocolLogEntry['direction']>(
    'all'
  );
  const [levelFilter, setLevelFilter] = useState<'all' | LogLevel>('all');
  const [search, setSearch] = useState('');

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs.filter((entry) => {
      if (protocolFilter !== 'all' && entry.protocol !== protocolFilter) return false;
      if (directionFilter !== 'all' && entry.direction !== directionFilter) return false;
      if (levelFilter !== 'all' && entry.level !== levelFilter) return false;
      if (!query) return true;

      const haystack = `${entry.summary}\n${JSON.stringify(entry.payload ?? {})}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [directionFilter, levelFilter, logs, protocolFilter, search]);

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-neutral-100">Protocol Logs</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Incoming and outgoing traffic across HTTP, TCP, and discovery surfaces
          </p>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-700"
        >
          <RefreshCw className="h-4 w-4" />
          Clear Logs
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[auto_auto_auto_minmax(0,1fr)_auto]">
        <FilterGroup
          label="Protocol"
          value={protocolFilter}
          options={['all', 'http', 'tcp', 'discovery', 'system']}
          onChange={(value) => setProtocolFilter(value as 'all' | ProtocolLogEntry['protocol'])}
        />
        <FilterGroup
          label="Direction"
          value={directionFilter}
          options={['all', 'incoming', 'outgoing', 'internal']}
          onChange={(value) => setDirectionFilter(value as 'all' | ProtocolLogEntry['direction'])}
        />
        <FilterGroup
          label="Level"
          value={levelFilter}
          options={['all', 'info', 'warning', 'error']}
          onChange={(value) => setLevelFilter(value as 'all' | LogLevel)}
        />

        <label className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-400">
          <Search className="h-4 w-4" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search summaries or payloads"
            className="w-full bg-transparent text-neutral-100 outline-none placeholder:text-neutral-600"
          />
        </label>

        <div className="flex items-center justify-end text-sm text-neutral-500">
          <span className="font-medium text-neutral-100">{filteredLogs.length}</span>
          <span className="ml-1">entries</span>
        </div>
      </div>

      <section className="flex-1 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
        {filteredLogs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Ban className="mb-3 h-12 w-12 text-neutral-700" />
            <p className="text-lg font-medium text-neutral-400">No matching protocol traffic</p>
            <p className="mt-1 text-sm text-neutral-600">
              Start a client request or adjust the filters to inspect traffic.
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <div className="flex flex-col gap-3">
              {filteredLogs
                .slice()
                .reverse()
                .map((entry) => {
                  const protocolConfig = PROTOCOL_LABELS[entry.protocol];
                  const icon =
                    entry.level === 'error' ? (
                      <AlertCircle className="h-3.5 w-3.5 text-error" />
                    ) : entry.level === 'warning' ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    ) : (
                      <Info className="h-3.5 w-3.5 text-info" />
                    );

                  return (
                    <article
                      key={entry.id}
                      className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4"
                    >
                      <div className="flex flex-wrap items-start gap-3">
                        <span className="font-mono text-xs text-neutral-600">
                          {formatTimestamp(entry.timestamp)}
                        </span>
                        <span
                          className={[
                            'rounded-full px-2 py-1 text-[11px] font-medium uppercase tracking-wide',
                            protocolConfig.color,
                          ].join(' ')}
                        >
                          {protocolConfig.label}
                        </span>
                        <span className="rounded-full border border-neutral-700 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                          {DIRECTION_LABELS[entry.direction]}
                        </span>
                        <span className="mt-0.5">{icon}</span>
                        <h3 className="flex-1 text-sm font-medium text-neutral-100">
                          {entry.summary}
                        </h3>
                      </div>

                      {entry.payload !== undefined && (
                        <pre className="mt-3 overflow-x-auto rounded-lg border border-neutral-800 bg-black/30 p-3 text-xs text-neutral-300">
                          {JSON.stringify(entry.payload, null, 2)}
                        </pre>
                      )}
                    </article>
                  );
                })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

interface FilterGroupProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

function FilterGroup({ label, value, options, onChange }: FilterGroupProps) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-400">
      <span className="whitespace-nowrap">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-neutral-100 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const millis = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${millis}`;
}
