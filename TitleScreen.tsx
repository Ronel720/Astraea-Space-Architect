/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { MissionScenario } from '../types';
import { MISSION_SCENARIOS, PLAYER_ROLES } from '../missionData';
import { sounds } from '../audio';
import { Compass, Users, Sparkles, Orbit, ShieldCheck, Zap } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: (scenarioId: string, isTeamMode: boolean) => void;
  selectedScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  isTeamMode: boolean;
  onToggleTeamMode: (isTeam: boolean) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  selectedScenarioId,
  onSelectScenario,
  isTeamMode,
  onToggleTeamMode
}) => {
  // Bind Enter and Space to launch the mission
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        sounds.playSelect();
        onStartGame(selectedScenarioId, isTeamMode);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame, selectedScenarioId, isTeamMode]);

  const selectedScenario = MISSION_SCENARIOS.find(s => s.id === selectedScenarioId) || MISSION_SCENARIOS[0];

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col justify-between p-6 sm:p-10 pointer-events-auto bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/95 overflow-y-auto"
      data-testid="title-screen"
    >
      {/* Top Header & Bespoke Mission Crest */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Custom SVG Mission Insignia Crest */}
          <div className="w-12 h-12 rounded-xl bg-sky-950/60 border border-sky-400/30 flex items-center justify-center shadow-lg shadow-sky-950/50">
            <svg viewBox="0 0 48 48" className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="24" cy="24" r="18" strokeDasharray="3 3" opacity="0.6" />
              <ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(-30 24 24)" stroke="#38bdf8" />
              <circle cx="24" cy="24" r="6" fill="#38bdf8" />
              <path d="M24 6 L26 12 L24 10 L22 12 Z" fill="#f59e0b" />
              <line x1="24" y1="18" x2="24" y2="6" stroke="#f59e0b" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase font-mono">
              ASTRAEA
            </h1>
            <p className="text-xs sm:text-sm text-sky-300 font-mono tracking-widest uppercase">
              Space Mission Architect & Flight Simulator
            </p>
          </div>
        </div>

        {/* Solo vs 4-Player Team Mode Toggle */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-700/60">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onToggleTeamMode(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium font-mono transition-all ${
              !isTeamMode
                ? 'bg-sky-500 text-slate-950 font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Solo Flight Director
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onToggleTeamMode(true);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium font-mono transition-all ${
              isTeamMode
                ? 'bg-sky-500 text-slate-950 font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            4-Player Team Command
          </button>
        </div>
      </div>

      {/* Middle Centerpiece: Scenario Catalog */}
      <div className="my-auto py-2 max-w-5xl w-full mx-auto">
        <div className="mb-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 block mb-0.5">
            Flight Program Registry
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Select Your Target Mission Scenario
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Every expedition challenges your team to balance mass, electric power, deep space telemetry, and launch vehicle dynamics under hard budget ceilings.
          </p>
        </div>

        {/* Scenario Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {MISSION_SCENARIOS.map((scenario) => {
            const isSelected = scenario.id === selectedScenarioId;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onSelectScenario(scenario.id);
                }}
                className={`relative text-left p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900/95 border-sky-400 ring-1 ring-sky-400/50 shadow-lg shadow-sky-950/50'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/85'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {scenario.targetBody}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                        scenario.difficulty === 'Novice'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : scenario.difficulty === 'Intermediate'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                          : scenario.difficulty === 'Advanced'
                          ? 'bg-orange-950/80 text-orange-400 border border-orange-800/60'
                          : 'bg-purple-950/80 text-purple-400 border border-purple-800/60'
                      }`}
                    >
                      {scenario.difficulty}
                    </span>
                  </div>

                  <h3 className="font-semibold text-white text-sm leading-snug">
                    {scenario.name}
                  </h3>
                  <p className="text-[11px] text-sky-300/80 font-mono mt-0.5">
                    {scenario.subtitle}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {scenario.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">
                    Budget: <strong className="text-white">${scenario.maxBudgetM}M</strong>
                  </span>
                  <span className="text-slate-400">
                    Target: <strong className="text-sky-300">{scenario.minRequiredScience} pts</strong>
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 4-Player Role Preview Banner if Team Mode Active */}
        {isTeamMode && (
          <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-700/70">
            <div className="flex items-center gap-2 mb-1.5 text-[11px] font-mono text-sky-400 uppercase tracking-widest font-semibold">
              <Users className="w-3.5 h-3.5" />
              4-Player Command Crew Roles
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PLAYER_ROLES.map((role) => (
                <div
                  key={role.id}
                  className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-left"
                >
                  <div className="text-[11px] font-bold font-mono text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: role.color }} />
                    {role.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    {role.focus}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer & Flat Control Hint */}
      <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 pb-1 border-t border-slate-800/80">
        <div className="text-xs font-mono text-slate-400 tracking-wide text-center sm:text-left">
          WASD / Drag to Rotate 3D Model &bull; Space / Enter to Begin &bull; Esc to Pause &bull; M to Mute
        </div>

        <button
          type="button"
          data-start="true"
          onClick={() => {
            sounds.playSelect();
            onStartGame(selectedScenarioId, isTeamMode);
          }}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-bold font-mono uppercase tracking-wider text-sm shadow-xl shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Initialize Mission Design &rarr;
        </button>
      </div>
    </div>
  );
};
