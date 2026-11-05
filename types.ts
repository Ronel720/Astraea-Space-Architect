/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CelestialBody = 'Earth' | 'Moon' | 'Mars' | 'Europa' | 'Deep Space';

export type BusComponentCategory = 
  | 'structure' 
  | 'power' 
  | 'battery' 
  | 'propulsion' 
  | 'adcs' 
  | 'comms' 
  | 'thermal' 
  | 'computer';

export type PlayerRole = 'director' | 'engineer' | 'scientist' | 'flight';

export interface RoleInfo {
  id: PlayerRole;
  name: string;
  title: string;
  icon: string;
  focus: string;
  color: string;
  responsibilities: string[];
}

export interface MissionScenario {
  id: string;
  name: string;
  targetBody: CelestialBody;
  subtitle: string;
  description: string;
  difficulty: 'Novice' | 'Intermediate' | 'Advanced' | 'Expert';
  primaryObjectives: string[];
  minRequiredScience: number;
  maxBudgetM: number;
  targetOrbitId: string;
  solarDistanceAU: number;
  radiationLevel: 'Low' | 'Moderate' | 'Severe' | 'Extreme';
  baselineDeltaVKms: number;
  recommendedInstruments: string[];
  scienceGoalCategories: string[];
}

export interface Orbit {
  id: string;
  name: string;
  body: CelestialBody;
  altitudeKm: number;
  orbitalPeriodMin: number;
  eclipseDurationMin: number;
  deltaVKms: number;
  description: string;
  coverageQuality: number; // 0.5 to 1.5 multiplier
  commsPassesPerDay: number;
  commsPassDurationMin: number;
  scienceMultiplier: number;
}

export interface LaunchVehicle {
  id: string;
  name: string;
  liftClass: 'Light' | 'Medium' | 'Heavy' | 'Super Heavy';
  payloadLeoKg: number;
  payloadGTOKg: number;
  payloadEscapeKg: number; // TLI or TMI
  costM: number;
  reliability: number; // 0.90 to 0.99
  fairingDiameterM: number;
  description: string;
}

export interface BusComponent {
  id: string;
  name: string;
  category: BusComponentCategory;
  massKg: number;
  powerDrawW: number;
  powerGenW?: number; // Solar or RTG output at 1 AU
  capacityWh?: number; // Battery capacity
  downlinkRateMbps?: number; // For Comms
  deltaVCapacityKms?: number; // Specific impulse/delta-V capability
  pointingAccuracyArcsec?: number; // ADCS
  costM: number;
  techLevel: 'Proven' | 'Advanced' | 'Cutting-Edge';
  description: string;
  pros: string;
  cons: string;
}

export interface ScientificInstrument {
  id: string;
  name: string;
  type: 'Optical' | 'Radar' | 'Spectrometer' | 'Particles' | 'Field' | 'In-Situ';
  massKg: number;
  powerDrawW: number;
  dataGenGbDay: number;
  costM: number;
  sciencePoints: number;
  synergyCategory: string;
  description: string;
  discoveryText: string;
}

export interface MissionDesign {
  scenarioId: string;
  orbitId: string;
  launchVehicleId: string;
  busComponents: Record<BusComponentCategory, string>;
  selectedInstruments: string[];
  missionName: string;
  isTeamMode: boolean;
  activeRole: PlayerRole;
  teamDecisions: Record<string, string>;
}

export interface MissionAnalysis {
  dryMassKg: number;
  propellantMassKg: number;
  totalMassKg: number;
  launcherCapacityKg: number;
  massMarginPct: number;
  isMassFeasible: boolean;

  powerGeneratedW: number;
  powerTotalDrawW: number;
  powerNetSunlightW: number;
  powerNetEclipseW: number;
  batteryCapacityWh: number;
  eclipseEnergyRequiredWh: number;
  batteryDepthOfDischargePct: number;
  isPowerFeasible: boolean;

  totalCostM: number;
  budgetLimitM: number;
  budgetMarginM: number;
  isBudgetFeasible: boolean;

  totalDataGenGbDay: number;
  downlinkCapacityGbDay: number;
  dataBalancePct: number;
  isDataFeasible: boolean;

  deltaVRequiredKms: number;
  deltaVAvailableKms: number;
  isDeltaVFeasible: boolean;

  operationalLifetimeYears: number;
  rawScienceScore: number;
  projectedSuccessProbability: number;

  warnings: string[];
  criticalErrors: string[];
}

export interface AnomalyChoice {
  id: string;
  text: string;
  role: PlayerRole;
  rationale: string;
  powerImpactW?: number;
  scienceImpact?: number;
  healthImpact?: number;
  dataLossGb?: number;
  costImpactM?: number;
}

export interface AnomalyEvent {
  id: string;
  title: string;
  category: string;
  description: string;
  triggerDay: number;
  severity: 'Minor' | 'Moderate' | 'Critical';
  choices: AnomalyChoice[];
}

export interface TeamTradeoffDilemma {
  id: string;
  title: string;
  leadRole: PlayerRole;
  scenario: string;
  optionA: {
    label: string;
    description: string;
    favoredRole: PlayerRole;
    effectText: string;
  };
  optionB: {
    label: string;
    description: string;
    favoredRole: PlayerRole;
    effectText: string;
  };
}

export interface SimulationTelemetry {
  simDay: number;
  orbitProgress: number; // 0 to 1
  trueAnomalyDeg: number;
  altitudeKm: number;
  velocityKms: number;
  inEclipse: boolean;
  solarFluxWm2: number;
  batteryLevelPct: number;
  dataBufferGb: number;
  maxDataBufferGb: number;
  cumulativeScienceCollected: number;
  spacecraftHealthPct: number;
  groundStationInContact: boolean;
  downlinkActive: boolean;
  totalDataDownlinkedGb: number;
  currentEvent: AnomalyEvent | null;
  resolvedAnomalies: string[];
  eventHistory: Array<{
    day: number;
    text: string;
    type: 'info' | 'success' | 'warning' | 'critical';
  }>;
}

export interface MissionAward {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

export interface MissionReport {
  grade: 'S' | 'A+' | 'A' | 'B' | 'C' | 'F';
  overallScore: number;
  scienceScore: number;
  engineeringScore: number;
  budgetScore: number;
  teamSynergyScore: number;
  achievedObjectives: string[];
  missedObjectives: string[];
  keyDiscoveries: string[];
  subsystemPerformance: Array<{
    subsystem: string;
    status: 'Nominal' | 'Degraded' | 'Strained';
    marginText: string;
  }>;
  budgetSummary: {
    initialBudgetM: number;
    finalExpenditureM: number;
    surplusM: number;
  };
  recommendations: string[];
  awards: MissionAward[];
}
