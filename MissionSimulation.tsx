/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  MissionDesign,
  MissionAnalysis,
  SimulationTelemetry,
  AnomalyChoice
} from '../types';
import { MISSION_SCENARIOS, ORBIT_PRESETS, PLAYER_ROLES } from '../missionData';
import { simulateStep } from '../rules';
import { sounds } from '../audio';
import { SpacecraftCanvas } from './SpacecraftCanvas';
import {
  Play,
  Pause,
  FastForward,
  AlertTriangle,
  Zap,
  Radio,
  Sparkles,
  Heart,
  RotateCcw,
  Flag,
  Activity,
  Compass
} from 'lucide-react';

interface MissionSimulationProps {
  design: MissionDesign;
  analysis: MissionAnalysis;
  onCompleteSimulation: (finalTelemetry: SimulationTelemetry) => void;
  onAbortSimulation: () => void;
  onPause: () => void;
}

export const MissionSimulation: React.FC<MissionSimulationProps> = ({
  design,
  analysis,
  onCompleteSimulation,
  onAbortSimulation,
  onPause
}) => {
  const scenario = MISSION_SCENARIOS.find(s => s.id === design.scenarioId) || MISSION_SCENARIOS[0];
  const orbit = ORBIT_PRESETS.find(o => o.id === design.orbitId) || ORBIT_PRESETS[0];

  // Simulation State
  const [telemetry, setTelemetry] = useState<SimulationTelemetry>({
    simDay: 1.0,
    orbitProgress: 0.0,
    trueAnomalyDeg: 0,
    altitudeKm: orbit.altitudeKm,
    velocityKms: 7.8,
    inEclipse: false,
    solarFluxWm2: Math.round(1361 / (scenario.solarDistanceAU * scenario.solarDistanceAU)),
    batteryLevelPct: 100,
    dataBufferGb: 0,
    maxDataBufferGb: 1000,
    cumulativeScienceCollected: Math.round(analysis.rawScienceScore * 0.25),
    spacecraftHealthPct: 100,
    groundStationInContact: true,
    downlinkActive: false,
    totalDataDownlinkedGb: 0,
    currentEvent: null,
    resolvedAnomalies: [],
    eventHistory: [
      {
        day: 1,
        text: 'Spacecraft separation confirmed. Solar arrays deployed and telemetry acquired.',
        type: 'success'
      }
    ]
  });

  const [timeMultiplier, setTimeMultiplier] = useState<number>(5); // 1x, 5x, 20x, 100x
  const [isSimPaused, setIsSimPaused] = useState<boolean>(false);
  const [simPhase, setSimPhase] = useState<'launch' | 'orbit'>('orbit');

  // Simulation tick loop
  useEffect(() => {
    if (isSimPaused || telemetry.currentEvent) return;

    const interval = setInterval(() => {
      // Advance simulation
      // Base step in days: at 60ms interval, 1x speed is ~0.02 days/sec, 100x is ~2 days/sec
      const dtDays = (0.015 * timeMultiplier);

      setTelemetry(prev => {
        const next = simulateStep(prev, design, analysis, dtDays);

        // Play periodic sound on downlink pass
        if (next.downlinkActive && !prev.downlinkActive) {
          sounds.playTelemetryPing();
        }

        // Anomaly alert sound
        if (next.currentEvent && !prev.currentEvent) {
          sounds.playAlarm();
        }

        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isSimPaused, timeMultiplier, design, analysis, telemetry.currentEvent]);

  // Handle tactical anomaly resolution choice
  const handleResolveAnomaly = (choice: AnomalyChoice) => {
    sounds.playSelect();
    setTelemetry(prev => {
      if (!prev.currentEvent) return prev;

      const updatedHistory = [
        {
          day: Math.floor(prev.simDay),
          text: `ANOMALY RESOLVED: Selected "${choice.text}" (${PLAYER_ROLES.find(r => r.id === choice.role)?.name}).`,
          type: 'info' as const
        },
        ...prev.eventHistory
      ];

      const newHealth = Math.min(100, Math.max(10, prev.spacecraftHealthPct + (choice.healthImpact || 0)));
      const newScience = prev.cumulativeScienceCollected + (choice.scienceImpact || 0);

      return {
        ...prev,
        spacecraftHealthPct: newHealth,
        cumulativeScienceCollected: Math.max(0, newScience),
        resolvedAnomalies: [...prev.resolvedAnomalies, prev.currentEvent.id],
        currentEvent: null,
        eventHistory: updatedHistory.slice(0, 20)
      };
    });
  };

  const scienceTarget = scenario.minRequiredScience;
  const scienceProgressPct = Math.min(100, Math.round((telemetry.cumulativeScienceCollected / scienceTarget) * 100));

  return (
    <div
      className="relative w-full h-screen overflow-hidden select-none bg-slate-950 font-sans"
      data-testid="mission-simulation-view"
    >
      {/* 3D Orbit Viewport */}
      <div className="absolute inset-0 z-0">
        <SpacecraftCanvas
          viewMode="orbit"
          targetBody={scenario.targetBody}
          explodedAmount={0}
          orbitProgress={telemetry.orbitProgress}
          inEclipse={telemetry.inEclipse}
        />
      </div>

      {/* Perimeter Status Clusters (Low Occlusion HUD as per guidelines) */}
      <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between z-10">
        {/* Top Bar: Mission Overview & Utility Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pointer-events-auto">
          {/* Top-Left: Mission ID & Target Body */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 rounded-xl shadow-lg">
            <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold font-mono">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white tracking-wide uppercase">
                {design.missionName || scenario.name}
              </div>
              <div className="text-[11px] font-mono text-sky-300 flex items-center gap-2">
                <span>{scenario.targetBody} &bull; {orbit.name}</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400">T+{Math.floor(telemetry.simDay)} Days</span>
              </div>
            </div>
          </div>

          {/* Top-Right: Time Warp & Sim Actions */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-xl shadow-lg">
            {/* Speed buttons */}
            <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-slate-800">
              {[1, 5, 20, 100].map(speed => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setTimeMultiplier(speed);
                    setIsSimPaused(false);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all ${
                    timeMultiplier === speed && !isSimPaused
                      ? 'bg-sky-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Pause toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsSimPaused(!isSimPaused);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Pause Simulation (Space)"
            >
              {isSimPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>

            {/* Evaluate & Finish Mission */}
            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                onCompleteSimulation(telemetry);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow"
            >
              <Flag className="w-3.5 h-3.5" />
              Complete Mission
            </button>
          </div>
        </div>

        {/* Center Screen: Active Anomaly Tactical Alert Card */}
        {telemetry.currentEvent && (
          <div className="pointer-events-auto max-w-xl w-full mx-auto p-5 rounded-2xl bg-slate-900/95 border-2 border-amber-500 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5 text-amber-400 font-mono text-xs font-bold uppercase tracking-widest mb-1.5">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Flight Alert &bull; {telemetry.currentEvent.category} Anomaly
            </div>
            <h3 className="text-lg font-bold font-mono text-white">
              {telemetry.currentEvent.title}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {telemetry.currentEvent.description}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                Team Tactical Remediation Choices:
              </span>
              {telemetry.currentEvent.choices.map((choice) => {
                const role = PLAYER_ROLES.find(r => r.id === choice.role);
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => handleResolveAnomaly(choice)}
                    className="w-full text-left p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-700/80 transition-all flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-white group-hover:text-sky-300 transition-colors">
                        {choice.text}
                      </span>
                      {role && (
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
                          style={{ backgroundColor: `${role.color}25`, color: role.color }}
                        >
                          {role.name}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 font-mono leading-snug">
                      {choice.rationale}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Bar: Telemetry Clusters & Event Log */}
        <div className="flex flex-col lg:flex-row items-end justify-between gap-4 pointer-events-auto">
          {/* Bottom-Left: Live Orbital & Systems Telemetry HUD */}
          <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-2xl shadow-xl w-full lg:max-w-xl">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-3">
              <span className="flex items-center gap-1.5 font-bold text-sky-400">
                <Activity className="w-4 h-4" />
                Live Spacecraft Telemetry
              </span>
              <span className="tabular-nums font-semibold text-white">
                Anomaly: {telemetry.trueAnomalyDeg}&deg; &bull; Alt: {telemetry.altitudeKm} km
              </span>
            </div>

            {/* Grid of Readouts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              {/* Battery Readout */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    BATTERY
                  </span>
                  {telemetry.inEclipse ? (
                    <span className="text-amber-400 font-bold text-[9px] px-1 bg-amber-950/60 rounded">
                      ECLIPSE
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold text-[9px] px-1 bg-emerald-950/60 rounded">
                      SUNLIGHT
                    </span>
                  )}
                </div>
                <div className="text-base font-bold text-white tabular-nums">
                  {telemetry.batteryLevelPct}%
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      telemetry.batteryLevelPct > 50
                        ? 'bg-emerald-400'
                        : telemetry.batteryLevelPct > 20
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${telemetry.batteryLevelPct}%` }}
                  />
                </div>
              </div>

              {/* Data Buffer Readout */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                  <span className="flex items-center gap-1">
                    <Radio className="w-3 h-3 text-sky-400" />
                    DATA BUFFER
                  </span>
                  {telemetry.downlinkActive && (
                    <span className="text-emerald-400 font-bold text-[9px] px-1 bg-emerald-950/60 rounded animate-pulse">
                      DOWNLINK
                    </span>
                  )}
                </div>
                <div className="text-base font-bold text-white tabular-nums">
                  {telemetry.dataBufferGb} <span className="text-[10px] text-slate-400">Gb</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  Total DL: {telemetry.totalDataDownlinkedGb} Gb
                </div>
              </div>

              {/* Science Points Readout */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    SCIENCE
                  </span>
                  <span className="text-purple-300 font-semibold">{scienceProgressPct}%</span>
                </div>
                <div className="text-base font-bold text-purple-300 tabular-nums">
                  {telemetry.cumulativeScienceCollected} <span className="text-[10px] text-slate-400">/ {scienceTarget}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${scienceProgressPct}%` }}
                  />
                </div>
              </div>

              {/* Spacecraft Health Readout */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" />
                    INTEGRITY
                  </span>
                  <span className="text-slate-400 text-[9px]">BUS</span>
                </div>
                <div className="text-base font-bold text-white tabular-nums">
                  {telemetry.spacecraftHealthPct}%
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      telemetry.spacecraftHealthPct > 70
                        ? 'bg-emerald-400'
                        : telemetry.spacecraftHealthPct > 40
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${telemetry.spacecraftHealthPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom-Right: Flight Ticker Event Log */}
          <div className="bg-slate-900/90 border border-slate-700/80 p-3.5 rounded-2xl shadow-xl w-full lg:max-w-md h-36 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400 border-b border-slate-800 pb-1.5 mb-2">
              <span className="font-semibold text-sky-400">Deep Space Network Log</span>
              <span className="text-[10px] text-slate-500">Auto-Scroll</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 text-xs font-mono pr-1">
              {telemetry.eventHistory.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed text-slate-300">
                  <span className="text-slate-500 text-[10px] shrink-0">T+{item.day}d</span>
                  <span
                    className={
                      item.type === 'success'
                        ? 'text-emerald-300'
                        : item.type === 'warning'
                        ? 'text-amber-300 font-semibold'
                        : item.type === 'critical'
                        ? 'text-rose-400 font-bold'
                        : 'text-slate-300'
                    }
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
