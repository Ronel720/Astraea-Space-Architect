/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../audio';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onGoToTitle: () => void;
  missionName: string;
  simDay: number;
  scienceCollected: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onGoToTitle,
  missionName,
  simDay,
  scienceCollected,
  isMuted,
  onToggleMute
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Mission Paused"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
        <span className="text-xs font-mono uppercase tracking-widest text-sky-400 block mb-1">
          Flight Telemetry Suspended
        </span>
        <h2 className="text-2xl font-bold font-mono text-white uppercase tracking-tight">
          Mission Paused
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          {missionName} &bull; T+{Math.floor(simDay)} Days
        </p>

        {/* 2-3 Tabular-Nums Stat Tiles */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Mission Elapsed
            </span>
            <span className="text-xl font-bold font-mono text-white tabular-nums">
              {Math.floor(simDay)} <span className="text-xs text-slate-400">days</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Science Collected
            </span>
            <span className="text-xl font-bold font-mono text-sky-300 tabular-nums">
              {scienceCollected} <span className="text-xs text-slate-400">pts</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              sounds.playSelect();
              onResume();
            }}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
          >
            <Play className="w-4 h-4" />
            Resume Flight Operations (Esc)
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onRestart();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-slate-700/60"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            Restart Mission Design
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onGoToTitle();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 text-slate-400 hover:text-white font-mono text-xs transition-all flex items-center justify-center gap-2 border border-slate-800/80"
          >
            <Home className="w-4 h-4" />
            Return to Mission Registry
          </button>
        </div>

        {/* Audio Mute Quick Toggle */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Audio Synthesizer</span>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            {isMuted ? 'Muted' : 'Sound Enabled'}
          </button>
        </div>
      </div>
    </div>
  );
};
