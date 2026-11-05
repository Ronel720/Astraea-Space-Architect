/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, X, ChevronRight, Zap, Orbit, Radio, DollarSign, Weight } from 'lucide-react';

interface FlightHandbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlightHandbookModal: React.FC<FlightHandbookModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTopic, setActiveTopic] = useState<'deltav' | 'power' | 'comms' | 'mass' | 'team'>('deltav');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="handbook-title"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <h2 id="handbook-title" className="text-base sm:text-lg font-bold font-mono text-white tracking-wide uppercase">
              Flight Director Handbook & Engineering Concepts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Handbook"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area with Sidebar */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          {/* Topics Sidebar */}
          <div className="w-full sm:w-56 p-3 border-b sm:border-b-0 sm:border-r border-slate-800 bg-slate-950/30 flex sm:flex-col gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTopic('deltav')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-left transition-all whitespace-nowrap ${
                activeTopic === 'deltav'
                  ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Orbit className="w-4 h-4 text-sky-400 shrink-0" />
              Delta-V & Orbits
            </button>
            <button
              type="button"
              onClick={() => setActiveTopic('power')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-left transition-all whitespace-nowrap ${
                activeTopic === 'power'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              Power & Eclipses
            </button>
            <button
              type="button"
              onClick={() => setActiveTopic('comms')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-left transition-all whitespace-nowrap ${
                activeTopic === 'comms'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
              Comms & Link Budget
            </button>
            <button
              type="button"
              onClick={() => setActiveTopic('mass')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-left transition-all whitespace-nowrap ${
                activeTopic === 'mass'
                  ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Weight className="w-4 h-4 text-purple-400 shrink-0" />
              Mass & Rocket Lift
            </button>
            <button
              type="button"
              onClick={() => setActiveTopic('team')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-left transition-all whitespace-nowrap ${
                activeTopic === 'team'
                  ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-4 h-4 text-sky-400 shrink-0" />
              Team Trade-Offs
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 p-6 overflow-y-auto text-sm leading-relaxed">
            {activeTopic === 'deltav' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Orbit className="w-4 h-4 text-sky-400" />
                  Orbital Mechanics & Delta-V Budget
                </h3>
                <p>
                  <strong>Delta-V (&Delta;V)</strong> is the change in velocity required to alter a spacecraft’s orbital path, execute planetary capture burns, or transfer between celestial bodies (via Hohmann transfer orbits).
                </p>
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-xs text-sky-300">
                  &Delta;V = I_sp &times; g_0 &times; ln( m_initial / m_final )
                </div>
                <p>
                  <strong>Key Trade-off:</strong> High specific-impulse engines (like Hall Effect Ion Thrusters, Isp &gt; 2,800s) provide extraordinary &Delta;V with very little propellant mass, but consume hundreds of watts of continuous electric power and deliver tiny acceleration. In contrast, chemical bipropellant engines fire fast and furious, but add substantial propellant weight.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2">
                  <div className="p-2.5 rounded-lg bg-slate-800/50">
                    <span className="text-white block font-bold">Low Earth Orbit (LEO):</span>
                    Requires ~0.15 km/s for station keeping and de-orbit disposal.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/50">
                    <span className="text-white block font-bold">Lunar Orbit Insertion:</span>
                    Demands ~0.95 km/s from cislunar transfer into polar orbit.
                  </div>
                </div>
              </div>
            )}

            {activeTopic === 'power' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  The Inverse-Square Law & Orbital Eclipses
                </h3>
                <p>
                  Solar radiation intensity drops according to the <strong>Inverse-Square Law</strong>: <code>Solar Flux = 1361 W/m&sup2; / (Distance_AU)&sup2;</code>.
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 font-mono">
                  <li><strong>Earth (1.0 AU):</strong> 1,361 W/m&sup2; available solar power.</li>
                  <li><strong>Mars (1.52 AU):</strong> ~590 W/m&sup2; (43% of Earth’s power).</li>
                  <li><strong>Jupiter / Europa (5.2 AU):</strong> ~50 W/m&sup2; (only 3.7% of Earth’s power!).</li>
                </ul>
                <p>
                  <strong>Battery Depth of Discharge (DoD):</strong> In orbital shadows (eclipses), all power comes from onboard batteries. For spacecraft designed to survive 5 to 10 years, DoD should stay under 50% to prevent chemical degradation. Beyond Mars, solar wings become huge and fragile—nuclear Stirling Radioisotope Generators (RTGs) become necessary.
                </p>
              </div>
            )}

            {activeTopic === 'comms' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  Communications Bandwidth & Memory Saturation
                </h3>
                <p>
                  Scientific instruments (especially Synthetic Aperture Radars and Multispectral Imaging Telescopes) generate massive streams of raw observations (50 to 200 Gigabits per day).
                </p>
                <p>
                  A spacecraft can only downlink this data when flying within line-of-sight of Earth ground stations (such as NASA’s Deep Space Network in Goldstone, Madrid, and Canberra).
                </p>
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <strong className="text-emerald-400 block mb-1 font-mono">The Data Bottleneck Risk:</strong>
                  If your instruments generate 150 Gb/day but your antenna can only dump 60 Gb/day during ground station flybys, your onboard solid-state flight recorder will fill to 100% within days. Once saturated, all subsequent scientific discoveries are lost!
                </div>
              </div>
            )}

            {activeTopic === 'mass' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Weight className="w-4 h-4 text-purple-400" />
                  Mass Fractions & Launch Vehicle Capacities
                </h3>
                <p>
                  Every kilogram sent to space costs tens of thousands of dollars. Launch vehicles have strict lift envelopes that decrease steeply as mission destination gets further from Earth:
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between p-2 rounded bg-slate-800/40">
                    <span>Falcon-Class Medium to LEO:</span>
                    <strong className="text-white">14,500 kg</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-800/40">
                    <span>Falcon-Class Medium to Moon (TLI):</span>
                    <strong className="text-white">5,200 kg</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-800/40">
                    <span>Falcon-Class Medium to Mars/Deep Space:</span>
                    <strong className="text-white">3,400 kg</strong>
                  </div>
                </div>
                <p>
                  <strong>Agency Rule of Thumb:</strong> Maintain at least a 15% mass margin between your wet spacecraft mass and the launch vehicle’s maximum capability to account for design maturity growth.
                </p>
              </div>
            )}

            {activeTopic === 'team' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-sky-400" />
                  Team Dynamics & Negotiation Principles
                </h3>
                <p>
                  Real aerospace programs are collaborative consensus engineering efforts among competing technical disciplines:
                </p>
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/40">
                    <strong className="text-sky-300 block font-mono">Mission Director:</strong>
                    Watches the dollar signs, schedule milestones, and public risk. Wants to keep contingency cash for anomalies.
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40">
                    <strong className="text-amber-300 block font-mono">Spacecraft Engineer:</strong>
                    Craves safety margins (mass margin &gt; 20%, battery DoD &lt; 40%, thermal stability). Hates heavy payloads.
                  </div>
                  <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/40">
                    <strong className="text-purple-300 block font-mono">Science PI:</strong>
                    Demands cutting-edge spectrometers and radars to maximize Nobel-grade scientific breakthroughs, despite their heavy mass and power draw.
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
                    <strong className="text-emerald-300 block font-mono">Flight Dynamics & Comms:</strong>
                    Prioritizes orbital geometry, propulsion delta-V, and high-frequency laser links so data never sits idle on the spacecraft.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition-all"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
