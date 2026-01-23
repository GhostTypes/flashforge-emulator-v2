/**
 * @fileoverview
 * Network interface utilities for FlashForge emulator
 *
 * Provides functions to enumerate and filter network interfaces
 * for UDP discovery configuration.
 *
 * @packageDocumentation
 */

import { networkInterfaces } from 'node:os';
import type { NetworkInterface } from '../../../shared/types/printer';

/**
 * Virtual adapter name patterns to filter out
 * These adapters should not be used for printer discovery
 */
const VIRTUAL_ADAPTER_PATTERNS = [
  'vEthernet',
  'Loopback',
  'TAP',
  'TUN',
  'Docker',
  'VirtualBox',
  'VMware',
  'Hyper-V',
  'Teredo',
  'isatap',
] as const;

/**
 * Determines if an interface is a virtual adapter
 */
function isVirtualAdapter(name: string): boolean {
  return VIRTUAL_ADAPTER_PATTERNS.some((pattern) => name.includes(pattern));
}

/**
 * Creates a user-friendly display name for a network interface
 */
function getDisplayName(name: string, address: string): string {
  // Strip common Windows adapter prefixes for cleaner display
  const shortName = name
    .replace(/^Wireless LAN adapter \*?\d*/i, 'Wi-Fi')
    .replace(/^Ethernet adapter/i, 'Ethernet')
    .replace(/^Local Area Connection\*?\d*/i, 'Local Area Connection')
    .replace(/^Bluetooth Network Connection/i, 'Bluetooth')
    .replace(/\s+/g, ' ')
    .trim();

  return `${shortName} (${address})`;
}

/**
 * Gets all available network interfaces on the system
 * Filters out internal and virtual adapters by default
 */
export function getAvailableNetworkInterfaces(includeVirtual = false): NetworkInterface[] {
  const interfaces = networkInterfaces();
  const result: NetworkInterface[] = [];

  for (const [name, netInterface] of Object.entries(interfaces)) {
    if (!netInterface) {
      continue;
    }

    for (const iface of netInterface) {
      // Only include IPv4 interfaces
      if (iface.family !== 'IPv4') {
        continue;
      }

      // Skip internal interfaces (loopback)
      if (iface.internal) {
        continue;
      }

      // Determine interface type
      const type: 'physical' | 'virtual' | 'loopback' = isVirtualAdapter(name)
        ? 'virtual'
        : 'physical';

      // Skip virtual adapters if not requested
      if (!includeVirtual && type === 'virtual') {
        continue;
      }

      result.push({
        address: iface.address,
        displayName: getDisplayName(name, iface.address),
        type,
        name,
      });
    }
  }

  return result;
}

/**
 * Gets the first physical network interface
 * Returns null if no physical interfaces are available
 */
export function getFirstPhysicalInterface(): NetworkInterface | null {
  const interfaces = getAvailableNetworkInterfaces();
  const physical = interfaces.find((iface) => iface.type === 'physical');
  return physical ?? null;
}

/**
 * Validates if a given IP address is a valid interface on the system
 */
export function isValidInterface(address: string): boolean {
  const interfaces = getAvailableNetworkInterfaces(true);
  return interfaces.some((iface) => iface.address === address);
}
