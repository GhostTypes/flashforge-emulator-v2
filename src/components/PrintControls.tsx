/**
 * @fileoverview
 * Dedicated QA console for job/state regression testing.
 *
 * @packageDocumentation
 */

import { serializeHttpDetail } from '@shared/serializers/httpDetail';
import type {
  PrintJobStatus,
  PrinterScenario,
  PrinterState,
  ScenarioPreset,
} from '@shared/types/printer';
import { PRINTER_PROFILES, canStartNewPrint, isStickyTerminalState } from '@shared/types/printer';
import {
  Bot,
  ClipboardPaste,
  Copy,
  Flame,
  Layers,
  Lightbulb,
  Play,
  RefreshCw,
  Snowflake,
  Square,
  Thermometer,
  Timer,
  Wind,
  Wrench,
  XCircle,
} from 'lucide-react';
import { type FunctionComponent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { NumberInput } from './NumberInput';
import { Slider } from './Slider';

interface SimulationState {
  mode: 'auto' | 'manual';
  speed: number;
}

interface ScenarioDraftSlot {
  slotId: number;
  hasFilament: boolean;
  materialName: string;
  materialColor: string;
}

interface ScenarioDraft {
  machineStatus: PrintJobStatus;
  printJobStatus: PrintJobStatus;
  fileName: string;
  progressPercent: number;
  currentLayer: number;
  totalLayers: number;
  elapsedTimeSeconds: number;
  remainingTimeMinutes: number;
  totalPrintTimeSeconds: number;
  formattedEta: string;
  nozzleCurrent: number;
  nozzleTarget: number;
  leftNozzleCurrent: number;
  leftNozzleTarget: number;
  bedCurrent: number;
  bedTarget: number;
  chamberCurrent: number;
  chamberTarget: number;
  coolingFanSpeed: number;
  coolingLeftFanSpeed: number;
  chamberFanSpeed: number;
  externalFanEnabled: boolean;
  internalFanEnabled: boolean;
  ledEnabled: boolean;
  estimatedRightLen: number;
  estimatedRightWeight: number;
  estimatedLeftLen: number;
  estimatedLeftWeight: number;
  hasLeftFilament: boolean;
  hasRightFilament: boolean;
  leftFilamentType: string;
  rightFilamentType: string;
  errorCode: string;
  tvoc: number;
  currentSlot: number;
  currentLoadSlot: number;
  slots: ScenarioDraftSlot[];
}

interface PrintControlsProps {
  state: PrinterState;
  scenarioPresets: readonly ScenarioPreset[];
  onCancelPrint: () => Promise<void>;
  onClearCompletedState: () => Promise<void>;
  onApplyScenarioPreset: (presetId: string) => Promise<void>;
  onApplyScenario: (scenario: PrinterScenario) => Promise<void>;
  onGetScenarioSnapshot: () => Promise<PrinterScenario>;
}

const STATUS_OPTIONS: readonly PrintJobStatus[] = [
  'idle',
  'ready',
  'busy',
  'heating',
  'printing',
  'pausing',
  'paused',
  'completed',
  'cancelled',
  'error',
] as const;

function createDraftFromState(state: PrinterState): ScenarioDraft {
  return {
    machineStatus: state.machineStatus,
    printJobStatus: state.printJob.status,
    fileName: state.printJob.currentFile ?? '',
    progressPercent: Math.round(state.printJob.progress * 100),
    currentLayer: state.printJob.currentLayer,
    totalLayers: state.printJob.totalLayers,
    elapsedTimeSeconds: Math.round(state.printJob.elapsedTimeSeconds),
    remainingTimeMinutes: state.printJob.remainingTimeMinutes,
    totalPrintTimeSeconds: state.printJob.totalPrintTimeSeconds,
    formattedEta: state.printJob.formattedEta,
    nozzleCurrent: Math.round(state.temperature.nozzleCurrent),
    nozzleTarget: Math.round(state.temperature.nozzleTarget),
    leftNozzleCurrent: Math.round(state.temperature.leftNozzleCurrent),
    leftNozzleTarget: Math.round(state.temperature.leftNozzleTarget),
    bedCurrent: Math.round(state.temperature.bedCurrent),
    bedTarget: Math.round(state.temperature.bedTarget),
    chamberCurrent: Math.round(state.temperature.chamberCurrent),
    chamberTarget: Math.round(state.temperature.chamberTarget),
    coolingFanSpeed: state.fan.coolingFanSpeed,
    coolingLeftFanSpeed: state.fan.coolingLeftFanSpeed,
    chamberFanSpeed: state.fan.chamberFanSpeed,
    externalFanEnabled: state.fan.externalFanEnabled,
    internalFanEnabled: state.fan.internalFanEnabled,
    ledEnabled: state.led.enabled,
    estimatedRightLen: state.estimatedRightLen,
    estimatedRightWeight: state.estimatedRightWeight,
    estimatedLeftLen: state.estimatedLeftLen,
    estimatedLeftWeight: state.estimatedLeftWeight,
    hasLeftFilament: state.hasLeftFilament,
    hasRightFilament: state.hasRightFilament,
    leftFilamentType: state.leftFilamentType,
    rightFilamentType: state.rightFilamentType,
    errorCode: state.errorCode,
    tvoc: state.tvoc,
    currentSlot: state.materialStation.currentSlot,
    currentLoadSlot: state.materialStation.currentLoadSlot,
    slots: state.materialStation.slots.map((slot) => ({
      slotId: slot.slotId,
      hasFilament: slot.hasFilament,
      materialName: slot.materialName,
      materialColor: slot.materialColor,
    })),
  };
}

function createDraftFromScenario(scenario: PrinterScenario, fallback: PrinterState): ScenarioDraft {
  const base = createDraftFromState(fallback);
  return {
    ...base,
    machineStatus: scenario.machineStatus ?? base.machineStatus,
    printJobStatus: scenario.printJobStatus ?? base.printJobStatus,
    fileName: scenario.fileName ?? base.fileName,
    progressPercent: scenario.progressPercent ?? base.progressPercent,
    currentLayer: scenario.currentLayer ?? base.currentLayer,
    totalLayers: scenario.totalLayers ?? base.totalLayers,
    elapsedTimeSeconds: scenario.elapsedTimeSeconds ?? base.elapsedTimeSeconds,
    remainingTimeMinutes: scenario.remainingTimeMinutes ?? base.remainingTimeMinutes,
    totalPrintTimeSeconds: scenario.totalPrintTimeSeconds ?? base.totalPrintTimeSeconds,
    formattedEta: scenario.formattedEta ?? base.formattedEta,
    nozzleCurrent: scenario.temperatures?.nozzleCurrent ?? base.nozzleCurrent,
    nozzleTarget: scenario.temperatures?.nozzleTarget ?? base.nozzleTarget,
    leftNozzleCurrent: scenario.temperatures?.leftNozzleCurrent ?? base.leftNozzleCurrent,
    leftNozzleTarget: scenario.temperatures?.leftNozzleTarget ?? base.leftNozzleTarget,
    bedCurrent: scenario.temperatures?.bedCurrent ?? base.bedCurrent,
    bedTarget: scenario.temperatures?.bedTarget ?? base.bedTarget,
    chamberCurrent: scenario.temperatures?.chamberCurrent ?? base.chamberCurrent,
    chamberTarget: scenario.temperatures?.chamberTarget ?? base.chamberTarget,
    coolingFanSpeed: scenario.fan?.coolingFanSpeed ?? base.coolingFanSpeed,
    coolingLeftFanSpeed: scenario.fan?.coolingLeftFanSpeed ?? base.coolingLeftFanSpeed,
    chamberFanSpeed: scenario.fan?.chamberFanSpeed ?? base.chamberFanSpeed,
    externalFanEnabled: scenario.fan?.externalFanEnabled ?? base.externalFanEnabled,
    internalFanEnabled: scenario.fan?.internalFanEnabled ?? base.internalFanEnabled,
    ledEnabled: scenario.ledEnabled ?? base.ledEnabled,
    estimatedRightLen: scenario.estimatedRightLen ?? base.estimatedRightLen,
    estimatedRightWeight: scenario.estimatedRightWeight ?? base.estimatedRightWeight,
    estimatedLeftLen: scenario.estimatedLeftLen ?? base.estimatedLeftLen,
    estimatedLeftWeight: scenario.estimatedLeftWeight ?? base.estimatedLeftWeight,
    hasLeftFilament: scenario.hasLeftFilament ?? base.hasLeftFilament,
    hasRightFilament: scenario.hasRightFilament ?? base.hasRightFilament,
    leftFilamentType: scenario.leftFilamentType ?? base.leftFilamentType,
    rightFilamentType: scenario.rightFilamentType ?? base.rightFilamentType,
    errorCode: scenario.errorCode ?? base.errorCode,
    tvoc: scenario.tvoc ?? base.tvoc,
    currentSlot: scenario.materialStation?.currentSlot ?? base.currentSlot,
    currentLoadSlot: scenario.materialStation?.currentLoadSlot ?? base.currentLoadSlot,
    slots:
      scenario.materialStation?.slots?.map((slot) => ({
        slotId: slot.slotId,
        hasFilament: slot.hasFilament ?? false,
        materialName: slot.materialName ?? '',
        materialColor: slot.materialColor ?? '#000000',
      })) ?? base.slots,
  };
}

function toScenario(draft: ScenarioDraft): PrinterScenario {
  return {
    machineStatus: draft.machineStatus,
    printJobStatus: draft.printJobStatus,
    fileName: draft.fileName.trim() || null,
    progressPercent: draft.progressPercent,
    currentLayer: draft.currentLayer,
    totalLayers: draft.totalLayers,
    elapsedTimeSeconds: draft.elapsedTimeSeconds,
    remainingTimeMinutes: draft.remainingTimeMinutes,
    totalPrintTimeSeconds: draft.totalPrintTimeSeconds,
    formattedEta: draft.formattedEta.trim(),
    temperatures: {
      nozzleCurrent: draft.nozzleCurrent,
      nozzleTarget: draft.nozzleTarget,
      leftNozzleCurrent: draft.leftNozzleCurrent,
      leftNozzleTarget: draft.leftNozzleTarget,
      bedCurrent: draft.bedCurrent,
      bedTarget: draft.bedTarget,
      chamberCurrent: draft.chamberCurrent,
      chamberTarget: draft.chamberTarget,
    },
    fan: {
      coolingFanSpeed: draft.coolingFanSpeed,
      coolingLeftFanSpeed: draft.coolingLeftFanSpeed,
      chamberFanSpeed: draft.chamberFanSpeed,
      externalFanEnabled: draft.externalFanEnabled,
      internalFanEnabled: draft.internalFanEnabled,
    },
    ledEnabled: draft.ledEnabled,
    estimatedRightLen: draft.estimatedRightLen,
    estimatedRightWeight: draft.estimatedRightWeight,
    estimatedLeftLen: draft.estimatedLeftLen,
    estimatedLeftWeight: draft.estimatedLeftWeight,
    hasLeftFilament: draft.hasLeftFilament,
    hasRightFilament: draft.hasRightFilament,
    leftFilamentType: draft.leftFilamentType,
    rightFilamentType: draft.rightFilamentType,
    errorCode: draft.errorCode,
    tvoc: draft.tvoc,
    materialStation: {
      currentSlot: draft.currentSlot,
      currentLoadSlot: draft.currentLoadSlot,
      slots: draft.slots,
    },
  };
}

export const PrintControls: FunctionComponent<PrintControlsProps> = ({
  state,
  scenarioPresets,
  onCancelPrint,
  onClearCompletedState,
  onApplyScenarioPreset,
  onApplyScenario,
  onGetScenarioSnapshot,
}) => {
  const [simulation, setSimulation] = useState<SimulationState>({ mode: 'auto', speed: 100 });
  const [draft, setDraft] = useState<ScenarioDraft>(() => createDraftFromState(state));
  const [jsonEditor, setJsonEditor] = useState('');
  const [jsonMessage, setJsonMessage] = useState<string | null>(null);
  const [jumpPercent, setJumpPercent] = useState(50);
  const lastModelRef = useRef(state.model);

  useEffect(() => {
    void window.api
      .getSimulationMode()
      .then(setSimulation)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (lastModelRef.current === state.model) {
      return;
    }

    lastModelRef.current = state.model;
    setDraft(createDraftFromState(state));
    setJsonMessage(null);
  }, [state]);

  const canStartJob = canStartNewPrint(state.machineStatus);
  const stickyTerminalState = isStickyTerminalState(state.machineStatus);

  const liveDetail = useMemo(() => serializeHttpDetail(state), [state]);
  const liveDetailJson = useMemo(() => JSON.stringify(liveDetail, null, 2), [liveDetail]);

  const applyPreset = async (presetId: string) => {
    await onApplyScenarioPreset(presetId);
    const snapshot = await onGetScenarioSnapshot();
    setDraft(createDraftFromScenario(snapshot, state));
  };

  const applyDraft = async () => {
    await onApplyScenario(toScenario(draft));
    setJsonMessage('Manual state injection applied.');
  };

  const syncFromLiveState = () => {
    setDraft(createDraftFromState(state));
    setJsonMessage('Loaded live state into the editor.');
  };

  const runAutoLifecycle = async () => {
    if (!canStartNewPrint(state.machineStatus)) {
      setJsonMessage(
        isStickyTerminalState(state.machineStatus)
          ? 'Clear to Ready before starting another job.'
          : 'A new job can only start from idle or ready.'
      );
      return;
    }

    const totalPrintTimeSeconds = Math.max(
      draft.totalPrintTimeSeconds,
      draft.elapsedTimeSeconds + draft.remainingTimeMinutes * 60,
      60
    );
    const fileName = draft.fileName.trim() || state.files[0]?.name || 'qa-regression-test.gcode';

    await window.api.setSimulationMode('auto', simulation.speed);
    setSimulation((current) => ({ ...current, mode: 'auto' }));
    const started = await window.api.startPrint(fileName, totalPrintTimeSeconds);
    if (!started) {
      setJsonMessage('Auto lifecycle was blocked because the printer is not idle or ready.');
      return;
    }
    setJsonMessage(
      'Auto lifecycle started. The completed state will remain visible until cleared.'
    );
  };

  const jumpToPercent = async () => {
    const jumped = await window.api.jumpPrintProgress(jumpPercent);
    setJsonMessage(
      jumped
        ? `Jumped to ${jumpPercent}% — elapsed, remaining, ETA, and layers were recomputed.`
        : 'Jump blocked: start a job first, and clear sticky terminal states (completed/cancelled/error) before jumping.'
    );
  };

  const loadJsonFromLiveState = async () => {
    const snapshot = await onGetScenarioSnapshot();
    setJsonEditor(JSON.stringify(snapshot, null, 2));
    setJsonMessage('Loaded current scenario JSON.');
  };

  const copyJsonToClipboard = async () => {
    const snapshot = await onGetScenarioSnapshot();
    const payload = JSON.stringify(snapshot, null, 2);
    setJsonEditor(payload);
    await navigator.clipboard.writeText(payload);
    setJsonMessage('Scenario JSON copied to the clipboard.');
  };

  const applyJson = async () => {
    try {
      const parsed = JSON.parse(jsonEditor) as PrinterScenario;
      await onApplyScenario(parsed);
      setDraft(createDraftFromScenario(parsed, state));
      setJsonMessage('Scenario JSON applied.');
    } catch (error) {
      setJsonMessage(error instanceof Error ? error.message : 'Invalid scenario JSON');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-xl font-medium text-neutral-100">QA Console</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Explicit regression surface for ETA, elapsed time, state transitions, cooldown, and AD5X
          behavior
        </p>
      </div>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
              <Bot className="h-4 w-4 text-primary-500" />
              Lifecycle Control
            </div>
            <p className="mt-2 max-w-2xl text-sm text-neutral-500">
              Auto mode drives a realistic heating -&gt; printing -&gt; completed -&gt; cooling
              lifecycle. Manual mode leaves every field under direct control.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ModeButton
              active={simulation.mode === 'auto'}
              label="Auto Simulation"
              onClick={async () => {
                await window.api.setSimulationMode('auto', simulation.speed);
                setSimulation((current) => ({ ...current, mode: 'auto' }));
              }}
            />
            <ModeButton
              active={simulation.mode === 'manual'}
              label="Manual Injection"
              onClick={async () => {
                await window.api.setSimulationMode('manual', simulation.speed);
                setSimulation((current) => ({ ...current, mode: 'manual' }));
              }}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto_auto]">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
            <div className="mb-2 flex items-center justify-between text-sm text-neutral-400">
              <span>Simulation Speed</span>
              <span className="font-medium text-neutral-100">{simulation.speed}x</span>
            </div>
            <Slider
              min={1}
              max={500}
              value={[simulation.speed]}
              onValueChange={([value]) => {
                if (value === undefined) return;
                setSimulation((current) => ({ ...current, speed: value }));
                void window.api.setSimulationMode(simulation.mode, value);
              }}
              className="mt-3"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-neutral-500">Jump to %</span>
              <span className="text-sm text-neutral-500">fast-forward</span>
            </div>
            <NumberInput
              value={jumpPercent}
              min={0}
              max={100}
              onValueChange={(value) => setJumpPercent(Math.round(value) || 0)}
              className="w-20"
            />
            <ActionButton icon={Timer} label="Jump" onClick={() => void jumpToPercent()} />
          </div>

          <ActionButton
            icon={Play}
            label="Run Auto Lifecycle"
            onClick={() => void runAutoLifecycle()}
            disabled={!canStartJob}
          />
          <ActionButton icon={Square} label="Pause" onClick={() => void window.api.pausePrint()} />
          <ActionButton
            icon={RefreshCw}
            label="Resume"
            onClick={() => void window.api.resumePrint()}
          />
          <ActionButton icon={XCircle} label="Cancel" danger onClick={() => void onCancelPrint()} />
        </div>

        {!canStartJob && (
          <p className="mt-4 text-sm text-warning">
            {stickyTerminalState
              ? 'Completed, cancelled, and error are sticky terminal states. Use Clear to Ready before starting another job.'
              : 'A new job can only start while the printer is idle or ready.'}
          </p>
        )}

        <div className="mt-4 grid gap-4 xl:grid-cols-[repeat(4,minmax(0,1fr))]">
          <ActionCard icon={Layers} label="Machine" value={state.machineStatus} />
          <ActionCard icon={Wrench} label="Job" value={state.printJob.status} />
          <ActionCard
            icon={Timer}
            label="Elapsed"
            value={`${Math.round(state.printJob.elapsedTimeSeconds)} sec`}
          />
          <ActionCard
            icon={Snowflake}
            label="ETA"
            value={state.printJob.formattedEta || `${state.printJob.remainingTimeMinutes} min`}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
          <Play className="h-4 w-4 text-primary-500" />
          Scenario Presets
        </div>
        <p className="mt-2 text-sm text-neutral-500">
          Apply named states that mirror the paths the app's polling, WebUI, and notification
          monitors observe.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {scenarioPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => void applyPreset(preset.id)}
              className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 text-left transition-colors hover:border-primary-500/40 hover:bg-neutral-950"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-100">{preset.label}</span>
                <span className="rounded-full bg-neutral-800 px-2 py-1 text-[11px] uppercase tracking-wide text-neutral-400">
                  {preset.id}
                </span>
              </div>
              <p className="mt-2 text-sm text-neutral-500">{preset.description}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
            <Timer className="h-4 w-4 text-primary-500" />
            Job / State Injection
          </div>
          <p className="mt-2 text-sm text-neutral-500">
            Units are explicit: elapsed + total duration in seconds, remaining in minutes, firmware
            ETA as `HH:MM`.
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            Editor values stay in draft form until you click `Apply Injection`. The live transport
            preview below always reflects the current emulator state.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <SelectField
              label="Machine Status"
              value={draft.machineStatus}
              options={STATUS_OPTIONS}
              onChange={(value) =>
                setDraft((current) => ({ ...current, machineStatus: value as PrintJobStatus }))
              }
            />
            <SelectField
              label="Print Job Status"
              value={draft.printJobStatus}
              options={STATUS_OPTIONS}
              onChange={(value) =>
                setDraft((current) => ({ ...current, printJobStatus: value as PrintJobStatus }))
              }
            />

            <TextField
              label="File Name"
              value={draft.fileName}
              onChange={(value) => setDraft((current) => ({ ...current, fileName: value }))}
            />
            <TextField
              label="Firmware ETA"
              value={draft.formattedEta}
              placeholder="04:48"
              onChange={(value) => setDraft((current) => ({ ...current, formattedEta: value }))}
            />

            <NumberField
              label="Progress (%)"
              value={draft.progressPercent}
              min={0}
              max={100}
              onChange={(value) => setDraft((current) => ({ ...current, progressPercent: value }))}
            />
            <div>
              <div className="mb-2 block text-sm text-neutral-400">Progress Slider</div>
              <Slider
                min={0}
                max={100}
                value={[draft.progressPercent]}
                onValueChange={([value]) => {
                  if (value === undefined) return;
                  setDraft((current) => ({ ...current, progressPercent: value }));
                }}
                className="mt-4"
              />
            </div>

            <NumberField
              label="Current Layer"
              value={draft.currentLayer}
              min={0}
              onChange={(value) => setDraft((current) => ({ ...current, currentLayer: value }))}
            />
            <NumberField
              label="Total Layers"
              value={draft.totalLayers}
              min={0}
              onChange={(value) => setDraft((current) => ({ ...current, totalLayers: value }))}
            />
            <NumberField
              label="Elapsed (sec)"
              value={draft.elapsedTimeSeconds}
              min={0}
              onChange={(value) =>
                setDraft((current) => ({ ...current, elapsedTimeSeconds: value }))
              }
            />
            <NumberField
              label="Remaining (min)"
              value={draft.remainingTimeMinutes}
              min={0}
              onChange={(value) =>
                setDraft((current) => ({ ...current, remainingTimeMinutes: value }))
              }
            />
            <NumberField
              label="Total Duration (sec)"
              value={draft.totalPrintTimeSeconds}
              min={0}
              onChange={(value) =>
                setDraft((current) => ({ ...current, totalPrintTimeSeconds: value }))
              }
            />
            <TextField
              label="Error Code"
              value={draft.errorCode}
              placeholder="Optional"
              onChange={(value) => setDraft((current) => ({ ...current, errorCode: value }))}
            />
          </div>

          <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
            <div className="text-xs uppercase tracking-wide text-neutral-500">
              Live /detail.detail Payload
            </div>
            <p className="mt-2 text-sm text-neutral-500">
              This is the live payload produced by the same serializer as `POST /detail`. Unsaved
              editor changes are not shown here until you apply them.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <PreviewField label="/detail.detail.status" value={liveDetail.status} />
              <PreviewField
                label="/detail.detail.estimatedTime"
                value={`${liveDetail.estimatedTime} sec`}
              />
              <PreviewField
                label="/detail.detail.printDuration"
                value={`${liveDetail.printDuration} sec`}
              />
              <PreviewField
                label="/detail.detail.printEta"
                value={liveDetail.printEta === '' ? '""' : liveDetail.printEta}
              />
            </div>
            <pre className="mt-4 max-h-80 overflow-auto rounded-lg border border-neutral-800 bg-black/20 p-4 text-xs text-neutral-200">
              <code>{liveDetailJson}</code>
            </pre>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton icon={Wrench} label="Apply Injection" onClick={() => void applyDraft()} />
            <ActionButton icon={RefreshCw} label="Load Live State" onClick={syncFromLiveState} />
            <ActionButton
              icon={Square}
              label="Clear to Ready"
              onClick={() => void onClearCompletedState()}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
            <Thermometer className="h-4 w-4 text-primary-500" />
            Thermal / Fan / Lighting
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <TemperaturePair
              label="Nozzle"
              current={draft.nozzleCurrent}
              target={draft.nozzleTarget}
              onCurrentChange={(value) =>
                setDraft((current) => ({ ...current, nozzleCurrent: value }))
              }
              onTargetChange={(value) =>
                setDraft((current) => ({ ...current, nozzleTarget: value }))
              }
            />
            <TemperaturePair
              label="Bed"
              current={draft.bedCurrent}
              target={draft.bedTarget}
              onCurrentChange={(value) =>
                setDraft((current) => ({ ...current, bedCurrent: value }))
              }
              onTargetChange={(value) => setDraft((current) => ({ ...current, bedTarget: value }))}
            />
            <TemperaturePair
              label="Chamber"
              current={draft.chamberCurrent}
              target={draft.chamberTarget}
              onCurrentChange={(value) =>
                setDraft((current) => ({ ...current, chamberCurrent: value }))
              }
              onTargetChange={(value) =>
                setDraft((current) => ({ ...current, chamberTarget: value }))
              }
            />
            {PRINTER_PROFILES[state.model].hasFiltration && (
              <NumberField
                label="TVOC Level"
                value={draft.tvoc}
                min={0}
                max={500}
                onChange={(value) => setDraft((current) => ({ ...current, tvoc: value }))}
              />
            )}
            {state.materialStation.hasMatlStation && (
              <TemperaturePair
                label="Left Nozzle"
                current={draft.leftNozzleCurrent}
                target={draft.leftNozzleTarget}
                onCurrentChange={(value) =>
                  setDraft((current) => ({ ...current, leftNozzleCurrent: value }))
                }
                onTargetChange={(value) =>
                  setDraft((current) => ({ ...current, leftNozzleTarget: value }))
                }
              />
            )}

            <NumberField
              label="Cooling Fan"
              value={draft.coolingFanSpeed}
              min={0}
              max={100}
              onChange={(value) => setDraft((current) => ({ ...current, coolingFanSpeed: value }))}
            />
            <NumberField
              label="Chamber Fan"
              value={draft.chamberFanSpeed}
              min={0}
              max={100}
              onChange={(value) => setDraft((current) => ({ ...current, chamberFanSpeed: value }))}
            />
            {state.materialStation.hasMatlStation && (
              <NumberField
                label="Left Cooling Fan"
                value={draft.coolingLeftFanSpeed}
                min={0}
                max={100}
                onChange={(value) =>
                  setDraft((current) => ({ ...current, coolingLeftFanSpeed: value }))
                }
              />
            )}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <ToggleCard
              icon={Lightbulb}
              label="LED"
              checked={draft.ledEnabled}
              onToggle={() =>
                setDraft((current) => ({ ...current, ledEnabled: !current.ledEnabled }))
              }
            />
            <ToggleCard
              icon={Wind}
              label="Internal Fan"
              checked={draft.internalFanEnabled}
              onToggle={() =>
                setDraft((current) => ({
                  ...current,
                  internalFanEnabled: !current.internalFanEnabled,
                }))
              }
            />
            <ToggleCard
              icon={Flame}
              label="External Fan"
              checked={draft.externalFanEnabled}
              onToggle={() =>
                setDraft((current) => ({
                  ...current,
                  externalFanEnabled: !current.externalFanEnabled,
                }))
              }
            />
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
            <Layers className="h-4 w-4 text-primary-500" />
            Filament / Job Metadata
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <NumberField
              label="Right Filament Length (mm)"
              value={draft.estimatedRightLen}
              min={0}
              onChange={(value) =>
                setDraft((current) => ({ ...current, estimatedRightLen: value }))
              }
            />
            <NumberField
              label="Right Filament Weight (g)"
              value={draft.estimatedRightWeight}
              min={0}
              onChange={(value) =>
                setDraft((current) => ({ ...current, estimatedRightWeight: value }))
              }
            />
            <NumberField
              label="Left Filament Length (mm)"
              value={draft.estimatedLeftLen}
              min={0}
              onChange={(value) => setDraft((current) => ({ ...current, estimatedLeftLen: value }))}
            />
            <NumberField
              label="Left Filament Weight (g)"
              value={draft.estimatedLeftWeight}
              min={0}
              onChange={(value) =>
                setDraft((current) => ({ ...current, estimatedLeftWeight: value }))
              }
            />
            <TextField
              label="Right Filament Type"
              value={draft.rightFilamentType}
              onChange={(value) =>
                setDraft((current) => ({ ...current, rightFilamentType: value }))
              }
            />
            <TextField
              label="Left Filament Type"
              value={draft.leftFilamentType}
              onChange={(value) => setDraft((current) => ({ ...current, leftFilamentType: value }))}
            />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <ToggleCard
              icon={Layers}
              label="Right Filament Present"
              checked={draft.hasRightFilament}
              onToggle={() =>
                setDraft((current) => ({ ...current, hasRightFilament: !current.hasRightFilament }))
              }
            />
            <ToggleCard
              icon={Layers}
              label="Left Filament Present"
              checked={draft.hasLeftFilament}
              onToggle={() =>
                setDraft((current) => ({ ...current, hasLeftFilament: !current.hasLeftFilament }))
              }
            />
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
            <ClipboardPaste className="h-4 w-4 text-primary-500" />
            Scenario Import / Export
          </div>
          <p className="mt-2 text-sm text-neutral-500">
            Save repeatable regression setups or paste a captured scenario directly back into the
            emulator.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <ActionButton
              icon={RefreshCw}
              label="Load Live JSON"
              onClick={() => void loadJsonFromLiveState()}
            />
            <ActionButton
              icon={Copy}
              label="Copy Live JSON"
              onClick={() => void copyJsonToClipboard()}
            />
            <ActionButton
              icon={ClipboardPaste}
              label="Apply JSON"
              onClick={() => void applyJson()}
            />
          </div>

          <textarea
            value={jsonEditor}
            onChange={(event) => setJsonEditor(event.target.value)}
            placeholder="Paste PrinterScenario JSON here"
            className="mt-4 h-72 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 font-mono text-xs text-neutral-200 outline-none placeholder:text-neutral-600"
          />

          {jsonMessage && <p className="mt-3 text-sm text-neutral-400">{jsonMessage}</p>}
        </section>
      </div>

      {state.materialStation.hasMatlStation && (
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
            <Snowflake className="h-4 w-4 text-primary-500" />
            AD5X / Material Station
          </div>
          <p className="mt-2 text-sm text-neutral-500">
            Exercise current slot selection, load slot changes, and per-slot filament metadata
            without hidden APIs.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <NumberField
              label="Current Active Slot"
              value={draft.currentSlot}
              min={0}
              max={4}
              onChange={(value) => setDraft((current) => ({ ...current, currentSlot: value }))}
            />
            <NumberField
              label="Current Load Slot"
              value={draft.currentLoadSlot}
              min={0}
              max={4}
              onChange={(value) => setDraft((current) => ({ ...current, currentLoadSlot: value }))}
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {draft.slots.map((slot) => (
              <div
                key={slot.slotId}
                className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-100">Slot {slot.slotId}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        currentSlot: slot.slotId,
                      }))
                    }
                    className={[
                      'rounded-full px-2 py-1 text-[11px] uppercase tracking-wide',
                      draft.currentSlot === slot.slotId
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'bg-neutral-800 text-neutral-500',
                    ].join(' ')}
                  >
                    Active
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Has filament</span>
                  <ToggleSwitch
                    checked={slot.hasFilament}
                    onToggle={() =>
                      setDraft((current) => ({
                        ...current,
                        slots: current.slots.map((candidate) =>
                          candidate.slotId === slot.slotId
                            ? { ...candidate, hasFilament: !candidate.hasFilament }
                            : candidate
                        ),
                      }))
                    }
                  />
                </div>

                <div className="mt-3 space-y-3">
                  <TextField
                    label="Material"
                    value={slot.materialName}
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        slots: current.slots.map((candidate) =>
                          candidate.slotId === slot.slotId
                            ? { ...candidate, materialName: value }
                            : candidate
                        ),
                      }))
                    }
                  />
                  <label className="block text-sm text-neutral-400">
                    Color
                    <input
                      type="color"
                      value={slot.materialColor || '#000000'}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          slots: current.slots.map((candidate) =>
                            candidate.slotId === slot.slotId
                              ? { ...candidate, materialColor: event.target.value }
                              : candidate
                          ),
                        }))
                      }
                      className="mt-2 h-10 w-full rounded-lg border border-neutral-800 bg-neutral-950/60 p-1"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {jsonMessage && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-400">
          {jsonMessage}
        </div>
      )}
    </div>
  );
};

interface ActionButtonProps {
  icon: typeof Play;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
        disabled
          ? 'cursor-not-allowed border border-neutral-800 bg-neutral-900 text-neutral-600'
          : danger
            ? 'border border-error/30 bg-error/10 text-error hover:bg-error/20'
            : 'border border-neutral-700 bg-neutral-950/60 text-neutral-200 hover:border-primary-500/40 hover:bg-neutral-950',
      ].join(' ')}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary-500 text-white'
          : 'bg-neutral-800 text-neutral-400 hover:text-neutral-100',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function ActionCard({
  icon: Icon,
  label,
  value,
}: { icon: typeof Play; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-neutral-500">{label}</span>
        <Icon className="h-4 w-4 text-primary-500" />
      </div>
      <div className="mt-3 text-lg font-medium text-neutral-100">{value}</div>
    </div>
  );
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-black/20 p-3">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-2 font-mono text-sm text-neutral-100">{value}</div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm text-neutral-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-neutral-100 outline-none"
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

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm text-neutral-400">
      {label}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-neutral-100 outline-none placeholder:text-neutral-600"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const inputId = useId();

  return (
    <div className="block text-sm text-neutral-400">
      <label htmlFor={inputId}>{label}</label>
      <NumberInput
        id={inputId}
        value={value}
        min={min}
        max={max}
        onValueChange={(next) => onChange(Math.round(next) || 0)}
        className="mt-2 w-full"
      />
    </div>
  );
}

function TemperaturePair({
  label,
  current,
  target,
  onCurrentChange,
  onTargetChange,
}: {
  label: string;
  current: number;
  target: number;
  onCurrentChange: (value: number) => void;
  onTargetChange: (value: number) => void;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
      <div className="text-sm font-medium text-neutral-100">{label}</div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <NumberField label="Current" value={current} onChange={onCurrentChange} />
        <NumberField label="Target" value={target} onChange={onTargetChange} />
      </div>
    </div>
  );
}

function ToggleCard({
  icon: Icon,
  label,
  checked,
  onToggle,
}: {
  icon: typeof Play;
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-neutral-100">
        <Icon className="h-4 w-4 text-primary-500" />
        {label}
      </div>
      <ToggleSwitch checked={checked} onToggle={onToggle} />
    </div>
  );
}

function ToggleSwitch({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-primary-500' : 'bg-neutral-700',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  );
}
