/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MissionScenario,
  Orbit,
  LaunchVehicle,
  BusComponent,
  ScientificInstrument,
  RoleInfo,
  TeamTradeoffDilemma,
  AnomalyEvent
} from './types';

export const PLAYER_ROLES: RoleInfo[] = [
  {
    id: 'director',
    name: 'Mission Director',
    title: 'Flight Project Lead',
    icon: 'compass',
    focus: 'Budget, Risk & Schedule',
    color: '#38bdf8', // sky
    responsibilities: [
      'Manage financial budget and operational contingency margins',
      'Authorize mission trade-offs and resolve team impasses',
      'Balance risk versus scientific prestige and public impact'
    ]
  },
  {
    id: 'engineer',
    name: 'Chief Spacecraft Engineer',
    title: 'Systems & Bus Architect',
    icon: 'cpu',
    focus: 'Mass, Power & Subsystems',
    color: '#fbbf24', // amber
    responsibilities: [
      'Ensure total mass does not exceed launch vehicle lift capability',
      'Maintain positive power margin through orbital eclipse periods',
      'Configure bus reliability, thermal balance, and attitude control'
    ]
  },
  {
    id: 'scientist',
    name: 'Lead Project Scientist',
    title: 'Principal Investigator',
    icon: 'microscope',
    focus: 'Payload, Science & Sensors',
    color: '#a855f7', // purple
    responsibilities: [
      'Select instrument suite to satisfy primary science objectives',
      'Maximize data resolution and multi-sensor synergy bonuses',
      'Ensure observation targets match chosen orbital parameters'
    ]
  },
  {
    id: 'flight',
    name: 'Flight Dynamics & Comms',
    title: 'Navigation & Telemetry Lead',
    icon: 'radio',
    focus: 'Trajectory, Delta-V & Downlink',
    color: '#34d399', // emerald
    responsibilities: [
      'Validate orbital insertion delta-V and propulsion capability',
      'Calculate ground station pass duration and link budget bandwidth',
      'Prevent onboard memory buffer saturation during science runs'
    ]
  }
];

export const MISSION_SCENARIOS: MissionScenario[] = [
  {
    id: 'earth-sentinel',
    name: 'Gaia Sentinel: Climate & Ocean Monitor',
    targetBody: 'Earth',
    subtitle: 'Sun-Synchronous Polar Earth Observation',
    description: 'Design a high-fidelity Earth observation observatory to track global ice sheet melt, coastal sea level rise, and carbon emissions. Must maintain constant solar illumination angles and downlinks over polar ground stations.',
    difficulty: 'Novice',
    primaryObjectives: [
      'Map global ice sheet mass loss with sub-meter vertical precision',
      'Track urban greenhouse gas plumes and deforestation rates',
      'Deliver daily global climate telemetry to NOAA and ESA ground networks'
    ],
    minRequiredScience: 280,
    maxBudgetM: 380,
    targetOrbitId: 'leo-sso',
    solarDistanceAU: 1.0,
    radiationLevel: 'Low',
    baselineDeltaVKms: 0.15,
    recommendedInstruments: ['inst-optical-hd', 'inst-sar-radar', 'inst-spec-vnir'],
    scienceGoalCategories: ['Atmospheric', 'Cryosphere', 'Oceanography']
  },
  {
    id: 'lunar-ice',
    name: 'Artemis Scout: South Pole Ice Prospector',
    targetBody: 'Moon',
    subtitle: 'Lunar Polar Reconnaissance & Resource Mapping',
    description: 'Prospect the permanently shadowed craters of the Lunar South Pole (Shackleton & Faustini craters) to map volatile water ice deposits essential for future human habitation. Requires penetrating radar, neutron spectrometry, and high-gain cislunar communications.',
    difficulty: 'Intermediate',
    primaryObjectives: [
      'Detect and quantify subsurface hydrogen and water ice in shadowed craters',
      'Produce high-resolution 3D digital elevation models for crewed landings',
      'Maintain continuous relay with Earth Deep Space Network'
    ],
    minRequiredScience: 420,
    maxBudgetM: 550,
    targetOrbitId: 'lunar-polar',
    solarDistanceAU: 1.0,
    radiationLevel: 'Moderate',
    baselineDeltaVKms: 0.95,
    recommendedInstruments: ['inst-radar-ice', 'inst-gamma-neutron', 'inst-lidar-alt'],
    scienceGoalCategories: ['Volatiles', 'Geology', 'Topography']
  },
  {
    id: 'mars-explorer',
    name: 'Ares Vanguard: Atmospheric & Surface Prospector',
    targetBody: 'Mars',
    subtitle: 'Interplanetary Hohmann Insertion & Areostationary Survey',
    description: 'Survive an 8-month cruise through deep space to explore the Martian atmosphere, ancient river delta clays, and seasonal methane releases. Overcome severe communications latency (up to 20 minutes) and dust storms.',
    difficulty: 'Advanced',
    primaryObjectives: [
      'Isolate organic biomolecules and seasonal methane venting in Jezero/Gale regions',
      'Analyze Martian dust storm atmospheric dynamics and seasonal CO2 cap changes',
      'Achieve autonomous mission operations during solar conjunction communication blackouts'
    ],
    minRequiredScience: 650,
    maxBudgetM: 850,
    targetOrbitId: 'mars-low',
    solarDistanceAU: 1.52,
    radiationLevel: 'Severe',
    baselineDeltaVKms: 1.85,
    recommendedInstruments: ['inst-mass-spec', 'inst-spec-vnir', 'inst-thermal-ir', 'inst-dust-analyzer'],
    scienceGoalCategories: ['Astrobiology', 'Atmospheric', 'Geology']
  },
  {
    id: 'europa-life',
    name: 'Oceanus Probe: Europa Subsurface Life Seeker',
    targetBody: 'Europa',
    subtitle: 'Jovian Radiation Belt Insertion & Ocean World Flybys',
    description: 'A flagship outer solar system expedition into the intense magnetic radiation belts of Jupiter to investigate the global saltwater ocean concealed beneath Europa’s 15 km ice shell. Severe solar power deficit (5.2 AU) demands nuclear power and extreme radiation shielding.',
    difficulty: 'Expert',
    primaryObjectives: [
      'Sample water plumes erupting through fractures in the ice crust (Tiger Stripes)',
      'Characterize ocean depth, salinity, and thermal vent habitability indicators',
      'Survive cumulative mega-rad radiation doses from Jupiter’s magnetosphere'
    ],
    minRequiredScience: 900,
    maxBudgetM: 1600,
    targetOrbitId: 'europa-flyby',
    solarDistanceAU: 5.2,
    radiationLevel: 'Extreme',
    baselineDeltaVKms: 2.90,
    recommendedInstruments: ['inst-mass-spec', 'inst-radar-ice', 'inst-magnetometer', 'inst-dust-analyzer'],
    scienceGoalCategories: ['Astrobiology', 'Oceanography', 'Magnetosphere']
  },
  {
    id: 'sandbox',
    name: 'Prometheus: Unlimited Deep Space Sandbox',
    targetBody: 'Deep Space',
    subtitle: 'Unrestricted Advanced Mission Architect',
    description: 'Experiment freely with unlimited capital, custom exotic thrusters, ultra-heavy launch vehicles, and multi-spectral sensors to engineer the ultimate interplanetary flagship without constraint.',
    difficulty: 'Novice',
    primaryObjectives: [
      'Construct a flagship explorer with cutting-edge subsystem architectures',
      'Push instruments and propulsion to theoretical performance limits',
      'Evaluate deep space mission trade-offs in a free-form testing playground'
    ],
    minRequiredScience: 100,
    maxBudgetM: 5000,
    targetOrbitId: 'deep-space-helio',
    solarDistanceAU: 1.2,
    radiationLevel: 'Moderate',
    baselineDeltaVKms: 1.0,
    recommendedInstruments: ['inst-optical-hd', 'inst-sar-radar', 'inst-mass-spec'],
    scienceGoalCategories: ['Astrobiology', 'Geology', 'Atmospheric', 'Magnetosphere']
  }
];

export const ORBIT_PRESETS: Orbit[] = [
  {
    id: 'leo-sso',
    name: 'Low Earth Sun-Synchronous Orbit (SSO)',
    body: 'Earth',
    altitudeKm: 700,
    orbitalPeriodMin: 98.7,
    eclipseDurationMin: 32.5,
    deltaVKms: 0.15,
    description: 'Passes over poles with a consistent solar angle. Ideal for optical/radar Earth observation and constant lighting on target terrain.',
    coverageQuality: 1.35,
    commsPassesPerDay: 14,
    commsPassDurationMin: 10.5,
    scienceMultiplier: 1.2
  },
  {
    id: 'leo-equatorial',
    name: 'Low Earth Orbit (LEO) 400km',
    body: 'Earth',
    altitudeKm: 400,
    orbitalPeriodMin: 92.5,
    eclipseDurationMin: 36.0,
    deltaVKms: 0.08,
    description: 'Standard low-drag orbit with frequent ground station flyovers. Low delta-V requirement, but frequent eclipse cycles.',
    coverageQuality: 1.0,
    commsPassesPerDay: 16,
    commsPassDurationMin: 8.5,
    scienceMultiplier: 1.0
  },
  {
    id: 'geo-earth',
    name: 'Geostationary Earth Orbit (GEO)',
    body: 'Earth',
    altitudeKm: 35786,
    orbitalPeriodMin: 1436.0,
    eclipseDurationMin: 68.0,
    deltaVKms: 1.45,
    description: 'Fixed continuously over one hemisphere. Continuous uninterrupted communication link, but higher delta-V and lower spatial resolution.',
    coverageQuality: 0.85,
    commsPassesPerDay: 24, // 24 hours continuous
    commsPassDurationMin: 60.0,
    scienceMultiplier: 0.9
  },
  {
    id: 'lunar-polar',
    name: 'Low Lunar Polar Orbit (100km)',
    body: 'Moon',
    altitudeKm: 100,
    orbitalPeriodMin: 118.0,
    eclipseDurationMin: 45.0,
    deltaVKms: 0.95,
    description: 'Sweeps over every lunar latitude twice a month. Critical for continuous imaging of permanently shadowed polar craters.',
    coverageQuality: 1.4,
    commsPassesPerDay: 12,
    commsPassDurationMin: 12.0,
    scienceMultiplier: 1.3
  },
  {
    id: 'mars-low',
    name: 'Mars Low Science Orbit (350km)',
    body: 'Mars',
    altitudeKm: 350,
    orbitalPeriodMin: 112.0,
    eclipseDurationMin: 39.0,
    deltaVKms: 1.85,
    description: 'Provides close-proximity surface radar and atmospheric spectroscopy. Requires precise aerocapture or chemical propulsion insertion.',
    coverageQuality: 1.3,
    commsPassesPerDay: 8,
    commsPassDurationMin: 18.0,
    scienceMultiplier: 1.35
  },
  {
    id: 'europa-flyby',
    name: 'Jovian Europa-Resonant Flyby Orbit',
    body: 'Europa',
    altitudeKm: 400,
    orbitalPeriodMin: 5100.0, // Multi-day orbit around Jupiter with close Europa flyby
    eclipseDurationMin: 90.0,
    deltaVKms: 2.90,
    description: 'Highly elliptical orbit around Jupiter with periodic low-altitude skim passes over Europa. Minimizes time spent in fatal radiation belts.',
    coverageQuality: 1.5,
    commsPassesPerDay: 4,
    commsPassDurationMin: 45.0,
    scienceMultiplier: 1.6
  },
  {
    id: 'deep-space-helio',
    name: 'Heliocentric Interplanetary Trajectory',
    body: 'Deep Space',
    altitudeKm: 150000000,
    orbitalPeriodMin: 720000.0,
    eclipseDurationMin: 0.0,
    deltaVKms: 1.0,
    description: 'Escapes planetary gravity into interplanetary space. Continuous 100% solar illumination, zero orbital eclipses, but immense signal loss.',
    coverageQuality: 1.0,
    commsPassesPerDay: 2,
    commsPassDurationMin: 120.0,
    scienceMultiplier: 1.1
  }
];

export const LAUNCH_VEHICLES: LaunchVehicle[] = [
  {
    id: 'lv-aurora-light',
    name: 'Aurora Light (Electron-Class)',
    liftClass: 'Light',
    payloadLeoKg: 450,
    payloadGTOKg: 120,
    payloadEscapeKg: 40,
    costM: 14,
    reliability: 0.94,
    fairingDiameterM: 1.4,
    description: 'Rapid, low-cost dedicated smallsat launcher. Perfect for budget-constrained CubeSats and lightweight Earth observation probes.'
  },
  {
    id: 'lv-falcon-medium',
    name: 'Valkyrie-9 Medium (Falcon-Class)',
    liftClass: 'Medium',
    payloadLeoKg: 14500,
    payloadGTOKg: 5200,
    payloadEscapeKg: 3400,
    costM: 67,
    reliability: 0.99,
    fairingDiameterM: 4.6,
    description: 'The workhorse of modern spaceflight. Reusable first stage delivers unmatched reliability and cost efficiency across LEO, GTO, and Lunar missions.'
  },
  {
    id: 'lv-titan-heavy',
    name: 'Titan Heavy (Delta/Falcon Heavy)',
    liftClass: 'Heavy',
    payloadLeoKg: 42000,
    payloadGTOKg: 18000,
    payloadEscapeKg: 12500,
    costM: 145,
    reliability: 0.98,
    fairingDiameterM: 5.2,
    description: 'Three core booster configuration capable of propelling massive multi-ton scientific flagships directly into interplanetary Hohmann transfer trajectories.'
  },
  {
    id: 'lv-olympus-super',
    name: 'Olympus Super Heavy (Starship/SLS)',
    liftClass: 'Super Heavy',
    payloadLeoKg: 120000,
    payloadGTOKg: 50000,
    payloadEscapeKg: 38000,
    costM: 280,
    reliability: 0.96,
    fairingDiameterM: 9.0,
    description: 'Colossal super-heavy architecture designed for outer solar system flagships, massive nuclear propulsion stages, and crewed habitat precursors.'
  }
];

export const BUS_COMPONENTS: Record<string, BusComponent[]> = {
  structure: [
    {
      id: 'struct-carbon',
      name: 'Ultra-Light Carbon Composite Chassis',
      category: 'structure',
      massKg: 120,
      powerDrawW: 0,
      costM: 22,
      techLevel: 'Advanced',
      description: 'Honeycomb carbon fiber structure offering maximum mass reduction and high stiffness for optical instrument mounting.',
      pros: 'Minimal mass impact, exceptional thermal dimensional stability',
      cons: 'Higher fabrication cost, sensitive to shear loads'
    },
    {
      id: 'struct-alu',
      name: 'Standard Aluminum-Lithium Modular Bus',
      category: 'structure',
      massKg: 240,
      powerDrawW: 0,
      costM: 11,
      techLevel: 'Proven',
      description: 'Aerospace-grade machined Al-Li alloy frame with heritage modular mounting bays and proven vibration resistance.',
      pros: 'Low cost, easy mechanical integration, robust heritage',
      cons: 'Heavier dry mass penalty'
    },
    {
      id: 'struct-rad-shielded',
      name: 'Tungsten-Reinforced Rad-Hard Vault',
      category: 'structure',
      massKg: 480,
      powerDrawW: 0,
      costM: 48,
      techLevel: 'Cutting-Edge',
      description: 'Titanium-tantalum shielded avionics vault designed to survive mega-rad Jovian radiation belts and intense cosmic rays.',
      pros: 'Immunity to high-energy proton/electron radiation upsets',
      cons: 'Heavy mass overhead, high material expense'
    }
  ],
  power: [
    {
      id: 'pwr-dual-silicon',
      name: 'Dual Deployable Silicon Solar Arrays',
      category: 'power',
      massKg: 75,
      powerDrawW: 0,
      powerGenW: 750, // at 1 AU
      costM: 14,
      techLevel: 'Proven',
      description: 'Standard fold-out solar wings. Efficient and affordable inside 1.5 AU, but performance degrades severely in outer planets.',
      pros: 'Economical, lightweight, high flight heritage',
      cons: 'Square-law inverse drop past Mars (negligible power at Jupiter)'
    },
    {
      id: 'pwr-articulating-gaas',
      name: 'Ultra-Flex Articulating GaAs Multi-Junction Wings',
      category: 'power',
      massKg: 160,
      powerDrawW: 0,
      powerGenW: 2400, // at 1 AU
      costM: 38,
      techLevel: 'Advanced',
      description: 'High-efficiency triple-junction gallium arsenide cells with dual-axis motorized sun-tracking gimbals.',
      pros: 'Huge 2400W output, maintains partial generation out to Mars',
      cons: 'Complex deployment mechanism, larger mass footprint'
    },
    {
      id: 'pwr-rtg-nuclear',
      name: 'Next-Gen Stirling Radioisotope Generator (ASRG)',
      category: 'power',
      massKg: 210,
      powerDrawW: 0,
      powerGenW: 850, // constant regardless of distance or eclipse!
      costM: 95,
      techLevel: 'Cutting-Edge',
      description: 'Plutonium-238 decay heat converted to steady electricity via advanced Stirling convertors. 100% immune to eclipses and solar distance.',
      pros: 'Constant power at Jupiter, zero loss in orbital shadow, 25yr lifetime',
      cons: 'Very expensive, strict nuclear launch licensing protocols'
    }
  ],
  battery: [
    {
      id: 'bat-li-ion-std',
      name: 'Space-Qualified Li-Ion Battery Pack (1,200 Wh)',
      category: 'battery',
      massKg: 45,
      powerDrawW: 0,
      capacityWh: 1200,
      costM: 6,
      techLevel: 'Proven',
      description: 'Reliable lithium-ion cell arrangement suitable for short 30-minute Low Earth Orbit eclipse periods.',
      pros: 'Low cost and weight for modest eclipse durations',
      cons: 'Risk of deep-discharge degradation on longer shadow passes'
    },
    {
      id: 'bat-solid-state',
      name: 'Advanced Solid-State Ceramic Battery (3,000 Wh)',
      category: 'battery',
      massKg: 75,
      powerDrawW: 0,
      capacityWh: 3000,
      costM: 18,
      techLevel: 'Advanced',
      description: 'Non-volatile ceramic solid electrolyte with superior energy density and resistance to thermal runaway.',
      pros: 'Safe 80% depth-of-discharge, high capacity, rapid recharge',
      cons: 'Moderate cost premium'
    },
    {
      id: 'bat-deep-discharge',
      name: 'Deep-Cycle Cryo-Tolerant Titan Pack (6,000 Wh)',
      category: 'battery',
      massKg: 140,
      powerDrawW: 0,
      capacityWh: 6000,
      costM: 32,
      techLevel: 'Cutting-Edge',
      description: 'High-capacity redundant battery bank built for long lunar nights (up to 354 hours) or multi-hour planetary occultations.',
      pros: 'Massive energy reserve for high-power radar passes in shadow',
      cons: 'Significant mass penalty'
    }
  ],
  propulsion: [
    {
      id: 'prop-monoprop-rcs',
      name: 'Hydrazine Monopropellant RCS Thruster System',
      category: 'propulsion',
      massKg: 65,
      powerDrawW: 20,
      deltaVCapacityKms: 0.35,
      costM: 9,
      techLevel: 'Proven',
      description: 'Catalytic decomposition of hydrazine through 12 attitude control thrusters for fine orientation and orbit maintenance.',
      pros: 'Instantaneous response, lightweight hardware, simple plumbing',
      cons: 'Low specific impulse, limited total delta-V'
    },
    {
      id: 'prop-biprop-apogee',
      name: 'Dual-Mode Hydrazine/NTO Bipropellant Engine',
      category: 'propulsion',
      massKg: 190,
      powerDrawW: 45,
      deltaVCapacityKms: 1.65,
      costM: 26,
      techLevel: 'Proven',
      description: 'High-thrust 400N apogee kick engine with hypergolic oxidizer for rapid orbital insertion and planetary capture burns.',
      pros: 'High thrust for rapid capture burns, reliable heritage',
      cons: 'Heavy wet propellant mass fraction'
    },
    {
      id: 'prop-ion-electric',
      name: 'High-Efficiency Hall Effect Krypton Ion Engine',
      category: 'propulsion',
      massKg: 110,
      powerDrawW: 650, // high continuous electrical draw!
      deltaVCapacityKms: 4.80,
      costM: 42,
      techLevel: 'Advanced',
      description: 'Electrostatic xenon/krypton plasma accelerator delivering extreme specific impulse (Isp > 2,800 s).',
      pros: 'Tremendous delta-V capacity for interplanetary voyages',
      cons: 'Requires 650W continuous electric power; very low instantaneous thrust'
    }
  ],
  adcs: [
    {
      id: 'adcs-reaction-wheels',
      name: '3-Axis Momentum Wheels & Sun Sensors',
      category: 'adcs',
      massKg: 35,
      powerDrawW: 45,
      pointingAccuracyArcsec: 35,
      costM: 7,
      techLevel: 'Proven',
      description: 'Standard flywheels that adjust spacecraft orientation by momentum transfer. Suitable for wide-field sensors.',
      pros: 'Low electrical consumption, proven mechanical architecture',
      cons: 'Wheel desaturation requires periodic propellant thruster firings'
    },
    {
      id: 'adcs-star-trackers',
      name: 'Autonomous Dual Star Trackers & High-Torque CMGs',
      category: 'adcs',
      massKg: 68,
      powerDrawW: 90,
      pointingAccuracyArcsec: 1.2,
      costM: 21,
      techLevel: 'Advanced',
      description: 'Precision celestial pattern recognition cameras combined with Control Moment Gyroscopes for sub-arcsecond lock on scientific targets.',
      pros: 'Ultra-stable precision pointing for high-res telescopes and SAR',
      cons: 'Sensitive to thruster vibration jitter'
    }
  ],
  comms: [
    {
      id: 'comms-s-band',
      name: 'Medium-Gain S-Band Horn Antenna Array',
      category: 'comms',
      massKg: 22,
      powerDrawW: 35,
      downlinkRateMbps: 12,
      costM: 5,
      techLevel: 'Proven',
      description: 'Omni-directional wide-beam antenna. Ideal for Low Earth Orbit telemetry and emergency safe-mode commands.',
      pros: 'Does not require precise Earth-pointing gimbal, low mass',
      cons: 'Bandwidth limited to 12 Mbps; insufficient for heavy imaging data'
    },
    {
      id: 'comms-x-band-dish',
      name: '2.4m High-Gain Steerable X/Ka-Band Parabolic Dish',
      category: 'comms',
      massKg: 55,
      powerDrawW: 110,
      downlinkRateMbps: 150,
      costM: 19,
      techLevel: 'Advanced',
      description: 'Gimballed carbon-mesh reflector providing high-speed telemetry links to Deep Space Network stations across cislunar and Mars distances.',
      pros: 'Fast 150 Mbps throughput, deep space operational reach',
      cons: 'Must continuously articulate toward Earth ground stations'
    },
    {
      id: 'comms-optical-laser',
      name: 'Deep Space Optical Laser Downlink Terminal (DSOC)',
      category: 'comms',
      massKg: 85,
      powerDrawW: 220,
      downlinkRateMbps: 850,
      costM: 45,
      techLevel: 'Cutting-Edge',
      description: 'Near-infrared laser transmitter sending gigabit optical pulses directly to ground observatories.',
      pros: 'Massive 850 Mbps bandwidth, unlocks real-time 4K hyper-spectral data',
      cons: 'Requires cloud-free Earth ground stations and sub-microradian pointing'
    }
  ],
  thermal: [
    {
      id: 'therm-passive-mli',
      name: 'Multi-Layer Insulation (MLI) & Heat Pipes',
      category: 'thermal',
      massKg: 30,
      powerDrawW: 15,
      costM: 4,
      techLevel: 'Proven',
      description: 'Reflective aluminized Mylar blankets and copper-ammonia heat pipes passively balancing sunlight heating and space cold.',
      pros: 'Simple, lightweight, zero moving parts',
      cons: 'Limited active heat dissipation for high-power electronics'
    },
    {
      id: 'therm-active-louver',
      name: 'Active Thermal Louvers & Dual-Loop Glycol Radiator',
      category: 'thermal',
      massKg: 65,
      powerDrawW: 60,
      costM: 16,
      techLevel: 'Advanced',
      description: 'Mechanical venetian-blind louvers with pumped fluid heat exchanger capable of radiating up to 3,000 W of excess heat.',
      pros: 'Maintains optimal 20°C avionics temperature under variable solar flux',
      cons: 'Requires fluid pumps and active power draw'
    }
  ],
  computer: [
    {
      id: 'comp-rad-hard',
      name: 'Dual Rad-Hard Space Processor & 256 GB Storage',
      category: 'computer',
      massKg: 18,
      powerDrawW: 30,
      costM: 8,
      techLevel: 'Proven',
      description: 'Radiation-hardened BAE RAD750 architecture with error-correcting memory and proven flight heritage on Curiosity and Kepler.',
      pros: 'Rock-solid reliability against single-event upsets (SEUs)',
      cons: 'Modest data buffer capacity (256 GB)'
    },
    {
      id: 'comp-ai-autonomous',
      name: 'Quad-Core Neural Flight Computer & 2 TB Rad-Tolerant Flash',
      category: 'computer',
      massKg: 32,
      powerDrawW: 75,
      costM: 24,
      techLevel: 'Cutting-Edge',
      description: 'High-speed AI coprocessor capable of onboard data compression, autonomous anomaly mitigation, and smart event prioritization.',
      pros: 'Compresses scientific data by 40%, enables automated emergency recovery',
      cons: 'Higher power consumption (75 W)'
    }
  ]
};

export const SCIENTIFIC_INSTRUMENTS: ScientificInstrument[] = [
  {
    id: 'inst-optical-hd',
    name: 'High-Resolution Multispectral Imager (HR-MSI)',
    type: 'Optical',
    massKg: 48,
    powerDrawW: 55,
    dataGenGbDay: 85,
    costM: 28,
    sciencePoints: 120,
    synergyCategory: 'Optical',
    description: '0.3-meter ground resolution optical telescope across 12 spectral bands (visible to near-infrared).',
    discoveryText: 'Discovered intricate geomorphological surface details and tracked erosion channels with unprecedented spatial resolution.'
  },
  {
    id: 'inst-sar-radar',
    name: 'L-Band Synthetic Aperture Radar (SAR)',
    type: 'Radar',
    massKg: 120,
    powerDrawW: 320,
    dataGenGbDay: 190,
    costM: 64,
    sciencePoints: 180,
    synergyCategory: 'Radar',
    description: 'Active phased-array radar penetrating cloud cover, volcanic ash, and topsoil to map subsurface tectonic structures.',
    discoveryText: 'Penetrated dense surface regolith, revealing buried paleochannels and structural faults hidden beneath surface dust.'
  },
  {
    id: 'inst-spec-vnir',
    name: 'Visible & Near-Infrared Imaging Spectrometer',
    type: 'Spectrometer',
    massKg: 38,
    powerDrawW: 42,
    dataGenGbDay: 60,
    costM: 32,
    sciencePoints: 110,
    synergyCategory: 'Spectroscopy',
    description: 'Measures absorption bands to identify hydrated minerals, carbonate rocks, and organic signatures.',
    discoveryText: 'Identified rich deposits of clay minerals and hydrated silicates indicating long-standing past liquid water.'
  },
  {
    id: 'inst-lidar-alt',
    name: 'Planetary Laser Altimeter & 3D LIDAR',
    type: 'Optical',
    massKg: 28,
    powerDrawW: 40,
    dataGenGbDay: 35,
    costM: 22,
    sciencePoints: 85,
    synergyCategory: 'Topography',
    description: 'Fires 10,000 laser pulses per second to build millimeter-accuracy topographic relief models.',
    discoveryText: 'Constructed an ultra-precise digital terrain elevation model identifying safe landing sites inside impact basins.'
  },
  {
    id: 'inst-magnetometer',
    name: 'Dual Fluxgate Magnetometer & Plasma Wave Boom',
    type: 'Field',
    massKg: 16,
    powerDrawW: 14,
    dataGenGbDay: 12,
    costM: 12,
    sciencePoints: 75,
    synergyCategory: 'Field',
    description: 'Deployable 4-meter carbon boom measuring magnetic anomalies, induced subsurface currents, and solar wind interactions.',
    discoveryText: 'Detected induced magnetic dipoles confirming a conductive global saltwater layer beneath the crust.'
  },
  {
    id: 'inst-thermal-ir',
    name: 'Thermal Infrared Radiometer & Atmospheric Sounder',
    type: 'Spectrometer',
    massKg: 34,
    powerDrawW: 38,
    dataGenGbDay: 40,
    costM: 26,
    sciencePoints: 95,
    synergyCategory: 'Spectroscopy',
    description: 'Analyzes thermal inertia of surface rocks, surface geothermal hotspots, and atmospheric temperature profiles.',
    discoveryText: 'Pinpointed localized geothermal warm spots along tectonic fractures suggesting active hydrothermal activity.'
  },
  {
    id: 'inst-gamma-neutron',
    name: 'Gamma-Ray & Epithermal Neutron Spectrometer',
    type: 'Spectrometer',
    massKg: 42,
    powerDrawW: 35,
    dataGenGbDay: 18,
    costM: 36,
    sciencePoints: 130,
    synergyCategory: 'Volatiles',
    description: 'Counts cosmic-ray-generated neutrons to measure hydrogen abundance, directly prospecting for water ice up to 1m depth.',
    discoveryText: 'Quantified substantial hydrogen concentrations within permanently shadowed polar craters, verifying accessible water ice.'
  },
  {
    id: 'inst-mass-spec',
    name: 'Gas Chromatography & Quadrupole Mass Spectrometer',
    type: 'In-Situ',
    massKg: 52,
    powerDrawW: 95,
    dataGenGbDay: 25,
    costM: 58,
    sciencePoints: 175,
    synergyCategory: 'Astrobiology',
    description: 'Sniffs and ionizes atmospheric plumes and exosphere particles to detect complex organic carbon compounds and amino acid precursors.',
    discoveryText: 'Isolated volatile organic fragments and complex prebiotic hydrocarbons within vented atmospheric plumes!'
  },
  {
    id: 'inst-dust-analyzer',
    name: 'Impact Ionization Cosmic Dust Analyzer',
    type: 'Particles',
    massKg: 20,
    powerDrawW: 22,
    dataGenGbDay: 15,
    costM: 18,
    sciencePoints: 80,
    synergyCategory: 'Particles',
    description: 'Measures mass, velocity, charge, and elemental composition of hypervelocity micrometeorites and ice grain ejections.',
    discoveryText: 'Captured and analyzed ejected ice grains showing silica-rich nanoparticles produced by hydrothermal ocean floor vents.'
  },
  {
    id: 'inst-radar-ice',
    name: 'Deep Ice-Penetrating Radar Sounder (REMS)',
    type: 'Radar',
    massKg: 65,
    powerDrawW: 160,
    dataGenGbDay: 110,
    costM: 48,
    sciencePoints: 160,
    synergyCategory: 'Radar',
    description: 'Low-frequency radar antennas penetrating up to 5 km beneath polar ice sheets to chart subsurface liquid lakes and ice crust thickness.',
    discoveryText: 'Sounded deep into the ice shell, imaging the precise interface between brittle outer ice and the liquid ocean below!'
  }
];

export const TEAM_DILEMMAS: TeamTradeoffDilemma[] = [
  {
    id: 'dilemma-science-vs-mass',
    title: 'High-Res Payload vs Mass Margin',
    leadRole: 'scientist',
    scenario: 'The Lead Project Scientist wants to add the Deep Ice Sounder (+65kg, +$48M) to maximize primary science points. However, the Chief Engineer warns this reduces the launch mass margin below the agency 12% safety threshold.',
    optionA: {
      label: 'Authorize Instrument Addition',
      description: 'Equip the advanced sounder. Boosts potential science return by +160 pts, but tightens mass margin and cuts contingency reserves.',
      favoredRole: 'scientist',
      effectText: '+160 Science Return, -8% Mass Margin, -$48M Budget'
    },
    optionB: {
      label: 'Enforce Engineering Safety Margin',
      description: 'Prioritize system robustness. Maintain healthy structural safety margins and save budget for mission longevity and anomaly mitigation.',
      favoredRole: 'engineer',
      effectText: '+10% Reliability Margin, Preserves Budget Contingency'
    }
  },
  {
    id: 'dilemma-downlink-vs-power',
    title: 'Optical Laser Downlink vs Electrical Draw',
    leadRole: 'flight',
    scenario: 'The Flight Dynamics & Comms Officer recommends upgrading to the Optical Laser Downlink (850 Mbps) to eliminate data bottlenecks. The Engineer points out that the 220W continuous power draw will strain batteries during orbital eclipses.',
    optionA: {
      label: 'Install Optical Laser Terminal',
      description: 'Unlocks ultra-fast gigabit downlink. High-resolution science passes will never be throttled by memory saturation.',
      favoredRole: 'flight',
      effectText: '+700 Mbps Downlink Capacity, Strains Battery in Eclipse'
    },
    optionB: {
      label: 'Stick with Steerable X-Band Dish',
      description: 'Use the proven 150 Mbps dish. Maintains positive power buffer and protects battery life cycle.',
      favoredRole: 'engineer',
      effectText: 'Balanced Power Grid, Lower Cost, Standard Downlink Rate'
    }
  },
  {
    id: 'dilemma-rtg-vs-solar',
    title: 'Nuclear RTG vs Articulating Solar Arrays',
    leadRole: 'director',
    scenario: 'For deep space missions, the Director must choose between an expensive Nuclear Stirling RTG ($95M, constant power) or articulating GaAs solar wings ($38M, but prone to eclipse dropouts and distance loss).',
    optionA: {
      label: 'Procure Nuclear Stirling RTG',
      description: 'Guarantees uninterrupted 850W power in all shadows, eclipses, and out to Jupiter. Zero battery drain risk.',
      favoredRole: 'engineer',
      effectText: 'Constant 850W Independent of Sun, -$95M Budget'
    },
    optionB: {
      label: 'Fly Lightweight Solar Wings',
      description: 'Saves $57M in program budget for additional instruments, but requires aggressive power-cycling during planetary eclipses.',
      favoredRole: 'director',
      effectText: '+$57M Cost Savings, Dependent on Battery Storage in Shadow'
    }
  }
];

export const ANOMALY_EVENTS: AnomalyEvent[] = [
  {
    id: 'anomaly-solar-storm',
    title: 'Coronal Mass Ejection (Solar Proton Storm)',
    category: 'Space Weather',
    description: 'An X-class solar flare has erupted from the Sun, directing a dense stream of high-energy protons directly toward your spacecraft. Star trackers report pixel noise and solar arrays experience slight degradation.',
    triggerDay: 28,
    severity: 'Moderate',
    choices: [
      {
        id: 'storm-safemode',
        text: 'Enter Protective Safe Mode & Orient Shields Sunward',
        role: 'engineer',
        rationale: 'Stow optical instrument doors, turn high-density avionics shields to the proton stream, and idle non-critical systems.',
        healthImpact: 0,
        scienceImpact: -15,
        powerImpactW: 0
      },
      {
        id: 'storm-rideout',
        text: 'Maintain Observation Run & Record Storm Physics',
        role: 'scientist',
        rationale: 'Take the risk: use field spectrometers and radiation sensors to collect rare real-time solar flare physics data.',
        healthImpact: -10,
        scienceImpact: +45,
        powerImpactW: -25
      }
    ]
  },
  {
    id: 'anomaly-reaction-wheel',
    title: 'Reaction Wheel Bearing Friction Spike',
    category: 'Attitude Control',
    description: 'Telemetry shows reaction wheel #2 experiencing elevated bearing temperatures and drag torque, causing attitude jitter during high-resolution optical captures.',
    triggerDay: 62,
    severity: 'Minor',
    choices: [
      {
        id: 'wheel-desaturate',
        text: 'Perform Momentum Dump & Switch to Backup Wheel',
        role: 'engineer',
        rationale: 'Fire RCS thrusters to desaturate the flywheel and shift attitude control to the redundant momentum assembly.',
        healthImpact: 0,
        scienceImpact: 0,
        powerImpactW: +10
      },
      {
        id: 'wheel-thruster-damp',
        text: 'Use RCS Micro-Thrusters for Fine Pointing',
        role: 'flight',
        rationale: 'Bypass the sluggish reaction wheel entirely by commanding ultra-fine cold-gas thruster pulses during science imaging.',
        healthImpact: +5,
        scienceImpact: +10,
        powerImpactW: 0
      }
    ]
  },
  {
    id: 'anomaly-ground-station-outage',
    title: 'Deep Space Network Antenna Maintenance Outage',
    category: 'Ground Segment',
    description: 'Heavy atmospheric weather has disrupted the primary 70-meter Deep Space Network dish in Goldstone. Scheduled downlink window cancelled; onboard memory buffer is filling up toward 90% capacity.',
    triggerDay: 105,
    severity: 'Moderate',
    choices: [
      {
        id: 'dsn-compress',
        text: 'Execute Onboard Lossless AI Compression Algorithm',
        role: 'scientist',
        rationale: 'Run the onboard flight computer compression routine to reduce stored dataset volume by 35% without fidelity loss.',
        healthImpact: 0,
        scienceImpact: 0,
        dataLossGb: 0
      },
      {
        id: 'dsn-secondary',
        text: 'Re-route High-Priority Telemetry to Madrid Secondary Dish',
        role: 'flight',
        rationale: 'Negotiate priority emergency time on ESA’s Cebreros antenna to dump core discovery packets before buffer overflow.',
        healthImpact: 0,
        scienceImpact: +15,
        costImpactM: 2
      }
    ]
  }
];
