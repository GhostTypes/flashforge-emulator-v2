/**
 * Reads the per-filament slice info of an uploaded 3MF.
 *
 * Real AD5X firmware reports per-tool material, color, and filament weight
 * for a stored 3MF in `/gcodeList` (`gcodeListDetail[].gcodeToolDatas`). The
 * printer takes those values from the slicer's `Metadata/slice_info.config`
 * inside the 3MF. The emulator does the same, so clients that read per-tool
 * weights (for example Spoolman tracking) see realistic values.
 *
 * A 3MF lists only the filaments the plate uses, each with its 1-based slicer
 * id. The gcode tool index is `id - 1`: a plate that uses filaments 1 and 3
 * prints with T0 and T2.
 *
 * The ZIP reader handles stored and deflated entries, which is what slicers
 * write. Anything it cannot read yields an empty list, never an error.
 */

import { inflateRawSync } from 'node:zlib';

/** One filament of a sliced plate. */
export interface SliceInfoFilament {
  /** Gcode tool index (0-based). */
  toolId: number;
  materialName: string;
  materialColor: string;
  /** Estimated filament weight in grams (0 when unknown). */
  usedG: number;
}

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_HEADER_SIGNATURE = 0x02014b50;
const LOCAL_HEADER_SIGNATURE = 0x04034b50;
const SLICE_INFO_ENTRY = 'Metadata/slice_info.config';

function readZipEntry(buffer: Buffer, entryName: string): Buffer | null {
  let eocd = -1;
  const searchStart = Math.max(0, buffer.length - 22 - 0xffff);
  for (let index = buffer.length - 22; index >= searchStart; index--) {
    if (buffer.readUInt32LE(index) === EOCD_SIGNATURE) {
      eocd = index;
      break;
    }
  }
  if (eocd < 0) {
    return null;
  }

  const entryCount = buffer.readUInt16LE(eocd + 10);
  let position = buffer.readUInt32LE(eocd + 16);
  for (let index = 0; index < entryCount; index++) {
    if (position + 46 > buffer.length || buffer.readUInt32LE(position) !== CENTRAL_HEADER_SIGNATURE) {
      return null;
    }
    const method = buffer.readUInt16LE(position + 10);
    const compressedSize = buffer.readUInt32LE(position + 20);
    const nameLength = buffer.readUInt16LE(position + 28);
    const extraLength = buffer.readUInt16LE(position + 30);
    const commentLength = buffer.readUInt16LE(position + 32);
    const localOffset = buffer.readUInt32LE(position + 42);
    const name = buffer.toString('utf8', position + 46, position + 46 + nameLength);

    if (name === entryName) {
      if (buffer.readUInt32LE(localOffset) !== LOCAL_HEADER_SIGNATURE) {
        return null;
      }
      const dataStart =
        localOffset + 30 + buffer.readUInt16LE(localOffset + 26) + buffer.readUInt16LE(localOffset + 28);
      const data = buffer.subarray(dataStart, dataStart + compressedSize);
      if (method === 0) {
        return data;
      }
      if (method === 8) {
        return inflateRawSync(data);
      }
      return null;
    }
    position += 46 + nameLength + extraLength + commentLength;
  }
  return null;
}

function attribute(tag: string, name: string): string | null {
  const match = new RegExp(`\\b${name}="([^"]*)"`).exec(tag);
  return match?.[1] ?? null;
}

/**
 * Per-filament slice info of a 3MF, in tool order.
 *
 * @param buffer - The uploaded 3MF file
 * @returns The filaments of the sliced plate, or an empty list
 */
export function readSliceInfoFilaments(buffer: Buffer | undefined): SliceInfoFilament[] {
  if (!buffer || buffer.length < 22) {
    return [];
  }
  try {
    const entry = readZipEntry(buffer, SLICE_INFO_ENTRY);
    if (!entry) {
      return [];
    }
    const xml = entry.toString('utf8');
    const filaments: SliceInfoFilament[] = [];
    const tags = xml.match(/<filament\b[^>]*>/g) ?? [];
    tags.forEach((tag, index) => {
      const id = Number.parseInt(attribute(tag, 'id') ?? '', 10);
      const usedG = Number.parseFloat(attribute(tag, 'used_g') ?? '');
      filaments.push({
        toolId: Number.isInteger(id) && id >= 1 ? id - 1 : index,
        materialName: attribute(tag, 'type') || 'PLA',
        materialColor: attribute(tag, 'color') || '#FFFFFF',
        usedG: Number.isFinite(usedG) && usedG > 0 ? usedG : 0,
      });
    });
    return filaments.sort((a, b) => a.toolId - b.toolId);
  } catch {
    return [];
  }
}
