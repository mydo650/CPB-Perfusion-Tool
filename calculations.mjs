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

export function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
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

export function validatePerfusionField(name, rawValue) {
  return validateField(PERFUSION_FIELD_CONFIG, name, rawValue);
}

export function validatePrimeField(name, rawValue) {
  return validateField(PRIME_FIELD_CONFIG, name, rawValue);
}

export function validateAnticoagField(name, rawValue) {
  return validateField(ANTICOAG_FIELD_CONFIG, name, rawValue);
}

export function calculateBsa(heightCm, weightKg) {
  return Math.sqrt((heightCm * weightKg) / 3600);
}

export function calculatePumpFlow(cardiacIndex, bsa) {
  return cardiacIndex * bsa;
}

export function calculateArterialOxygenContent(hgb, saO2Fraction, paO2) {
  return hgb * 1.34 * saO2Fraction + 0.003 * paO2;
}

export function calculateDo2i(cardiacIndex, hgb, saO2Percent, paO2) {
  return calculateArterialOxygenContent(hgb, saO2Percent / 100, paO2) * 10 * cardiacIndex;
}

export function calculateRequiredCardiacIndex(do2iTarget, arterialOxygenContent) {
  if (arterialOxygenContent <= 0) return null;
  return do2iTarget / (10 * arterialOxygenContent);
}

export function calculateRequiredHemoglobin(do2iTarget, cardiacIndex, saO2Percent, paO2) {
  const saO2Fraction = saO2Percent / 100;
  if (cardiacIndex <= 0 || saO2Fraction <= 0) return null;
  return (do2iTarget / (10 * cardiacIndex) - 0.003 * paO2) / (1.34 * saO2Fraction);
}

export function calculateEstimatedBloodVolume(weightKg, ebvFactor) {
  return weightKg * ebvFactor;
}

export function calculatePredictedPrimeHct(bloodVolumeMl, baselineHctPercent, primeVolumeMl) {
  return ((bloodVolumeMl * (baselineHctPercent / 100)) / (bloodVolumeMl + primeVolumeMl)) * 100;
}

export function calculateRequiredPrbcVolume(targetHctPercent, baselineHctPercent, bloodVolumeMl, primeVolumeMl, prbcHctPercent) {
  const targetFraction = targetHctPercent / 100;
  const baselineFraction = baselineHctPercent / 100;
  const prbcFraction = prbcHctPercent / 100;
  const numerator = targetFraction * (bloodVolumeMl + primeVolumeMl) - baselineFraction * bloodVolumeMl;
  const denominator = prbcFraction - targetFraction;
  if (denominator <= 0) return null;
  return Math.max(0, numerator / denominator);
}

export function calculateProjectedHctAfterPrbc(bloodVolumeMl, baselineHctPercent, primeVolumeMl, prbcVolumeMl, prbcHctPercent) {
  const redCellVolume = bloodVolumeMl * (baselineHctPercent / 100) + prbcVolumeMl * (prbcHctPercent / 100);
  const totalVolume = bloodVolumeMl + primeVolumeMl + prbcVolumeMl;
  return (redCellVolume / totalVolume) * 100;
}

export function calculateHctDrop(baselineHctPercent, predictedHctPercent) {
  return baselineHctPercent - predictedHctPercent;
}

export function calculatePrimeToBloodRatio(primeVolumeMl, bloodVolumeMl) {
  if (bloodVolumeMl <= 0) return null;
  return primeVolumeMl / bloodVolumeMl;
}

export function calculateRedCellDeficitToTarget(targetHctPercent, baselineHctPercent, bloodVolumeMl, primeVolumeMl) {
  const targetRedCellVolumeMl = (targetHctPercent / 100) * (bloodVolumeMl + primeVolumeMl);
  const currentRedCellVolumeMl = (baselineHctPercent / 100) * bloodVolumeMl;
  return Math.max(0, targetRedCellVolumeMl - currentRedCellVolumeMl);
}

export function calculateHeparinLoadingDose(weightKg, heparinDosePerKg) {
  return weightKg * heparinDosePerKg;
}

export function calculateProtamineDose(heparinUnits, protamineRatioMgPer100U) {
  return (heparinUnits / 100) * protamineRatioMgPer100U;
}

export function calculateHeparinResponseCurve(baselineActSeconds, postHeparinActSeconds, heparinDosePerKg, targetActSeconds, weightKg) {
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

export function evaluateCalculator(rawInputs) {
  const fields = {};
  Object.keys(PERFUSION_FIELD_CONFIG).forEach((name) => {
    fields[name] = validatePerfusionField(name, rawInputs[name]);
  });

  const valid = (name) => fields[name].valid;
  const valueOf = (name) => fields[name].value;
  const results = {
    bsa: null,
    flowRange: null,
    effectiveCi: null,
    currentFlow: null,
    do2i: null,
    do2iThresholdMet: null,
    do2iSource: null,
    do2iTarget: null,
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

  if (valid("do2iTarget")) {
    results.do2iTarget = valueOf("do2iTarget");
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

export function evaluatePrimeCalculator(rawInputs) {
  const fields = {};
  Object.keys(PRIME_FIELD_CONFIG).forEach((name) => {
    fields[name] = validatePrimeField(name, rawInputs[name]);
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

export function evaluateAnticoagulationCalculator(rawInputs) {
  const fields = {};
  Object.keys(ANTICOAG_FIELD_CONFIG).forEach((name) => {
    fields[name] = validateAnticoagField(name, rawInputs[name]);
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
