const PERFUSION_FIELD_CONFIG = {
  heightCm: { label: "Height", min: 30, max: 250, allowZero: false },
  weightKg: { label: "Weight", min: 1, max: 300, allowZero: false },
  cardiacIndex: { label: "Cardiac index", min: 0.1, max: 6, allowZero: false },
  pumpFlow: { label: "Pump flow", min: 0.1, max: 12, allowZero: false },
  hgb: { label: "Hemoglobin", min: 1, max: 25, allowZero: false },
  saO2: { label: "SaO2", min: 0, max: 100, allowZero: true },
  paO2: { label: "PaO2", min: 0, max: 600, allowZero: true },
  do2iTarget: { label: "DO2i target", min: 100, max: 500, allowZero: false },
};

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
  heparinDosePerKg: { label: "Heparin loading dose", min: 50, max: 1000, allowZero: false },
  baselineActSeconds: { label: "Baseline ACT", min: 50, max: 400, allowZero: false },
  postHeparinActSeconds: { label: "Post-heparin ACT", min: 50, max: 1200, allowZero: false },
  targetActSeconds: { label: "Target ACT", min: 200, max: 1200, allowZero: false },
  protamineRatioMgPer100U: { label: "Protamine ratio", min: 0.1, max: 5, allowZero: false },
};

const SHARED_FIELD_GROUPS = {
  patientWeightKg: ["weightKg", "primeWeightKg", "anticoagWeightKg"],
  patientHeightCm: ["heightCm"],
};

const SHARED_FIELD_STORAGE_KEY = "cpbSupportSharedFields";

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

function calculatePumpFlow(cardiacIndex, bsa) {
  return cardiacIndex * bsa;
}

function calculateArterialOxygenContent(hgb, saO2Fraction, paO2) {
  return hgb * 1.34 * saO2Fraction + 0.003 * paO2;
}

function calculateDo2i(cardiacIndex, hgb, saO2Percent, paO2) {
  return calculateArterialOxygenContent(hgb, saO2Percent / 100, paO2) * 10 * cardiacIndex;
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

function calculateRedCellDeficitToTarget(targetHctPercent, baselineHctPercent, bloodVolumeMl, primeVolumeMl) {
  const targetRedCellVolumeMl = (targetHctPercent / 100) * (bloodVolumeMl + primeVolumeMl);
  const currentRedCellVolumeMl = (baselineHctPercent / 100) * bloodVolumeMl;
  return Math.max(0, targetRedCellVolumeMl - currentRedCellVolumeMl);
}

function calculateHeparinLoadingDose(weightKg, heparinDosePerKg) {
  return weightKg * heparinDosePerKg;
}

function calculateProtamineDose(heparinUnits, protamineRatioMgPer100U) {
  return (heparinUnits / 100) * protamineRatioMgPer100U;
}

function calculateHeparinResponseCurve(baselineActSeconds, postHeparinActSeconds, heparinDosePerKg, targetActSeconds, weightKg) {
  const actDelta = postHeparinActSeconds - baselineActSeconds;
  if (actDelta <= 0 || heparinDosePerKg <= 0) return null;

  const slopeActPerUnitKg = actDelta / heparinDosePerKg;
  const requiredHeparinDosePerKg = Math.max(0, (targetActSeconds - baselineActSeconds) / slopeActPerUnitKg);
  const requiredHeparinUnits = requiredHeparinDosePerKg * weightKg;
  const givenHeparinUnits = heparinDosePerKg * weightKg;

  return {
    slopeActPerUnitKg,
    requiredHeparinDosePerKg,
    requiredHeparinUnits,
    givenHeparinUnits,
    additionalHeparinUnits: Math.max(0, requiredHeparinUnits - givenHeparinUnits),
    targetReachedByTestDose: postHeparinActSeconds >= targetActSeconds,
    points: {
      baseline: { dosePerKg: 0, actSeconds: baselineActSeconds },
      measured: { dosePerKg: heparinDosePerKg, actSeconds: postHeparinActSeconds },
      target: { dosePerKg: requiredHeparinDosePerKg, actSeconds: targetActSeconds },
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
    flowRange: null,
    effectiveCi: null,
    currentFlow: null,
    currentHgb: valid("hgb") ? valueOf("hgb") : null,
    do2i: null,
    do2iThresholdMet: null,
    do2iSource: null,
    do2iTarget: valid("do2iTarget") ? valueOf("do2iTarget") : null,
    arterialOxygenContent: null,
    requiredCi: null,
    requiredFlow: null,
    requiredHgb: null,
  };

  if (valid("heightCm") && valid("weightKg")) {
    results.bsa = calculateBsa(valueOf("heightCm"), valueOf("weightKg"));
    results.flowRange = {
      low: calculatePumpFlow(1.6, results.bsa),
      high: calculatePumpFlow(2.6, results.bsa),
    };
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

  if (valid("hgb") && valid("saO2") && valid("paO2")) {
    results.arterialOxygenContent = calculateArterialOxygenContent(valueOf("hgb"), valueOf("saO2") / 100, valueOf("paO2"));
  }

  if (results.effectiveCi !== null && results.arterialOxygenContent !== null) {
    results.do2i = calculateDo2i(results.effectiveCi, valueOf("hgb"), valueOf("saO2"), valueOf("paO2"));
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

  if (results.bloodVolumeMl !== null && valid("primeBaselineHct") && valid("primeVolumeMl")) {
    results.predictedHct = calculatePredictedPrimeHct(results.bloodVolumeMl, valueOf("primeBaselineHct"), valueOf("primeVolumeMl"));
    results.hctDrop = calculateHctDrop(valueOf("primeBaselineHct"), results.predictedHct);
    results.primeToBloodRatio = calculatePrimeToBloodRatio(valueOf("primeVolumeMl"), results.bloodVolumeMl);
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
    protamineDoseMg: null,
    heparinResponseCurve: null,
  };

  if (valid("anticoagWeightKg") && valid("heparinDosePerKg")) {
    results.heparinLoadingUnits = calculateHeparinLoadingDose(valueOf("anticoagWeightKg"), valueOf("heparinDosePerKg"));
  }

  if (results.heparinLoadingUnits !== null && valid("protamineRatioMgPer100U")) {
    results.protamineDoseMg = calculateProtamineDose(results.heparinLoadingUnits, valueOf("protamineRatioMgPer100U"));
  }

  if (valid("anticoagWeightKg") && valid("heparinDosePerKg") && valid("baselineActSeconds") && valid("postHeparinActSeconds") && valid("targetActSeconds")) {
    results.heparinResponseCurve = calculateHeparinResponseCurve(
      valueOf("baselineActSeconds"),
      valueOf("postHeparinActSeconds"),
      valueOf("heparinDosePerKg"),
      valueOf("targetActSeconds"),
      valueOf("anticoagWeightKg"),
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

const perfusionOutputs = perfusionForm
  ? {
      bsa: {
        value: document.querySelector("#bsaOutput"),
        status: document.querySelector("#bsaStatus"),
        format: (value) => `${roundTo(value, 2).toFixed(2)} m²`,
        empty: "Enter height and weight.",
      },
      flowRange: {
        value: document.querySelector("#flowOutput"),
        status: document.querySelector("#flowStatus"),
        format: (value) => `${roundTo(value.low, 2).toFixed(2)} to ${roundTo(value.high, 2).toFixed(2)} L/min`,
        empty: "Enter height and weight to calculate 1.6 to 2.6 L/min/m².",
      },
      do2i: {
        value: document.querySelector("#do2iOutput"),
        status: document.querySelector("#do2iStatus"),
        format: (value) => `${Math.round(value)} mL O2/min/m²`,
        empty: "Enter hemoglobin, SaO2, PaO2, and either CI or pump flow.",
      },
      requiredFlow: {
        value: document.querySelector("#targetFlowOutput"),
        status: document.querySelector("#targetFlowStatus"),
        format: (value) => `${roundTo(value, 2).toFixed(2)} L/min`,
        empty: "Enter BSA, hemoglobin, SaO2, and PaO2.",
      },
      requiredCi: {
        value: document.querySelector("#targetCiOutput"),
        status: document.querySelector("#targetCiStatus"),
        format: (value) => `${roundTo(value, 2).toFixed(2)} L/min/m²`,
        empty: "Enter hemoglobin, SaO2, and PaO2.",
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
        empty: "Calculated from the estimated heparin loading dose.",
      },
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

const tabButtons = Array.from(document.querySelectorAll("[data-tab-target]"));
const tabPanels = Array.from(document.querySelectorAll("[data-tab-panel]"));

function collectInputs(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function formatPrimeUnits(prbcVolumeMl) {
  if (prbcVolumeMl === null) return "--";
  if (prbcVolumeMl === 0) return "0 units";
  return `${roundTo(prbcVolumeMl / 300, 1).toFixed(1)} units`;
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

function renderPerfusion() {
  const evaluation = evaluateCalculator(collectInputs(perfusionForm));
  updateFormInvalidState(perfusionForm, evaluation.fields, perfusionSummary);

  if (evaluation.results.bsa !== null) {
    perfusionOutputs.bsa.value.textContent = perfusionOutputs.bsa.format(evaluation.results.bsa);
    perfusionOutputs.bsa.status.textContent = "Calculation ready.";
  } else {
    perfusionOutputs.bsa.value.textContent = "--";
    perfusionOutputs.bsa.status.textContent = perfusionOutputs.bsa.empty;
  }

  if (evaluation.results.flowRange !== null) {
    perfusionOutputs.flowRange.value.textContent = perfusionOutputs.flowRange.format(evaluation.results.flowRange);
    perfusionOutputs.flowRange.status.textContent = "Based on 1.6 to 2.6 L/min/m².";
  } else {
    perfusionOutputs.flowRange.value.textContent = "--";
    perfusionOutputs.flowRange.status.textContent = perfusionOutputs.flowRange.empty;
  }

  if (evaluation.results.do2i !== null) {
    perfusionOutputs.do2i.value.textContent = perfusionOutputs.do2i.format(evaluation.results.do2i);
    const source = evaluation.results.do2iSource === "pump flow" ? "pump flow/BSA" : "cardiac index";
    const threshold = evaluation.results.do2iThresholdMet ? "above" : "below";
    perfusionOutputs.do2i.status.textContent = `Using ${source}. Current DO2i is ${threshold} target ${Math.round(evaluation.results.do2iTarget)}.`;
  } else {
    perfusionOutputs.do2i.value.textContent = "--";

    if (!evaluation.results.bsa && evaluation.fields.pumpFlow.valid) {
      perfusionOutputs.do2i.status.textContent = "Height and weight are needed to use pump flow for DO2i.";
    } else if (!evaluation.fields.cardiacIndex.valid && !evaluation.fields.pumpFlow.valid) {
      perfusionOutputs.do2i.status.textContent = "Enter either cardiac index or pump flow.";
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
    perfusionOutputs.requiredHgb.status.textContent = `${formatDelta(evaluation.results.requiredHgb - evaluation.results.currentHgb, "g/dL")} from current Hgb.`;
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
    summary.textContent = "Enter ACT response values to plot the baseline, measured response, and projected target dose.";
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
  const maxDose = Math.max(...points.map((point) => point.dosePerKg), curve.points.measured.dosePerKg + 50, 100);
  const referenceDoseMax = Math.max(...referenceActs.map((actSeconds) => Math.max(0, (actSeconds - curve.points.baseline.actSeconds) / curve.slopeActPerUnitKg)));
  const maxAct = Math.max(...points.map((point) => point.actSeconds), ...referenceActs, isHeparinCurveZoomedOut ? 1000 : 800);
  const xMax = Math.ceil(Math.max(maxDose, referenceDoseMax, isHeparinCurveZoomedOut ? 900 : 100) / 50) * 50;
  const yMax = Math.ceil(maxAct / 100) * 100;
  const x = (dosePerKg) => margin.left + (dosePerKg / xMax) * plotWidth;
  const y = (actSeconds) => margin.top + plotHeight - (actSeconds / yMax) * plotHeight;
  const visibleLineEndDosePerKg = Math.min(xMax, (yMax - curve.points.baseline.actSeconds) / curve.slopeActPerUnitKg);
  const lineEnd = {
    dosePerKg: visibleLineEndDosePerKg,
    actSeconds: curve.points.baseline.actSeconds + curve.slopeActPerUnitKg * visibleLineEndDosePerKg,
  };
  const xTicks = isHeparinCurveZoomedOut ? [0, xMax / 2, xMax] : [0, xMax / 2, xMax];
  const yTicks = isHeparinCurveZoomedOut
    ? [0, 400, 800, yMax].filter((tick, index, ticks) => tick <= yMax && ticks.indexOf(tick) === index)
    : Array.from(new Set([0, Math.round(yMax / 2), 480, 600, yMax].filter((tick) => tick <= yMax))).sort((a, b) => a - b);
  const formatHover = (label, point) => `${label}: ${roundTo(point.dosePerKg, 0).toFixed(0)} units/kg, ACT ${roundTo(point.actSeconds, 0).toFixed(0)} sec`;
  const formatReferenceHover = (label, actSeconds) => {
    const dosePerKg = Math.max(0, (actSeconds - curve.points.baseline.actSeconds) / curve.slopeActPerUnitKg);
    const weightKg = curve.givenHeparinUnits / curve.points.measured.dosePerKg;
    const additionalUnits = Math.max(0, dosePerKg * weightKg - curve.givenHeparinUnits);
    return `${label}: ACT ${actSeconds} sec, ${roundTo(dosePerKg, 0).toFixed(0)} units/kg, ${Math.round(additionalUnits).toLocaleString()} additional units`;
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
        <circle cx="${x(point.dosePerKg)}" cy="${y(point.actSeconds)}" r="7"></circle>
        <text x="${x(point.dosePerKg)}" y="${y(point.actSeconds) - 12}" text-anchor="middle">${label}</text>
      </g>
    `)
    .join("");
  const act480DosePerKg = Math.max(0, (480 - curve.points.baseline.actSeconds) / curve.slopeActPerUnitKg);
  const act600DosePerKg = Math.max(0, (600 - curve.points.baseline.actSeconds) / curve.slopeActPerUnitKg);
  const targetAct = roundTo(curve.points.target.actSeconds, 0).toFixed(0);
  const targetAdditionalUnits = Math.round(curve.additionalHeparinUnits).toLocaleString();
  const targetLabel = `Target ACT ${targetAct}`;
  const targetTooltip = `${targetLabel}: ${roundTo(curve.points.target.dosePerKg, 0).toFixed(0)} units/kg, ${targetAdditionalUnits} additional units`;
  const referencePointMarkup = `
    <g class="curve-reference curve-reference-480" tabindex="0" data-tooltip="${formatReferenceHover("ACT 480 reference", 480)}">
      <polygon points="${starPoints(x(act480DosePerKg), y(480), 12, 5)}"></polygon>
      <text x="${x(act480DosePerKg)}" y="${y(480) - 18}" text-anchor="middle">480</text>
    </g>
    <g class="curve-reference curve-reference-600" tabindex="0" data-tooltip="${formatReferenceHover("ACT 600 reference", 600)}">
      <circle cx="${x(act600DosePerKg)}" cy="${y(600)}" r="8"></circle>
      <text x="${x(act600DosePerKg)}" y="${y(600) - 14}" text-anchor="middle">600</text>
    </g>
    <g class="curve-selected-target" tabindex="0" data-tooltip="${targetTooltip}">
      <rect x="${x(curve.points.target.dosePerKg) - 8}" y="${y(curve.points.target.actSeconds) - 8}" width="16" height="16" transform="rotate(45 ${x(curve.points.target.dosePerKg)} ${y(curve.points.target.actSeconds)})"></rect>
      <text x="${x(curve.points.target.dosePerKg)}" y="${y(curve.points.target.actSeconds) + 28}" text-anchor="middle">
        <tspan x="${x(curve.points.target.dosePerKg)}">${targetLabel}</tspan>
        <tspan x="${x(curve.points.target.dosePerKg)}" dy="16">${targetAdditionalUnits} units addl.</tspan>
      </text>
    </g>
  `;

  summary.textContent = curve.targetReachedByTestDose
    ? `The measured ACT reaches the selected target of ACT ${roundTo(curve.points.target.actSeconds, 0).toFixed(0)} with the current loading dose.`
    : `Selected Target ACT ${roundTo(curve.points.target.actSeconds, 0).toFixed(0)} updates the target line and diamond marker. Reference markers remain at ACT 480 and ACT 600.`;

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
        <text x="${x(tick)}" y="${height - margin.bottom + 26}" text-anchor="middle">${Math.round(tick)}</text>
      </g>
    `).join("")}
    <line class="curve-axis" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}"></line>
    <line class="curve-axis" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}"></line>
    <line class="curve-target-line" x1="${margin.left}" y1="${y(curve.points.target.actSeconds)}" x2="${width - margin.right}" y2="${y(curve.points.target.actSeconds)}"></line>
    <line class="curve-response-line" x1="${x(0)}" y1="${y(curve.points.baseline.actSeconds)}" x2="${x(lineEnd.dosePerKg)}" y2="${y(lineEnd.actSeconds)}"></line>
    ${pointMarkup}
    ${referencePointMarkup}
    <text class="curve-axis-label" x="${width / 2}" y="${height - 18}" text-anchor="middle">Heparin dose (units/kg)</text>
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

  if (evaluation.results.protamineDoseMg !== null) {
    anticoagOutputs.protamineDoseMg.value.textContent = anticoagOutputs.protamineDoseMg.format(evaluation.results.protamineDoseMg);
    anticoagOutputs.protamineDoseMg.status.textContent = "Based on the estimated heparin loading dose and selected protamine ratio.";
  } else {
    anticoagOutputs.protamineDoseMg.value.textContent = "--";
    anticoagOutputs.protamineDoseMg.status.textContent = anticoagOutputs.protamineDoseMg.empty;
  }

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

if (anticoagForm) {
  hydrateSharedFields(anticoagForm);
  anticoagForm.addEventListener("input", renderAnticoagulation);
  anticoagForm.addEventListener("change", renderAnticoagulation);
  anticoagForm.addEventListener("input", (event) => syncSharedFieldValue(event.target));
  anticoagForm.addEventListener("change", (event) => syncSharedFieldValue(event.target));
  bindCurveTooltip(anticoagOutputs.curveChart);
  bindCurveTooltip(anticoagOutputs.curveModalChart);
  targetActButtons.forEach((button) => {
    button.addEventListener("click", () => {
      anticoagForm.elements.namedItem("targetActSeconds").value = button.dataset.targetAct;
      renderAnticoagulation();
    });
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
