/**
 * @fileoverview
 * Sidebar navigation component
 *
 * Provides navigation between different sections of the emulator.
 *
 * @packageDocumentation
 */

import { Activity, Cog, FileStack, List, PlayCircle, Power, Settings } from 'lucide-react';
import type { FunctionComponent } from 'react';

export type SidebarTab = 'dashboard' | 'controls' | 'files' | 'logs' | 'settings';

interface SidebarProps {
  /** Currently active tab */
  activeTab: SidebarTab;
  /** Callback when tab is clicked */
  onTabChange: (tab: SidebarTab) => void;
}

const TABS = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: Activity },
  { id: 'controls' as const, label: 'Print Controls', icon: PlayCircle },
  { id: 'files' as const, label: 'File Manager', icon: FileStack },
  { id: 'logs' as const, label: 'Logs', icon: List },
  { id: 'settings' as const, label: 'Settings', icon: Cog },
] as const;

export const Sidebar: FunctionComponent<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-neutral-800 bg-neutral-900">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-neutral-800 px-4">
        <Power className="mr-2 h-5 w-5 text-primary-500" strokeWidth={2.5} />
        <h1 className="text-lg font-semibold text-neutral-100">FlashForge Emulator</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={[
                    'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  <span>{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-800 p-4">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Settings className="h-3.5 w-3.5" />
          <span>V2.0 - Development Build</span>
        </div>
      </div>
    </aside>
  );
};
