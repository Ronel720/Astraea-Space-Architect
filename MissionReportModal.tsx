/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MissionReport, MissionScenario } from '../types';
import { Award, CheckCircle2, XCircle, Sparkles, RotateCcw, Home, ArrowRight, ShieldCheck, DollarSign, Radio, Zap } from 'lucide-react';
import { sounds } from '../audio';

interface MissionReportModalProps {
  isOpen: boolean;
  report: MissionReport;
  scenario: MissionScenario;
  onRestart: () => void;
  onGoToTitle: () => void;
  onNextScenario?: () => void;
}

export const MissionReportModal: React.FC<MissionReportModalProps> = ({
  isOpen,
  report,
  scenario,
  onRestart,
  onGoToTitle,
  onNextScenario
}) => {
  if (!isOpen) return null;

  const getGradeColor = (grade: MissionReport['grade']) => {
    switch (grade) {
      case 'S':
        return 'text-amber-300 border-amber-400 bg-amber-950/50 shadow-amber-500/20';
      case 'A+':
      case 'A':
        return 'text-emerald-400 border-emerald-500 bg-emerald-950/50 shadow-emerald-500/20';
      case 'B':
        return 'text-sky-400 border-sky-500 bg-sky-950/50 shadow-sky-500/20';
      case 'C':
        return 'text-amber-400 border-amber-600 bg-amber-950/40 shadow-amber-500/20';
      default:
        return 'text-rose-400 border-rose-500 bg-rose-950/50 shadow-rose-500/20';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md pointer-events-auto overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
    >
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-4xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400 block mb-0.5">
              Flight Directorate &bull; Post-Mission Review
            </span>
            <h2 id="report-title" className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight uppercase">
              {scenario.name} &bull; Mission Evaluation
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:block">
            Target: {scenario.targetBody}
          </span>
        </div>

        {/* Scrollable Report Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 text-sm">
          {/* Top Grade & Score Cluster */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            {/* Medallion */}
            <div
              className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center shadow-xl shrink-0 ${getGradeColor(
                report.grade
              )}`}
            >
              <span className="text-4xl font-extrabold font-mono tracking-tighter">
                {report.grade}
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase font-semibold mt-0.5">
                Rating
              </span>
            </div>

            {/* Score Breakdown Bars */}
            <div className="flex-1 w-full space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold">
                  Overall Composite Performance
                </span>
                <span className="text-lg font-bold font-mono text-white tabular-nums">
                  {report.overallScore} / 100
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, report.overallScore))}%` }}
                />
              </div>

              {/* Sub-scores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-400 block">Science (40%)</span>
                  <span className="font-bold text-sky-400 tabular-nums">{report.scienceScore}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-400 block">Engineering (25%)</span>
                  <span className="font-bold text-amber-400 tabular-nums">{report.engineeringScore}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-400 block">Fiscal (20%)</span>
                  <span className="font-bold text-emerald-400 tabular-nums">{report.budgetScore}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-400 block">Synergy (15%)</span>
                  <span className="font-bold text-purple-400 tabular-nums">{report.teamSynergyScore}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Objectives Status */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2.5 font-bold">
              Mission Objectives Manifest
            </h3>
            <div className="space-y-2">
              {report.achievedObjectives.map((obj, i) => (
                <div
                  key={`achieved-${i}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-200">{obj}</span>
                  <span className="ml-auto text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300">
                    ACCOMPLISHED
                  </span>
                </div>
              ))}
              {report.missedObjectives.map((obj, i) => (
                <div
                  key={`missed-${i}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-xs"
                >
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-rose-200">{obj}</span>
                  <span className="ml-auto text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-900/60 text-rose-300">
                    UNFULFILLED
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Discoveries */}
          {report.keyDiscoveries.length > 0 && (
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2.5 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Scientific Discoveries & Publications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {report.keyDiscoveries.map((disc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans"
                  >
                    &ldquo;{disc}&rdquo;
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subsystem Margins & Performance */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2.5 font-bold">
              Subsystem Performance Audits
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {report.subsystemPerformance.map((sub, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-white">{sub.subsystem}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        sub.status === 'Nominal'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : sub.status === 'Degraded'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    {sub.marginText}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unlocked Awards */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2.5 font-bold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Agency Honors & Medals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {report.awards.map((award) => (
                <div
                  key={award.id}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    award.unlocked
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${award.unlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-600'}`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold font-mono">{award.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {award.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onGoToTitle();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700/60"
          >
            <Home className="w-4 h-4 text-slate-400" />
            Mission Registry
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onRestart();
              }}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700/60"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              Redesign Mission
            </button>

            {onNextScenario && (
              <button
                type="button"
                data-start="true"
                onClick={() => {
                  sounds.playSelect();
                  onNextScenario();
                }}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
              >
                Next Expedition
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
