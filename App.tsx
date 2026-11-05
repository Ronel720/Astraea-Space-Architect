/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MissionDesign,
  SimulationTelemetry,
  MissionReport
} from './game/types';
import {
  MISSION_SCENARIOS,
  ORBIT_PRESETS,
  LAUNCH_VEHICLES,
  BUS_COMPONENTS,
  SCIENTIFIC_INSTRUMENTS
} from './game/missionData';
import { analyzeMission, evaluateMissionReport } from './game/rules';
import { sounds } from './game/audio';
import { TitleScreen } from './game/components/TitleScreen';
import { MissionPlanner } from './game/components/MissionPlanner';
import { MissionSimulation } from './game/components/MissionSimulation';
import { MissionReportModal } from './game/components/MissionReportModal';
import { PauseModal } from './game/components/PauseModal';
import { FlightHandbookModal } from './game/components/FlightHandbookModal';

type GameState = 'title' | 'planner' | 'simulation' | 'paused' | 'report';

export default function App() {
  // Check ?autostart=1 parameter
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const autostart = searchParams?.get('autostart') === '1';

  const [gameState, setGameState] = useState<GameState>(autostart ? 'planner' : 'title');
  const [previousStateBeforePause, setPreviousStateBeforePause] = useState<GameState>('planner');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('earth-sentinel');
  const [isTeamMode, setIsTeamMode] = useState<boolean>(true);
  const [isHandbookOpen, setIsHandbookOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Active Mission Design Configuration
  const [design, setDesign] = useState<MissionDesign>(() => {
    const sc = MISSION_SCENARIOS[0];
    return {
      scenarioId: sc.id,
      orbitId: sc.targetOrbitId,
      launchVehicleId: 'lv-falcon-medium',
      busComponents: {
        structure: 'struct-carbon',
        power: 'pwr-dual-silicon',
        battery: 'bat-solid-state',
        propulsion: 'prop-monoprop-rcs',
        adcs: 'adcs-reaction-wheels',
        comms: 'comms-x-band-dish',
        thermal: 'therm-passive-mli',
        computer: 'comp-rad-hard'
      },
      selectedInstruments: ['inst-optical-hd', 'inst-sar-radar', 'inst-spec-vnir'],
      missionName: 'Gaia Sentinel 1',
      isTeamMode: true,
      activeRole: 'director',
      teamDecisions: {}
    };
  });

  // Keep Mission Analysis computed in real-time
  const analysis = useMemo(() => analyzeMission(design), [design]);

  // Simulation Telemetry & Final Report
  const [simulationTelemetry, setSimulationTelemetry] = useState<SimulationTelemetry | null>(null);
  const [missionReport, setMissionReport] = useState<MissionReport | null>(null);

  // Sync document.body.dataset.state with game state
  useEffect(() => {
    const stateAttr = gameState === 'simulation' || gameState === 'planner' ? 'playing' : gameState;
    document.body.dataset.state = stateAttr;
  }, [gameState]);

  // Global Keyboard shortcuts (Escape / P to pause, M to mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'simulation' || gameState === 'planner') {
          e.preventDefault();
          sounds.playClick();
          setPreviousStateBeforePause(gameState);
          setGameState('paused');
        } else if (gameState === 'paused') {
          e.preventDefault();
          sounds.playClick();
          setGameState(previousStateBeforePause);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        const muted = sounds.toggleMute();
        setIsMuted(muted);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, previousStateBeforePause]);

  // Start mission from Title Screen
  const handleStartGame = useCallback((scenarioId: string, teamMode: boolean) => {
    const sc = MISSION_SCENARIOS.find(s => s.id === scenarioId) || MISSION_SCENARIOS[0];

    // Pick appropriate defaults based on scenario
    let powerChoice = 'pwr-dual-silicon';
    let propChoice = 'prop-monoprop-rcs';
    let launcherChoice = 'lv-falcon-medium';

    if (sc.targetBody === 'Europa') {
      powerChoice = 'pwr-rtg-nuclear';
      launcherChoice = 'lv-titan-heavy';
      propChoice = 'prop-biprop-apogee';
    } else if (sc.targetBody === 'Mars') {
      powerChoice = 'pwr-articulating-gaas';
      propChoice = 'prop-biprop-apogee';
    }

    setDesign({
      scenarioId: sc.id,
      orbitId: sc.targetOrbitId,
      launchVehicleId: launcherChoice,
      busComponents: {
        structure: 'struct-carbon',
        power: powerChoice,
        battery: 'bat-solid-state',
        propulsion: propChoice,
        adcs: 'adcs-reaction-wheels',
        comms: 'comms-x-band-dish',
        thermal: 'therm-passive-mli',
        computer: 'comp-rad-hard'
      },
      selectedInstruments: sc.recommendedInstruments,
      missionName: `${sc.name.split(':')[0]} Explorer`,
      isTeamMode: teamMode,
      activeRole: 'director',
      teamDecisions: {}
    });

    setSelectedScenarioId(sc.id);
    setIsTeamMode(teamMode);
    setGameState('planner');
  }, []);

  // Launch into Simulation
  const handleLaunchMission = useCallback(() => {
    setGameState('simulation');
  }, []);

  // Complete Simulation and Show Report
  const handleCompleteSimulation = useCallback((finalTelemetry: SimulationTelemetry) => {
    setSimulationTelemetry(finalTelemetry);
    const report = evaluateMissionReport(design, analysis, finalTelemetry);
    setMissionReport(report);
    if (['S', 'A+', 'A'].includes(report.grade)) {
      sounds.playFanfare();
    }
    setGameState('report');
  }, [design, analysis]);

  // Go to Next Scenario
  const handleNextScenario = useCallback(() => {
    const currentIndex = MISSION_SCENARIOS.findIndex(s => s.id === design.scenarioId);
    const nextIndex = (currentIndex + 1) % MISSION_SCENARIOS.length;
    const nextScenario = MISSION_SCENARIOS[nextIndex];
    handleStartGame(nextScenario.id, design.isTeamMode);
  }, [design.scenarioId, design.isTeamMode, handleStartGame]);

  const activeScenario = MISSION_SCENARIOS.find(s => s.id === design.scenarioId) || MISSION_SCENARIOS[0];

  return (
    <div className="w-full h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* Title Screen */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={handleStartGame}
          selectedScenarioId={selectedScenarioId}
          onSelectScenario={setSelectedScenarioId}
          isTeamMode={isTeamMode}
          onToggleTeamMode={setIsTeamMode}
        />
      )}

      {/* Mission Planner Workshop */}
      {(gameState === 'planner' || gameState === 'paused') && (
        <MissionPlanner
          design={design}
          analysis={analysis}
          onUpdateDesign={setDesign}
          onLaunchMission={handleLaunchMission}
          onOpenHandbook={() => setIsHandbookOpen(true)}
          onGoToTitle={() => setGameState('title')}
        />
      )}

      {/* Mission Simulation View */}
      {gameState === 'simulation' && (
        <MissionSimulation
          design={design}
          analysis={analysis}
          onCompleteSimulation={handleCompleteSimulation}
          onAbortSimulation={() => setGameState('planner')}
          onPause={() => {
            setPreviousStateBeforePause('simulation');
            setGameState('paused');
          }}
        />
      )}

      {/* Pause Modal */}
      <PauseModal
        isOpen={gameState === 'paused'}
        onResume={() => setGameState(previousStateBeforePause)}
        onRestart={() => setGameState('planner')}
        onGoToTitle={() => setGameState('title')}
        missionName={design.missionName}
        simDay={simulationTelemetry?.simDay ?? 1}
        scienceCollected={simulationTelemetry?.cumulativeScienceCollected ?? analysis.rawScienceScore}
        isMuted={isMuted}
        onToggleMute={() => {
          const muted = sounds.toggleMute();
          setIsMuted(muted);
        }}
      />

      {/* Mission Report Modal */}
      {missionReport && (
        <MissionReportModal
          isOpen={gameState === 'report'}
          report={missionReport}
          scenario={activeScenario}
          onRestart={() => setGameState('planner')}
          onGoToTitle={() => setGameState('title')}
          onNextScenario={handleNextScenario}
        />
      )}

      {/* Flight Handbook Modal */}
      <FlightHandbookModal
        isOpen={isHandbookOpen}
        onClose={() => setIsHandbookOpen(false)}
      />
    </div>
  );
}
