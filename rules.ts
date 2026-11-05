/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MissionDesign,
  MissionAnalysis,
  SimulationTelemetry,
  MissionReport,
  BusComponentCategory
} from './types';
import {
  MISSION_SCENARIOS,
  ORBIT_PRESETS,
  LAUNCH_VEHICLES,
  BUS_COMPONENTS,
  SCIENTIFIC_INSTRUMENTS,
  ANOMALY_EVENTS
} from './missionData';

/**
 * Calculates complete engineering budgets: Mass, Power, Data, Budget, and Delta-V
 */
export function analyzeMission(design: MissionDesign): MissionAnalysis {
  const scenario = MISSION_SCENARIOS.find(s => s.id === design.scenarioId) || MISSION_SCENARIOS[0];
  const orbit = ORBIT_PRESETS.find(o => o.id === design.orbitId) || ORBIT_PRESETS[0];
  const launcher = LAUNCH_VEHICLES.find(l => l.id === design.launchVehicleId) || LAUNCH_VEHICLES[1];

  // 1. Resolve selected components
  const componentsList = Object.entries(design.busComponents).map(([cat, id]) => {
    const list = BUS_COMPONENTS[cat] || [];
    return list.find(c => c.id === id) || list[0];
  }).filter(Boolean);

  const instrumentsList = design.selectedInstruments.map(id => {
    return SCIENTIFIC_INSTRUMENTS.find(i => i.id === id);
  }).filter((i): i is typeof SCIENTIFIC_INSTRUMENTS[0] => Boolean(i));

  // 2. Mass Budget
  const busDryMass = componentsList.reduce((acc, c) => acc + c.massKg, 0);
  const instrumentsMass = instrumentsList.reduce((acc, i) => acc + i.massKg, 0);
  const dryMassKg = busDryMass + instrumentsMass;

  // Delta-V required
  const deltaVRequiredKms = scenario.baselineDeltaVKms + orbit.deltaVKms;

  // Propulsion capability & propellant calculation
  const propComponent = componentsList.find(c => c.category === 'propulsion');
  const deltaVCapacity = propComponent?.deltaVCapacityKms ?? 0.5;

  // Rocket propellant mass estimate
  // Approximate propellant fraction: for chemical, ~30-55% of dry mass for 1-2 km/s
  // For ion, very low propellant fraction (~5-15%)
  const isIon = propComponent?.id === 'prop-ion-electric';
  const propFactor = isIon ? 0.12 : Math.min(1.2, Math.max(0.15, deltaVRequiredKms * 0.38));
  const propellantMassKg = Math.round(dryMassKg * propFactor);
  const totalMassKg = dryMassKg + propellantMassKg;

  // Launcher Capacity at target destination
  let launcherCapacityKg = launcher.payloadLeoKg;
  if (scenario.targetBody === 'Moon' || orbit.id === 'geo-earth') {
    launcherCapacityKg = launcher.payloadGTOKg;
  } else if (scenario.targetBody === 'Mars' || scenario.targetBody === 'Europa' || scenario.targetBody === 'Deep Space') {
    launcherCapacityKg = launcher.payloadEscapeKg;
  }

  const massMarginPct = Math.round(((launcherCapacityKg - totalMassKg) / launcherCapacityKg) * 100);
  const isMassFeasible = totalMassKg <= launcherCapacityKg;

  // 3. Power Budget
  const powerComponent = componentsList.find(c => c.category === 'power');
  const batteryComponent = componentsList.find(c => c.category === 'battery');

  // Solar flux drops with 1 / distance^2
  const distance = scenario.solarDistanceAU;
  const solarScale = 1 / (distance * distance);

  // If RTG, power is independent of distance and eclipse
  const isRtg = powerComponent?.id === 'pwr-rtg-nuclear';
  const nominalGenW = powerComponent?.powerGenW ?? 800;
  const powerGeneratedW = isRtg ? nominalGenW : Math.round(nominalGenW * solarScale);

  // Continuous draw
  const busPowerDraw = componentsList.reduce((acc, c) => acc + c.powerDrawW, 0);
  const instrumentPowerDraw = instrumentsList.reduce((acc, i) => acc + i.powerDrawW, 0);
  const powerTotalDrawW = busPowerDraw + instrumentPowerDraw;

  const powerNetSunlightW = powerGeneratedW - powerTotalDrawW;
  const powerNetEclipseW = isRtg ? powerNetSunlightW : -powerTotalDrawW;

  const batteryCapacityWh = batteryComponent?.capacityWh ?? 1500;
  // Eclipse duration in hours
  const eclipseHours = orbit.eclipseDurationMin / 60;
  const eclipseEnergyRequiredWh = isRtg ? 0 : Math.round(powerTotalDrawW * eclipseHours);
  const batteryDepthOfDischargePct = batteryCapacityWh > 0 
    ? Math.round((eclipseEnergyRequiredWh / batteryCapacityWh) * 100) 
    : 100;

  // Feasibility: positive net in sunlight AND battery DoD < 80% (or RTG)
  const isPowerFeasible = (powerNetSunlightW > 0 || isRtg) && (isRtg || batteryDepthOfDischargePct <= 80);

  // 4. Financial Budget
  const busCost = componentsList.reduce((acc, c) => acc + c.costM, 0);
  const instrumentsCost = instrumentsList.reduce((acc, i) => acc + i.costM, 0);
  const operationsCost = Math.round((dryMassKg * 0.02) + 25); // operations & ground support
  const totalCostM = busCost + instrumentsCost + launcher.costM + operationsCost;
  const budgetLimitM = scenario.maxBudgetM;
  const budgetMarginM = budgetLimitM - totalCostM;
  const isBudgetFeasible = totalCostM <= budgetLimitM;

  // 5. Data & Telemetry Budget
  const totalDataGenGbDay = instrumentsList.reduce((acc, i) => acc + i.dataGenGbDay, 0);
  const commsComponent = componentsList.find(c => c.category === 'comms');
  const downlinkRateMbps = commsComponent?.downlinkRateMbps ?? 20;

  // Daily pass duration in minutes
  const totalDailyPassMinutes = orbit.commsPassesPerDay * orbit.commsPassDurationMin;
  // Daily bits = downlinkRateMbps * 1e6 * (minutes * 60)
  // Daily Gb = bits / 1e9 / 8 (in Gigabytes, where 1 Byte = 8 bits)
  const downlinkCapacityGbDay = Math.round(
    (downlinkRateMbps * (totalDailyPassMinutes * 60)) / 8000
  );

  const dataBalancePct = totalDataGenGbDay > 0
    ? Math.round((downlinkCapacityGbDay / totalDataGenGbDay) * 100)
    : 100;
  const isDataFeasible = totalDataGenGbDay === 0 || downlinkCapacityGbDay >= (totalDataGenGbDay * 0.7);

  // 6. Delta-V feasibility
  const deltaVAvailableKms = deltaVCapacity;
  const isDeltaVFeasible = deltaVAvailableKms >= (deltaVRequiredKms * 0.95);

  // 7. Expected Science Score
  let rawScienceScore = instrumentsList.reduce((acc, i) => acc + i.sciencePoints, 0);

  // Synergy bonuses
  const categoriesPresent = new Set(instrumentsList.map(i => i.synergyCategory));
  if (categoriesPresent.has('Optical') && categoriesPresent.has('Radar')) rawScienceScore += 40;
  if (categoriesPresent.has('Spectroscopy') && categoriesPresent.has('Volatiles')) rawScienceScore += 50;
  if (categoriesPresent.has('Astrobiology') && categoriesPresent.has('Volatiles')) rawScienceScore += 65;

  // Multiply by orbit coverage multiplier
  rawScienceScore = Math.round(rawScienceScore * orbit.scienceMultiplier * orbit.coverageQuality);

  // 8. Operational Lifetime & Reliability
  let operationalLifetimeYears = 3;
  if (powerComponent?.id === 'pwr-rtg-nuclear') operationalLifetimeYears += 10;
  if (propComponent?.id === 'prop-ion-electric') operationalLifetimeYears += 4;
  if (componentsList.find(c => c.id === 'struct-rad-shielded')) operationalLifetimeYears += 3;

  // Success probability
  let projectedSuccessProbability = launcher.reliability * 100;
  if (massMarginPct < 5) projectedSuccessProbability -= 15;
  if (batteryDepthOfDischargePct > 65) projectedSuccessProbability -= 10;
  if (dataBalancePct < 85) projectedSuccessProbability -= 8;
  if (!isDeltaVFeasible) projectedSuccessProbability -= 30;
  projectedSuccessProbability = Math.max(10, Math.min(99, Math.round(projectedSuccessProbability)));

  // 9. Warnings & Critical Errors
  const warnings: string[] = [];
  const criticalErrors: string[] = [];

  if (totalMassKg > launcherCapacityKg) {
    criticalErrors.push(
      `Overweight: Spacecraft total mass (${totalMassKg} kg) exceeds launcher capacity (${launcherCapacityKg} kg) by ${totalMassKg - launcherCapacityKg} kg.`
    );
  } else if (massMarginPct < 10) {
    warnings.push(`Low mass margin (${massMarginPct}%). Agency guidelines recommend >= 15% mass contingency.`);
  }

  if (powerNetSunlightW < 0 && !isRtg) {
    criticalErrors.push(
      `Power Deficit: Spacecraft consumes ${powerTotalDrawW}W but only generates ${powerGeneratedW}W in sunlight at ${distance} AU.`
    );
  }

  if (!isRtg && batteryDepthOfDischargePct > 80) {
    criticalErrors.push(
      `Battery Over-Discharge: Battery depth of discharge (${batteryDepthOfDischargePct}%) exceeds safe 80% ceiling during ${orbit.eclipseDurationMin}-min eclipse.`
    );
  } else if (!isRtg && batteryDepthOfDischargePct > 50) {
    warnings.push(
      `Elevated battery DoD (${batteryDepthOfDischargePct}%). Repeated deep cycles will degrade battery lifespan over time.`
    );
  }

  if (totalCostM > budgetLimitM) {
    criticalErrors.push(
      `Budget Overrun: Total cost ($${totalCostM}M) exceeds scenario ceiling ($${budgetLimitM}M) by $${totalCostM - budgetLimitM}M.`
    );
  }

  if (deltaVAvailableKms < deltaVRequiredKms * 0.95) {
    criticalErrors.push(
      `Insufficient Delta-V: Selected propulsion delivers ${deltaVAvailableKms.toFixed(2)} km/s, but trajectory requires ${deltaVRequiredKms.toFixed(2)} km/s.`
    );
  }

  if (downlinkCapacityGbDay < totalDataGenGbDay * 0.6) {
    warnings.push(
      `Data Downlink Choke: Instruments generate ${totalDataGenGbDay} Gb/day, but comms link can only downlink ${downlinkCapacityGbDay} Gb/day. Onboard buffer will saturate.`
    );
  }

  if (instrumentsList.length === 0) {
    criticalErrors.push('No scientific instruments installed. Mission cannot fulfill scientific objectives.');
  }

  return {
    dryMassKg,
    propellantMassKg,
    totalMassKg,
    launcherCapacityKg,
    massMarginPct,
    isMassFeasible,

    powerGeneratedW,
    powerTotalDrawW,
    powerNetSunlightW,
    powerNetEclipseW,
    batteryCapacityWh,
    eclipseEnergyRequiredWh,
    batteryDepthOfDischargePct,
    isPowerFeasible,

    totalCostM,
    budgetLimitM,
    budgetMarginM,
    isBudgetFeasible,

    totalDataGenGbDay,
    downlinkCapacityGbDay,
    dataBalancePct,
    isDataFeasible,

    deltaVRequiredKms,
    deltaVAvailableKms,
    isDeltaVFeasible,

    operationalLifetimeYears,
    rawScienceScore,
    projectedSuccessProbability,

    warnings,
    criticalErrors
  };
}

/**
 * Advances the real-time orbital simulation step by `dtDays`
 */
export function simulateStep(
  state: SimulationTelemetry,
  design: MissionDesign,
  analysis: MissionAnalysis,
  dtDays: number
): SimulationTelemetry {
  const orbit = ORBIT_PRESETS.find(o => o.id === design.orbitId) || ORBIT_PRESETS[0];
  const scenario = MISSION_SCENARIOS.find(s => s.id === design.scenarioId) || MISSION_SCENARIOS[0];

  const newDay = state.simDay + dtDays;

  // Orbital progress
  const orbitalPeriodDays = (orbit.orbitalPeriodMin) / (24 * 60);
  const orbitsElapsed = dtDays / orbitalPeriodDays;
  const newOrbitProgress = (state.orbitProgress + orbitsElapsed) % 1.0;
  const trueAnomalyDeg = Math.round(newOrbitProgress * 360);

  // Eclipse check: typically occurs on dark side (e.g. true anomaly 140 to 220 deg)
  const inEclipse = orbit.eclipseDurationMin > 0 && trueAnomalyDeg > 145 && trueAnomalyDeg < 215;

  // Solar flux calculation
  const baseSolarFlux = 1361; // W/m2 at 1 AU
  const solarFluxWm2 = inEclipse ? 0 : Math.round(baseSolarFlux / (scenario.solarDistanceAU * scenario.solarDistanceAU));

  // Battery charge dynamics
  let batteryLevel = state.batteryLevelPct;
  if (inEclipse) {
    const drainRatePctPerDay = (analysis.powerTotalDrawW * 24 / analysis.batteryCapacityWh) * 100;
    batteryLevel = Math.max(5, batteryLevel - drainRatePctPerDay * dtDays);
  } else {
    const chargeRatePctPerDay = (Math.max(10, analysis.powerNetSunlightW) * 24 / analysis.batteryCapacityWh) * 100;
    batteryLevel = Math.min(100, batteryLevel + chargeRatePctPerDay * dtDays);
  }

  // Science generation & data buffer
  const dailyScienceRate = analysis.rawScienceScore / 365;
  const scienceCollectedThisStep = dailyScienceRate * dtDays * (state.spacecraftHealthPct / 100);
  const newScienceTotal = Math.round(state.cumulativeScienceCollected + scienceCollectedThisStep);

  const dataGeneratedGb = analysis.totalDataGenGbDay * dtDays;
  let dataBuffer = state.dataBufferGb + dataGeneratedGb;

  // Ground station contact check (intermittent passes)
  // For GEO continuous; for LEO passes occur multiple times per orbit
  const groundStationInContact = (trueAnomalyDeg > 300 || trueAnomalyDeg < 60);
  const downlinkActive = groundStationInContact && dataBuffer > 0;

  let totalDownlinked = state.totalDataDownlinkedGb;
  if (downlinkActive) {
    const downlinkCapacityStep = analysis.downlinkCapacityGbDay * dtDays * 2.5;
    const dumped = Math.min(dataBuffer, downlinkCapacityStep);
    dataBuffer -= dumped;
    totalDownlinked += dumped;
  }

  // Clamp data buffer
  const maxDataBufferGb = 1000;
  dataBuffer = Math.min(maxDataBufferGb, Math.max(0, dataBuffer));

  // Check for triggerable anomalies
  let activeAnomaly = state.currentEvent;
  const eventHistory = [...state.eventHistory];

  if (!activeAnomaly) {
    for (const anomaly of ANOMALY_EVENTS) {
      if (
        !state.resolvedAnomalies.includes(anomaly.id) &&
        newDay >= anomaly.triggerDay &&
        state.simDay < anomaly.triggerDay
      ) {
        activeAnomaly = anomaly;
        eventHistory.unshift({
          day: Math.floor(newDay),
          text: `ANOMALY ALERT: ${anomaly.title}`,
          type: 'warning'
        });
        break;
      }
    }
  }

  // Log milestone events
  if (Math.floor(newDay / 30) > Math.floor(state.simDay / 30)) {
    eventHistory.unshift({
      day: Math.floor(newDay),
      text: `Flight Month ${Math.floor(newDay / 30)} operational milestone reached. Telemetry nominal.`,
      type: 'info'
    });
  }

  return {
    ...state,
    simDay: newDay,
    orbitProgress: newOrbitProgress,
    trueAnomalyDeg,
    altitudeKm: orbit.altitudeKm,
    velocityKms: 7.8, // nominal orbital speed
    inEclipse,
    solarFluxWm2,
    batteryLevelPct: Math.round(batteryLevel),
    dataBufferGb: Math.round(dataBuffer * 10) / 10,
    maxDataBufferGb,
    cumulativeScienceCollected: newScienceTotal,
    groundStationInContact,
    downlinkActive,
    totalDataDownlinkedGb: Math.round(totalDownlinked * 10) / 10,
    currentEvent: activeAnomaly,
    eventHistory: eventHistory.slice(0, 20)
  };
}

/**
 * Generates the final evaluation report card, awards, and score breakdown
 */
export function evaluateMissionReport(
  design: MissionDesign,
  analysis: MissionAnalysis,
  telemetry: SimulationTelemetry
): MissionReport {
  const scenario = MISSION_SCENARIOS.find(s => s.id === design.scenarioId) || MISSION_SCENARIOS[0];

  // 1. Component scores (0-100)
  // Science Score
  const scienceRatio = telemetry.cumulativeScienceCollected / scenario.minRequiredScience;
  const scienceScore = Math.min(100, Math.round(scienceRatio * 90));

  // Engineering Score (margins)
  let engineeringScore = 70;
  if (analysis.massMarginPct >= 15) engineeringScore += 10;
  if (analysis.isPowerFeasible) engineeringScore += 10;
  if (analysis.batteryDepthOfDischargePct <= 50) engineeringScore += 10;
  if (analysis.warnings.length === 0) engineeringScore += 5;
  engineeringScore = Math.min(100, Math.max(10, engineeringScore));

  // Budget Score
  let budgetScore = 60;
  if (analysis.budgetMarginM > 50) budgetScore += 25;
  else if (analysis.budgetMarginM > 10) budgetScore += 15;
  else if (analysis.budgetMarginM >= 0) budgetScore += 5;
  else budgetScore -= 30;
  budgetScore = Math.min(100, Math.max(10, budgetScore));

  // Team Synergy Score
  let teamSynergyScore = design.isTeamMode ? 92 : 85;
  if (telemetry.resolvedAnomalies.length >= 2) teamSynergyScore += 8;

  // Overall Score (Weighted)
  const overallScore = Math.round(
    scienceScore * 0.40 +
    engineeringScore * 0.25 +
    budgetScore * 0.20 +
    teamSynergyScore * 0.15
  );

  // Letter Grade
  let grade: MissionReport['grade'] = 'C';
  if (analysis.criticalErrors.length > 0 || telemetry.spacecraftHealthPct < 30) {
    grade = 'F';
  } else if (overallScore >= 95) {
    grade = 'S';
  } else if (overallScore >= 88) {
    grade = 'A+';
  } else if (overallScore >= 80) {
    grade = 'A';
  } else if (overallScore >= 70) {
    grade = 'B';
  }

  // Objectives check
  const achievedObjectives: string[] = [];
  const missedObjectives: string[] = [];

  scenario.primaryObjectives.forEach((obj, idx) => {
    if (idx === 0 && telemetry.cumulativeScienceCollected >= scenario.minRequiredScience * 0.7) {
      achievedObjectives.push(obj);
    } else if (idx === 1 && analysis.isPowerFeasible && analysis.isMassFeasible) {
      achievedObjectives.push(obj);
    } else if (idx === 2 && telemetry.totalDataDownlinkedGb > 50) {
      achievedObjectives.push(obj);
    } else {
      missedObjectives.push(obj);
    }
  });

  // Discoveries
  const keyDiscoveries: string[] = [];
  design.selectedInstruments.forEach(id => {
    const inst = SCIENTIFIC_INSTRUMENTS.find(i => i.id === id);
    if (inst) keyDiscoveries.push(inst.discoveryText);
  });

  // Awards
  const awards = [
    {
      id: 'award-perfection',
      title: 'Galileo Gold Medal',
      icon: 'award',
      description: 'Achieved an overall mission score above 90 with zero critical errors.',
      unlocked: overallScore >= 90 && analysis.criticalErrors.length === 0
    },
    {
      id: 'award-frugal',
      title: 'Fiscal Custodian',
      icon: 'dollar-sign',
      description: 'Completed mission objectives while preserving over $30M in contingency reserves.',
      unlocked: analysis.budgetMarginM >= 30
    },
    {
      id: 'award-telemetry',
      title: 'Deep Space Communi-Master',
      icon: 'radio',
      description: 'Downlinked more than 250 Gigabytes of science data without buffer saturation.',
      unlocked: telemetry.totalDataDownlinkedGb >= 250
    },
    {
      id: 'award-teamwork',
      title: 'Flight Director Laurels',
      icon: 'users',
      description: 'Resolved all operational in-flight anomalies through unified team consensus.',
      unlocked: telemetry.resolvedAnomalies.length >= 2
    }
  ];

  return {
    grade,
    overallScore,
    scienceScore,
    engineeringScore,
    budgetScore,
    teamSynergyScore,
    achievedObjectives,
    missedObjectives,
    keyDiscoveries,
    subsystemPerformance: [
      {
        subsystem: 'Power Subsystem',
        status: analysis.isPowerFeasible ? 'Nominal' : 'Strained',
        marginText: `${analysis.powerNetSunlightW >= 0 ? '+' : ''}${analysis.powerNetSunlightW}W Sunlight Margin / ${analysis.batteryDepthOfDischargePct}% Battery DoD`
      },
      {
        subsystem: 'Mass & Launch Vehicle',
        status: analysis.isMassFeasible ? 'Nominal' : 'Strained',
        marginText: `${analysis.massMarginPct}% Mass Margin (${analysis.totalMassKg} kg / ${analysis.launcherCapacityKg} kg)`
      },
      {
        subsystem: 'Communications & Downlink',
        status: analysis.isDataFeasible ? 'Nominal' : 'Degraded',
        marginText: `${analysis.downlinkCapacityGbDay} Gb/day Downlink (${analysis.dataBalancePct}% throughput)`
      },
      {
        subsystem: 'Propulsion & Trajectory',
        status: analysis.isDeltaVFeasible ? 'Nominal' : 'Strained',
        marginText: `${analysis.deltaVAvailableKms.toFixed(2)} km/s available vs ${analysis.deltaVRequiredKms.toFixed(2)} km/s required`
      }
    ],
    budgetSummary: {
      initialBudgetM: analysis.budgetLimitM,
      finalExpenditureM: analysis.totalCostM,
      surplusM: analysis.budgetMarginM
    },
    recommendations: [
      analysis.massMarginPct < 15
        ? 'Consider selecting lightweight carbon composite structure to widen launch payload safety margins.'
        : 'Mass allocation was well-balanced with comfortable launcher reserve.',
      analysis.batteryDepthOfDischargePct > 60
        ? 'Upgrade battery pack to solid-state or titan deep-cycle to avoid accelerated cell degradation during long shadows.'
        : 'Battery capacity adequately cushioned orbital eclipse power demands.',
      analysis.dataBalancePct < 100
        ? 'Upgrade antenna to high-gain X-band dish or optical laser terminal to accelerate data dump passes.'
        : 'Telemetry link bandwidth easily kept up with payload data production.'
    ],
    awards
  };
}
