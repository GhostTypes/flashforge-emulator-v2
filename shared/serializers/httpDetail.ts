/**
 * @fileoverview
 * Shared serializer for the modern HTTP `/detail` response.
 *
 * Keeps the transport payload used by the HTTP server, QA preview, and smoke tests
 * aligned so regression tooling cannot drift from the real wire contract.
 *
 * @packageDocumentation
 */

import type { IndepMatlInfo, PrinterState } from '../types/printer';
import {
  PRINTER_PID,
  PRINTER_PROFILES,
  isCreator5Series,
  mapMachineStatusToHttpDetailStatus,
} from '../types/printer';

export interface HttpDetailMaterialStationInfo {
  currentLoadSlot: number;
  currentSlot: number;
  slotCnt: number;
  stateAction: number;
  stateStep: number;
  slotInfos: Array<{
    slotId: number;
    hasFilament: boolean;
    materialName: string;
    materialColor: string;
  }>;
}

export interface HttpDetailPayload {
  autoShutdown: PrinterState['autoShutdown'];
  autoShutdownTime: number;
  cameraStreamUrl: string;
  chamberFanSpeed: number;
  chamberTargetTemp: number;
  chamberTemp: number;
  coolingFanSpeed: number;
  coolingFanLeftSpeed: number;
  cumulativeFilament: number;
  cumulativePrintTime: number;
  currentPrintSpeed: number;
  doorStatus: 'open' | 'close';
  errorCode: string;
  estimatedLeftLen: number;
  estimatedLeftWeight: number;
  estimatedRightLen: number;
  estimatedRightWeight: number;
  estimatedTime: number;
  externalFanStatus: 'open' | 'close';
  fillAmount: number;
  firmwareVersion: string;
  flashRegisterCode: string;
  internalFanStatus: 'open' | 'close';
  ipAddr: string;
  lightStatus: 'open' | 'close';
  location: string;
  macAddr: string;
  measure: string;
  name: string;
  nozzleCnt: number;
  nozzleModel: string;
  nozzleStyle: number;
  pid: number;
  platTargetTemp: number;
  platTemp: number;
  polarRegisterCode: string;
  printDuration: number;
  printFileName: string;
  printFileThumbUrl: string;
  printLayer: number;
  printProgress: number;
  printEta: string;
  formattedEta: string;
  jobTotalPrintTimeSeconds: number;
  printSpeedAdjust: number;
  hasRightFilament: boolean;
  remainingDiskSpace: number;
  rightFilamentType: string;
  rightTargetTemp: number;
  rightTemp: number;
  status: ReturnType<typeof mapMachineStatusToHttpDetailStatus>;
  targetPrintLayer: number;
  tvoc: number;
  zAxisCompensation: number;
  hasMatlStation?: true;
  hasLeftFilament?: boolean;
  leftFilamentType?: string;
  leftTemp?: number;
  leftTargetTemp?: number;
  matlStationInfo?: HttpDetailMaterialStationInfo;
  indepMatlInfo?: IndepMatlInfo;
  model?: string;
  nozzleTemps?: number[];
  nozzleTargetTemps?: number[];
  camera?: 0 | 1;
  lidar?: 0 | 1;
}

export function serializeHttpDetail(state: PrinterState): HttpDetailPayload {
  const profile = PRINTER_PROFILES[state.model];
  const creator5 = isCreator5Series(state.model);
  const estimatedTimeSeconds =
    state.printJob.elapsedTimeSeconds + state.printJob.remainingTimeMinutes * 60;

  const detail: HttpDetailPayload = {
    autoShutdown: state.autoShutdown,
    autoShutdownTime: state.autoShutdownTime,
    cameraStreamUrl: profile.hasCamera
      ? creator5
        ? `http://${state.ipAddress}:8080/?action=stream`
        : `http://${state.ipAddress}:8080/stream`
      : '',
    chamberFanSpeed: state.fan.chamberFanSpeed,
    chamberTargetTemp: profile.emitsChamberSentinel ? -108 : state.temperature.chamberTarget,
    chamberTemp: profile.emitsChamberSentinel ? -108 : state.temperature.chamberCurrent,
    coolingFanSpeed: state.fan.coolingFanSpeed,
    coolingFanLeftSpeed: profile.hasIndependentDualNozzle ? state.fan.coolingLeftFanSpeed : 0,
    cumulativeFilament: state.cumulativeFilament,
    cumulativePrintTime: state.cumulativePrintTime,
    currentPrintSpeed: state.currentPrintSpeed,
    doorStatus: state.doorOpen ? 'open' : 'close',
    errorCode: state.errorCode,
    estimatedLeftLen: state.estimatedLeftLen,
    estimatedLeftWeight: state.estimatedLeftWeight,
    estimatedRightLen: state.estimatedRightLen,
    estimatedRightWeight: state.estimatedRightWeight,
    estimatedTime: estimatedTimeSeconds,
    externalFanStatus: state.fan.externalFanEnabled ? 'open' : 'close',
    fillAmount: state.fillAmount,
    firmwareVersion: state.firmwareVersion,
    flashRegisterCode: '',
    internalFanStatus: state.fan.internalFanEnabled ? 'open' : 'close',
    ipAddr: state.ipAddress,
    lightStatus: state.led.enabled ? 'open' : 'close',
    location: '',
    macAddr: state.macAddress,
    measure: `${profile.buildVolume.x}X${profile.buildVolume.y}X${profile.buildVolume.z}`,
    name: state.machineName,
    nozzleCnt: state.nozzleCount,
    nozzleModel: state.nozzleModel,
    nozzleStyle: creator5 ? 0 : 1,
    pid: PRINTER_PID[state.model] ?? 0,
    platTargetTemp: state.temperature.bedTarget,
    platTemp: state.temperature.bedCurrent,
    polarRegisterCode: '',
    printDuration: state.printJob.elapsedTimeSeconds,
    printFileName: state.printJob.currentFile ?? '',
    printFileThumbUrl: state.printJob.currentFile
      ? creator5
        ? `http://${state.ipAddress}:8898/getThum`
        : `http://${state.ipAddress}:8898/thumb/${state.printJob.currentFile}`
      : '',
    printLayer: state.printJob.currentLayer,
    printProgress: state.printJob.progress,
    printEta: state.printJob.formattedEta || '',
    formattedEta: state.printJob.formattedEta || '',
    jobTotalPrintTimeSeconds: state.printJob.totalPrintTimeSeconds,
    printSpeedAdjust: state.printSpeedAdjust,
    hasRightFilament: state.hasRightFilament,
    remainingDiskSpace: state.remainingDiskSpace,
    rightFilamentType: state.rightFilamentType,
    rightTargetTemp: creator5 ? (state.toolTargetTemps[0] ?? 0) : state.temperature.nozzleTarget,
    rightTemp: creator5 ? (state.toolTemps[0] ?? 0) : state.temperature.nozzleCurrent,
    status: mapMachineStatusToHttpDetailStatus(state.machineStatus),
    targetPrintLayer: state.printJob.totalLayers,
    tvoc: state.tvoc,
    zAxisCompensation: state.zAxisCompensation,
  };

  // Creator 5 series /detail additions. The 4-head tool changer reports per-tool
  // temps through nozzleTemps/nozzleTargetTemps (rightTemp above mirrors tool 0
  // as the legacy alias). `model` is hardcoded in real firmware /detail output.
  if (creator5) {
    detail.model = profile.name;
    detail.nozzleTemps = [...state.toolTemps];
    detail.nozzleTargetTemps = [...state.toolTargetTemps];
    detail.camera = profile.hasCamera ? 1 : 0;
    detail.lidar = 0;
  }

  if (!profile.hasMaterialStation) {
    return detail;
  }

  // The material station block is shared by AD5X and the Creator 5 series, but
  // real Creator 5 firmware omits the AD5X-only extras: no hasMatlStation flag
  // (derive from slotCnt/slotInfos instead) and no leftTemp/indepMatlInfo IFS
  // fields.
  detail.matlStationInfo = {
    currentLoadSlot: state.materialStation.currentLoadSlot,
    currentSlot: state.materialStation.currentSlot,
    slotCnt: state.materialStation.slotCount,
    stateAction: 0,
    stateStep: 0,
    slotInfos: state.materialStation.slots.map((slot) => ({
      slotId: slot.slotId,
      hasFilament: slot.hasFilament,
      materialName: slot.materialName || 'PLA',
      materialColor: slot.materialColor,
    })),
  };

  if (!profile.hasIndependentDualNozzle) {
    return detail;
  }

  const currentSlot = state.materialStation.slots.find(
    (slot) => slot.slotId === state.materialStation.currentSlot
  );
  const indepMatlInfo: IndepMatlInfo = {
    materialColor: currentSlot?.materialColor || '',
    materialName: currentSlot?.materialName || 'PLA',
    stateAction: 0,
    stateStep: 0,
  };

  return {
    ...detail,
    hasMatlStation: true,
    hasLeftFilament: state.hasLeftFilament,
    leftFilamentType: state.leftFilamentType,
    leftTemp: state.temperature.leftNozzleCurrent,
    leftTargetTemp: state.temperature.leftNozzleTarget,
    indepMatlInfo,
  };
}
