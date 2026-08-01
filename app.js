const PERFUSION_FIELD_CONFIG = {
  heightCm: { label: "Height", min: 30, max: 250, allowZero: false },
  weightKg: { label: "Weight", min: 1, max: 300, allowZero: false },
  cardiacIndex: { label: "Cardiac index", min: 0.1, max: 6, allowZero: false },
  pumpFlow: { label: "Pump flow", min: 0.1, max: 12, allowZero: false },
  hgb: { label: "Hemoglobin", min: 1, max: 25, allowZero: false },
  hct: { label: "Hematocrit", min: 5, max: 80, allowZero: false },
  saO2: { label: "SaO2", min: 0, max: 100, allowZero: true },
  paO2: { label: "PaO2", min: 0, max: 600, allowZero: true },
  do2iTarget: { label: "DO2i target", min: 100, max: 500, allowZero: false },
};

const PERFUSION_FLOW_INDEX_VALUES = [1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8, 3.0];

const PRIME_FIELD_CONFIG = {
  primeWeightKg: { label: "Weight", min: 1, max: 300, allowZero: false },
  primeEbvFactor: { label: "Estimated blood volume factor", min: 40, max: 100, allowZero: false },
  primeBaselineHct: { label: "Pre-CPB hematocrit", min: 10, max: 70, allowZero: false },
  primeVolumeMl: { label: "Prime volume", min: 50, max: 3000, allowZero: false },
  primeTargetHct: { label: "Target on-pump hematocrit", min: 10, max: 50, allowZero: false },
  primePrbcHct: { label: "PRBC hematocrit", min: 40, max: 90, allowZero: false },
};

const ANTICOAG_FIELD_CONFIG = {
  anticoagWeightKg: { label: "Weight", min: 1, max: 300, allowZero: false },
  anticoagEbvFactor: { label: "Estimated blood volume factor", min: 40, max: 100, allowZero: false },
  anticoagPrimeVolumeMl: { label: "Prime volume", min: 0, max: 5000, allowZero: true },
  heparinDosePerKg: { label: "Heparin loading dose", min: 50, max: 1000, allowZero: false },
  baselineActSeconds: { label: "Baseline ACT", min: 50, max: 400, allowZero: false },
  postHeparinActSeconds: { label: "Post-heparin ACT", min: 50, max: 1200, allowZero: false },
  targetActSeconds: { label: "Target ACT", min: 200, max: 1200, allowZero: false },
  protamineRatioMgPer100U: { label: "Protamine ratio", min: 0.1, max: 5, allowZero: false },
  desiredAt3Percent: { label: "Desired AT3", min: 0, max: 200, allowZero: true },
  currentAt3Percent: { label: "Current AT3", min: 0, max: 200, allowZero: true },
};

const SHARED_FIELD_GROUPS = {
  patientWeightKg: ["weightKg", "primeWeightKg", "anticoagWeightKg", "drugCheckWeightKg"],
  patientHeightCm: ["heightCm"],
  patientCardiacIndex: ["cardiacIndex"],
  patientPumpFlow: ["pumpFlow"],
  casePrimeVolumeMl: ["primeVolumeMl", "anticoagPrimeVolumeMl"],
};

const SHARED_FIELD_STORAGE_KEY = "cpbSupportSharedFields";
const ANTICOAG_LOG_STORAGE_KEY = "cpbSupportAnticoagHeparinLog";
const DEFAULT_CANNULA_CARDIAC_INDEX = 2.6;
const CANNULA_SIDES = ["arterial", "venous", "bicaval"];
const BASE_CANNULA_SIDES = ["arterial", "venous"];
const DRUG_DOSE_CHECKS = {
  "heparin-cpb-bolus": {
    label: "Heparin CPB loading bolus",
    routeType: "bolus",
    doseUnit: "units/kg",
    concentrationUnit: "units/mL",
    resultUnit: "units",
    referenceLow: 150,
    referenceHigh: 400,
    suggestedDose: 300,
    suggestedConcentration: 1000,
    rangeLabel: "reference CPB loading range: 150 to 400 units/kg",
    caution: "Confirm ACT response and institutional anticoagulation protocol. Common CPB loading doses are often 300 to 400 units/kg, but monitoring drives additional dosing.",
  },
  "bivalirudin-cpb-bolus": {
    label: "Bivalirudin CPB loading bolus",
    routeType: "bolus",
    doseUnit: "mg/kg",
    concentrationUnit: "mg/mL",
    resultUnit: "mg",
    referenceLow: 0.75,
    referenceHigh: 1,
    suggestedDose: 1,
    suggestedConcentration: 5,
    rangeLabel: "reference loading range: 0.75 to 1 mg/kg",
    caution: "No direct reversal agent exists. Renal impairment can prolong effect; verify local bivalirudin CPB protocol and ACT target.",
  },
  "bivalirudin-cpb-infusion": {
    label: "Bivalirudin CPB infusion",
    routeType: "infusion",
    doseUnit: "mg/kg/hr",
    concentrationUnit: "mg/mL",
    resultUnit: "mg/hr",
    referenceLow: 1.75,
    referenceHigh: 2.5,
    suggestedDose: 2.5,
    suggestedConcentration: 5,
    rangeLabel: "reference infusion range: 1.75 to 2.5 mg/kg/hr",
    caution: "Use ACT or institutional monitoring targets. Stagnant blood can clot with bivalirudin; follow local circuit-management practice.",
  },
  "argatroban-hit-infusion": {
    label: "Argatroban HIT infusion",
    routeType: "infusion",
    doseUnit: "mcg/kg/min",
    concentrationUnit: "mcg/mL",
    resultUnit: "mcg/min",
    referenceLow: 0.5,
    referenceHigh: 2,
    suggestedDose: 2,
    suggestedConcentration: 1000,
    rangeLabel: "reference HIT initial range: 0.5 to 2 mcg/kg/min",
    caution: "Not approved for CPB/bypass anticoagulation. Hepatic impairment or critical illness may require lower initial dosing. Monitor aPTT per protocol and watch for bleeding.",
  },
  "argatroban-pci-bolus": {
    label: "Argatroban PCI bolus",
    routeType: "bolus",
    doseUnit: "mcg/kg",
    concentrationUnit: "mcg/mL",
    resultUnit: "mcg",
    referenceLow: 350,
    referenceHigh: 350,
    suggestedDose: 350,
    suggestedConcentration: 1000,
    rangeLabel: "labeled PCI bolus: 350 mcg/kg",
    caution: "PCI dosing is ACT-guided. Argatroban is not approved for CPB/bypass anticoagulation; verify indication and protocol.",
  },
  "argatroban-pci-infusion": {
    label: "Argatroban PCI infusion",
    routeType: "infusion",
    doseUnit: "mcg/kg/min",
    concentrationUnit: "mcg/mL",
    resultUnit: "mcg/min",
    referenceLow: 25,
    referenceHigh: 25,
    suggestedDose: 25,
    suggestedConcentration: 1000,
    rangeLabel: "labeled PCI infusion: 25 mcg/kg/min",
    caution: "Check ACT 5 to 10 minutes after bolus completion and adjust per protocol. Use caution with hepatic impairment.",
  },
};

function buildCannulaRangeSizes(startFr, endFr, stepFr = 2) {
  return Array.from({ length: Math.floor((endFr - startFr) / stepFr) + 1 }, (_, index) => {
    const fr = startFr + index * stepFr;
    return { id: `${fr} Fr`, label: `${fr} Fr`, points: [] };
  });
}

function buildCannulaListedSizes(sizeLabels) {
  return sizeLabels.map((sizeLabel) => ({
    id: sizeLabel.endsWith("Fr") ? sizeLabel : `${sizeLabel} Fr`,
    label: sizeLabel.endsWith("Fr") ? sizeLabel : `${sizeLabel} Fr`,
    points: [],
  }));
}

function buildCannulaFlowValues(maxFlow, step = 1) {
  return Array.from({ length: Math.round(maxFlow / step) + 1 }, (_, index) => roundTo(index * step, 2));
}

function buildAnchoredCannulaPoints(anchorFlow, anchorPressure, maxFlow, step = 1) {
  return buildCannulaFlowValues(maxFlow, step).map((flow) => [
    flow,
    flow === 0 ? 0 : Math.round(anchorPressure * ((flow / anchorFlow) ** 2)),
  ]);
}

function buildAnchoredCannulaSizes(entries, maxFlow, step = 1) {
  return entries.map(({ label, anchorFlow, anchorPressure }) => ({
    id: label,
    label,
    points: buildAnchoredCannulaPoints(anchorFlow, anchorPressure, maxFlow, step),
  }));
}

const CANNULA_LIBRARY = {
  medtronic: {
    label: "Medtronic Cannulae",
    sourceLabel: "CHNOLA Perfusion Team P&P Manual 2021 photo charts, traced first-pass",
    maxFlow: 7,
    families: {
      femoralArterial: {
        label: "Femoral arterial",
        category: "arterial",
        flowUnit: "L/min",
        pressureUnit: "mmHg",
        chartThresholdPressure: 100,
        recommendedMaxPressure: 100,
        sizes: [
          { id: "19 Fr", label: "19 Fr", points: [[0, 0], [1, 8], [2, 26], [3, 55], [4, 94], [5, 145], [6, 210], [7, 286]] },
          { id: "21 Fr", label: "21 Fr", points: [[0, 0], [1, 6], [2, 18], [3, 39], [4, 66], [5, 103], [6, 150], [7, 206]] },
          { id: "23 Fr", label: "23 Fr", points: [[0, 0], [1, 4], [2, 12], [3, 27], [4, 47], [5, 71], [6, 108], [7, 152]] },
          { id: "25 Fr", label: "25 Fr", points: [[0, 0], [1, 3], [2, 9], [3, 20], [4, 33], [5, 52], [6, 77], [7, 109]] },
        ],
      },
      dlpArterial: {
        label: "DLP arterial",
        category: "arterial",
        flowUnit: "L/min",
        pressureUnit: "mmHg",
        maxFlow: 4,
        chartMaxPressure: 200,
        chartThresholdPressure: 100,
        recommendedMaxPressure: 100,
        sizes: buildAnchoredCannulaSizes([
          { label: "6 Fr", anchorFlow: 0.45, anchorPressure: 100 },
          { label: "8 Fr", anchorFlow: 0.95, anchorPressure: 100 },
          { label: "10 Fr", anchorFlow: 1.45, anchorPressure: 100 },
          { label: "12 Fr", anchorFlow: 2.4, anchorPressure: 100 },
          { label: "14 Fr", anchorFlow: 3.05, anchorPressure: 100 },
          { label: "16 Fr", anchorFlow: 3.85, anchorPressure: 100 },
        ], 4, 0.5),
      },
      nextGenArterialCatalog: {
        label: "Bio-Medicus NextGen arterial",
        category: "arterial",
        flowUnit: "L/min",
        pressureUnit: "mmHg",
        maxFlow: 2,
        chartMaxPressure: 200,
        chartThresholdPressure: 100,
        recommendedMaxPressure: 100,
        sizes: buildAnchoredCannulaSizes([
          { label: "8 Fr", anchorFlow: 0.65, anchorPressure: 100 },
          { label: "10 Fr", anchorFlow: 1.2, anchorPressure: 100 },
          { label: "12 Fr", anchorFlow: 1.8, anchorPressure: 100 },
          { label: "14 Fr", anchorFlow: 2.7, anchorPressure: 100 },
        ], 2, 0.25),
      },
      eopaArterial: {
        label: "EOPA arterial",
        category: "arterial",
        flowUnit: "L/min",
        pressureUnit: "mmHg",
        maxFlow: 6,
        chartMaxPressure: 200,
        chartThresholdPressure: 100,
        recommendedMaxPressure: 100,
        sizes: buildAnchoredCannulaSizes([
          { label: "18 Fr", anchorFlow: 4.75, anchorPressure: 100 },
          { label: "20 Fr", anchorFlow: 5.8, anchorPressure: 100 },
          { label: "22 Fr", anchorFlow: 7.17, anchorPressure: 100 },
          { label: "24 Fr", anchorFlow: 9.27, anchorPressure: 100 },
        ], 6),
      },
      femoralVenousMultiStage: {
        label: "Femoral venous multi-stage",
        category: "venous",
        flowUnit: "L/min",
        pressureUnit: "mmHg",
        chartThresholdPressure: 40,
        recommendedMaxPressure: 40,
        sizes: [
          { id: "19 Fr", label: "19 Fr", points: [[0, 0], [1, 9], [2, 26], [3, 55], [4, 97], [5, 152], [6, 221], [7, 306]] },
          { id: "23 Fr", label: "23 Fr", points: [[0, 0], [1, 6], [2, 16], [3, 35], [4, 59], [5, 90], [6, 129], [7, 178]] },
          { id: "25 Fr", label: "25 Fr", points: [[0, 0], [1, 5], [2, 13], [3, 28], [4, 47], [5, 70], [6, 101], [7, 139]] },
          { id: "29 Fr", label: "29 Fr", points: [[0, 0], [1, 3], [2, 8], [3, 17], [4, 28], [5, 42], [6, 60], [7, 82]] },
        ],
      },
      dlpSingleStageStraightVenous: {
        label: "DLP single-stage straight venous",
        category: "venous",
        flowUnit: "L/min",
        pressureUnit: "mmHg",
        maxFlow: 6,
        chartMaxPressure: 100,
        chartThresholdPressure: 40,
        recommendedMaxPressure: 40,
        sizes: buildAnchoredCannulaSizes([
          { label: "12 Fr", anchorFlow: 0.65, anchorPressure: 40 },
          { label: "14 Fr", anchorFlow: 1.0, anchorPressure: 40 },
          { label: "16 Fr", anchorFlow: 1.6, anchorPressure: 40 },
          { label: "18 Fr", anchorFlow: 2.25, anchorPressure: 40 },
          { label: "20 Fr", anchorFlow: 3.1, anchorPressure: 40 },
          { label: "22 Fr", anchorFlow: 4.0, anchorPressure: 40 },
          { label: "24 Fr", anchorFlow: 4.8, anchorPressure: 40 },
          { label: "26 Fr", anchorFlow: 5.7, anchorPressure: 40 },
          { label: "28 Fr", anchorFlow: 5.37, anchorPressure: 40 },
          { label: "30 Fr", anchorFlow: 5.7, anchorPressure: 40 },
          { label: "32 Fr", anchorFlow: 6.93, anchorPressure: 40 },
          { label: "34 Fr", anchorFlow: 7.75, anchorPressure: 40 },
          { label: "36 Fr", anchorFlow: 9.8, anchorPressure: 40 },
        ], 6),
      },
      dlpSingleStagePlasticRightAngleVenous: {
        label: "DLP single-stage plastic right-angle venous",
        category: "venous",
        flowUnit: "L/min",
        pressureUnit: "mmHg",
        maxFlow: 6,
        chartMaxPressure: 100,
        chartThresholdPressure: 40,
        recommendedMaxPressure: 40,
        sizes: buildAnchoredCannulaSizes([
          { label: "12 Fr", anchorFlow: 0.65, anchorPressure: 40 },
          { label: "14 Fr", anchorFlow: 1.05, anchorPressure: 40 },
          { label: "16 Fr", anchorFlow: 1.65, anchorPressure: 40 },
          { label: "18 Fr", anchorFlow: 2.35, anchorPressure: 40 },
          { label: "20 Fr", anchorFlow: 3.15, anchorPressure: 40 },
          { label: "22 Fr", anchorFlow: 4.15, anchorPressure: 40 },
          { label: "24 Fr", anchorFlow: 4.95, anchorPressure: 40 },
          { label: "26 Fr", anchorFlow: 4.41, anchorPressure: 40 },
          { label: "28 Fr", anchorFlow: 5.26, anchorPressure: 40 },
          { label: "30 Fr", anchorFlow: 5.7, anchorPressure: 40 },
          { label: "32 Fr", anchorFlow: 6.82, anchorPressure: 40 },
        ], 6),
      },
      mc2TwoStageVenous: {
        label: "MC2 two-stage venous",
        category: "venous",
        flowUnit: "L/min",
        pressureUnit: "mmHg",
        maxFlow: 6,
        chartMaxPressure: 20,
        chartThresholdPressure: 40,
        recommendedMaxPressure: 40,
        sizes: buildAnchoredCannulaSizes([
          { label: "28/36 Fr", anchorFlow: 6, anchorPressure: 19 },
          { label: "32/40 Fr", anchorFlow: 6, anchorPressure: 12 },
        ], 6),
      },
      dlpMetalTipRightAngleVenous: {
        label: "DLP metal-tip right-angle venous",
        category: "venous",
        flowUnit: "L/min",
        pressureUnit: "mmHg",
        maxFlow: 6,
        chartMaxPressure: 100,
        chartThresholdPressure: 40,
        recommendedMaxPressure: 40,
        sizes: buildAnchoredCannulaSizes([
          { label: "12 Fr", anchorFlow: 0.75, anchorPressure: 40 },
          { label: "14 Fr", anchorFlow: 1.2, anchorPressure: 40 },
          { label: "16 Fr", anchorFlow: 1.6, anchorPressure: 40 },
          { label: "18 Fr", anchorFlow: 2.1, anchorPressure: 40 },
          { label: "20 Fr", anchorFlow: 3.0, anchorPressure: 40 },
          { label: "22 Fr", anchorFlow: 4.0, anchorPressure: 40 },
          { label: "24 Fr", anchorFlow: 5.0, anchorPressure: 40 },
        ], 6),
      },
      dlpMalleableStraightVenous: {
        label: "DLP malleable straight venous",
        category: "venous",
        flowUnit: "L/min",
        pressureUnit: "mmHg",
        maxFlow: 6,
        chartMaxPressure: 100,
        chartThresholdPressure: 40,
        recommendedMaxPressure: 40,
        sizes: buildAnchoredCannulaSizes([
          { label: "12 Fr", anchorFlow: 0.6, anchorPressure: 40 },
          { label: "14 Fr", anchorFlow: 0.9, anchorPressure: 40 },
          { label: "16 Fr", anchorFlow: 1.5, anchorPressure: 40 },
          { label: "18 Fr", anchorFlow: 2.3, anchorPressure: 40 },
          { label: "20 Fr", anchorFlow: 3.1, anchorPressure: 40 },
          { label: "22 Fr", anchorFlow: 4.0, anchorPressure: 40 },
          { label: "24 Fr", anchorFlow: 4.9, anchorPressure: 40 },
          { label: "26 Fr", anchorFlow: 5.8, anchorPressure: 40 },
          { label: "28 Fr", anchorFlow: 5.37, anchorPressure: 40 },
          { label: "30 Fr", anchorFlow: 5.7, anchorPressure: 40 },
          { label: "32 Fr", anchorFlow: 6.16, anchorPressure: 40 },
        ], 6),
      },
      nextGenPediatricVenous: {
        label: "NextGen pediatric venous",
        category: "venous",
        flowUnit: "L/min",
        pressureUnit: "mmHg",
        maxFlow: 2,
        chartMaxPressure: 200,
        chartThresholdPressure: 40,
        recommendedMaxPressure: 40,
        sizes: buildAnchoredCannulaSizes([
          { label: "8 Fr", anchorFlow: 0.6, anchorPressure: 40 },
          { label: "10 Fr", anchorFlow: 1.0, anchorPressure: 40 },
          { label: "12 Fr", anchorFlow: 1.55, anchorPressure: 40 },
          { label: "14 Fr", anchorFlow: 1.9, anchorPressure: 40 },
        ], 2, 0.25),
      },
    },
  },
  getinge: {
    label: "Getinge HLS Cannulae",
    sourceLabel: "Getinge HLS brochure",
    maxFlow: 7,
    families: {
      arterialHls: {
        label: "Arterial HLS cannulae",
        category: "arterial",
        flowUnit: "L/min",
        pressureUnit: "mmHg",
        chartThresholdPressure: 100,
        recommendedMaxPressure: 100,
        sizes: [
          { id: "15 Fr", label: "15 Fr", points: [[0, 0], [1, 11], [2, 36], [3, 76], [4, 132], [5, 202], [6, 286], [7, 388]] },
          { id: "19 Fr", label: "19 Fr", points: [[0, 0], [1, 7], [2, 22], [3, 47], [4, 78], [5, 122], [6, 176], [7, 244]] },
          { id: "23 Fr", label: "23 Fr", points: [[0, 0], [1, 4], [2, 13], [3, 27], [4, 44], [5, 67], [6, 95], [7, 129]] },
        ],
      },
      venousHls: {
        label: "Venous HLS cannulae",
        category: "venous",
        flowUnit: "L/min",
        pressureUnit: "mmHg",
        chartThresholdPressure: 40,
        recommendedMaxPressure: 40,
        sizes: [
          { id: "21 Fr", label: "21 Fr", points: [[0, 0], [1, 8], [2, 24], [3, 50], [4, 86], [5, 133], [6, 191], [7, 262]] },
          { id: "25 Fr", label: "25 Fr", points: [[0, 0], [1, 5], [2, 14], [3, 30], [4, 50], [5, 76], [6, 108], [7, 148]] },
          { id: "29 Fr", label: "29 Fr", points: [[0, 0], [1, 3], [2, 9], [3, 18], [4, 30], [5, 45], [6, 65], [7, 88]] },
        ],
      },
    },
  },
  edwards: {
    label: "Edwards Cannulae",
    sourceLabel: "CHNOLA Perfusion Team P&P Manual 2021 photo charts, traced first-pass",
    maxFlow: 7,
    families: {
      ezGlideAorticArterial: {
        label: "EZ Glide aortic",
        category: "arterial",
        flowUnit: "L/min",
        pressureUnit: "mmHg",
        maxFlow: 6,
        chartMaxPressure: 200,
        chartThresholdPressure: 100,
        recommendedMaxPressure: 100,
        sizes: buildAnchoredCannulaSizes([
          { label: "21 Fr Straight", anchorFlow: 4.5, anchorPressure: 100 },
          { label: "21 Fr Curved", anchorFlow: 5.8, anchorPressure: 100 },
          { label: "24 Fr Straight", anchorFlow: 6.2, anchorPressure: 100 },
          { label: "24 Fr Curved", anchorFlow: 7.0, anchorPressure: 100 },
        ], 6),
      },
      optisiteArterial: {
        label: "Optisite arterial",
        category: "arterial",
        flowUnit: "L/min",
        pressureUnit: "mmHg",
        maxFlow: 6,
        chartMaxPressure: 200,
        chartThresholdPressure: 100,
        recommendedMaxPressure: 100,
        sizes: buildAnchoredCannulaSizes([
          { label: "16 Fr", anchorFlow: 2.9, anchorPressure: 100 },
          { label: "18 Fr", anchorFlow: 4.25, anchorPressure: 100 },
          { label: "20 Fr", anchorFlow: 5.75, anchorPressure: 100 },
          { label: "22 Fr", anchorFlow: 6.2, anchorPressure: 100 },
        ], 6),
      },
    },
  },
  sorin: {
    label: "Sorin / LivaNova Cannulae",
    sourceLabel: "CHNOLA Perfusion Team P&P Manual 2021 photo charts, traced first-pass",
    maxFlow: 7,
    families: {
      rightAnglePlasticTipVenous: {
        label: "Right-angle plastic-tip venous",
        category: "venous",
        flowUnit: "L/min",
        pressureUnit: "mmHg",
        maxFlow: 8,
        chartMaxPressure: 160,
        chartThresholdPressure: 40,
        recommendedMaxPressure: 40,
        sizes: buildAnchoredCannulaSizes([
          { label: "14 Fr", anchorFlow: 1.3, anchorPressure: 40 },
          { label: "16 Fr", anchorFlow: 1.8, anchorPressure: 40 },
          { label: "18 Fr", anchorFlow: 2.6, anchorPressure: 40 },
          { label: "20 Fr", anchorFlow: 3.6, anchorPressure: 40 },
          { label: "22 Fr", anchorFlow: 5.0, anchorPressure: 40 },
        ], 8),
      },
    },
  },
};

function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function readSharedFieldState() {
  try {
    return JSON.parse(window.localStorage.getItem(SHARED_FIELD_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeSharedFieldState(nextState) {
  try {
    window.localStorage.setItem(SHARED_FIELD_STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    // Ignore storage failures so calculators still work in restrictive browsers.
  }
}

function createHeparinLogEntryId() {
  return `heparin-log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readHeparinLogState() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(ANTICOAG_LOG_STORAGE_KEY) ?? "{}");
    const entries = Array.isArray(stored.entries)
      ? stored.entries
        .map((entry) => ({
          id: typeof entry?.id === "string" ? entry.id : createHeparinLogEntryId(),
          time: typeof entry?.time === "string" ? entry.time.slice(0, 5) : "",
          units: Number(entry?.units),
        }))
        .filter((entry) => entry.time && Number.isFinite(entry.units) && entry.units > 0)
      : [];

    return {
      entries,
    };
  } catch {
    return { entries: [] };
  }
}

function writeHeparinLogState(nextState) {
  try {
    const entries = Array.isArray(nextState.entries)
      ? nextState.entries
        .filter((entry) => entry.time && Number.isFinite(entry.units) && entry.units > 0)
        .map((entry) => ({
          id: typeof entry.id === "string" ? entry.id : createHeparinLogEntryId(),
          time: entry.time.slice(0, 5),
          units: Number(entry.units),
        }))
      : [];

    window.localStorage.setItem(
      ANTICOAG_LOG_STORAGE_KEY,
      JSON.stringify({
        entries,
      }),
    );
  } catch {
    // Ignore storage failures so calculators still work in restrictive browsers.
  }
}

function getCurrentClockTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function findSharedGroupForField(fieldName) {
  return Object.entries(SHARED_FIELD_GROUPS).find(([, fieldNames]) => fieldNames.includes(fieldName)) ?? null;
}

function hydrateSharedFields(form) {
  if (!form) return;

  const sharedState = readSharedFieldState();

  Object.entries(SHARED_FIELD_GROUPS).forEach(([groupName, fieldNames]) => {
    const storedValue = sharedState[groupName];
    if (storedValue === undefined || storedValue === null || storedValue === "") return;

    fieldNames.forEach((fieldName) => {
      const field = form.elements.namedItem(fieldName);
      if (field instanceof HTMLInputElement && field.value === "") {
        field.value = storedValue;
      }
    });
  });
}

function syncSharedFieldValue(input) {
  if (!(input instanceof HTMLInputElement) || !input.name) return;

  const sharedGroup = findSharedGroupForField(input.name);
  if (!sharedGroup) return;

  const [groupName] = sharedGroup;
  const sharedState = readSharedFieldState();

  if (input.value === "") {
    delete sharedState[groupName];
  } else {
    sharedState[groupName] = input.value;
  }

  writeSharedFieldState(sharedState);
}

function validateField(configMap, name, rawValue) {
  const config = configMap[name];
  if (!config) return { valid: false, value: null, message: "Unknown field." };
  if (rawValue === "" || rawValue === null || rawValue === undefined) {
    return { valid: false, value: null, message: `${config.label} is required.` };
  }

  const value = Number(rawValue);
  if (Number.isNaN(value)) {
    return { valid: false, value: null, message: `${config.label} must be numeric.` };
  }
  if (!config.allowZero && value <= 0) {
    return { valid: false, value: null, message: `${config.label} must be greater than 0.` };
  }
  if (config.allowZero && value < 0) {
    return { valid: false, value: null, message: `${config.label} cannot be negative.` };
  }
  if (value < config.min || value > config.max) {
    return { valid: false, value: null, message: `${config.label} must be between ${config.min} and ${config.max}.` };
  }
  return { valid: true, value, message: "" };
}

function calculateBsa(heightCm, weightKg) {
  return Math.sqrt((heightCm * weightKg) / 3600);
}

function calculateWeightOnlyBsa(weightKg) {
  return (4 * weightKg + 7) / (weightKg + 90);
}

function calculatePumpFlow(cardiacIndex, bsa) {
  return cardiacIndex * bsa;
}

function calculateArterialOxygenContent(hgb, saO2Fraction, paO2) {
  return hgb * 1.34 * saO2Fraction + 0.003 * paO2;
}

function calculateHemoglobinFromHematocrit(hctPercent) {
  return hctPercent / 3;
}

function calculateDo2i(cardiacIndex, hgb, saO2Percent, paO2) {
  return calculateArterialOxygenContent(hgb, saO2Percent / 100, paO2) * 10 * cardiacIndex;
}

function buildPerfusionFlowMap(bsa) {
  return PERFUSION_FLOW_INDEX_VALUES.map((cardiacIndex) => ({
    cardiacIndex,
    pumpFlow: calculatePumpFlow(cardiacIndex, bsa),
  }));
}

function calculateRequiredCardiacIndex(do2iTarget, arterialOxygenContent) {
  if (arterialOxygenContent <= 0) return null;
  return do2iTarget / (10 * arterialOxygenContent);
}

function calculateRequiredHemoglobin(do2iTarget, cardiacIndex, saO2Percent, paO2) {
  const saO2Fraction = saO2Percent / 100;
  if (cardiacIndex <= 0 || saO2Fraction <= 0) return null;
  return (do2iTarget / (10 * cardiacIndex) - 0.003 * paO2) / (1.34 * saO2Fraction);
}

function calculateEstimatedBloodVolume(weightKg, ebvFactor) {
  return weightKg * ebvFactor;
}

function suggestEstimatedBloodVolumeFactor(weightKg) {
  if (!Number.isFinite(weightKg) || weightKg <= 0) return null;
  if (weightKg <= 10) return 85;
  if (weightKg <= 20) return 80;
  if (weightKg <= 30) return 75;
  if (weightKg <= 40) return 70;
  if (weightKg <= 50) return 65;
  return 75;
}

function calculatePredictedPrimeHct(bloodVolumeMl, baselineHctPercent, primeVolumeMl) {
  return ((bloodVolumeMl * (baselineHctPercent / 100)) / (bloodVolumeMl + primeVolumeMl)) * 100;
}

function calculateRequiredPrbcVolume(targetHctPercent, baselineHctPercent, bloodVolumeMl, primeVolumeMl, prbcHctPercent) {
  const targetFraction = targetHctPercent / 100;
  const baselineFraction = baselineHctPercent / 100;
  const prbcFraction = prbcHctPercent / 100;
  const numerator = targetFraction * (bloodVolumeMl + primeVolumeMl) - baselineFraction * bloodVolumeMl;
  const denominator = prbcFraction - targetFraction;
  if (denominator <= 0) return null;
  return Math.max(0, numerator / denominator);
}

function calculateProjectedHctAfterPrbc(bloodVolumeMl, baselineHctPercent, primeVolumeMl, prbcVolumeMl, prbcHctPercent) {
  const redCellVolume = bloodVolumeMl * (baselineHctPercent / 100) + prbcVolumeMl * (prbcHctPercent / 100);
  const totalVolume = bloodVolumeMl + primeVolumeMl + prbcVolumeMl;
  return (redCellVolume / totalVolume) * 100;
}

function calculateHctDrop(baselineHctPercent, predictedHctPercent) {
  return baselineHctPercent - predictedHctPercent;
}

function calculatePrimeToBloodRatio(primeVolumeMl, bloodVolumeMl) {
  if (bloodVolumeMl <= 0) return null;
  return primeVolumeMl / bloodVolumeMl;
}

function calculateCrystalloidPrimeBicarb(primeVolumeMl) {
  return 0.025 * primeVolumeMl;
}

function calculatePrimeMannitol(weightKg) {
  return 0.25 * weightKg;
}

function calculateRedCellDeficitToTarget(targetHctPercent, baselineHctPercent, bloodVolumeMl, primeVolumeMl) {
  const targetRedCellVolumeMl = (targetHctPercent / 100) * (bloodVolumeMl + primeVolumeMl);
  const currentRedCellVolumeMl = (baselineHctPercent / 100) * bloodVolumeMl;
  return Math.max(0, targetRedCellVolumeMl - currentRedCellVolumeMl);
}

function calculateHeparinLoadingDose(weightKg, heparinDosePerKg) {
  return weightKg * heparinDosePerKg;
}

function calculateBivalirudinLoadingDose(weightKg) {
  return weightKg;
}

function calculateArgatrobanInfusionRate(weightKg) {
  return 2 * weightKg;
}

function calculateAt3DoseUnits(desiredAt3Percent, currentAt3Percent, weightKg) {
  return Math.max(0, ((desiredAt3Percent - currentAt3Percent) * weightKg) / 1.4);
}

function calculateProtamineDose(heparinUnits, protamineRatioMgPer100U) {
  return (heparinUnits / 100) * protamineRatioMgPer100U;
}

function calculateDrugDoseSafetyCheck({ weightKg, dose, concentration, routeType, doseUnit, concentrationUnit, referenceLow, referenceHigh }) {
  const numericWeight = Number(weightKg);
  const numericDose = Number(dose);
  const numericConcentration = Number(concentration);
  const numericLow = Number(referenceLow);
  const numericHigh = Number(referenceHigh);

  if (!Number.isFinite(numericWeight) || numericWeight <= 0) return null;
  if (!Number.isFinite(numericDose) || numericDose <= 0) return null;
  if (!Number.isFinite(numericConcentration) || numericConcentration <= 0) return null;

  const totalDose = numericWeight * numericDose;
  const volumeMl = totalDose / numericConcentration;
  const doseStatus = Number.isFinite(numericLow) && numericDose < numericLow
    ? "below"
    : Number.isFinite(numericHigh) && numericDose > numericHigh
      ? "above"
      : "within";

  return {
    totalDose,
    volumeMl,
    routeType: routeType === "infusion" ? "infusion" : "bolus",
    doseUnit,
    concentrationUnit,
    doseStatus,
  };
}

function calculateHeparinAdministrationTotal(entries = []) {
  return entries.reduce((total, entry) => {
    const units = Number(entry?.units ?? 0);
    return Number.isFinite(units) && units > 0 ? total + units : total;
  }, 0);
}

function calculateHeparinResponseCurve(baselineActSeconds, postHeparinActSeconds, heparinUnits, targetActSeconds, weightKg, distributionVolumeMl) {
  const actDelta = postHeparinActSeconds - baselineActSeconds;
  if (actDelta <= 0 || heparinUnits <= 0 || weightKg <= 0 || distributionVolumeMl <= 0) return null;

  const loadingConcentrationUnitsPerMl = heparinUnits / distributionVolumeMl;
  if (loadingConcentrationUnitsPerMl <= 0) return null;

  const slopeActPerUnitMl = actDelta / loadingConcentrationUnitsPerMl;
  const requiredHeparinConcentrationUnitsPerMl = Math.max(0, (targetActSeconds - baselineActSeconds) / slopeActPerUnitMl);
  const requiredHeparinUnits = requiredHeparinConcentrationUnitsPerMl * distributionVolumeMl;
  const requiredHeparinDosePerKg = requiredHeparinUnits / weightKg;
  const givenHeparinDosePerKg = heparinUnits / weightKg;

  return {
    slopeActPerUnitMl,
    loadingConcentrationUnitsPerMl,
    requiredHeparinConcentrationUnitsPerMl,
    requiredHeparinDosePerKg,
    requiredHeparinUnits,
    givenHeparinUnits: heparinUnits,
    givenHeparinDosePerKg,
    distributionVolumeMl,
    additionalHeparinUnits: Math.max(0, requiredHeparinUnits - heparinUnits),
    targetReachedByTestDose: postHeparinActSeconds >= targetActSeconds,
    points: {
      baseline: { concentrationUnitsPerMl: 0, dosePerKg: 0, actSeconds: baselineActSeconds },
      measured: { concentrationUnitsPerMl: loadingConcentrationUnitsPerMl, dosePerKg: givenHeparinDosePerKg, actSeconds: postHeparinActSeconds },
      target: { concentrationUnitsPerMl: requiredHeparinConcentrationUnitsPerMl, dosePerKg: requiredHeparinDosePerKg, actSeconds: targetActSeconds },
    },
  };
}

function evaluateCalculator(rawInputs) {
  const fields = {};
  Object.keys(PERFUSION_FIELD_CONFIG).forEach((name) => {
    fields[name] = validateField(PERFUSION_FIELD_CONFIG, name, rawInputs[name]);
  });

  const valid = (name) => fields[name].valid;
  const valueOf = (name) => fields[name].value;
  const results = {
    bsa: null,
    bsaFormula: null,
    flowRange: null,
    flowMap: null,
    effectiveCi: null,
    currentFlow: null,
    currentHgb: null,
    hgbSource: null,
    do2i: null,
    do2iThresholdMet: null,
    do2iSource: null,
    do2iTarget: valid("do2iTarget") ? valueOf("do2iTarget") : null,
    arterialOxygenContent: null,
    requiredCi: null,
    requiredFlow: null,
    requiredHgb: null,
  };

  if (valid("weightKg")) {
    if (valid("heightCm")) {
      results.bsa = calculateBsa(valueOf("heightCm"), valueOf("weightKg"));
      results.bsaFormula = "Mosteller";
    } else {
      results.bsa = calculateWeightOnlyBsa(valueOf("weightKg"));
      results.bsaFormula = "Costeff";
    }
    results.flowMap = buildPerfusionFlowMap(results.bsa);
    results.flowRange = {
      low: results.flowMap[0].pumpFlow,
      high: results.flowMap[results.flowMap.length - 1].pumpFlow,
    };
  }

  if (valid("hgb")) {
    results.currentHgb = valueOf("hgb");
    results.hgbSource = "hemoglobin";
  } else if (valid("hct")) {
    results.currentHgb = calculateHemoglobinFromHematocrit(valueOf("hct"));
    results.hgbSource = "hematocrit";
  }

  if (results.bsa !== null && valid("pumpFlow")) {
    results.currentFlow = valueOf("pumpFlow");
    results.effectiveCi = valueOf("pumpFlow") / results.bsa;
    results.do2iSource = "pump flow";
  } else if (valid("cardiacIndex")) {
    results.effectiveCi = valueOf("cardiacIndex");
    results.do2iSource = "cardiac index";
    if (results.bsa !== null) results.currentFlow = calculatePumpFlow(results.effectiveCi, results.bsa);
  }

  if (results.currentHgb !== null && valid("saO2") && valid("paO2")) {
    results.arterialOxygenContent = calculateArterialOxygenContent(results.currentHgb, valueOf("saO2") / 100, valueOf("paO2"));
  }

  if (results.effectiveCi !== null && results.arterialOxygenContent !== null) {
    results.do2i = calculateDo2i(results.effectiveCi, results.currentHgb, valueOf("saO2"), valueOf("paO2"));
    if (results.do2iTarget !== null) results.do2iThresholdMet = results.do2i >= results.do2iTarget;
  }

  if (results.do2iTarget !== null && results.arterialOxygenContent !== null) {
    results.requiredCi = calculateRequiredCardiacIndex(results.do2iTarget, results.arterialOxygenContent);
    if (results.requiredCi !== null && results.bsa !== null) results.requiredFlow = calculatePumpFlow(results.requiredCi, results.bsa);
  }

  if (results.do2iTarget !== null && results.effectiveCi !== null && valid("saO2") && valid("paO2")) {
    results.requiredHgb = calculateRequiredHemoglobin(results.do2iTarget, results.effectiveCi, valueOf("saO2"), valueOf("paO2"));
  }

  return { fields, results };
}

function evaluatePrimeCalculator(rawInputs) {
  const fields = {};
  Object.keys(PRIME_FIELD_CONFIG).forEach((name) => {
    fields[name] = validateField(PRIME_FIELD_CONFIG, name, rawInputs[name]);
  });

  const valid = (name) => fields[name].valid;
  const valueOf = (name) => fields[name].value;
  const results = {
    bloodVolumeMl: null,
    predictedHct: null,
    hctDrop: null,
    primeToBloodRatio: null,
    crystalloidPrimeBicarbMeq: null,
    primeMannitolG: null,
    targetHct: valid("primeTargetHct") ? valueOf("primeTargetHct") : null,
    redCellDeficitMl: null,
    prbcVolumeMl: null,
    projectedHct: null,
    targetMetWithoutPrbc: null,
    prbcTargetReachable: null,
  };

  if (valid("primeWeightKg") && valid("primeEbvFactor")) {
    results.bloodVolumeMl = calculateEstimatedBloodVolume(valueOf("primeWeightKg"), valueOf("primeEbvFactor"));
  }

  if (valid("primeWeightKg")) {
    results.primeMannitolG = calculatePrimeMannitol(valueOf("primeWeightKg"));
  }

  if (results.bloodVolumeMl !== null && valid("primeBaselineHct") && valid("primeVolumeMl")) {
    results.predictedHct = calculatePredictedPrimeHct(results.bloodVolumeMl, valueOf("primeBaselineHct"), valueOf("primeVolumeMl"));
    results.hctDrop = calculateHctDrop(valueOf("primeBaselineHct"), results.predictedHct);
    results.primeToBloodRatio = calculatePrimeToBloodRatio(valueOf("primeVolumeMl"), results.bloodVolumeMl);
  }

  if (valid("primeVolumeMl")) {
    results.crystalloidPrimeBicarbMeq = calculateCrystalloidPrimeBicarb(valueOf("primeVolumeMl"));
  }

  if (results.bloodVolumeMl !== null && valid("primeBaselineHct") && valid("primeVolumeMl") && valid("primeTargetHct") && valid("primePrbcHct")) {
    results.redCellDeficitMl = calculateRedCellDeficitToTarget(valueOf("primeTargetHct"), valueOf("primeBaselineHct"), results.bloodVolumeMl, valueOf("primeVolumeMl"));
    results.prbcTargetReachable = valueOf("primePrbcHct") > valueOf("primeTargetHct");
    results.prbcVolumeMl = calculateRequiredPrbcVolume(valueOf("primeTargetHct"), valueOf("primeBaselineHct"), results.bloodVolumeMl, valueOf("primeVolumeMl"), valueOf("primePrbcHct"));
    if (results.prbcVolumeMl !== null) {
      results.projectedHct = calculateProjectedHctAfterPrbc(results.bloodVolumeMl, valueOf("primeBaselineHct"), valueOf("primeVolumeMl"), results.prbcVolumeMl, valueOf("primePrbcHct"));
    }
    if (results.predictedHct !== null) results.targetMetWithoutPrbc = results.predictedHct >= valueOf("primeTargetHct");
  }

  return { fields, results };
}

function evaluateAnticoagulationCalculator(rawInputs) {
  const fields = {};
  Object.keys(ANTICOAG_FIELD_CONFIG).forEach((name) => {
    fields[name] = validateField(ANTICOAG_FIELD_CONFIG, name, rawInputs[name]);
  });

  const valid = (name) => fields[name].valid;
  const valueOf = (name) => fields[name].value;
  const results = {
    heparinLoadingUnits: null,
    bloodVolumeMl: null,
    distributionVolumeMl: null,
    heparinLoadingConcentrationUnitsPerMl: null,
    bivalirudinLoadingMg: null,
    argatrobanRateMcgPerMin: null,
    at3DoseUnits: null,
    protamineDoseMg: null,
    heparinResponseCurve: null,
  };

  if (valid("anticoagWeightKg") && valid("anticoagEbvFactor")) {
    results.bloodVolumeMl = calculateEstimatedBloodVolume(valueOf("anticoagWeightKg"), valueOf("anticoagEbvFactor"));
  }

  if (results.bloodVolumeMl !== null && valid("anticoagPrimeVolumeMl")) {
    results.distributionVolumeMl = results.bloodVolumeMl + valueOf("anticoagPrimeVolumeMl");
  }

  if (valid("anticoagWeightKg")) {
    results.bivalirudinLoadingMg = calculateBivalirudinLoadingDose(valueOf("anticoagWeightKg"));
    results.argatrobanRateMcgPerMin = calculateArgatrobanInfusionRate(valueOf("anticoagWeightKg"));
  }

  if (valid("anticoagWeightKg") && valid("desiredAt3Percent") && valid("currentAt3Percent")) {
    results.at3DoseUnits = calculateAt3DoseUnits(valueOf("desiredAt3Percent"), valueOf("currentAt3Percent"), valueOf("anticoagWeightKg"));
  }

  if (valid("anticoagWeightKg") && valid("heparinDosePerKg")) {
    results.heparinLoadingUnits = calculateHeparinLoadingDose(valueOf("anticoagWeightKg"), valueOf("heparinDosePerKg"));
  }

  if (results.heparinLoadingUnits !== null && results.distributionVolumeMl !== null && results.distributionVolumeMl > 0) {
    results.heparinLoadingConcentrationUnitsPerMl = results.heparinLoadingUnits / results.distributionVolumeMl;
  }

  if (results.heparinLoadingUnits !== null && valid("protamineRatioMgPer100U")) {
    results.protamineDoseMg = calculateProtamineDose(results.heparinLoadingUnits, valueOf("protamineRatioMgPer100U"));
  }

  if (valid("anticoagWeightKg") && results.heparinLoadingUnits !== null && results.distributionVolumeMl !== null && valid("baselineActSeconds") && valid("postHeparinActSeconds") && valid("targetActSeconds")) {
    results.heparinResponseCurve = calculateHeparinResponseCurve(
      valueOf("baselineActSeconds"),
      valueOf("postHeparinActSeconds"),
      results.heparinLoadingUnits,
      valueOf("targetActSeconds"),
      valueOf("anticoagWeightKg"),
      results.distributionVolumeMl,
    );
  }

  return { fields, results };
}

const perfusionForm = document.querySelector("#calculator-form");
const perfusionSummary = document.querySelector("#validationSummary");
const primeForm = document.querySelector("#prime-form");
const primeSummary = document.querySelector("#primeValidationSummary");
const anticoagForm = document.querySelector("#anticoag-form");
const anticoagSummary = document.querySelector("#anticoagValidationSummary");
const primeEbvQuickButtons = Array.from(document.querySelectorAll("[data-prime-ebv-quick]"));
const targetActButtons = Array.from(document.querySelectorAll("[data-target-act]"));
const anticoagEbvGuideButton = document.querySelector("#applyAnticoagEbvGuide");
const primePlanCard = document.querySelector("#primePlanCard");
const heparinCurvePanel = document.querySelector(".curve-panel");
const expandCurveButton = document.querySelector("#expandCurveButton");
const zoomCurveButton = document.querySelector("#zoomCurveButton");
const closeCurveModalButton = document.querySelector("#closeCurveModalButton");
let isHeparinCurveExpanded = false;
let isHeparinCurveZoomedOut = false;

const primePlanElements = {
  tone: document.querySelector("#primePlanTone"),
  headline: document.querySelector("#primePlanHeadline"),
  body: document.querySelector("#primePlanBody"),
  gapBadge: document.querySelector("#primeGapBadge"),
  unitsBadge: document.querySelector("#primeUnitsBadge"),
  ratioBadge: document.querySelector("#primeRatioBadge"),
};
const cannulaBicavalToggle = document.querySelector("#cannulaBicavalToggle");
const cannulaFlowHint = document.querySelector("#cannulaFlowHint");
const cannulaFlowSlider = document.querySelector("#cannulaFlowSlider");
const cannulaFlowDisplay = document.querySelector("#cannulaFlowDisplay");
const cannulaFlowOutput = document.querySelector("#cannulaFlowOutput");
const cannulaFlowStatus = document.querySelector("#cannulaFlowStatus");
const cannulaCiOutput = document.querySelector("#cannulaCiOutput");
const cannulaCiStatus = document.querySelector("#cannulaCiStatus");
const cannulaBsaOutput = document.querySelector("#cannulaBsaOutput");
const cannulaBsaStatus = document.querySelector("#cannulaBsaStatus");
const cannulaSourceOutput = document.querySelector("#cannulaSourceOutput");
const cannulaSourceStatus = document.querySelector("#cannulaSourceStatus");
const cannulaPanels = {
  arterial: {
    label: "Arterial",
    manufacturerSelect: document.querySelector("#cannulaArterialManufacturer"),
    familySelect: document.querySelector("#cannulaArterialFamily"),
    sizeButtons: document.querySelector("#cannulaArterialSizeButtons"),
    chart: document.querySelector("#cannulaArterialChart"),
    chartSummary: document.querySelector("#cannulaArterialSummary"),
    tooltip: document.querySelector("#cannulaArterialChartTooltip"),
    recommendedOutput: document.querySelector("#cannulaArterialRecommendedOutput"),
    recommendedStatus: document.querySelector("#cannulaArterialRecommendedStatus"),
    selectedOutput: document.querySelector("#cannulaArterialSelectedOutput"),
    selectedStatus: document.querySelector("#cannulaArterialSelectedStatus"),
    pressureOutput: document.querySelector("#cannulaArterialPressureOutput"),
    pressureStatus: document.querySelector("#cannulaArterialPressureStatus"),
  },
  venous: {
    label: "Venous",
    manufacturerSelect: document.querySelector("#cannulaVenousManufacturer"),
    familySelect: document.querySelector("#cannulaVenousFamily"),
    roleHint: document.querySelector("#cannulaVenousRoleHint"),
    sizeButtons: document.querySelector("#cannulaVenousSizeButtons"),
    chart: document.querySelector("#cannulaVenousChart"),
    chartSummary: document.querySelector("#cannulaVenousSummary"),
    tooltip: document.querySelector("#cannulaVenousChartTooltip"),
    recommendedOutput: document.querySelector("#cannulaVenousRecommendedOutput"),
    recommendedStatus: document.querySelector("#cannulaVenousRecommendedStatus"),
    selectedOutput: document.querySelector("#cannulaVenousSelectedOutput"),
    selectedStatus: document.querySelector("#cannulaVenousSelectedStatus"),
    pressureOutput: document.querySelector("#cannulaVenousPressureOutput"),
    pressureStatus: document.querySelector("#cannulaVenousPressureStatus"),
  },
  bicaval: {
    label: "Bicaval",
    setupPanel: document.querySelector("#cannulaBicavalSetupPanel"),
    comparePanel: document.querySelector("#cannulaBicavalComparePanel"),
    manufacturerSelect: document.querySelector("#cannulaBicavalManufacturer"),
    familySelect: document.querySelector("#cannulaBicavalFamily"),
    roleHint: document.querySelector("#cannulaBicavalRoleHint"),
    sizeButtons: document.querySelector("#cannulaBicavalSizeButtons"),
    chart: document.querySelector("#cannulaBicavalChart"),
    chartSummary: document.querySelector("#cannulaBicavalSummary"),
    tooltip: document.querySelector("#cannulaBicavalChartTooltip"),
    recommendedOutput: document.querySelector("#cannulaBicavalRecommendedOutput"),
    recommendedStatus: document.querySelector("#cannulaBicavalRecommendedStatus"),
    selectedOutput: document.querySelector("#cannulaBicavalSelectedOutput"),
    selectedStatus: document.querySelector("#cannulaBicavalSelectedStatus"),
    pressureOutput: document.querySelector("#cannulaBicavalPressureOutput"),
    pressureStatus: document.querySelector("#cannulaBicavalPressureStatus"),
  },
};
const cannulaState = {
  sides: {
    arterial: {
      manufacturerId: null,
      familyId: null,
      sizeId: null,
      familyManualOverride: false,
      manualOverride: false,
    },
    venous: {
      manufacturerId: null,
      familyId: null,
      sizeId: null,
      familyManualOverride: false,
      manualOverride: false,
    },
    bicaval: {
      manufacturerId: null,
      familyId: null,
      sizeId: null,
      familyManualOverride: false,
      manualOverride: false,
    },
  },
  flow: 4,
  bicavalEnabled: false,
  draggingSide: null,
  manualFlowOverride: false,
  flowLinkedToPerfusion: false,
  flowSourceLabel: "",
  flowSourceDetail: "",
};
let cannulaDragFrame = null;
let pendingCannulaPointerUpdate = null;

const perfusionOutputs = perfusionForm
  ? {
      bsa: {
        value: document.querySelector("#bsaOutput"),
        status: document.querySelector("#bsaStatus"),
        format: (value) => `${roundTo(value, 2).toFixed(2)} m²`,
        empty: "Enter weight. Add height for the Mosteller BSA.",
      },
      flowMap: {
        value: document.querySelector("#flowMapOutput"),
        status: document.querySelector("#flowMapStatus"),
      },
      do2i: {
        value: document.querySelector("#do2iOutput"),
        status: document.querySelector("#do2iStatus"),
        format: (value) => `${Math.round(value)} mL O2/min/m²`,
        empty: "Enter hemoglobin or hematocrit, SaO2, PaO2, and either CI or pump flow.",
      },
      requiredFlow: {
        value: document.querySelector("#targetFlowOutput"),
        status: document.querySelector("#targetFlowStatus"),
        format: (value) => `${roundTo(value, 2).toFixed(2)} L/min`,
        empty: "Enter weight, hemoglobin or hematocrit, SaO2, and PaO2.",
      },
      requiredCi: {
        value: document.querySelector("#targetCiOutput"),
        status: document.querySelector("#targetCiStatus"),
        format: (value) => `${roundTo(value, 2).toFixed(2)} L/min/m²`,
        empty: "Enter hemoglobin or hematocrit, SaO2, and PaO2.",
      },
      requiredHgb: {
        value: document.querySelector("#targetHgbOutput"),
        status: document.querySelector("#targetHgbStatus"),
        format: (value) => `${roundTo(value, 1).toFixed(1)} g/dL`,
        empty: "Enter current flow or CI, plus oxygenation values.",
      },
    }
  : null;

const primeOutputs = primeForm
  ? {
      bloodVolumeMl: {
        value: document.querySelector("#primeEbvOutput"),
        status: document.querySelector("#primeEbvStatus"),
        format: (value) => `${Math.round(value)} mL`,
        empty: "Enter weight and blood volume factor.",
      },
      predictedHct: {
        value: document.querySelector("#primePredictedHctOutput"),
        status: document.querySelector("#primePredictedHctStatus"),
        format: (value) => `${roundTo(value, 1).toFixed(1)} %`,
        empty: "Enter weight, pre-CPB Hct, and prime volume.",
      },
      hctDrop: {
        value: document.querySelector("#primeHctDropOutput"),
        status: document.querySelector("#primeHctDropStatus"),
        format: (value) => `${roundTo(value, 1).toFixed(1)} %`,
        empty: "Calculated once pre-CPB Hct and prime volume are entered.",
      },
      primeToBloodRatio: {
        value: document.querySelector("#primeRatioOutput"),
        status: document.querySelector("#primeRatioStatus"),
        format: (value) => `${roundTo(value, 2).toFixed(2)} : 1`,
        empty: "Shows how large the clear prime is relative to estimated blood volume.",
      },
      crystalloidPrimeBicarbMeq: {
        value: document.querySelector("#primeBicarbOutput"),
        status: document.querySelector("#primeBicarbStatus"),
        format: (value) => `${roundTo(value, 1).toFixed(1)} mEq`,
        empty: "Enter prime volume to calculate sodium bicarbonate.",
      },
      primeMannitolG: {
        value: document.querySelector("#primeMannitolOutput"),
        status: document.querySelector("#primeMannitolStatus"),
        format: (value) => `${roundTo(value, 1).toFixed(1)} g`,
        empty: "Enter weight to calculate mannitol.",
      },
      prbcVolumeMl: {
        value: document.querySelector("#primePrbcNeededOutput"),
        status: document.querySelector("#primePrbcNeededStatus"),
        format: (value) => `${Math.round(value)} mL`,
        empty: "Enter target Hct and PRBC Hct assumptions.",
      },
      projectedHct: {
        value: document.querySelector("#primeProjectedHctOutput"),
        status: document.querySelector("#primeProjectedHctStatus"),
        format: (value) => `${roundTo(value, 1).toFixed(1)} %`,
        empty: "Calculated from the estimated PRBC volume.",
      },
      redCellDeficitMl: {
        value: document.querySelector("#primeRedCellDeficitOutput"),
        status: document.querySelector("#primeRedCellDeficitStatus"),
        format: (value) => `${Math.round(value)} mL RBC`,
        empty: "Expressed as the red-cell volume missing before any PRBC is added.",
      },
    }
  : null;

const anticoagOutputs = anticoagForm
  ? {
      heparinLoadingUnits: {
        value: document.querySelector("#heparinLoadingOutput"),
        status: document.querySelector("#heparinLoadingStatus"),
        format: (value) => `${Math.round(value).toLocaleString()} units`,
        empty: "Enter weight and a heparin units/kg assumption.",
      },
      distributionVolumeMl: {
        value: document.querySelector("#heparinDistributionVolumeOutput"),
        status: document.querySelector("#heparinDistributionVolumeStatus"),
        format: (value) => `${Math.round(value).toLocaleString()} mL`,
        empty: "Enter weight, EBV factor, and prime volume.",
      },
      heparinLoadingConcentrationUnitsPerMl: {
        value: document.querySelector("#heparinConcentrationOutput"),
        status: document.querySelector("#heparinConcentrationStatus"),
        format: (value) => `${roundTo(value, 2).toFixed(2)} units/mL`,
        empty: "Heparin units divided by EBV plus prime volume.",
      },
      bivalirudinLoadingMg: {
        value: document.querySelector("#bivalirudinLoadingOutput"),
        status: document.querySelector("#bivalirudinLoadingStatus"),
        format: (value) => `${roundTo(value, 1).toFixed(1)} mg`,
        empty: "Enter weight in any shared-weight tab to calculate 1 mg/kg.",
      },
      argatrobanRateMcgPerMin: {
        value: document.querySelector("#argatrobanRateOutput"),
        status: document.querySelector("#argatrobanRateStatus"),
        format: (value) => `${roundTo(value, 1).toFixed(1)} mcg/min`,
        empty: "Enter weight in any shared-weight tab to calculate 2 mcg/kg/min.",
      },
      at3DoseUnits: {
        value: document.querySelector("#at3DoseOutput"),
        status: document.querySelector("#at3DoseStatus"),
        format: (value) => `${Math.round(value).toLocaleString()} units`,
        empty: "Enter weight, desired AT3, and current AT3.",
      },
      additionalHeparin: {
        value: document.querySelector("#additionalHeparinOutput"),
        status: document.querySelector("#additionalHeparinStatus"),
        format: (value) => `${Math.round(value.additionalHeparinUnits).toLocaleString()} units`,
        empty: "Calculated from the dose-response projection.",
      },
      protamineDoseMg: {
        value: document.querySelector("#protamineDoseOutput"),
        status: document.querySelector("#protamineDoseStatus"),
        format: (value) => `${roundTo(value, 1).toFixed(1)} mg`,
        empty: "Add the initial heparin dose to the log, plus any extra boluses, to calculate protamine from the tally.",
      },
      heparinTallyUnits: {
        value: document.querySelector("#heparinTallyOutput"),
        status: document.querySelector("#heparinTallyStatus"),
        format: (value) => `${Math.round(value).toLocaleString()} units`,
      },
      heparinLogTimeInput: document.querySelector("#heparinAdminTime"),
      heparinLogUnitsInput: document.querySelector("#heparinAdminUnits"),
      heparinLogValidation: document.querySelector("#heparinLogValidation"),
      heparinLogList: document.querySelector("#heparinLogList"),
      heparinLogEmpty: document.querySelector("#heparinLogEmpty"),
      useLoadingDoseForLogButton: document.querySelector("#useLoadingDoseForLog"),
      addHeparinLogEntryButton: document.querySelector("#addHeparinLogEntry"),
      clearHeparinLogButton: document.querySelector("#clearHeparinLog"),
      curveChart: document.querySelector("#heparinCurveChart"),
      curveSummary: document.querySelector("#heparinCurveSummary"),
      curveTooltip: document.querySelector("#heparinCurveTooltip"),
      heparinResistanceWarning: document.querySelector("#heparinResistanceWarning"),
      curveModal: document.querySelector("#heparinCurveModal"),
      curveModalChart: document.querySelector("#heparinCurveModalChart"),
      curveModalSummary: document.querySelector("#heparinCurveModalSummary"),
      curveModalTooltip: document.querySelector("#heparinCurveModalTooltip"),
    }
  : null;

let heparinLogState = anticoagForm ? readHeparinLogState() : { entries: [] };

const drugDoseCheckForm = document.querySelector("#drug-dose-check-form");
const drugDoseCheckOutputs = drugDoseCheckForm
  ? {
      weightInput: document.querySelector("#drugCheckWeightKg"),
      scenarioSelect: document.querySelector("#drugCheckScenario"),
      scenarioHint: document.querySelector("#drugCheckScenarioHint"),
      doseInput: document.querySelector("#drugCheckDose"),
      doseUnit: document.querySelector("#drugCheckDoseUnit"),
      doseHint: document.querySelector("#drugCheckDoseHint"),
      concentrationInput: document.querySelector("#drugCheckConcentration"),
      concentrationUnit: document.querySelector("#drugCheckConcentrationUnit"),
      concentrationHint: document.querySelector("#drugCheckConcentrationHint"),
      validation: document.querySelector("#drugCheckValidation"),
      totalDoseOutput: document.querySelector("#drugCheckTotalDoseOutput"),
      totalDoseStatus: document.querySelector("#drugCheckTotalDoseStatus"),
      volumeOutput: document.querySelector("#drugCheckVolumeOutput"),
      volumeStatus: document.querySelector("#drugCheckVolumeStatus"),
      rangeOutput: document.querySelector("#drugCheckRangeOutput"),
      rangeStatus: document.querySelector("#drugCheckRangeStatus"),
      caution: document.querySelector("#drugCheckCaution"),
    }
  : null;

const tabButtons = Array.from(document.querySelectorAll("[data-tab-target]"));
const tabPanels = Array.from(document.querySelectorAll("[data-tab-panel]"));
const referenceFilterButtons = Array.from(document.querySelectorAll("[data-reference-filter]"));
const referenceFilterCount = document.querySelector("#referenceFilterCount");
const referenceGroups = Array.from(document.querySelectorAll(".reference-group:not(.reference-workflow-group)"));
const referenceItems = referenceGroups.flatMap((group) => Array.from(group.querySelectorAll(".references-list li")));

function collectInputs(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function formatPrimeUnits(prbcVolumeMl) {
  if (prbcVolumeMl === null) return "--";
  if (prbcVolumeMl === 0) return "0 units";
  return `${roundTo(prbcVolumeMl / 300, 1).toFixed(1)} units`;
}

function classifyReferenceSource(item) {
  const text = item.textContent.toLowerCase();

  if (/(medtronic|getinge|livanova)/.test(text)) return { key: "manufacturer", label: "Manufacturer" };
  if (/(dailymed|fda label|u\.s\. food and drug administration|pfizer label)/.test(text)) return { key: "drug-label", label: "FDA/DailyMed" };
  if (/(ncbi bookshelf|statpearls)/.test(text)) return { key: "ncbi", label: "NCBI" };
  if (/(amsect|sts\/sca|aabb|ismp|guideline|clinical guide|accp|blood bank|vumc)/.test(text)) return { key: "guideline", label: "Guideline" };
  if (/(pubmed|pubmed central|pmc)/.test(text)) return { key: "peer-reviewed", label: "Peer-reviewed" };
  return { key: "other", label: "Needs Review" };
}

function initializeReferenceFilters() {
  if (referenceFilterButtons.length === 0 || referenceItems.length === 0) return;

  referenceItems.forEach((item) => {
    const source = classifyReferenceSource(item);
    item.dataset.referenceSource = source.key;

    if (!item.querySelector(".reference-source-badge")) {
      const badge = document.createElement("span");
      badge.className = `reference-source-badge reference-source-${source.key}`;
      badge.textContent = source.label;
      item.append(" ", badge);
    }
  });

  const applyFilter = (filterName) => {
    let visibleCount = 0;

    referenceItems.forEach((item) => {
      const shouldShow = filterName === "all" || item.dataset.referenceSource === filterName;
      item.hidden = !shouldShow;
      if (shouldShow) visibleCount += 1;
    });

    referenceGroups.forEach((group) => {
      const groupItems = Array.from(group.querySelectorAll(".references-list li"));
      group.hidden = groupItems.every((item) => item.hidden);
    });

    referenceFilterButtons.forEach((button) => {
      const isActive = button.dataset.referenceFilter === filterName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (referenceFilterCount) {
      referenceFilterCount.textContent = filterName === "all"
        ? `${visibleCount} references shown.`
        : `${visibleCount} references match this source filter.`;
    }
  };

  referenceFilterButtons.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.referenceFilter ?? "all"));
    button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
  });

  applyFilter("all");
}

function setHeparinLogValidation(message = "") {
  if (!anticoagOutputs?.heparinLogValidation) return;
  anticoagOutputs.heparinLogValidation.textContent = message;
}

function formatDrugCheckNumber(value, decimals = 1) {
  if (!Number.isFinite(value)) return "--";
  if (Math.abs(value) >= 1000) return Math.round(value).toLocaleString();
  return roundTo(value, decimals).toFixed(decimals);
}

function getDrugDoseCheckScenario() {
  const scenarioId = drugDoseCheckOutputs?.scenarioSelect?.value ?? "heparin-cpb-bolus";
  return DRUG_DOSE_CHECKS[scenarioId] ?? DRUG_DOSE_CHECKS["heparin-cpb-bolus"];
}

function syncDrugDoseCheckScenarioFields() {
  if (!drugDoseCheckOutputs) return;
  const scenario = getDrugDoseCheckScenario();

  drugDoseCheckOutputs.doseUnit.textContent = scenario.doseUnit;
  drugDoseCheckOutputs.concentrationUnit.textContent = scenario.concentrationUnit;
  drugDoseCheckOutputs.scenarioHint.textContent = `${scenario.rangeLabel}.`;
  drugDoseCheckOutputs.doseHint.textContent = `Reference: ${scenario.rangeLabel}.`;
  drugDoseCheckOutputs.concentrationHint.textContent = `Enter concentration as ${scenario.concentrationUnit}.`;
}

function applyDrugDoseCheckScenarioDefaults() {
  if (!drugDoseCheckOutputs) return;
  const scenario = getDrugDoseCheckScenario();
  drugDoseCheckOutputs.doseInput.value = String(scenario.suggestedDose);
  drugDoseCheckOutputs.concentrationInput.value = String(scenario.suggestedConcentration);
}

function renderDrugDoseSafetyCheck() {
  if (!drugDoseCheckForm || !drugDoseCheckOutputs) return;

  const scenario = getDrugDoseCheckScenario();
  syncDrugDoseCheckScenarioFields();

  const checked = calculateDrugDoseSafetyCheck({
    weightKg: drugDoseCheckOutputs.weightInput?.value,
    dose: drugDoseCheckOutputs.doseInput?.value,
    concentration: drugDoseCheckOutputs.concentrationInput?.value,
    routeType: scenario.routeType,
    doseUnit: scenario.doseUnit,
    concentrationUnit: scenario.concentrationUnit,
    referenceLow: scenario.referenceLow,
    referenceHigh: scenario.referenceHigh,
  });
  const rangeCard = drugDoseCheckOutputs.rangeOutput?.closest(".drug-check-output");

  if (!checked) {
    rangeCard?.removeAttribute("data-check-state");
    drugDoseCheckOutputs.validation.textContent = "Enter a valid weight, dose, and concentration to run the cross-check.";
    drugDoseCheckOutputs.totalDoseOutput.textContent = "--";
    drugDoseCheckOutputs.totalDoseStatus.textContent = "Enter weight, dose, and concentration.";
    drugDoseCheckOutputs.volumeOutput.textContent = "--";
    drugDoseCheckOutputs.volumeStatus.textContent = "Calculated from the entered concentration.";
    drugDoseCheckOutputs.rangeOutput.textContent = "--";
    drugDoseCheckOutputs.rangeStatus.textContent = `Compares the entered dose with ${scenario.rangeLabel}.`;
    drugDoseCheckOutputs.caution.textContent = `Educational cross-check only. ${scenario.caution}`;
    return;
  }

  const totalDoseLabel = `${formatDrugCheckNumber(checked.totalDose)} ${scenario.resultUnit}`;
  const volumeLabel = checked.routeType === "infusion"
    ? `${formatDrugCheckNumber(checked.volumeMl)} mL/hr`
    : `${formatDrugCheckNumber(checked.volumeMl)} mL`;
  const rangeLabel = checked.doseStatus === "within"
    ? "Within range"
    : checked.doseStatus === "below"
      ? "Review low"
      : "Review high";

  drugDoseCheckOutputs.validation.textContent = "";
  rangeCard?.setAttribute("data-check-state", checked.doseStatus);
  drugDoseCheckOutputs.totalDoseOutput.textContent = totalDoseLabel;
  drugDoseCheckOutputs.totalDoseStatus.textContent = `${scenario.label}: ${drugDoseCheckOutputs.doseInput.value} ${scenario.doseUnit} x ${drugDoseCheckOutputs.weightInput.value} kg.`;
  drugDoseCheckOutputs.volumeOutput.textContent = volumeLabel;
  drugDoseCheckOutputs.volumeStatus.textContent = checked.routeType === "infusion"
    ? `Pump rate from ${formatDrugCheckNumber(checked.totalDose)} ${scenario.resultUnit} using ${drugDoseCheckOutputs.concentrationInput.value} ${scenario.concentrationUnit}.`
    : `Draw-up volume from ${formatDrugCheckNumber(checked.totalDose)} ${scenario.resultUnit} using ${drugDoseCheckOutputs.concentrationInput.value} ${scenario.concentrationUnit}.`;
  drugDoseCheckOutputs.rangeOutput.textContent = rangeLabel;
  drugDoseCheckOutputs.rangeStatus.textContent = checked.doseStatus === "within"
    ? `Entered dose falls within ${scenario.rangeLabel}.`
    : `Entered dose is ${checked.doseStatus} ${scenario.rangeLabel}; verify indication, concentration, and local protocol.`;
  drugDoseCheckOutputs.caution.textContent = `Educational cross-check only. ${scenario.caution}`;
}

function renderHeparinAdministrationLog(evaluation) {
  if (!anticoagOutputs) return;

  const entries = heparinLogState.entries;
  const tallyUnits = calculateHeparinAdministrationTotal(entries);

  if (anticoagOutputs.heparinTallyUnits.value) {
    anticoagOutputs.heparinTallyUnits.value.textContent = tallyUnits > 0
      ? anticoagOutputs.heparinTallyUnits.format(tallyUnits)
      : "--";
  }
  if (anticoagOutputs.heparinTallyUnits.status) {
    anticoagOutputs.heparinTallyUnits.status.textContent = entries.length > 0
      ? `${entries.length} heparin entr${entries.length === 1 ? "y" : "ies"} recorded.`
      : "No heparin entries recorded yet.";
  }

  if (evaluation.fields.protamineRatioMgPer100U?.valid && tallyUnits > 0) {
    anticoagOutputs.protamineDoseMg.value.textContent = anticoagOutputs.protamineDoseMg.format(
      calculateProtamineDose(tallyUnits, evaluation.fields.protamineRatioMgPer100U.value),
    );
    anticoagOutputs.protamineDoseMg.status.textContent = "Based on the total logged heparin and selected protamine ratio.";
  } else {
    anticoagOutputs.protamineDoseMg.value.textContent = "--";
    anticoagOutputs.protamineDoseMg.status.textContent = evaluation.fields.protamineRatioMgPer100U?.valid
      ? anticoagOutputs.protamineDoseMg.empty
      : "Enter a valid protamine ratio to calculate the reversal dose.";
  }

  if (anticoagOutputs.heparinLogEmpty) {
    anticoagOutputs.heparinLogEmpty.hidden = entries.length > 0;
  }

  if (anticoagOutputs.heparinLogList) {
    anticoagOutputs.heparinLogList.innerHTML = entries
      .map((entry) => `
        <li class="heparin-log-entry">
          <div class="heparin-log-entry-copy">
            <span class="heparin-log-entry-time">${entry.time}</span>
            <span class="heparin-log-entry-dose">${Math.round(entry.units).toLocaleString()} units heparin</span>
          </div>
          <button type="button" class="heparin-log-remove" data-heparin-log-remove="${entry.id}">Remove</button>
        </li>
      `)
      .join("");
  }
}

function setPrimePlan(state, headline, body) {
  if (!primePlanCard) return;
  primePlanCard.dataset.planState = state;
  primePlanElements.tone.textContent = state === "good" ? "Target covered" : state === "warn" ? "Transfusion likely" : state === "critical" ? "Assumption conflict" : "Planning snapshot";
  primePlanElements.headline.textContent = headline;
  primePlanElements.body.textContent = body;
}

function renderPrimePlan(evaluation) {
  const { results } = evaluation;

  if (results.predictedHct === null) {
    setPrimePlan("idle", "Build a dilution estimate", "Enter weight, baseline hematocrit, and prime volume to generate a quick bypass planning summary.");
    primePlanElements.gapBadge.textContent = "Target gap: --";
    primePlanElements.unitsBadge.textContent = "Estimated PRBC: --";
    primePlanElements.ratioBadge.textContent = "Prime ratio: --";
    return;
  }

  const targetGap = results.targetHct !== null ? Math.max(0, results.targetHct - results.predictedHct) : null;
  primePlanElements.gapBadge.textContent = targetGap === null ? "Target gap: --" : `Target gap: ${roundTo(targetGap, 1).toFixed(1)} %`;
  primePlanElements.unitsBadge.textContent = `Estimated PRBC: ${results.prbcVolumeMl === null ? "--" : `${Math.round(results.prbcVolumeMl)} mL (${formatPrimeUnits(results.prbcVolumeMl)})`}`;
  primePlanElements.ratioBadge.textContent = results.primeToBloodRatio === null ? "Prime ratio: --" : `Prime ratio: ${roundTo(results.primeToBloodRatio, 2).toFixed(2)} : 1`;

  if (results.targetMetWithoutPrbc) {
    setPrimePlan("good", "Clear prime already stays at or above target", `Predicted post-prime hematocrit is ${roundTo(results.predictedHct, 1).toFixed(1)}%, so no added PRBC volume is needed with the current assumptions.`);
    return;
  }

  if (results.prbcTargetReachable === false) {
    setPrimePlan("critical", "Current PRBC assumption cannot reach the target", "Raise the assumed PRBC hematocrit or lower the target on-pump hematocrit to generate a reachable transfusion estimate.");
    return;
  }

  if (results.prbcVolumeMl !== null && results.projectedHct !== null) {
    setPrimePlan("warn", "Prime plan suggests adding PRBC before bypass", `Estimated PRBC volume is ${Math.round(results.prbcVolumeMl)} mL, which projects an on-pump hematocrit of ${roundTo(results.projectedHct, 1).toFixed(1)}% under the current assumptions.`);
    return;
  }

  setPrimePlan("idle", "Complete the remaining target assumptions", "Add a target on-pump hematocrit and PRBC hematocrit assumption to finish the dilution planning summary.");
}

function syncPrimeEbvQuickState() {
  if (!primeForm) return;
  const currentEbvFactor = primeForm.elements.namedItem("primeEbvFactor")?.value;
  primeEbvQuickButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.primeEbvQuick === currentEbvFactor);
  });
}

function updateFormInvalidState(form, fields, summaryElement) {
  const invalidMessages = [];

  for (const element of form.elements) {
    if (!(element instanceof HTMLInputElement)) {
      continue;
    }

    const fieldState = fields[element.name];
    const isInvalid = Boolean(fieldState && !fieldState.valid && element.value !== "");
    element.setAttribute("aria-invalid", String(isInvalid));

    if (isInvalid) {
      invalidMessages.push(fieldState.message);
    }
  }

  summaryElement.textContent = invalidMessages[0] ?? "";
}

function formatDelta(value, unit) {
  const rounded = roundTo(Math.abs(value), unit === "g/dL" ? 1 : 2);

  if (value === 0) {
    return "No change needed";
  }

  const direction = value > 0 ? "Increase by" : "Decrease by";
  return `${direction} ${unit === "g/dL" ? rounded.toFixed(1) : rounded.toFixed(2)} ${unit}`;
}

function interpolateCurve(points, flow) {
  if (!points.length) return null;
  if (flow <= points[0][0]) return points[0][1];
  if (flow >= points[points.length - 1][0]) {
    if (points.length >= 2) {
      const [lastX, lastY] = points[points.length - 1];
      const [prevX, prevY] = points[points.length - 2];
      if (lastX > 0 && prevX > 0 && lastY > 0 && prevY > 0 && lastX !== prevX && lastY !== prevY) {
        const exponent = Math.log(lastY / prevY) / Math.log(lastX / prevX);
        if (Number.isFinite(exponent) && exponent > 0) {
          const coefficient = lastY / (lastX ** exponent);
          return coefficient * (flow ** exponent);
        }
      }
      const slope = (lastY - prevY) / (lastX - prevX);
      return lastY + (flow - lastX) * slope;
    }
    return points[points.length - 1][1];
  }

  for (let index = 1; index < points.length; index += 1) {
    const [rightX, rightY] = points[index];
    const [leftX, leftY] = points[index - 1];
    if (flow <= rightX) {
      const ratio = (flow - leftX) / (rightX - leftX);
      return leftY + (rightY - leftY) * ratio;
    }
  }

  return points[points.length - 1][1];
}

function getCannulaPanelState(side) {
  return cannulaState.sides[side];
}

function getActiveCannulaSides() {
  return cannulaState.bicavalEnabled ? CANNULA_SIDES : BASE_CANNULA_SIDES;
}

function getCannulaLibraryCategory(side) {
  return side === "arterial" ? "arterial" : "venous";
}

function getCannulaManufacturer(side) {
  const panelState = getCannulaPanelState(side);
  if (!panelState?.manufacturerId) return null;
  return CANNULA_LIBRARY[panelState.manufacturerId] ?? null;
}

function getCannulaManufacturerEntriesForSide(side) {
  const category = getCannulaLibraryCategory(side);
  return Object.entries(CANNULA_LIBRARY).filter(([, manufacturer]) => Object.values(manufacturer.families).some((family) => family.category === category));
}

function getCannulaFamilyEntriesForManufacturer(manufacturer, side) {
  const category = getCannulaLibraryCategory(side);
  return manufacturer ? Object.entries(manufacturer.families).filter(([, family]) => family.category === category) : [];
}

function getCannulaFamiliesForSide(side) {
  const manufacturer = getCannulaManufacturer(side);
  return getCannulaFamilyEntriesForManufacturer(manufacturer, side);
}

function getCannulaFamily(side) {
  const panelState = getCannulaPanelState(side);
  if (!panelState.familyId) return null;
  return getCannulaManufacturer(side)?.families[panelState.familyId] ?? null;
}

function getCannulaRoleMetadata(family) {
  if (!family) {
    return { shortLabel: "", guidance: "", graphLabel: "" };
  }

  const label = family.label.toLowerCase();

  if (/(mc2|two-stage|two stage|dual-stage|dual stage)/i.test(label)) {
    return {
      shortLabel: "Two-stage",
      guidance: "Typical role: two-stage or cavoatrial drainage rather than separate SVC and IVC bicaval cannulas.",
      graphLabel: "Two-stage / cavoatrial role",
    };
  }

  if (label.includes("femoral")) {
    return {
      shortLabel: "Femoral",
      guidance: "Typical role: femoral venous drainage rather than direct SVC or IVC central bicaval cannulation.",
      graphLabel: "Femoral venous role",
    };
  }

  if (label.includes("right-angle") || label.includes("right angle")) {
    return {
      shortLabel: "SVC",
      guidance: "Typical bicaval role: SVC cannula. Right-angle venous cannulas are commonly used in the SVC.",
      graphLabel: "Possible SVC role",
    };
  }

  if (label.includes("straight") || label.includes("malleable") || label.includes("metal-tip")) {
    return {
      shortLabel: "IVC",
      guidance: "Typical bicaval role: IVC cannula. Straight or malleable venous cannulas are commonly used for the IVC, often at a larger size than the SVC line.",
      graphLabel: "Possible IVC role",
    };
  }

  return {
    shortLabel: "Venous",
    guidance: "Typical role depends on the surgeon, anatomy, and exposure; use this family as a general venous option unless a specific SVC or IVC role is defined.",
    graphLabel: "",
  };
}

function getCannulaSizes(side) {
  return getCannulaFamily(side)?.sizes ?? [];
}

function getCannulaFlowMax(side) {
  const family = getCannulaFamily(side);
  if (family?.maxFlow) return family.maxFlow;
  return getCannulaManufacturer(side)?.maxFlow ?? 7;
}

function getCannulaTargetFlowCeiling() {
  const perfusionContext = getSharedPerfusionContext();
  const perfusionFlowAtCi3 = perfusionContext.bsa !== null
    ? calculatePumpFlow(3.0, perfusionContext.bsa)
    : 0;
  const manufacturerMaxima = getActiveCannulaSides()
    .map((side) => getCannulaManufacturer(side)?.maxFlow ?? 0)
    .filter((value) => Number.isFinite(value) && value > 0);
  const manufacturerCeiling = manufacturerMaxima.length ? Math.max(...manufacturerMaxima) : 7;
  return roundTo(Math.min(Math.max(4, perfusionFlowAtCi3, cannulaState.flow), manufacturerCeiling || 7), 1);
}

function getCannulaChartFlowMax(side) {
  return Math.max(getCannulaFlowMax(side), getCannulaTargetFlowCeiling());
}

function isCannulaFlowBeyondChartRange(size) {
  if (!size?.points?.length) return false;
  return cannulaState.flow > size.points[size.points.length - 1][0];
}

function getSelectedCannulaSize(side) {
  const panelState = getCannulaPanelState(side);
  return getCannulaSizes(side).find((size) => size.id === panelState.sizeId) ?? getCannulaSizes(side)[0] ?? null;
}

function getCannulaFrenchSizeValue(size) {
  return Number.parseFloat(size.id);
}

function getRecommendedCannulaSizeForFamily(family) {
  if (!family) return null;
  const sortedSizes = [...family.sizes].sort((left, right) => getCannulaFrenchSizeValue(left) - getCannulaFrenchSizeValue(right));
  const familiesWithCurveData = sortedSizes.filter((size) => Array.isArray(size.points) && size.points.length > 0);
  if (!familiesWithCurveData.length) {
    return sortedSizes[0] ?? null;
  }
  const acceptableSize = familiesWithCurveData.find((size) => interpolateCurve(size.points, cannulaState.flow) <= family.recommendedMaxPressure);
  return acceptableSize ?? familiesWithCurveData[familiesWithCurveData.length - 1];
}

function getRecommendedCannulaSize(side) {
  return getRecommendedCannulaSizeForFamily(getCannulaFamily(side));
}

function cannulaFamilyHasCurveData(family) {
  return Boolean(family?.sizes?.some((size) => Array.isArray(size.points) && size.points.length > 0));
}

function getPreferredCannulaManufacturerId(side) {
  const manufacturerEntries = getCannulaManufacturerEntriesForSide(side);
  const manufacturerWithCurveData = manufacturerEntries.find(([, manufacturer]) =>
    getCannulaFamilyEntriesForManufacturer(manufacturer, side).some(([, family]) => cannulaFamilyHasCurveData(family)),
  );
  return manufacturerWithCurveData?.[0] ?? manufacturerEntries[0]?.[0] ?? null;
}

function getPreferredCannulaFamilyId(side) {
  const familyEntries = getCannulaFamiliesForSide(side);
  if (side === "bicaval") {
    const intracardiacFamily = familyEntries.find(([, family]) =>
      cannulaFamilyHasCurveData(family) && !family.label.toLowerCase().includes("femoral")
      && /(bicaval|two-stage|two stage|dual-stage|dual stage|mc2)/i.test(family.label),
    );
    const fallbackIntracardiacFamily = familyEntries.find(([, family]) =>
      cannulaFamilyHasCurveData(family) && /(bicaval|two-stage|two stage|dual-stage|dual stage|mc2|multi-stage|multi stage)/i.test(family.label),
    );
    const nonFemoralCurveFamily = familyEntries.find(([, family]) => cannulaFamilyHasCurveData(family) && !family.label.toLowerCase().includes("femoral"));
    const fallbackCurveFamily = familyEntries.find(([, family]) => cannulaFamilyHasCurveData(family));
    return intracardiacFamily?.[0] ?? fallbackIntracardiacFamily?.[0] ?? nonFemoralCurveFamily?.[0] ?? fallbackCurveFamily?.[0] ?? familyEntries[0]?.[0] ?? null;
  }
  const familyWithCurveData = familyEntries.find(([, family]) => cannulaFamilyHasCurveData(family) && !family.label.toLowerCase().includes("femoral"));
  const fallbackFamilyWithCurveData = familyEntries.find(([, family]) => cannulaFamilyHasCurveData(family));
  return familyWithCurveData?.[0] ?? fallbackFamilyWithCurveData?.[0] ?? familyEntries[0]?.[0] ?? null;
}

function getCannulaFamilyRecommendationScore(side, familyId, family) {
  const recommendedSize = getRecommendedCannulaSizeForFamily(family);
  if (!recommendedSize) return Number.POSITIVE_INFINITY;

  const recommendedFr = Number.isFinite(getCannulaFrenchSizeValue(recommendedSize))
    ? getCannulaFrenchSizeValue(recommendedSize)
    : 999;
  const recommendedPressure = Array.isArray(recommendedSize.points) && recommendedSize.points.length
    ? interpolateCurve(recommendedSize.points, cannulaState.flow)
    : family.recommendedMaxPressure;
  const pressurePenalty = Math.max(0, recommendedPressure - family.recommendedMaxPressure) * 10;
  const label = `${familyId} ${family.label}`.toLowerCase();

  let bias = 0;
  if (side === "arterial" && label.includes("femoral")) {
    bias += 4;
  }
  if (side === "venous" && label.includes("femoral")) {
    bias += 3;
  }
  if (side === "bicaval") {
    if (/(mc2|two-stage|two stage|dual-stage|dual stage|multi-stage|multi stage|bicaval)/i.test(label)) {
      bias -= 1.5;
    }
    if (label.includes("femoral")) {
      bias += 3;
    }
  }

  return recommendedFr + pressurePenalty + bias;
}

function getRecommendedCannulaFamilyId(side) {
  const familyEntries = getCannulaFamiliesForSide(side);
  if (!familyEntries.length) return null;

  const rankedFamilies = familyEntries
    .filter(([, family]) => cannulaFamilyHasCurveData(family))
    .map(([familyId, family]) => ({
      familyId,
      score: getCannulaFamilyRecommendationScore(side, familyId, family),
    }))
    .filter(({ score }) => Number.isFinite(score))
    .sort((left, right) => left.score - right.score);

  return rankedFamilies[0]?.familyId ?? getPreferredCannulaFamilyId(side);
}

function getValidSharedNumber(groupName, config) {
  const sharedState = readSharedFieldState();
  const rawValue = sharedState[groupName];
  if (rawValue === undefined || rawValue === null || rawValue === "") return null;

  const value = Number(rawValue);
  if (Number.isNaN(value)) return null;
  if (!config.allowZero && value <= 0) return null;
  if (config.allowZero && value < 0) return null;
  if (value < config.min || value > config.max) return null;
  return value;
}

function getSharedPerfusionContext() {
  const heightCm = getValidSharedNumber("patientHeightCm", PERFUSION_FIELD_CONFIG.heightCm);
  const weightKg = getValidSharedNumber("patientWeightKg", PERFUSION_FIELD_CONFIG.weightKg);
  const cardiacIndex = getValidSharedNumber("patientCardiacIndex", PERFUSION_FIELD_CONFIG.cardiacIndex);
  const pumpFlow = getValidSharedNumber("patientPumpFlow", PERFUSION_FIELD_CONFIG.pumpFlow);
  let bsa = null;
  let bsaFormula = null;

  if (weightKg !== null) {
    if (heightCm !== null) {
      bsa = calculateBsa(heightCm, weightKg);
      bsaFormula = "Mosteller";
    } else {
      bsa = calculateWeightOnlyBsa(weightKg);
      bsaFormula = "Costeff";
    }
  }

  return {
    heightCm,
    weightKg,
    cardiacIndex,
    pumpFlow,
    bsa,
    bsaFormula,
  };
}

function syncCannulaFlowFromPerfusion(force = false) {
  if (cannulaState.manualFlowOverride && !force) return;

  const maxFlow = getCannulaTargetFlowCeiling();
  const perfusionContext = getSharedPerfusionContext();
  let nextFlow = cannulaState.flow;
  let flowSourceLabel = "Manual target flow";
  let flowSourceDetail = "Adjust liters per minute with the slider or chart drag control.";
  let linkedToPerfusion = false;

  if (perfusionContext.pumpFlow !== null) {
    nextFlow = perfusionContext.pumpFlow;
    flowSourceLabel = "Perfusion pump flow";
    flowSourceDetail = `Using entered pump flow from the perfusion tab${perfusionContext.bsa !== null ? ` with ${perfusionContext.bsaFormula} BSA ${roundTo(perfusionContext.bsa, 2).toFixed(2)} m² in context.` : "."}`;
    linkedToPerfusion = true;
  } else if (perfusionContext.cardiacIndex !== null && perfusionContext.bsa !== null) {
    nextFlow = calculatePumpFlow(perfusionContext.cardiacIndex, perfusionContext.bsa);
    flowSourceLabel = "Perfusion cardiac index";
    flowSourceDetail = `Using entered cardiac index ${roundTo(perfusionContext.cardiacIndex, 2).toFixed(2)} L/min/m² × ${perfusionContext.bsaFormula} BSA ${roundTo(perfusionContext.bsa, 2).toFixed(2)} m².`;
    linkedToPerfusion = true;
  } else if (perfusionContext.bsa !== null) {
    nextFlow = calculatePumpFlow(DEFAULT_CANNULA_CARDIAC_INDEX, perfusionContext.bsa);
    flowSourceLabel = `Default CI ${DEFAULT_CANNULA_CARDIAC_INDEX.toFixed(1)}`;
    flowSourceDetail = `No perfusion flow entered, so target flow defaults to ${DEFAULT_CANNULA_CARDIAC_INDEX.toFixed(1)} L/min/m² × ${perfusionContext.bsaFormula} BSA ${roundTo(perfusionContext.bsa, 2).toFixed(2)} m².`;
    linkedToPerfusion = true;
  }

  cannulaState.flow = roundTo(Math.min(nextFlow, maxFlow || 7), 1);
  cannulaState.flowLinkedToPerfusion = linkedToPerfusion;
  cannulaState.flowSourceLabel = flowSourceLabel;
  cannulaState.flowSourceDetail = flowSourceDetail;
}

function syncCannulaManufacturerOptions(side) {
  const panel = cannulaPanels[side];
  if (!panel?.manufacturerSelect) return;
  const panelState = getCannulaPanelState(side);
  const manufacturerEntries = getCannulaManufacturerEntriesForSide(side);
  panel.manufacturerSelect.innerHTML = manufacturerEntries
    .map(([id, config]) => `<option value="${id}">${config.label}</option>`)
    .join("");
  if (!manufacturerEntries.length) {
    panel.manufacturerSelect.innerHTML = `<option value="">No ${side} manufacturer listed</option>`;
    panel.manufacturerSelect.value = "";
    return;
  }
  if (!manufacturerEntries.some(([id]) => id === panelState.manufacturerId)) {
    panelState.manufacturerId = getPreferredCannulaManufacturerId(side);
  }
  panel.manufacturerSelect.value = panelState.manufacturerId;
}

function syncCannulaRecommendedSelection(side) {
  const panelState = getCannulaPanelState(side);
  const familyEntries = getCannulaFamiliesForSide(side);
  if (!familyEntries.length) {
    panelState.familyId = null;
    panelState.sizeId = null;
    panelState.familyManualOverride = false;
    panelState.manualOverride = false;
    return;
  }

  if (!panelState.familyManualOverride) {
    panelState.familyId = getRecommendedCannulaFamilyId(side) ?? getPreferredCannulaFamilyId(side);
  }

  const sizes = getCannulaSizes(side);
  if (!sizes.length) {
    panelState.sizeId = null;
    panelState.manualOverride = false;
    return;
  }

  if (!panelState.manualOverride) {
    const recommendedSize = getRecommendedCannulaSize(side);
    panelState.sizeId = recommendedSize?.id ?? sizes[0]?.id ?? null;
    return;
  }

  if (!sizes.some((size) => size.id === panelState.sizeId)) {
    panelState.sizeId = sizes[0]?.id ?? null;
    panelState.manualOverride = false;
  }
}

function syncCannulaSideDefaults() {
  CANNULA_SIDES.forEach((side) => {
    const panelState = getCannulaPanelState(side);
    const manufacturerEntries = getCannulaManufacturerEntriesForSide(side);
    if (!manufacturerEntries.length) {
      panelState.manufacturerId = null;
      panelState.familyId = null;
      panelState.sizeId = null;
      panelState.familyManualOverride = false;
      panelState.manualOverride = false;
      return;
    }
    if (!manufacturerEntries.some(([id]) => id === panelState.manufacturerId)) {
      panelState.manufacturerId = getPreferredCannulaManufacturerId(side);
    }
    const familyEntries = getCannulaFamiliesForSide(side);
    const hasCurrentFamily = familyEntries.some(([familyId]) => familyId === panelState.familyId);
    if (!familyEntries.length) {
      panelState.familyId = null;
      panelState.sizeId = null;
      panelState.familyManualOverride = false;
      panelState.manualOverride = false;
      return;
    }
    if (!hasCurrentFamily) {
      panelState.familyId = null;
      panelState.familyManualOverride = false;
      panelState.manualOverride = false;
    }
    syncCannulaRecommendedSelection(side);
  });
}

function syncCannulaFamilyOptions(side) {
  const panel = cannulaPanels[side];
  if (!panel?.familySelect) return;
  const panelState = getCannulaPanelState(side);
  const familyEntries = getCannulaFamiliesForSide(side);
  if (!familyEntries.length) {
    panel.familySelect.innerHTML = `<option value="">No ${side} family listed</option>`;
    panel.familySelect.value = "";
    return;
  }
  panel.familySelect.innerHTML = familyEntries
    .map(([id, family]) => `<option value="${id}">${family.label}</option>`)
    .join("");
  panel.familySelect.value = panelState.familyId;

  if (panel.roleHint) {
    const selectedFamily = getCannulaFamily(side);
    panel.roleHint.textContent = selectedFamily
      ? getCannulaRoleMetadata(selectedFamily).guidance
      : `Select a ${side} family to see the typical cannulation role.`;
  }
}

function syncCannulaSizeButtons(side) {
  const panel = cannulaPanels[side];
  if (!panel?.sizeButtons) return;
  const panelState = getCannulaPanelState(side);
  const sizes = getCannulaSizes(side);
  if (!sizes.length) {
    panel.sizeButtons.innerHTML = `<span class="quick-select-button is-disabled">No sizes listed</span>`;
    return;
  }
  if (!sizes.some((size) => size.id === panelState.sizeId)) {
    panelState.sizeId = sizes[0].id;
  }
  panel.sizeButtons.innerHTML = sizes
    .map((size) => `<button type="button" class="quick-select-button${size.id === panelState.sizeId ? " is-active" : ""}" data-cannula-size="${size.id}">${size.label}</button>`)
    .join("");
}

function syncCannulaFlowControls() {
  if (!cannulaFlowSlider || !cannulaFlowDisplay) return;
  const maxFlow = getCannulaTargetFlowCeiling();
  const sliderMax = maxFlow || 7;
  cannulaFlowSlider.max = String(sliderMax);
  if (cannulaState.flow > sliderMax) {
    cannulaState.flow = sliderMax;
  }
  cannulaFlowSlider.value = String(cannulaState.flow);
  cannulaFlowDisplay.textContent = `${roundTo(cannulaState.flow, 1).toFixed(1)} L/min`;
}

function setCannulaManualFlowSource() {
  cannulaState.manualFlowOverride = true;
  cannulaState.flowLinkedToPerfusion = false;
  cannulaState.flowSourceLabel = "Manual target flow";
  cannulaState.flowSourceDetail = "Adjusted directly on the cannula selection tab with the slider or chart drag.";
}

function formatCannulaTooltip(side) {
  const family = getCannulaFamily(side);
  const size = getSelectedCannulaSize(side);
  if (!family || !size || !Array.isArray(size.points) || !size.points.length) {
    return `Flow ${roundTo(cannulaState.flow, 1).toFixed(1)} L/min`;
  }
  const pressureDrop = interpolateCurve(size.points, cannulaState.flow);
  const extrapolatedLabel = isCannulaFlowBeyondChartRange(size) ? " | Extrapolated" : "";
  return `Flow ${roundTo(cannulaState.flow, 1).toFixed(1)} L/min | ${size.label} | ${Math.round(pressureDrop)} mmHg${extrapolatedLabel}`;
}

function showCannulaTooltip(side, event) {
  const tooltip = cannulaPanels[side]?.tooltip;
  if (!tooltip) return;
  tooltip.textContent = formatCannulaTooltip(side);
  tooltip.classList.add("is-visible");
  positionCurveTooltip(event, tooltip);
}

function hideCannulaTooltips() {
  CANNULA_SIDES.forEach((side) => {
    cannulaPanels[side]?.tooltip?.classList.remove("is-visible");
  });
}

function syncCannulaBicavalVisibility() {
  const isEnabled = cannulaState.bicavalEnabled;
  document.body.classList.toggle("has-bicaval", isEnabled);
  if (cannulaBicavalToggle) {
    cannulaBicavalToggle.checked = isEnabled;
  }
  cannulaPanels.bicaval.setupPanel.hidden = !isEnabled;
  cannulaPanels.bicaval.comparePanel.hidden = !isEnabled;
  if (cannulaFlowHint) {
    cannulaFlowHint.textContent = isEnabled
      ? "Use the slider or drag on any chart to move arterial, venous, and bicaval comparisons to the same liters per minute."
      : "Use the slider or drag on either chart to move arterial and venous comparisons to the same liters per minute.";
  }
  if (!isEnabled) {
    cannulaState.draggingSide = cannulaState.draggingSide === "bicaval" ? null : cannulaState.draggingSide;
    hideCannulaTooltips();
  }
}

function buildCurvePath(points, x, y) {
  return points.map(([flow, pressure], index) => `${index === 0 ? "M" : "L"} ${x(flow)} ${y(pressure)}`).join(" ");
}

function getNiceAxisStep(maxValue, targetTickCount = 6) {
  const roughStep = maxValue / targetTickCount;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalizedStep = roughStep / magnitude;

  if (normalizedStep <= 1) return magnitude;
  if (normalizedStep <= 2) return 2 * magnitude;
  if (normalizedStep <= 2.5) return 2.5 * magnitude;
  if (normalizedStep <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function getCannulaYAxisConfig(selectedSize, family) {
  const thresholdPressure = family.chartThresholdPressure ?? family.recommendedMaxPressure;
  if (family.chartMaxPressure) {
    const yMax = family.chartMaxPressure;
    const tickStep = getNiceAxisStep(yMax);
    const yTicks = Array.from({ length: Math.round(yMax / tickStep) + 1 }, (_, index) => roundTo(index * tickStep, 2));
    return { thresholdPressure, yMax, yTicks };
  }
  const selectedCurveMax = Math.max(...selectedSize.points.map(([, pressure]) => pressure));
  const paddedMax = Math.max(selectedCurveMax, thresholdPressure) * 1.12;
  const tickStep = getNiceAxisStep(paddedMax);
  const yMax = Math.ceil(paddedMax / tickStep) * tickStep;
  const yTicks = Array.from({ length: Math.round(yMax / tickStep) + 1 }, (_, index) => roundTo(index * tickStep, 2));

  return { thresholdPressure, yMax, yTicks };
}

function renderCannulaSharedOutputs() {
  const arterialManufacturer = getCannulaManufacturer("arterial");
  const venousManufacturer = getCannulaManufacturer("venous");
  const bicavalManufacturer = cannulaState.bicavalEnabled ? getCannulaManufacturer("bicaval") : null;
  const perfusionContext = getSharedPerfusionContext();
  const targetCardiacIndex = perfusionContext.bsa !== null && perfusionContext.bsa > 0
    ? cannulaState.flow / perfusionContext.bsa
    : null;
  cannulaFlowOutput.textContent = `${roundTo(cannulaState.flow, 1).toFixed(1)} L/min`;
  cannulaFlowStatus.textContent = cannulaState.flowLinkedToPerfusion
    ? `${cannulaState.flowSourceLabel}. ${cannulaState.flowSourceDetail}`
    : "Click and drag on any chart or use the slider to move the shared target flow.";
  if (cannulaCiOutput && cannulaCiStatus) {
    cannulaCiOutput.textContent = targetCardiacIndex !== null ? `${roundTo(targetCardiacIndex, 2).toFixed(2)} L/min/m²` : "--";
    if (targetCardiacIndex === null) {
      cannulaCiStatus.textContent = "Enter weight in the Perfusion tab to link liters per minute back to cardiac index.";
    } else if (cannulaState.flowLinkedToPerfusion && perfusionContext.pumpFlow === null && perfusionContext.cardiacIndex === null) {
      cannulaCiStatus.textContent = `This default target flow reflects the ${DEFAULT_CANNULA_CARDIAC_INDEX.toFixed(1)} L/min/m² assumption.`;
    } else if (cannulaState.flowLinkedToPerfusion && perfusionContext.pumpFlow === null && perfusionContext.cardiacIndex !== null) {
      cannulaCiStatus.textContent = `Pulled directly from the Perfusion tab cardiac index of ${roundTo(perfusionContext.cardiacIndex, 2).toFixed(2)} L/min/m².`;
    } else if (cannulaState.flowLinkedToPerfusion && perfusionContext.pumpFlow !== null) {
      cannulaCiStatus.textContent = `Calculated from pump flow and BSA, currently ${roundTo(targetCardiacIndex, 2).toFixed(2)} L/min/m².`;
    } else {
      cannulaCiStatus.textContent = `Live target cardiac index at ${roundTo(cannulaState.flow, 1).toFixed(1)} L/min using current patient BSA.`;
    }
  }
  if (cannulaBsaOutput && cannulaBsaStatus) {
    cannulaBsaOutput.textContent = perfusionContext.bsa !== null ? `${roundTo(perfusionContext.bsa, 2).toFixed(2)} m²` : "--";
    cannulaBsaStatus.textContent = perfusionContext.bsa !== null
      ? perfusionContext.bsaFormula === "Mosteller"
        ? `Derived from height ${roundTo(perfusionContext.heightCm, 1).toFixed(1)} cm and weight ${roundTo(perfusionContext.weightKg, 1).toFixed(1)} kg from the Perfusion tab.`
        : `Estimated from weight ${roundTo(perfusionContext.weightKg, 1).toFixed(1)} kg using the Costeff weight-only formula.`
      : "Enter weight in the Perfusion tab to calculate BSA and target cardiac index.";
  }
  const sourceLabels = [
    arterialManufacturer ? `Arterial: ${arterialManufacturer.sourceLabel}` : null,
    venousManufacturer ? `Venous: ${venousManufacturer.sourceLabel}` : null,
    bicavalManufacturer ? `Bicaval: ${bicavalManufacturer.sourceLabel}` : null,
  ].filter(Boolean);
  cannulaSourceOutput.textContent = sourceLabels.join(" | ") || "--";
  cannulaSourceStatus.textContent = "Current plotted families are first-pass traces from the supplied chart photos. They are much closer to the printed graphs than placeholders, but should still be refined against cleaner source charts or PDFs before relying on them for detailed interpretation.";
}

function renderCannulaSideOutputs(side) {
  const panel = cannulaPanels[side];
  const panelState = getCannulaPanelState(side);
  const manufacturer = getCannulaManufacturer(side);
  const family = getCannulaFamily(side);
  const sideLabel = panel?.label?.toLowerCase() ?? side;
  if (!family) {
    panel.recommendedOutput.textContent = "--";
    panel.recommendedStatus.textContent = `No ${sideLabel} family is currently listed for ${manufacturer?.label ?? "this manufacturer"}.`;
    panel.selectedOutput.textContent = "--";
    panel.selectedStatus.textContent = `Select a manufacturer with a matching ${sideLabel} family to compare this panel.`;
    panel.pressureOutput.textContent = "--";
    panel.pressureStatus.textContent = `Pressure-drop data is unavailable because no ${sideLabel} family is loaded for this panel.`;
    return;
  }
  const recommendedSize = getRecommendedCannulaSize(side);
  if (!recommendedSize) {
    panel.recommendedOutput.textContent = "--";
    panel.recommendedStatus.textContent = `No sizes are listed yet for ${manufacturer.label} ${family.label}.`;
    panel.selectedOutput.textContent = "--";
    panel.selectedStatus.textContent = "Add size data to enable manual comparison.";
    panel.pressureOutput.textContent = "--";
    panel.pressureStatus.textContent = "Pressure-drop data is unavailable until sizes are added.";
    return;
  }
  if (!panelState.manualOverride) {
    panelState.sizeId = recommendedSize.id;
  }
  const selectedSize = getSelectedCannulaSize(side);
  if (!cannulaFamilyHasCurveData(family)) {
    panel.recommendedOutput.textContent = "--";
    panel.recommendedStatus.textContent = `Curve data pending for ${manufacturer.label} ${family.label}; automatic recommendation is not available yet.`;
    panel.selectedOutput.textContent = selectedSize?.label ?? "--";
    panel.selectedStatus.textContent = `Catalog entry loaded for ${manufacturer.label} ${family.label}.`;
    panel.pressureOutput.textContent = "--";
    panel.pressureStatus.textContent = "Pressure-drop chart points still need to be added for this family.";
    return;
  }
  const pressureDrop = interpolateCurve(selectedSize.points, cannulaState.flow);
  const recommendedPressure = interpolateCurve(recommendedSize.points, cannulaState.flow);
  const selectedSizeBeyondRange = isCannulaFlowBeyondChartRange(selectedSize);

  panel.recommendedOutput.textContent = recommendedSize.label;
  panel.recommendedStatus.textContent = recommendedPressure <= family.recommendedMaxPressure
    ? `Recommended at ${roundTo(cannulaState.flow, 1).toFixed(1)} L/min using a target pressure-drop threshold of ${family.recommendedMaxPressure} mmHg.`
    : `No listed size stays at or below ${family.recommendedMaxPressure} mmHg at this flow; showing the lowest-resistance available size.`;
  panel.selectedOutput.textContent = selectedSize.label;
  panel.selectedStatus.textContent = panelState.manualOverride
    ? `Manual override active for ${manufacturer.label} ${family.label}.`
    : `${manufacturer.label} ${family.label}. Displaying the recommended size.`;
  panel.pressureOutput.textContent = `${Math.round(pressureDrop)} mmHg`;
  panel.pressureStatus.textContent = selectedSizeBeyondRange
    ? `Estimated pressure drop at ${roundTo(cannulaState.flow, 1).toFixed(1)} L/min for the selected size. This point is beyond the supplied chart range and is extrapolated.`
    : `Estimated pressure drop at ${roundTo(cannulaState.flow, 1).toFixed(1)} L/min for the selected size.`;
}

function renderAllCannulaOutputs() {
  renderCannulaSharedOutputs();
  getActiveCannulaSides().forEach((side) => {
    syncCannulaRecommendedSelection(side);
    syncCannulaFamilyOptions(side);
    syncCannulaSizeButtons(side);
    renderCannulaSideOutputs(side);
  });
}

function renderAllCannulaCharts() {
  getActiveCannulaSides().forEach((side) => renderCannulaChart(side));
}

function renderAllCannulaViews() {
  renderAllCannulaOutputs();
  renderAllCannulaCharts();
}

function updateCannulaFlowFromPointer(event, side, showTooltip = false) {
  const chart = cannulaPanels[side]?.chart;
  if (!chart) return;
  const bounds = chart.getBoundingClientRect();
  const margin = { left: 70, right: 32 };
  const usableWidth = bounds.width - margin.left - margin.right;
  const relativeX = Math.min(Math.max(event.clientX - bounds.left - margin.left, 0), usableWidth);
  const chartFlowMax = getCannulaChartFlowMax(side);
  if (!chartFlowMax) return;
  cannulaState.flow = roundTo((relativeX / usableWidth) * chartFlowMax, 1);
  syncCannulaFlowControls();
  renderAllCannulaViews();
  if (showTooltip) {
    showCannulaTooltip(side, event);
  }
}

function flushPendingCannulaPointerUpdate() {
  if (!pendingCannulaPointerUpdate) return;
  const { event, side } = pendingCannulaPointerUpdate;
  pendingCannulaPointerUpdate = null;
  cannulaDragFrame = null;
  updateCannulaFlowFromPointer(event, side, true);
}

function scheduleCannulaPointerUpdate(event, side) {
  pendingCannulaPointerUpdate = {
    event: { clientX: event.clientX },
    side,
  };
  if (cannulaDragFrame !== null) return;
  cannulaDragFrame = window.requestAnimationFrame(() => {
    flushPendingCannulaPointerUpdate();
  });
}

function cancelCannulaPointerUpdate() {
  if (cannulaDragFrame !== null) {
    window.cancelAnimationFrame(cannulaDragFrame);
  }
  cannulaDragFrame = null;
  pendingCannulaPointerUpdate = null;
}

function renderCannulaChart(side) {
  const panel = cannulaPanels[side];
  if (!panel?.chart || !panel.chartSummary) return;
  const manufacturer = getCannulaManufacturer(side);
  const family = getCannulaFamily(side);
  if (!manufacturer) {
    panel.chartSummary.textContent = `No ${side} manufacturer is currently listed.`;
    panel.chart.innerHTML = `
      <rect class="curve-bg" x="0" y="0" width="720" height="400" rx="18"></rect>
      <text class="curve-empty-text" x="360" y="200" text-anchor="middle">No ${side} manufacturer listed</text>
    `;
    return;
  }
  if (!family) {
    panel.chartSummary.textContent = `No ${side} family is currently listed for ${manufacturer.label}.`;
    panel.chart.innerHTML = `
      <rect class="curve-bg" x="0" y="0" width="720" height="400" rx="18"></rect>
      <text class="curve-empty-text" x="360" y="200" text-anchor="middle">No ${side} family listed for this manufacturer</text>
    `;
    return;
  }
  const selectedSize = getSelectedCannulaSize(side);
  if (!selectedSize || !cannulaFamilyHasCurveData(family)) {
    panel.chartSummary.textContent = `${manufacturer.label} ${family.label}. Size catalog loaded; published pressure-drop curve data is still pending.`;
    panel.chart.innerHTML = `
      <rect class="curve-bg" x="0" y="0" width="720" height="400" rx="18"></rect>
      <text class="curve-empty-text" x="360" y="188" text-anchor="middle">Curve data pending for ${family.label}</text>
      <text class="curve-empty-text" x="360" y="212" text-anchor="middle">Sizes can be selected now, but the pressure-drop graph needs verified points.</text>
    `;
    return;
  }
  const width = 720;
  const height = 400;
  const margin = { top: 26, right: 32, bottom: 58, left: 70 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const { thresholdPressure, yMax, yTicks } = getCannulaYAxisConfig(selectedSize, family);
  const xMax = getCannulaChartFlowMax(side);
  const x = (flow) => margin.left + (flow / xMax) * plotWidth;
  const y = (pressure) => margin.top + plotHeight - (pressure / yMax) * plotHeight;
  const xTickMax = Math.ceil(xMax);
  const xTicks = Array.from({ length: xTickMax + 1 }, (_, index) => index);
  const selectedPressure = interpolateCurve(selectedSize.points, cannulaState.flow);
  const selectedSizeBeyondRange = isCannulaFlowBeyondChartRange(selectedSize);
  const curvePoints = selectedSizeBeyondRange
    ? [...selectedSize.points, [cannulaState.flow, selectedPressure]]
    : selectedSize.points;
  const guideX = x(cannulaState.flow);
  const thresholdY = y(thresholdPressure);
  const thresholdLabel = `${thresholdPressure} mmHg ${getCannulaLibraryCategory(side)} reference`;
  const roleMetadata = getCannulaRoleMetadata(family);
  const showGraphRoleLabel = getCannulaLibraryCategory(side) === "venous" && Boolean(roleMetadata.graphLabel);

  panel.chartSummary.textContent = selectedSizeBeyondRange
    ? `${manufacturer.label} ${family.label}, ${selectedSize.label}. Drag across the chart to estimate pressure drop at the shared target flow. Current target is beyond the printed chart extent, so the end of the curve is extrapolated.`
    : `${manufacturer.label} ${family.label}, ${selectedSize.label}. Drag across the chart to estimate pressure drop at the shared target flow.`;
  panel.chart.innerHTML = `
    <rect class="curve-bg" x="0" y="0" width="${width}" height="${height}" rx="18"></rect>
    ${yTicks.map((tick) => `
      <g class="curve-gridline">
        <line x1="${margin.left}" y1="${y(tick)}" x2="${width - margin.right}" y2="${y(tick)}"></line>
        <text x="${margin.left - 12}" y="${y(tick) + 4}" text-anchor="end">${tick}</text>
      </g>
    `).join("")}
    ${xTicks.map((tick) => `
      <g class="curve-gridline">
        <line x1="${x(tick)}" y1="${margin.top}" x2="${x(tick)}" y2="${height - margin.bottom}"></line>
        <text x="${x(tick)}" y="${height - margin.bottom + 26}" text-anchor="middle">${tick}</text>
      </g>
    `).join("")}
    <line class="curve-axis" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}"></line>
    <line class="curve-axis" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}"></line>
    <line class="cannula-threshold-line cannula-threshold-line-${side}" x1="${margin.left}" y1="${thresholdY}" x2="${width - margin.right}" y2="${thresholdY}"></line>
    <text class="cannula-threshold-label cannula-threshold-label-${side}" x="${margin.left + 8}" y="${thresholdY - 8}" text-anchor="start">${thresholdLabel}</text>
    ${showGraphRoleLabel ? `
      <text class="cannula-role-label cannula-role-label-${side}" x="${width - margin.right - 4}" y="${margin.top + 18}" text-anchor="end">${roleMetadata.graphLabel}</text>
    ` : ""}
    <line class="cannula-guide-line" x1="${guideX}" y1="${margin.top}" x2="${guideX}" y2="${height - margin.bottom}"></line>
    <path class="cannula-curve-line cannula-curve-line-${side}" d="${buildCurvePath(curvePoints, x, y)}"></path>
    <g class="cannula-selected-point cannula-selected-point-${side}">
      <circle cx="${x(cannulaState.flow)}" cy="${y(selectedPressure)}" r="7"></circle>
      <text x="${x(cannulaState.flow)}" y="${y(selectedPressure) - 14}" text-anchor="middle">${selectedSize.label}: ${Math.round(selectedPressure)} mmHg</text>
    </g>
    <text class="curve-axis-label" x="${width / 2}" y="${height - 18}" text-anchor="middle">Flow (L/min)</text>
    <text class="curve-axis-label" transform="translate(20 ${height / 2}) rotate(-90)" text-anchor="middle">Pressure drop (mmHg)</text>
  `;
}

function initializeCannulaSelection() {
  if (!cannulaFlowSlider) return;
  syncCannulaBicavalVisibility();
  CANNULA_SIDES.forEach((side) => syncCannulaManufacturerOptions(side));
  syncCannulaFlowFromPerfusion(true);
  syncCannulaSideDefaults();
  CANNULA_SIDES.forEach((side) => syncCannulaFamilyOptions(side));
  CANNULA_SIDES.forEach((side) => syncCannulaSizeButtons(side));
  syncCannulaFlowControls();
  renderAllCannulaViews();

  CANNULA_SIDES.forEach((side) => {
    const panel = cannulaPanels[side];
    const panelState = getCannulaPanelState(side);

    panel.manufacturerSelect?.addEventListener("change", () => {
      panelState.manufacturerId = panel.manufacturerSelect.value || null;
      panelState.familyId = null;
      panelState.sizeId = null;
      panelState.familyManualOverride = false;
      panelState.manualOverride = false;
      syncCannulaFlowFromPerfusion();
      syncCannulaSideDefaults();
      syncCannulaManufacturerOptions(side);
      syncCannulaFamilyOptions(side);
      syncCannulaSizeButtons(side);
      syncCannulaFlowControls();
      renderAllCannulaViews();
    });

    panel.familySelect?.addEventListener("change", () => {
      panelState.familyId = panel.familySelect.value || null;
      panelState.familyManualOverride = true;
      panelState.sizeId = null;
      panelState.manualOverride = false;
      syncCannulaRecommendedSelection(side);
      syncCannulaSizeButtons(side);
      syncCannulaFamilyOptions(side);
      syncCannulaFlowControls();
      renderCannulaSideOutputs(side);
      renderCannulaChart(side);
    });

    panel.sizeButtons?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-cannula-size]");
      if (!button) return;
      panelState.sizeId = button.dataset.cannulaSize;
      panelState.familyManualOverride = true;
      panelState.manualOverride = true;
      syncCannulaSizeButtons(side);
      renderCannulaSideOutputs(side);
      renderCannulaChart(side);
    });

    panel.chart?.addEventListener("pointerdown", (event) => {
      cannulaState.draggingSide = side;
      setCannulaManualFlowSource();
      updateCannulaFlowFromPointer(event, side, true);
    });

    panel.chart?.addEventListener("pointerleave", () => {
      if (cannulaState.draggingSide !== side) {
        panel.tooltip?.classList.remove("is-visible");
      }
    });
  });

  cannulaFlowSlider.addEventListener("input", () => {
    cannulaState.flow = Number(cannulaFlowSlider.value);
    setCannulaManualFlowSource();
    syncCannulaSideDefaults();
    syncCannulaFlowControls();
    renderAllCannulaViews();
    hideCannulaTooltips();
  });

  cannulaBicavalToggle?.addEventListener("change", () => {
    cannulaState.bicavalEnabled = Boolean(cannulaBicavalToggle.checked);
    syncCannulaBicavalVisibility();
    syncCannulaFlowControls();
    renderAllCannulaViews();
  });

  window.addEventListener("pointermove", (event) => {
    if (!cannulaState.draggingSide) return;
    scheduleCannulaPointerUpdate(event, cannulaState.draggingSide);
  });

  window.addEventListener("pointerup", (event) => {
    if (cannulaState.draggingSide) {
      cancelCannulaPointerUpdate();
      updateCannulaFlowFromPointer(event, cannulaState.draggingSide, true);
    }
    cannulaState.draggingSide = null;
    hideCannulaTooltips();
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== SHARED_FIELD_STORAGE_KEY) return;
    if (cannulaState.flowLinkedToPerfusion && !cannulaState.manualFlowOverride) {
      syncCannulaFlowFromPerfusion(true);
    }
    syncCannulaSideDefaults();
    syncCannulaFlowControls();
    renderAllCannulaViews();
  });

  window.addEventListener("focus", () => {
    if (cannulaState.flowLinkedToPerfusion && !cannulaState.manualFlowOverride) {
      syncCannulaFlowFromPerfusion(true);
    }
    syncCannulaSideDefaults();
    syncCannulaFlowControls();
    renderAllCannulaCharts();
    renderAllCannulaOutputs();
  });
}

function activateTab(groupName, targetName) {
  tabButtons
    .filter((button) => button.dataset.tabGroup === groupName)
    .forEach((button) => {
      const isActive = button.dataset.tabTarget === targetName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });

  tabPanels
    .filter((panel) => panel.dataset.tabGroup === groupName)
    .forEach((panel) => {
      const isActive = panel.dataset.tabPanel === targetName;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
}

function handleTabKeydown(event) {
  const groupName = event.currentTarget.dataset.tabGroup;
  const groupButtons = tabButtons.filter((button) => button.dataset.tabGroup === groupName);
  const currentIndex = groupButtons.indexOf(event.currentTarget);

  if (currentIndex === -1) {
    return;
  }

  let nextIndex = null;

  if (event.key === "ArrowRight") {
    nextIndex = (currentIndex + 1) % groupButtons.length;
  } else if (event.key === "ArrowLeft") {
    nextIndex = (currentIndex - 1 + groupButtons.length) % groupButtons.length;
  } else if (event.key === "Home") {
    nextIndex = 0;
  } else if (event.key === "End") {
    nextIndex = groupButtons.length - 1;
  }

  if (nextIndex === null) {
    return;
  }

  event.preventDefault();
  const nextButton = groupButtons[nextIndex];
  activateTab(groupName, nextButton.dataset.tabTarget);
  nextButton.focus();
}

function renderPerfusionFlowMap(flowMap) {
  if (!perfusionOutputs?.flowMap?.value || !perfusionOutputs.flowMap.status) return;

  if (!flowMap?.length) {
    perfusionOutputs.flowMap.value.innerHTML = "";
    perfusionOutputs.flowMap.status.textContent = "Enter weight to map each cardiac index to liters per minute. Add height for Mosteller BSA.";
    return;
  }

  perfusionOutputs.flowMap.value.innerHTML = flowMap
    .map(({ cardiacIndex, pumpFlow }) => `
      <article class="flow-map-chip">
        <span class="flow-map-chip-ci">${cardiacIndex.toFixed(1)} CI</span>
        <strong class="flow-map-chip-flow">${roundTo(pumpFlow, 2).toFixed(2)} L/min</strong>
      </article>
    `)
    .join("");
  perfusionOutputs.flowMap.status.textContent = "Indexed planning map from 1.6 through 3.0 L/min/m² using the current BSA.";
}

function renderPerfusion() {
  const evaluation = evaluateCalculator(collectInputs(perfusionForm));
  updateFormInvalidState(perfusionForm, evaluation.fields, perfusionSummary);

  if (evaluation.results.bsa !== null) {
    perfusionOutputs.bsa.value.textContent = perfusionOutputs.bsa.format(evaluation.results.bsa);
    perfusionOutputs.bsa.status.textContent = evaluation.results.bsaFormula === "Mosteller"
      ? "Mosteller calculation ready."
      : "Estimated from weight only using the Costeff formula.";
  } else {
    perfusionOutputs.bsa.value.textContent = "--";
    perfusionOutputs.bsa.status.textContent = perfusionOutputs.bsa.empty;
  }
  renderPerfusionFlowMap(evaluation.results.flowMap);

  if (evaluation.results.do2i !== null) {
    perfusionOutputs.do2i.value.textContent = perfusionOutputs.do2i.format(evaluation.results.do2i);
    const source = evaluation.results.do2iSource === "pump flow" ? "pump flow/BSA" : "cardiac index";
    const threshold = evaluation.results.do2iThresholdMet ? "above" : "below";
    const oxygenCarrierSource = evaluation.results.hgbSource === "hematocrit"
      ? `estimated Hgb ${roundTo(evaluation.results.currentHgb, 1).toFixed(1)} g/dL from Hct`
      : `Hgb ${roundTo(evaluation.results.currentHgb, 1).toFixed(1)} g/dL`;
    perfusionOutputs.do2i.status.textContent = `Using ${source} and ${oxygenCarrierSource}. Current DO2i is ${threshold} target ${Math.round(evaluation.results.do2iTarget)}.`;
  } else {
    perfusionOutputs.do2i.value.textContent = "--";

    if (!evaluation.results.bsa && evaluation.fields.pumpFlow.valid) {
      perfusionOutputs.do2i.status.textContent = "Weight is needed to use pump flow for DO2i.";
    } else if (!evaluation.fields.cardiacIndex.valid && !evaluation.fields.pumpFlow.valid) {
      perfusionOutputs.do2i.status.textContent = "Enter either cardiac index or pump flow.";
    } else if (!evaluation.fields.hgb.valid && !evaluation.fields.hct.valid) {
      perfusionOutputs.do2i.status.textContent = "Enter either hemoglobin or hematocrit.";
    } else {
      perfusionOutputs.do2i.status.textContent = perfusionOutputs.do2i.empty;
    }
  }

  if (evaluation.results.requiredFlow !== null) {
    perfusionOutputs.requiredFlow.value.textContent = perfusionOutputs.requiredFlow.format(evaluation.results.requiredFlow);

    if (evaluation.results.currentFlow !== null) {
      perfusionOutputs.requiredFlow.status.textContent = `${formatDelta(evaluation.results.requiredFlow - evaluation.results.currentFlow, "L/min")} from current flow.`;
    } else {
      perfusionOutputs.requiredFlow.status.textContent = "Target flow derived from target CI and BSA.";
    }
  } else {
    perfusionOutputs.requiredFlow.value.textContent = "--";
    perfusionOutputs.requiredFlow.status.textContent = perfusionOutputs.requiredFlow.empty;
  }

  if (evaluation.results.requiredCi !== null) {
    perfusionOutputs.requiredCi.value.textContent = perfusionOutputs.requiredCi.format(evaluation.results.requiredCi);

    if (evaluation.results.effectiveCi !== null) {
      perfusionOutputs.requiredCi.status.textContent = `${formatDelta(evaluation.results.requiredCi - evaluation.results.effectiveCi, "L/min/m²")} from current effective CI.`;
    } else {
      perfusionOutputs.requiredCi.status.textContent = "Target based on current Hgb, SaO2, and PaO2.";
    }
  } else {
    perfusionOutputs.requiredCi.value.textContent = "--";
    perfusionOutputs.requiredCi.status.textContent = perfusionOutputs.requiredCi.empty;
  }

  if (evaluation.results.requiredHgb !== null) {
    perfusionOutputs.requiredHgb.value.textContent = perfusionOutputs.requiredHgb.format(evaluation.results.requiredHgb);
    if (evaluation.results.currentHgb !== null) {
      const sourceLabel = evaluation.results.hgbSource === "hematocrit" ? "estimated current Hgb" : "current Hgb";
      perfusionOutputs.requiredHgb.status.textContent = `${formatDelta(evaluation.results.requiredHgb - evaluation.results.currentHgb, "g/dL")} from ${sourceLabel}.`;
    } else {
      perfusionOutputs.requiredHgb.status.textContent = "Target hemoglobin derived from current flow/CI and oxygenation inputs.";
    }
  } else {
    perfusionOutputs.requiredHgb.value.textContent = "--";

    if (!evaluation.fields.cardiacIndex.valid && !evaluation.fields.pumpFlow.valid) {
      perfusionOutputs.requiredHgb.status.textContent = "Enter either cardiac index or pump flow to solve for Hgb.";
    } else {
      perfusionOutputs.requiredHgb.status.textContent = perfusionOutputs.requiredHgb.empty;
    }
  }
}

function renderPrime() {
  const evaluation = evaluatePrimeCalculator(collectInputs(primeForm));
  updateFormInvalidState(primeForm, evaluation.fields, primeSummary);
  renderPrimePlan(evaluation);
  syncPrimeEbvQuickState();

  if (evaluation.results.bloodVolumeMl !== null) {
    primeOutputs.bloodVolumeMl.value.textContent = primeOutputs.bloodVolumeMl.format(evaluation.results.bloodVolumeMl);
    primeOutputs.bloodVolumeMl.status.textContent = "Estimated as weight × blood volume factor.";
  } else {
    primeOutputs.bloodVolumeMl.value.textContent = "--";
    primeOutputs.bloodVolumeMl.status.textContent = primeOutputs.bloodVolumeMl.empty;
  }

  if (evaluation.results.predictedHct !== null) {
    primeOutputs.predictedHct.value.textContent = primeOutputs.predictedHct.format(evaluation.results.predictedHct);

    if (evaluation.results.targetHct !== null) {
      const threshold = evaluation.results.predictedHct >= evaluation.results.targetHct ? "meets" : "is below";
      primeOutputs.predictedHct.status.textContent = `Predicted post-prime Hct ${threshold} the current target.`;
    } else {
      primeOutputs.predictedHct.status.textContent = "Assumes a clear prime before PRBC addition.";
    }
  } else {
    primeOutputs.predictedHct.value.textContent = "--";
    primeOutputs.predictedHct.status.textContent = primeOutputs.predictedHct.empty;
  }

  if (evaluation.results.hctDrop !== null) {
    primeOutputs.hctDrop.value.textContent = primeOutputs.hctDrop.format(evaluation.results.hctDrop);
    primeOutputs.hctDrop.status.textContent = "Difference between baseline and diluted hematocrit.";
  } else {
    primeOutputs.hctDrop.value.textContent = "--";
    primeOutputs.hctDrop.status.textContent = primeOutputs.hctDrop.empty;
  }

  if (evaluation.results.primeToBloodRatio !== null) {
    primeOutputs.primeToBloodRatio.value.textContent = primeOutputs.primeToBloodRatio.format(evaluation.results.primeToBloodRatio);
    primeOutputs.primeToBloodRatio.status.textContent = "Higher ratios indicate more dilution from the clear prime.";
  } else {
    primeOutputs.primeToBloodRatio.value.textContent = "--";
    primeOutputs.primeToBloodRatio.status.textContent = primeOutputs.primeToBloodRatio.empty;
  }

  if (evaluation.results.crystalloidPrimeBicarbMeq !== null) {
    primeOutputs.crystalloidPrimeBicarbMeq.value.textContent = primeOutputs.crystalloidPrimeBicarbMeq.format(evaluation.results.crystalloidPrimeBicarbMeq);
    primeOutputs.crystalloidPrimeBicarbMeq.status.textContent = "Formula: x = 0.025V, using the entered prime volume as V.";
  } else {
    primeOutputs.crystalloidPrimeBicarbMeq.value.textContent = "--";
    primeOutputs.crystalloidPrimeBicarbMeq.status.textContent = primeOutputs.crystalloidPrimeBicarbMeq.empty;
  }

  if (evaluation.results.primeMannitolG !== null) {
    primeOutputs.primeMannitolG.value.textContent = primeOutputs.primeMannitolG.format(evaluation.results.primeMannitolG);
    primeOutputs.primeMannitolG.status.textContent = "Formula: 0.25 g/kg, using the entered weight.";
  } else {
    primeOutputs.primeMannitolG.value.textContent = "--";
    primeOutputs.primeMannitolG.status.textContent = primeOutputs.primeMannitolG.empty;
  }

  if (evaluation.results.prbcVolumeMl !== null) {
    primeOutputs.prbcVolumeMl.value.textContent = primeOutputs.prbcVolumeMl.format(evaluation.results.prbcVolumeMl);

    if (evaluation.results.targetMetWithoutPrbc) {
      primeOutputs.prbcVolumeMl.status.textContent = "Predicted Hct already meets target; no added PRBC volume needed.";
    } else {
      primeOutputs.prbcVolumeMl.status.textContent = "Exact mass-balance estimate using the selected PRBC hematocrit.";
    }
  } else {
    primeOutputs.prbcVolumeMl.value.textContent = "--";
    if (evaluation.results.prbcTargetReachable === false) {
      primeOutputs.prbcVolumeMl.status.textContent = "Target cannot be reached when PRBC hematocrit is at or below the selected target Hct.";
    } else {
      primeOutputs.prbcVolumeMl.status.textContent = primeOutputs.prbcVolumeMl.empty;
    }
  }

  if (evaluation.results.projectedHct !== null) {
    primeOutputs.projectedHct.value.textContent = primeOutputs.projectedHct.format(evaluation.results.projectedHct);
    primeOutputs.projectedHct.status.textContent = "Checks the resulting Hct after the estimated PRBC addition.";
  } else {
    primeOutputs.projectedHct.value.textContent = "--";
    if (evaluation.results.prbcTargetReachable === false) {
      primeOutputs.projectedHct.status.textContent = "Choose a PRBC hematocrit above the target to project a reachable result.";
    } else {
      primeOutputs.projectedHct.status.textContent = primeOutputs.projectedHct.empty;
    }
  }

  if (evaluation.results.redCellDeficitMl !== null) {
    primeOutputs.redCellDeficitMl.value.textContent = primeOutputs.redCellDeficitMl.format(evaluation.results.redCellDeficitMl);

    if (evaluation.results.targetMetWithoutPrbc) {
      primeOutputs.redCellDeficitMl.status.textContent = "No red-cell deficit remains at the selected target.";
    } else {
      primeOutputs.redCellDeficitMl.status.textContent = "Red-cell volume gap before accounting for PRBC product concentration.";
    }
  } else {
    primeOutputs.redCellDeficitMl.value.textContent = "--";
    primeOutputs.redCellDeficitMl.status.textContent = primeOutputs.redCellDeficitMl.empty;
  }
}

function renderHeparinCurve(curve, options = {}) {
  const chart = options.chart ?? anticoagOutputs.curveChart;
  const summary = options.summary ?? anticoagOutputs.curveSummary;
  const isModal = Boolean(options.isModal);
  if (!chart || !summary) return;

  const width = isModal ? 1100 : 640;
  const height = isModal ? 620 : 360;
  chart.setAttribute("viewBox", `0 0 ${width} ${height}`);

  if (!curve) {
    summary.textContent = "Enter ACT response, EBV factor, and prime volume to plot the baseline, measured concentration response, and projected target concentration.";
    chart.innerHTML = `
      <rect class="curve-bg" x="0" y="0" width="${width}" height="${height}" rx="18"></rect>
      <text class="curve-empty-text" x="${width / 2}" y="${height / 2}" text-anchor="middle">Waiting for ACT response data</text>
    `;
    return;
  }

  const margin = isModal
    ? { top: 34, right: 58, bottom: 64, left: 78 }
    : { top: 28, right: 34, bottom: 58, left: 70 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const points = [curve.points.baseline, curve.points.measured, curve.points.target];
  const referenceActs = [480, 600];
  const concentrationForAct = (actSeconds) => Math.max(0, (actSeconds - curve.points.baseline.actSeconds) / curve.slopeActPerUnitMl);
  const weightKg = curve.givenHeparinDosePerKg > 0 ? curve.givenHeparinUnits / curve.givenHeparinDosePerKg : null;
  const dosePerKgForConcentration = (concentrationUnitsPerMl) => (
    weightKg ? (concentrationUnitsPerMl * curve.distributionVolumeMl) / weightKg : 0
  );
  const unitsForConcentration = (concentrationUnitsPerMl) => concentrationUnitsPerMl * curve.distributionVolumeMl;
  const maxConcentration = Math.max(...points.map((point) => point.concentrationUnitsPerMl), curve.points.measured.concentrationUnitsPerMl + 0.75, 5);
  const referenceConcentrationMax = Math.max(...referenceActs.map((actSeconds) => concentrationForAct(actSeconds)));
  const maxAct = Math.max(...points.map((point) => point.actSeconds), ...referenceActs, isHeparinCurveZoomedOut ? 1000 : 800);
  const xMax = Math.ceil(Math.max(maxConcentration, referenceConcentrationMax, isHeparinCurveZoomedOut ? 12 : 5));
  const yMax = Math.ceil(maxAct / 100) * 100;
  const x = (concentrationUnitsPerMl) => margin.left + (concentrationUnitsPerMl / xMax) * plotWidth;
  const y = (actSeconds) => margin.top + plotHeight - (actSeconds / yMax) * plotHeight;
  const visibleLineEndConcentration = Math.min(xMax, concentrationForAct(yMax));
  const lineEnd = {
    concentrationUnitsPerMl: visibleLineEndConcentration,
    actSeconds: curve.points.baseline.actSeconds + curve.slopeActPerUnitMl * visibleLineEndConcentration,
  };
  const xTicks = isHeparinCurveZoomedOut ? [0, xMax / 2, xMax] : [0, xMax / 2, xMax];
  const yTicks = isHeparinCurveZoomedOut
    ? [0, 400, 800, yMax].filter((tick, index, ticks) => tick <= yMax && ticks.indexOf(tick) === index)
    : Array.from(new Set([0, Math.round(yMax / 2), 480, 600, yMax].filter((tick) => tick <= yMax))).sort((a, b) => a - b);
  const formatTick = (tick) => roundTo(tick, 1).toFixed(tick % 1 === 0 ? 0 : 1);
  const formatHover = (label, point) => `${label}: ${roundTo(point.concentrationUnitsPerMl, 2).toFixed(2)} units/mL, ${roundTo(point.dosePerKg, 0).toFixed(0)} units/kg, ACT ${roundTo(point.actSeconds, 0).toFixed(0)} sec`;
  const formatReferenceHover = (label, actSeconds) => {
    const concentrationUnitsPerMl = concentrationForAct(actSeconds);
    const dosePerKg = dosePerKgForConcentration(concentrationUnitsPerMl);
    const additionalUnits = Math.max(0, unitsForConcentration(concentrationUnitsPerMl) - curve.givenHeparinUnits);
    return `${label}: ACT ${actSeconds} sec, ${roundTo(concentrationUnitsPerMl, 2).toFixed(2)} units/mL, ${roundTo(dosePerKg, 0).toFixed(0)} units/kg, ${Math.round(additionalUnits).toLocaleString()} additional units`;
  };
  const starPoints = (centerX, centerY, outerRadius, innerRadius, spikes = 5) => {
    const pointsList = [];
    for (let index = 0; index < spikes * 2; index += 1) {
      const radius = index % 2 === 0 ? outerRadius : innerRadius;
      const angle = -Math.PI / 2 + (index * Math.PI) / spikes;
      pointsList.push(`${centerX + Math.cos(angle) * radius},${centerY + Math.sin(angle) * radius}`);
    }
    return pointsList.join(" ");
  };
  const pointMarkup = [
    { key: "baseline", label: "Baseline", point: curve.points.baseline },
    { key: "measured", label: "Measured", point: curve.points.measured },
  ]
    .map(({ key, label, point }) => `
      <g class="curve-point curve-point-${key}" tabindex="0" data-tooltip="${formatHover(label, point)}">
        <circle cx="${x(point.concentrationUnitsPerMl)}" cy="${y(point.actSeconds)}" r="7"></circle>
        <text x="${x(point.concentrationUnitsPerMl)}" y="${y(point.actSeconds) - 12}" text-anchor="middle">${label}</text>
      </g>
    `)
    .join("");
  const act480Concentration = concentrationForAct(480);
  const act600Concentration = concentrationForAct(600);
  const targetAct = roundTo(curve.points.target.actSeconds, 0).toFixed(0);
  const targetAdditionalUnits = Math.round(curve.additionalHeparinUnits).toLocaleString();
  const targetLabel = `Target ACT ${targetAct}`;
  const targetTooltip = `${targetLabel}: ${roundTo(curve.points.target.concentrationUnitsPerMl, 2).toFixed(2)} units/mL, ${roundTo(curve.points.target.dosePerKg, 0).toFixed(0)} units/kg, ${targetAdditionalUnits} additional units`;
  const referencePointMarkup = `
    <g class="curve-reference curve-reference-480" tabindex="0" data-tooltip="${formatReferenceHover("ACT 480 reference", 480)}">
      <polygon points="${starPoints(x(act480Concentration), y(480), 12, 5)}"></polygon>
      <text x="${x(act480Concentration)}" y="${y(480) - 18}" text-anchor="middle">480</text>
    </g>
    <g class="curve-reference curve-reference-600" tabindex="0" data-tooltip="${formatReferenceHover("ACT 600 reference", 600)}">
      <circle cx="${x(act600Concentration)}" cy="${y(600)}" r="8"></circle>
      <text x="${x(act600Concentration)}" y="${y(600) - 14}" text-anchor="middle">600</text>
    </g>
    <g class="curve-selected-target" tabindex="0" data-tooltip="${targetTooltip}">
      <rect x="${x(curve.points.target.concentrationUnitsPerMl) - 8}" y="${y(curve.points.target.actSeconds) - 8}" width="16" height="16" transform="rotate(45 ${x(curve.points.target.concentrationUnitsPerMl)} ${y(curve.points.target.actSeconds)})"></rect>
      <text x="${x(curve.points.target.concentrationUnitsPerMl)}" y="${y(curve.points.target.actSeconds) + 28}" text-anchor="middle">
        <tspan x="${x(curve.points.target.concentrationUnitsPerMl)}">${targetLabel}</tspan>
        <tspan x="${x(curve.points.target.concentrationUnitsPerMl)}" dy="16">${targetAdditionalUnits} units addl.</tspan>
      </text>
    </g>
  `;

  summary.textContent = curve.targetReachedByTestDose
    ? `HDR rise/run: ${roundTo(curve.slopeActPerUnitMl, 1).toFixed(1)} sec per unit/mL. The measured ACT reaches the selected target with the current loading concentration.`
    : `HDR rise/run: ${roundTo(curve.slopeActPerUnitMl, 1).toFixed(1)} sec per unit/mL. Selected Target ACT ${roundTo(curve.points.target.actSeconds, 0).toFixed(0)} updates the concentration target and diamond marker.`;

  chart.innerHTML = `
    <rect class="curve-bg" x="0" y="0" width="${width}" height="${height}" rx="18"></rect>
    ${yTicks.map((tick) => `
      <g class="curve-gridline">
        <line x1="${margin.left}" y1="${y(tick)}" x2="${width - margin.right}" y2="${y(tick)}"></line>
        <text x="${margin.left - 12}" y="${y(tick) + 4}" text-anchor="end">${Math.round(tick)}</text>
      </g>
    `).join("")}
    ${xTicks.map((tick) => `
      <g class="curve-gridline">
        <line x1="${x(tick)}" y1="${margin.top}" x2="${x(tick)}" y2="${height - margin.bottom}"></line>
        <text x="${x(tick)}" y="${height - margin.bottom + 26}" text-anchor="middle">${formatTick(tick)}</text>
      </g>
    `).join("")}
    <line class="curve-axis" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}"></line>
    <line class="curve-axis" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}"></line>
    <line class="curve-target-line" x1="${margin.left}" y1="${y(curve.points.target.actSeconds)}" x2="${width - margin.right}" y2="${y(curve.points.target.actSeconds)}"></line>
    <line class="curve-response-line" x1="${x(0)}" y1="${y(curve.points.baseline.actSeconds)}" x2="${x(lineEnd.concentrationUnitsPerMl)}" y2="${y(lineEnd.actSeconds)}"></line>
    ${pointMarkup}
    ${referencePointMarkup}
    <text class="curve-axis-label" x="${width / 2}" y="${height - 18}" text-anchor="middle">Heparin concentration (units/mL)</text>
    <text class="curve-axis-label" transform="translate(20 ${height / 2}) rotate(-90)" text-anchor="middle">ACT (seconds)</text>
  `;
}

function positionCurveTooltip(event, tooltip) {
  const wrap = tooltip.closest(".curve-chart-wrap, .curve-modal-chart-wrap");
  if (!wrap) return;
  const bounds = wrap.getBoundingClientRect();
  const left = Math.min(Math.max(event.clientX - bounds.left + 12, 8), bounds.width - tooltip.offsetWidth - 8);
  const top = Math.min(Math.max(event.clientY - bounds.top + 12, 8), bounds.height - tooltip.offsetHeight - 8);
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function hideCurveTooltip() {
  const tooltip = anticoagOutputs?.curveTooltip;
  const modalTooltip = anticoagOutputs?.curveModalTooltip;
  tooltip?.classList.remove("is-visible");
  modalTooltip?.classList.remove("is-visible");
}

function bindCurveTooltip(chart) {
  chart?.addEventListener("pointermove", (event) => {
    const target = event.target.closest("[data-tooltip]");
    const tooltip = chart === anticoagOutputs.curveModalChart ? anticoagOutputs.curveModalTooltip : anticoagOutputs.curveTooltip;
    if (!target || !tooltip) {
      hideCurveTooltip();
      return;
    }
    tooltip.textContent = target.dataset.tooltip;
    tooltip.classList.add("is-visible");
    positionCurveTooltip(event, tooltip);
  });
  chart?.addEventListener("pointerleave", hideCurveTooltip);
  chart?.addEventListener("focusin", (event) => {
    const target = event.target.closest("[data-tooltip]");
    const tooltip = chart === anticoagOutputs.curveModalChart ? anticoagOutputs.curveModalTooltip : anticoagOutputs.curveTooltip;
    if (!target || !tooltip) return;
    const bounds = target.getBoundingClientRect();
    tooltip.textContent = target.dataset.tooltip;
    tooltip.classList.add("is-visible");
    positionCurveTooltip({
      clientX: bounds.left + bounds.width / 2,
      clientY: bounds.top + bounds.height / 2,
    }, tooltip);
  });
  chart?.addEventListener("focusout", hideCurveTooltip);
}

function syncCurveControlState() {
  if (anticoagOutputs?.curveModal) {
    anticoagOutputs.curveModal.hidden = !isHeparinCurveExpanded;
  }
  document.body.classList.toggle("has-expanded-curve", isHeparinCurveExpanded);

  if (expandCurveButton) {
    expandCurveButton.textContent = "Expand";
    expandCurveButton.setAttribute("aria-pressed", String(isHeparinCurveExpanded));
  }

  if (zoomCurveButton) {
    zoomCurveButton.textContent = isHeparinCurveZoomedOut ? "Reset zoom" : "Zoom out";
    zoomCurveButton.setAttribute("aria-pressed", String(isHeparinCurveZoomedOut));
  }
}

function syncTargetActPresetState() {
  if (!anticoagForm) return;
  const currentTarget = anticoagForm.elements.namedItem("targetActSeconds")?.value;
  targetActButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.targetAct === currentTarget);
  });
}

function renderAnticoagulation() {
  const evaluation = evaluateAnticoagulationCalculator(collectInputs(anticoagForm));
  updateFormInvalidState(anticoagForm, evaluation.fields, anticoagSummary);
  syncTargetActPresetState();

  if (evaluation.results.heparinLoadingUnits !== null) {
    anticoagOutputs.heparinLoadingUnits.value.textContent = anticoagOutputs.heparinLoadingUnits.format(evaluation.results.heparinLoadingUnits);
    anticoagOutputs.heparinLoadingUnits.status.textContent = "Weight × loading dose assumption.";
  } else {
    anticoagOutputs.heparinLoadingUnits.value.textContent = "--";
    anticoagOutputs.heparinLoadingUnits.status.textContent = anticoagOutputs.heparinLoadingUnits.empty;
  }

  if (evaluation.results.distributionVolumeMl !== null) {
    const weightKg = evaluation.fields.anticoagWeightKg.value;
    const ebvFactor = evaluation.fields.anticoagEbvFactor.value;
    const suggestedEbvFactor = suggestEstimatedBloodVolumeFactor(weightKg);
    const suggestionCopy = suggestedEbvFactor !== null && suggestedEbvFactor !== ebvFactor
      ? ` Suggested guide factor for this weight is ${suggestedEbvFactor} mL/kg.`
      : "";
    anticoagOutputs.distributionVolumeMl.value.textContent = anticoagOutputs.distributionVolumeMl.format(evaluation.results.distributionVolumeMl);
    anticoagOutputs.distributionVolumeMl.status.textContent = `EBV ${Math.round(evaluation.results.bloodVolumeMl).toLocaleString()} mL + prime ${Math.round(evaluation.fields.anticoagPrimeVolumeMl.value).toLocaleString()} mL.${suggestionCopy}`;
  } else {
    anticoagOutputs.distributionVolumeMl.value.textContent = "--";
    anticoagOutputs.distributionVolumeMl.status.textContent = anticoagOutputs.distributionVolumeMl.empty;
  }

  if (evaluation.results.heparinLoadingConcentrationUnitsPerMl !== null) {
    anticoagOutputs.heparinLoadingConcentrationUnitsPerMl.value.textContent = anticoagOutputs.heparinLoadingConcentrationUnitsPerMl.format(evaluation.results.heparinLoadingConcentrationUnitsPerMl);
    anticoagOutputs.heparinLoadingConcentrationUnitsPerMl.status.textContent = `${Math.round(evaluation.results.heparinLoadingUnits).toLocaleString()} units / ${Math.round(evaluation.results.distributionVolumeMl).toLocaleString()} mL.`;
  } else {
    anticoagOutputs.heparinLoadingConcentrationUnitsPerMl.value.textContent = "--";
    anticoagOutputs.heparinLoadingConcentrationUnitsPerMl.status.textContent = anticoagOutputs.heparinLoadingConcentrationUnitsPerMl.empty;
  }

  if (evaluation.results.bivalirudinLoadingMg !== null) {
    anticoagOutputs.bivalirudinLoadingMg.value.textContent = anticoagOutputs.bivalirudinLoadingMg.format(evaluation.results.bivalirudinLoadingMg);
    anticoagOutputs.bivalirudinLoadingMg.status.textContent = "Shared weight × 1 mg/kg loading dose.";
  } else {
    anticoagOutputs.bivalirudinLoadingMg.value.textContent = "--";
    anticoagOutputs.bivalirudinLoadingMg.status.textContent = anticoagOutputs.bivalirudinLoadingMg.empty;
  }

  if (evaluation.results.argatrobanRateMcgPerMin !== null) {
    anticoagOutputs.argatrobanRateMcgPerMin.value.textContent = anticoagOutputs.argatrobanRateMcgPerMin.format(evaluation.results.argatrobanRateMcgPerMin);
    anticoagOutputs.argatrobanRateMcgPerMin.status.textContent = "Not approved for CPB/bypass anticoagulation; shared weight × 2 mcg/kg/min.";
  } else {
    anticoagOutputs.argatrobanRateMcgPerMin.value.textContent = "--";
    anticoagOutputs.argatrobanRateMcgPerMin.status.textContent = anticoagOutputs.argatrobanRateMcgPerMin.empty;
  }

  if (evaluation.results.at3DoseUnits !== null) {
    anticoagOutputs.at3DoseUnits.value.textContent = anticoagOutputs.at3DoseUnits.format(evaluation.results.at3DoseUnits);
    anticoagOutputs.at3DoseUnits.status.textContent = evaluation.results.at3DoseUnits > 0
      ? "Formula: (desired AT3 - current AT3) × kg / 1.4."
      : "Current AT3 meets or exceeds desired AT3.";
  } else {
    anticoagOutputs.at3DoseUnits.value.textContent = "--";
    anticoagOutputs.at3DoseUnits.status.textContent = anticoagOutputs.at3DoseUnits.empty;
  }

  if (evaluation.results.heparinResponseCurve !== null) {
    const projectedDosePerKg = evaluation.results.heparinResponseCurve.requiredHeparinDosePerKg;
    anticoagOutputs.additionalHeparin.value.textContent = anticoagOutputs.additionalHeparin.format(evaluation.results.heparinResponseCurve);
    anticoagOutputs.additionalHeparin.status.textContent = evaluation.results.heparinResponseCurve.targetReachedByTestDose
      ? "Measured ACT already reaches the selected target."
      : `Extra heparin needed beyond the ${Math.round(evaluation.results.heparinResponseCurve.givenHeparinUnits).toLocaleString()} unit loading dose.`;

    if (anticoagOutputs.heparinResistanceWarning) {
      anticoagOutputs.heparinResistanceWarning.hidden = projectedDosePerKg < 500;
      anticoagOutputs.heparinResistanceWarning.textContent = projectedDosePerKg >= 500
        ? `Projected dose is ${roundTo(projectedDosePerKg, 0).toFixed(0)} units/kg to reach the selected ACT. Consider local heparin-resistance protocol, antithrombin status, timing, ACT device, and clinician review.`
        : "";
    }
  } else {
    anticoagOutputs.additionalHeparin.value.textContent = "--";
    anticoagOutputs.additionalHeparin.status.textContent = evaluation.fields.baselineActSeconds?.valid && evaluation.fields.postHeparinActSeconds?.valid
      ? "Post-heparin ACT must be greater than baseline ACT."
      : anticoagOutputs.additionalHeparin.empty;
    if (anticoagOutputs.heparinResistanceWarning) {
      anticoagOutputs.heparinResistanceWarning.hidden = true;
      anticoagOutputs.heparinResistanceWarning.textContent = "";
    }
  }

  renderHeparinAdministrationLog(evaluation);

  renderHeparinCurve(evaluation.results.heparinResponseCurve);
  if (isHeparinCurveExpanded) {
    renderHeparinCurve(evaluation.results.heparinResponseCurve, {
      chart: anticoagOutputs.curveModalChart,
      summary: anticoagOutputs.curveModalSummary,
      isModal: true,
    });
  }
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => activateTab(button.dataset.tabGroup, button.dataset.tabTarget));
  button.addEventListener("keydown", handleTabKeydown);
});

initializeReferenceFilters();

if (perfusionForm) {
  hydrateSharedFields(perfusionForm);
  perfusionForm.addEventListener("input", renderPerfusion);
  perfusionForm.addEventListener("change", renderPerfusion);
  perfusionForm.addEventListener("input", (event) => syncSharedFieldValue(event.target));
  perfusionForm.addEventListener("change", (event) => syncSharedFieldValue(event.target));
  renderPerfusion();
}

if (primeForm) {
  hydrateSharedFields(primeForm);
  primeForm.addEventListener("input", renderPrime);
  primeForm.addEventListener("change", renderPrime);
  primeForm.addEventListener("input", (event) => syncSharedFieldValue(event.target));
  primeForm.addEventListener("change", (event) => syncSharedFieldValue(event.target));
  primeEbvQuickButtons.forEach((button) => {
    button.addEventListener("click", () => {
      primeForm.elements.namedItem("primeEbvFactor").value = button.dataset.primeEbvQuick;
      renderPrime();
    });
  });
  renderPrime();
}

if (drugDoseCheckForm) {
  hydrateSharedFields(drugDoseCheckForm);
  drugDoseCheckForm.addEventListener("input", renderDrugDoseSafetyCheck);
  drugDoseCheckForm.addEventListener("change", renderDrugDoseSafetyCheck);
  drugDoseCheckForm.addEventListener("input", (event) => syncSharedFieldValue(event.target));
  drugDoseCheckForm.addEventListener("change", (event) => syncSharedFieldValue(event.target));
  drugDoseCheckOutputs.scenarioSelect?.addEventListener("change", () => {
    applyDrugDoseCheckScenarioDefaults();
    renderDrugDoseSafetyCheck();
  });
  applyDrugDoseCheckScenarioDefaults();
  syncDrugDoseCheckScenarioFields();
  renderDrugDoseSafetyCheck();
}

if (anticoagForm) {
  hydrateSharedFields(anticoagForm);
  anticoagForm.addEventListener("input", renderAnticoagulation);
  anticoagForm.addEventListener("change", renderAnticoagulation);
  anticoagForm.addEventListener("input", (event) => syncSharedFieldValue(event.target));
  anticoagForm.addEventListener("change", (event) => syncSharedFieldValue(event.target));
  if (anticoagOutputs.heparinLogTimeInput && anticoagOutputs.heparinLogTimeInput.value === "") {
    anticoagOutputs.heparinLogTimeInput.value = getCurrentClockTime();
  }
  anticoagOutputs.useLoadingDoseForLogButton?.addEventListener("click", () => {
    const evaluation = evaluateAnticoagulationCalculator(collectInputs(anticoagForm));
    if (evaluation.results.heparinLoadingUnits === null) {
      setHeparinLogValidation("Enter weight and the heparin loading dose assumption first so the initial dose can be copied into the log.");
      return;
    }

    if (anticoagOutputs.heparinLogUnitsInput) {
      anticoagOutputs.heparinLogUnitsInput.value = String(Math.round(evaluation.results.heparinLoadingUnits));
    }
    if (anticoagOutputs.heparinLogTimeInput && anticoagOutputs.heparinLogTimeInput.value === "") {
      anticoagOutputs.heparinLogTimeInput.value = getCurrentClockTime();
    }
    setHeparinLogValidation("Estimated loading dose copied into the heparin amount field.");
  });
  anticoagOutputs.addHeparinLogEntryButton?.addEventListener("click", () => {
    const timeValue = anticoagOutputs.heparinLogTimeInput?.value?.trim() ?? "";
    const unitsValue = Number(anticoagOutputs.heparinLogUnitsInput?.value ?? "");

    if (!timeValue) {
      setHeparinLogValidation("Enter the administration time for this heparin dose.");
      return;
    }
    if (!Number.isFinite(unitsValue) || unitsValue <= 0) {
      setHeparinLogValidation("Enter a heparin amount greater than 0 units.");
      return;
    }

    heparinLogState.entries = [
      ...heparinLogState.entries,
      {
        id: createHeparinLogEntryId(),
        time: timeValue.slice(0, 5),
        units: Math.round(unitsValue),
      },
    ];
    writeHeparinLogState(heparinLogState);
    if (anticoagOutputs.heparinLogUnitsInput) {
      anticoagOutputs.heparinLogUnitsInput.value = "";
    }
    setHeparinLogValidation("Heparin entry added. Protamine is calculated from the total logged heparin.");
    renderAnticoagulation();
  });
  anticoagOutputs.clearHeparinLogButton?.addEventListener("click", () => {
    heparinLogState.entries = [];
    writeHeparinLogState(heparinLogState);
    setHeparinLogValidation("Heparin log cleared.");
    renderAnticoagulation();
  });
  anticoagOutputs.heparinLogList?.addEventListener("click", (event) => {
    const removeButton = event.target instanceof Element ? event.target.closest("[data-heparin-log-remove]") : null;
    if (!(removeButton instanceof HTMLButtonElement)) return;

    heparinLogState.entries = heparinLogState.entries.filter((entry) => entry.id !== removeButton.dataset.heparinLogRemove);
    writeHeparinLogState(heparinLogState);
    setHeparinLogValidation("");
    renderAnticoagulation();
  });
  bindCurveTooltip(anticoagOutputs.curveChart);
  bindCurveTooltip(anticoagOutputs.curveModalChart);
  targetActButtons.forEach((button) => {
    button.addEventListener("click", () => {
      anticoagForm.elements.namedItem("targetActSeconds").value = button.dataset.targetAct;
      renderAnticoagulation();
    });
  });
  anticoagEbvGuideButton?.addEventListener("click", () => {
    const weightField = validateAnticoagField("anticoagWeightKg", anticoagForm.elements.namedItem("anticoagWeightKg")?.value);
    const suggestedEbvFactor = suggestEstimatedBloodVolumeFactor(weightField.value);
    if (!weightField.valid || suggestedEbvFactor === null) {
      updateFormInvalidState(anticoagForm, { anticoagWeightKg: weightField }, anticoagSummary);
      return;
    }
    anticoagForm.elements.namedItem("anticoagEbvFactor").value = String(suggestedEbvFactor);
    renderAnticoagulation();
  });
  expandCurveButton?.addEventListener("click", () => {
    isHeparinCurveExpanded = true;
    syncCurveControlState();
    renderAnticoagulation();
  });
  closeCurveModalButton?.addEventListener("click", () => {
    isHeparinCurveExpanded = false;
    syncCurveControlState();
    hideCurveTooltip();
  });
  zoomCurveButton?.addEventListener("click", () => {
    isHeparinCurveZoomedOut = !isHeparinCurveZoomedOut;
    syncCurveControlState();
    renderAnticoagulation();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !isHeparinCurveExpanded) return;
    isHeparinCurveExpanded = false;
    syncCurveControlState();
  });
  syncCurveControlState();
  renderAnticoagulation();
}

initializeCannulaSelection();
