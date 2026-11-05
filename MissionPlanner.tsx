/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MissionDesign,
  MissionAnalysis,
  BusComponentCategory,
  PlayerRole
} from '../types';
import {
  MISSION_SCENARIOS,
  ORBIT_PRESETS,
  LAUNCH_VEHICLES,
  BUS_COMPONENTS,
  SCIENTIFIC_INSTRUMENTS,
  PLAYER_ROLES,
  TEAM_DILEMMAS
} from '../missionData';
import { sounds } from '../audio';
import { SpacecraftCanvas } from './SpacecraftCanvas';
import {
  Layers,
  Rocket,
  Cpu,
  Microscope,
  Radio,
  Zap,
  DollarSign,
  Weight,
  Orbit,
  BookOpen,
  Play,
  Users,
  AlertCircle,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Eye,
  Info
} from 'lucide-react';

interface MissionPlannerProps {
  design: MissionDesign;
  analysis: MissionAnalysis;
  onUpdateDesign: (updater: (prev: MissionDesign) => MissionDesign) => void;
  onLaunchMission: () => void;
  onOpenHandbook: () => void;
  onGoToTitle: () => void;
}

export const MissionPlanner: React.FC<MissionPlannerProps> = ({
  design,
  analysis,
  onUpdateDesign,
  onLaunchMission,
  onOpenHandbook,
  onGoToTitle
}) => {
  const scenario = MISSION_SCENARIOS.find(s => s.id === design.scenarioId) || MISSION_SCENARIOS[0];

  // Active Category Tab
  const [activeTab, setActiveTab] = useState<'orbit' | 'launcher' | 'bus' | 'payload' | 'team'>('orbit');
  const [selectedBusCategory, setSelectedBusCategory] = useState<BusComponentCategory>('power');

  // 3D Canvas Controls
  const [canvasViewMode, setCanvasViewMode] = useState<'spacecraft' | 'orbit'>('spacecraft');
  const [explodedAmount, setExplodedAmount] = useState<number>(0.0);
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);

  // Active Role in Team Mode
  const activeRoleInfo = PLAYER_ROLES.find(r => r.id === design.activeRole) || PLAYER_ROLES[0];

  // Handlers for updating configuration
  const handleSelectOrbit = (orbitId: string) => {
    sounds.playSelect();
    onUpdateDesign(prev => ({ ...prev, orbitId }));
  };

  const handleSelectLauncher = (launchVehicleId: string) => {
    sounds.playSelect();
    onUpdateDesign(prev => ({ ...prev, launchVehicleId }));
  };

  const handleSelectBusComponent = (category: BusComponentCategory, componentId: string) => {
    sounds.playSelect();
    onUpdateDesign(prev => ({
      ...prev,
      busComponents: {
        ...prev.busComponents,
        [category]: componentId
      }
    }));
  };

  const handleToggleInstrument = (instrumentId: string) => {
    sounds.playClick();
    onUpdateDesign(prev => {
      const exists = prev.selectedInstruments.includes(instrumentId);
      const updated = exists
        ? prev.selectedInstruments.filter(id => id !== instrumentId)
        : [...prev.selectedInstruments, instrumentId];
      return { ...prev, selectedInstruments: updated };
    });
  };

  const handleSelectRole = (role: PlayerRole) => {
    sounds.playClick();
    onUpdateDesign(prev => ({ ...prev, activeRole: role }));
  };

  const handleVoteDilemma = (dilemmaId: string, optionKey: 'optionA' | 'optionB') => {
    sounds.playSelect();
    onUpdateDesign(prev => ({
      ...prev,
      teamDecisions: {
        ...prev.teamDecisions,
        [dilemmaId]: optionKey
      }
    }));
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 select-none font-sans"
      data-testid="mission-planner-view"
    >
      {/* Top Navigation & Mission Summary Bar */}
      <header className="h-14 px-4 sm:px-6 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onGoToTitle();
            }}
            className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            &larr; Scenarios
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold font-mono text-white tracking-wide uppercase">
                {scenario.name}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-800/60 font-semibold">
                {scenario.targetBody}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Target Science: {scenario.minRequiredScience} pts &bull; Budget Ceiling: ${scenario.maxBudgetM}M
            </p>
          </div>
        </div>

        {/* Top Right Utilities */}
        <div className="flex items-center gap-2">
          {design.isTeamMode && (
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              {PLAYER_ROLES.map(role => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelectRole(role.id)}
                  title={`${role.name}: ${role.focus}`}
                  className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-all ${
                    design.activeRole === role.id
                      ? 'bg-slate-800 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  style={design.activeRole === role.id ? { borderLeft: `3px solid ${role.color}` } : {}}
                >
                  {role.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenHandbook();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-300 font-mono text-xs border border-slate-800 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            Handbook
          </button>

          {/* Launch Mission CTA */}
          <button
            type="button"
            data-start="true"
            onClick={() => {
              if (analysis.criticalErrors.length > 0) {
                sounds.playAlarm();
                alert(`Cannot launch mission! Resolve critical errors:\n\n• ${analysis.criticalErrors.join('\n• ')}`);
                return;
              }
              sounds.playLaunchRumble();
              onLaunchMission();
            }}
            className={`px-5 py-1.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg ${
              analysis.criticalErrors.length === 0
                ? 'bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 shadow-sky-500/25'
                : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            {analysis.criticalErrors.length === 0 ? 'Simulate Mission' : 'Configuration Errors'}
          </button>
        </div>
      </header>

      {/* Main Split Layout: Left Configuration Workshop / Right 3D Visualizer & Telemetry HUD */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Section: Subsystems Configuration Panel */}
        <div className="w-full lg:w-[48%] xl:w-[45%] h-1/2 lg:h-full flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/95 overflow-hidden z-10">
          {/* Subsystem Tabs */}
          <div className="flex items-center border-b border-slate-800 bg-slate-900/40 p-1.5 gap-1 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('orbit');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                activeTab === 'orbit'
                  ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              1. Orbit & Trajectory
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('launcher');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                activeTab === 'launcher'
                  ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              2. Launch Vehicle
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('bus');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                activeTab === 'bus'
                  ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              3. Spacecraft Bus
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('payload');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                activeTab === 'payload'
                  ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Microscope className="w-3.5 h-3.5" />
              4. Science Payload ({design.selectedInstruments.length})
            </button>
            {design.isTeamMode && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('team');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                  activeTab === 'team'
                    ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-purple-400" />
                Crew Room
              </button>
            )}
          </div>

          {/* Subsystem Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Tab 1: Orbit Selection */}
            {activeTab === 'orbit' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 leading-relaxed font-mono">
                  Select your destination orbit. Trajectory delta-V determines required propellant mass, while orbital altitude and period govern communications passes and eclipse durations.
                </div>
                <div className="space-y-2.5">
                  {ORBIT_PRESETS.filter(o => o.body === scenario.targetBody || o.id === 'deep-space-helio').map(orbit => {
                    const isSelected = orbit.id === design.orbitId;
                    return (
                      <button
                        key={orbit.id}
                        type="button"
                        onClick={() => handleSelectOrbit(orbit.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-slate-900 border-sky-400 shadow-md ring-1 ring-sky-400/40'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono mb-1">
                          <span className="font-bold text-white text-sm">{orbit.name}</span>
                          <span className="text-sky-300 font-semibold">&Delta;V: {orbit.deltaVKms} km/s</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-snug">
                          {orbit.description}
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400">
                          <span>Alt: <strong className="text-slate-300">{orbit.altitudeKm} km</strong></span>
                          <span>Period: <strong className="text-slate-300">{orbit.orbitalPeriodMin} min</strong></span>
                          <span>Eclipse: <strong className="text-amber-400">{orbit.eclipseDurationMin} min</strong></span>
                          <span>Passes: <strong className="text-emerald-400">{orbit.commsPassesPerDay}/day</strong></span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Launch Vehicle Selection */}
            {activeTab === 'launcher' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 leading-relaxed font-mono">
                  Choose a rocket configuration. Ensure payload lift capability at your target destination exceeds wet spacecraft mass with at least a 15% safety margin.
                </div>
                <div className="space-y-2.5">
                  {LAUNCH_VEHICLES.map(lv => {
                    const isSelected = lv.id === design.launchVehicleId;
                    let targetCapacity = lv.payloadLeoKg;
                    if (scenario.targetBody === 'Moon') targetCapacity = lv.payloadGTOKg;
                    else if (scenario.targetBody === 'Mars' || scenario.targetBody === 'Europa' || scenario.targetBody === 'Deep Space') {
                      targetCapacity = lv.payloadEscapeKg;
                    }

                    return (
                      <button
                        key={lv.id}
                        type="button"
                        onClick={() => handleSelectLauncher(lv.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-slate-900 border-sky-400 shadow-md ring-1 ring-sky-400/40'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono mb-1">
                          <span className="font-bold text-white text-sm">{lv.name}</span>
                          <span className="text-emerald-400 font-bold">${lv.costM}M</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-snug">
                          {lv.description}
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400">
                          <span>Target Lift: <strong className="text-sky-300">{targetCapacity} kg</strong></span>
                          <span>Reliability: <strong className="text-slate-300">{(lv.reliability * 100).toFixed(0)}%</strong></span>
                          <span>Fairing: <strong className="text-slate-300">{lv.fairingDiameterM}m</strong></span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Spacecraft Bus Subsystems */}
            {activeTab === 'bus' && (
              <div className="space-y-4">
                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                  {(Object.keys(BUS_COMPONENTS) as BusComponentCategory[]).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setSelectedBusCategory(cat);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider font-semibold transition-all ${
                        selectedBusCategory === cat
                          ? 'bg-sky-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Subsystem Component List */}
                <div className="space-y-2.5">
                  {BUS_COMPONENTS[selectedBusCategory]?.map(comp => {
                    const isSelected = design.busComponents[selectedBusCategory] === comp.id;
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => handleSelectBusComponent(selectedBusCategory, comp.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-slate-900 border-sky-400 shadow ring-1 ring-sky-400/40'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono mb-1">
                          <span className="font-bold text-white">{comp.name}</span>
                          <span className="text-emerald-400 font-semibold">${comp.costM}M</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-snug">
                          {comp.description}
                        </p>
                        <div className="mt-2 pt-2 border-t border-slate-800/70 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-mono text-slate-400">
                          <span>Mass: <strong className="text-slate-200">{comp.massKg} kg</strong></span>
                          {comp.powerGenW && <span>Gen: <strong className="text-amber-400">+{comp.powerGenW} W</strong></span>}
                          {comp.powerDrawW > 0 && <span>Draw: <strong className="text-amber-300">-{comp.powerDrawW} W</strong></span>}
                          {comp.capacityWh && <span>Battery: <strong className="text-sky-300">{comp.capacityWh} Wh</strong></span>}
                          {comp.downlinkRateMbps && <span>Link: <strong className="text-emerald-300">{comp.downlinkRateMbps} Mbps</strong></span>}
                          {comp.deltaVCapacityKms && <span>Propulsion: <strong className="text-purple-300">{comp.deltaVCapacityKms} km/s</strong></span>}
                        </div>
                        <div className="mt-1 text-[10px] text-slate-400 font-mono">
                          <span className="text-emerald-400/90 font-medium">Pros: {comp.pros}</span> &bull; <span className="text-amber-400/90 font-medium">Cons: {comp.cons}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 4: Scientific Payload Instruments */}
            {activeTab === 'payload' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Equip instruments to satisfy mission science targets.</span>
                  <span className="text-sky-300 font-semibold">{design.selectedInstruments.length} selected</span>
                </div>

                <div className="space-y-2.5">
                  {SCIENTIFIC_INSTRUMENTS.map(inst => {
                    const isSelected = design.selectedInstruments.includes(inst.id);
                    return (
                      <button
                        key={inst.id}
                        type="button"
                        onClick={() => handleToggleInstrument(inst.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-slate-900 border-purple-400 ring-1 ring-purple-400/40 shadow'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-purple-500 border-purple-400 text-slate-950' : 'border-slate-700'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs font-mono mb-1">
                            <span className="font-bold text-white">{inst.name}</span>
                            <span className="text-purple-300 font-bold">+{inst.sciencePoints} pts</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-snug">
                            {inst.description}
                          </p>
                          <div className="mt-2 pt-1.5 border-t border-slate-800/70 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-mono text-slate-400">
                            <span>Cost: <strong className="text-emerald-400">${inst.costM}M</strong></span>
                            <span>Mass: <strong className="text-slate-300">{inst.massKg} kg</strong></span>
                            <span>Draw: <strong className="text-amber-400">{inst.powerDrawW} W</strong></span>
                            <span>Data: <strong className="text-sky-400">{inst.dataGenGbDay} Gb/day</strong></span>
                            <span className="text-slate-500 font-semibold">Synergy: {inst.synergyCategory}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 5: 4-Player Team Command Room */}
            {activeTab === 'team' && (
              <div className="space-y-4">
                {/* Active Role Card */}
                <div
                  className="p-3.5 rounded-xl border"
                  style={{
                    backgroundColor: `${activeRoleInfo.color}10`,
                    borderColor: `${activeRoleInfo.color}40`
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeRoleInfo.color }} />
                    <span className="text-xs font-mono font-bold uppercase text-white">
                      Current Perspective: {activeRoleInfo.name} ({activeRoleInfo.title})
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono">
                    Priority: {activeRoleInfo.focus}
                  </p>
                  <ul className="mt-2 space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                    {activeRoleInfo.responsibilities.map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </div>

                {/* Team Trade-off Dilemmas */}
                <div className="space-y-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-bold">
                    Consensus Trade-Off Dilemmas
                  </span>
                  {TEAM_DILEMMAS.map(dilemma => {
                    const currentVote = design.teamDecisions[dilemma.id];
                    return (
                      <div
                        key={dilemma.id}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs"
                      >
                        <div className="font-bold text-white font-mono flex items-center justify-between">
                          <span>{dilemma.title}</span>
                          <span className="text-[10px] text-sky-400 uppercase font-normal">
                            Led by {PLAYER_ROLES.find(r => r.id === dilemma.leadRole)?.name}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          {dilemma.scenario}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleVoteDilemma(dilemma.id, 'optionA')}
                            className={`p-2.5 rounded-lg text-left border transition-all ${
                              currentVote === 'optionA'
                                ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <div className="font-bold font-mono text-[11px] text-white">
                              {dilemma.optionA.label}
                            </div>
                            <div className="text-[10px] mt-0.5 leading-snug">
                              {dilemma.optionA.effectText}
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleVoteDilemma(dilemma.id, 'optionB')}
                            className={`p-2.5 rounded-lg text-left border transition-all ${
                              currentVote === 'optionB'
                                ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <div className="font-bold font-mono text-[11px] text-white">
                              {dilemma.optionB.label}
                            </div>
                            <div className="text-[10px] mt-0.5 leading-snug">
                              {dilemma.optionB.effectText}
                            </div>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: 3D Visualizer & Real-Time Engineering Margins HUD */}
        <div className="w-full lg:w-[52%] xl:w-[55%] h-1/2 lg:h-full flex flex-col relative overflow-hidden bg-slate-950">
          {/* 3D Canvas Viewport */}
          <div className="flex-1 relative">
            <SpacecraftCanvas
              viewMode={canvasViewMode}
              targetBody={scenario.targetBody}
              explodedAmount={explodedAmount}
            />

            {/* 3D Viewport Controls Dock (Floating Top-Right) */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-slate-900/85 backdrop-blur-none p-1.5 rounded-xl border border-slate-800 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setCanvasViewMode('spacecraft');
                }}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  canvasViewMode === 'spacecraft'
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Spacecraft Bus
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setCanvasViewMode('orbit');
                }}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  canvasViewMode === 'orbit'
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Celestial Orbit
              </button>
            </div>

            {/* Exploded View Slider (Floating Bottom-Center over 3D Canvas) */}
            {canvasViewMode === 'spacecraft' && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-slate-900/85 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3 shadow-xl">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold whitespace-nowrap">
                  Exploded View:
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodedAmount}
                  onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
                  className="w-32 accent-sky-400 cursor-pointer"
                />
                <span className="text-xs font-mono text-white tabular-nums w-8">
                  {Math.round(explodedAmount * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Bottom HUD: Real-Time Engineering Margins & Budget Gauges */}
          <div className="p-4 bg-slate-950/95 border-t border-slate-800 z-10 space-y-3">
            {/* Top row: 5 Primary Resource Meters */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-mono">
              {/* 1. Mass Budget */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                  <span className="flex items-center gap-1">
                    <Weight className="w-3 h-3 text-purple-400" />
                    MASS
                  </span>
                  <span className={analysis.isMassFeasible ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                    {analysis.massMarginPct}%
                  </span>
                </div>
                <div className="text-sm font-bold text-white tabular-nums">
                  {analysis.totalMassKg} <span className="text-[10px] text-slate-400">/ {analysis.launcherCapacityKg} kg</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${analysis.isMassFeasible ? 'bg-purple-400' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(100, (analysis.totalMassKg / analysis.launcherCapacityKg) * 100)}%` }}
                  />
                </div>
              </div>

              {/* 2. Power Balance */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    POWER
                  </span>
                  <span className={analysis.isPowerFeasible ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                    {analysis.powerNetSunlightW >= 0 ? `+${analysis.powerNetSunlightW}W` : `${analysis.powerNetSunlightW}W`}
                  </span>
                </div>
                <div className="text-sm font-bold text-white tabular-nums">
                  {analysis.powerGeneratedW}W <span className="text-[10px] text-slate-400">gen / {analysis.powerTotalDrawW}W</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Eclipse DoD: <strong className={analysis.batteryDepthOfDischargePct <= 50 ? 'text-emerald-400' : 'text-amber-400'}>{analysis.batteryDepthOfDischargePct}%</strong>
                </div>
              </div>

              {/* 3. Financial Budget */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    BUDGET
                  </span>
                  <span className={analysis.isBudgetFeasible ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                    ${analysis.budgetMarginM}M
                  </span>
                </div>
                <div className="text-sm font-bold text-white tabular-nums">
                  ${analysis.totalCostM}M <span className="text-[10px] text-slate-400">/ ${analysis.budgetLimitM}M</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${analysis.isBudgetFeasible ? 'bg-emerald-400' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(100, (analysis.totalCostM / analysis.budgetLimitM) * 100)}%` }}
                  />
                </div>
              </div>

              {/* 4. Comms & Data Downlink */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                  <span className="flex items-center gap-1">
                    <Radio className="w-3 h-3 text-sky-400" />
                    DATA LINK
                  </span>
                  <span className={analysis.isDataFeasible ? 'text-emerald-400' : 'text-amber-400 font-bold'}>
                    {analysis.dataBalancePct}%
                  </span>
                </div>
                <div className="text-sm font-bold text-white tabular-nums">
                  {analysis.downlinkCapacityGbDay} <span className="text-[10px] text-slate-400">/ {analysis.totalDataGenGbDay} Gb/d</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Throughput: <strong className="text-slate-300">{analysis.downlinkCapacityGbDay} Gb/day</strong>
                </div>
              </div>

              {/* 5. Trajectory & Science */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                  <span className="flex items-center gap-1">
                    <Orbit className="w-3 h-3 text-sky-400" />
                    SCIENCE
                  </span>
                  <span className="text-sky-300 font-bold">{analysis.rawScienceScore} pts</span>
                </div>
                <div className="text-xs font-bold text-white font-mono mt-1">
                  &Delta;V: {analysis.deltaVAvailableKms.toFixed(2)} / {analysis.deltaVRequiredKms.toFixed(2)} km/s
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Est. Life: <strong className="text-emerald-400">{analysis.operationalLifetimeYears} yrs</strong>
                </div>
              </div>
            </div>

            {/* Warnings & Diagnostics Strip */}
            {(analysis.criticalErrors.length > 0 || analysis.warnings.length > 0) && (
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs font-mono">
                {analysis.criticalErrors.map((err, idx) => (
                  <div key={`err-${idx}`} className="flex items-center gap-2 text-rose-400 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
                {analysis.warnings.map((warn, idx) => (
                  <div key={`warn-${idx}`} className="flex items-center gap-2 text-amber-300 text-[11px]">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
