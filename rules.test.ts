/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMission, simulateStep, evaluateMissionReport } from './rules';
import { MissionDesign, SimulationTelemetry } from './types';

const defaultDesign: MissionDesign = {
  scenarioId: 'earth-sentinel',
  orbitId: 'leo-sso',
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
  missionName: 'TerraScan Alpha',
  isTeamMode: true,
  activeRole: 'director',
  teamDecisions: {}
};

test('analyzeMission calculates positive margins for nominal Earth Sentinel configuration', () => {
  const analysis = analyzeMission(defaultDesign);

  assert.equal(analysis.isMassFeasible, true, 'Mass should be within launcher capacity');
  assert.ok(analysis.totalMassKg > 0, 'Total mass must be greater than zero');
  assert.ok(analysis.massMarginPct > 50, 'Falcon medium should have comfortable mass margin for small Earth satellite');
  assert.equal(analysis.isBudgetFeasible, true, 'Total cost must be within budget ceiling');
  assert.ok(analysis.rawScienceScore >= 280, 'Science score must meet or exceed minimum threshold');
});

test('analyzeMission flags critical error when mission exceeds launcher lift capacity', () => {
  // Aurora light has only 450 kg LEO payload
  // With heavy structure, radar, and large battery, mass exceeds 450 kg
  const heavyDesign: MissionDesign = {
    ...defaultDesign,
    launchVehicleId: 'lv-aurora-light',
    busComponents: {
      ...defaultDesign.busComponents,
      structure: 'struct-rad-shielded', // 480kg alone!
      battery: 'bat-deep-discharge'
    }
  };

  const analysis = analyzeMission(heavyDesign);
  assert.equal(analysis.isMassFeasible, false, 'Should be flagged as over mass capacity');
  assert.ok(
    analysis.criticalErrors.some(err => err.includes('Overweight')),
    'Critical errors must report overweight condition'
  );
});

test('analyzeMission handles nuclear RTG power generation at outer solar system distances', () => {
  const europaSolarDesign: MissionDesign = {
    ...defaultDesign,
    scenarioId: 'europa-life',
    orbitId: 'europa-flyby',
    launchVehicleId: 'lv-titan-heavy',
    busComponents: {
      ...defaultDesign.busComponents,
      power: 'pwr-dual-silicon' // Silicon at 5.2 AU generates almost nothing!
    }
  };
  const analysisSolar = analyzeMission(europaSolarDesign);
  assert.equal(analysisSolar.isPowerFeasible, false, 'Solar at 5.2 AU should fail power check');

  const europaRtgDesign: MissionDesign = {
    ...europaSolarDesign,
    busComponents: {
      ...europaSolarDesign.busComponents,
      power: 'pwr-rtg-nuclear' // Constant 850W
    }
  };
  const analysisRtg = analyzeMission(europaRtgDesign);
  assert.equal(analysisRtg.powerGeneratedW, 850, 'RTG must output constant nominal wattage');
  assert.equal(analysisRtg.isPowerFeasible, true, 'RTG should be viable at Europa');
});

test('simulateStep correctly advances orbital telemetry and battery levels', () => {
  const analysis = analyzeMission(defaultDesign);
  const initialTelemetry: SimulationTelemetry = {
    simDay: 1.0,
    orbitProgress: 0.1,
    trueAnomalyDeg: 36,
    altitudeKm: 700,
    velocityKms: 7.8,
    inEclipse: false,
    solarFluxWm2: 1361,
    batteryLevelPct: 100,
    dataBufferGb: 10,
    maxDataBufferGb: 1000,
    cumulativeScienceCollected: 50,
    spacecraftHealthPct: 100,
    groundStationInContact: true,
    downlinkActive: true,
    totalDataDownlinkedGb: 20,
    currentEvent: null,
    resolvedAnomalies: [],
    eventHistory: []
  };

  const nextTelemetry = simulateStep(initialTelemetry, defaultDesign, analysis, 0.5);

  assert.equal(nextTelemetry.simDay, 1.5, 'Simulation day should advance by dtDays');
  assert.ok(nextTelemetry.cumulativeScienceCollected >= 50, 'Cumulative science should increase over time');
});

test('evaluateMissionReport awards high grade and unlocks achievements for successful mission', () => {
  const analysis = analyzeMission(defaultDesign);
  const finalTelemetry: SimulationTelemetry = {
    simDay: 180,
    orbitProgress: 0.5,
    trueAnomalyDeg: 180,
    altitudeKm: 700,
    velocityKms: 7.8,
    inEclipse: false,
    solarFluxWm2: 1361,
    batteryLevelPct: 98,
    dataBufferGb: 5,
    maxDataBufferGb: 1000,
    cumulativeScienceCollected: 350,
    spacecraftHealthPct: 100,
    groundStationInContact: true,
    downlinkActive: true,
    totalDataDownlinkedGb: 300,
    currentEvent: null,
    resolvedAnomalies: ['anomaly-solar-storm', 'anomaly-reaction-wheel'],
    eventHistory: []
  };

  const report = evaluateMissionReport(defaultDesign, analysis, finalTelemetry);

  assert.ok(['S', 'A+', 'A'].includes(report.grade), 'Successful mission should receive S or A grade');
  assert.ok(report.overallScore >= 80, 'Score should be >= 80');
  assert.ok(report.awards.some(a => a.unlocked), 'At least one award should be unlocked');
  assert.ok(report.keyDiscoveries.length > 0, 'Key discoveries should be populated');
});
