import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateProtamineDose,
  calculateArterialOxygenContent,
  calculateBsa,
  calculateDo2i,
  calculateEstimatedBloodVolume,
  calculateDrugDoseSafetyCheck,
  calculateHeparinAdministrationTotal,
  calculateHemoglobinFromHematocrit,
  calculateHctDrop,
  calculateHeparinLoadingDose,
  calculateHeparinResponseCurve,
  calculatePredictedPrimeHct,
  calculatePrimeToBloodRatio,
  calculateProjectedHctAfterPrbc,
  calculatePumpFlow,
  calculateRedCellDeficitToTarget,
  calculateRequiredCardiacIndex,
  calculateRequiredHemoglobin,
  calculateRequiredPrbcVolume,
  calculateWeightOnlyBsa,
  buildPerfusionFlowMap,
  suggestEstimatedBloodVolumeFactor,
  evaluateAnticoagulationCalculator,
  evaluateCalculator,
  evaluatePrimeCalculator,
  roundTo,
  validateAnticoagField,
  validatePerfusionField,
  validatePrimeField,
} from "../calculations.mjs";

test("Mosteller BSA matches expected fixture", () => {
  const bsa = calculateBsa(170, 70);
  assert.equal(roundTo(bsa, 2), 1.82);
});

test("Costeff BSA estimates from weight only", () => {
  const bsa = calculateWeightOnlyBsa(70);
  assert.equal(roundTo(bsa, 2), 1.79);
});

test("pump flow uses target cardiac index and BSA", () => {
  const flow = calculatePumpFlow(2.4, 1.82);
  assert.equal(roundTo(flow, 2), 4.37);
});

test("arterial oxygen content uses percent converted to fraction via DO2i helper", () => {
  const content = calculateArterialOxygenContent(12, 0.98, 150);
  assert.equal(roundTo(content, 2), 16.21);

  const do2i = calculateDo2i(2.4, 12, 98, 150);
  assert.equal(Math.round(do2i), 389);
});

test("hematocrit can estimate hemoglobin for oxygen delivery math", () => {
  assert.equal(roundTo(calculateHemoglobinFromHematocrit(36), 1), 12.0);
});

test("indexed flow map covers CI 1.6 through 3.0", () => {
  const flowMap = buildPerfusionFlowMap(1.82);
  assert.equal(flowMap[0].cardiacIndex, 1.6);
  assert.equal(flowMap.at(-1).cardiacIndex, 3.0);
  assert.equal(roundTo(flowMap[0].pumpFlow, 2), 2.91);
  assert.equal(roundTo(flowMap.at(-1).pumpFlow, 2), 5.46);
});

test("calculator returns only the affected outputs when some inputs are missing", () => {
  const evaluated = evaluateCalculator({
    heightCm: "170",
    weightKg: "70",
    cardiacIndex: "",
    pumpFlow: "",
    hgb: "12",
    saO2: "98",
    paO2: "150",
  });

  assert.equal(roundTo(evaluated.results.bsa, 2), 1.82);
  assert.equal(roundTo(evaluated.results.flowRange.low, 2), 2.91);
  assert.equal(roundTo(evaluated.results.flowRange.high, 2), 5.45);
  assert.equal(evaluated.results.flowMap.length, 8);
  assert.equal(evaluated.results.do2i, null);
});

test("calculator falls back to Costeff BSA when height is missing", () => {
  const evaluated = evaluateCalculator({
    heightCm: "",
    weightKg: "70",
    cardiacIndex: "2.4",
    pumpFlow: "",
    hgb: "12",
    saO2: "98",
    paO2: "150",
    do2iTarget: "275",
  });

  assert.equal(evaluated.results.bsaFormula, "Costeff");
  assert.equal(roundTo(evaluated.results.bsa, 2), 1.79);
  assert.equal(roundTo(evaluated.results.currentFlow, 2), 4.31);
  assert.equal(Math.round(evaluated.results.do2i), 389);
});

test("pump flow overrides cardiac index for DO2i when both are entered", () => {
  const evaluated = evaluateCalculator({
    heightCm: "170",
    weightKg: "70",
    cardiacIndex: "2.4",
    pumpFlow: "4.0",
    hgb: "12",
    saO2: "98",
    paO2: "150",
    do2iTarget: "275",
  });

  assert.equal(evaluated.results.do2iSource, "pump flow");
  assert.equal(roundTo(evaluated.results.effectiveCi, 2), 2.20);
  assert.equal(Math.round(evaluated.results.do2i), 357);
});

test("hematocrit can stand in for hemoglobin in DO2i calculations", () => {
  const evaluated = evaluateCalculator({
    heightCm: "170",
    weightKg: "70",
    cardiacIndex: "2.4",
    pumpFlow: "",
    hgb: "",
    hct: "36",
    saO2: "98",
    paO2: "150",
    do2iTarget: "275",
  });

  assert.equal(evaluated.results.hgbSource, "hematocrit");
  assert.equal(roundTo(evaluated.results.currentHgb, 1), 12.0);
  assert.equal(Math.round(evaluated.results.do2i), 389);
});

test("required CI and flow can be back-calculated from a DO2i target", () => {
  const content = calculateArterialOxygenContent(12, 0.98, 150);
  const requiredCi = calculateRequiredCardiacIndex(275, content);
  assert.equal(roundTo(requiredCi, 2), 1.70);

  const evaluated = evaluateCalculator({
    heightCm: "170",
    weightKg: "70",
    cardiacIndex: "2.2",
    pumpFlow: "",
    hgb: "12",
    saO2: "98",
    paO2: "150",
    do2iTarget: "275",
  });

  assert.equal(roundTo(evaluated.results.requiredCi, 2), 1.70);
  assert.equal(roundTo(evaluated.results.requiredFlow, 2), 3.08);
});

test("required hemoglobin can be back-calculated from the current effective CI", () => {
  const requiredHgb = calculateRequiredHemoglobin(275, 2.0, 98, 150);
  assert.equal(roundTo(requiredHgb, 1), 10.1);
});

test("prime calculations estimate blood volume and post-prime hematocrit", () => {
  const bloodVolume = calculateEstimatedBloodVolume(70, 70);
  assert.equal(bloodVolume, 4900);

  const predictedHct = calculatePredictedPrimeHct(4900, 36, 1400);
  assert.equal(roundTo(predictedHct, 1), 28.0);
  assert.equal(roundTo(calculateHctDrop(36, predictedHct), 1), 8.0);
  assert.equal(roundTo(calculatePrimeToBloodRatio(1400, 4900), 2), 0.29);
});

test("prime calculator solves required PRBC volume to a target hematocrit", () => {
  const requiredPrbc = calculateRequiredPrbcVolume(30, 36, 4900, 1400, 60);
  assert.equal(Math.round(requiredPrbc), 420);
  const redCellDeficit = calculateRedCellDeficitToTarget(30, 36, 4900, 1400);
  assert.equal(Math.round(redCellDeficit), 126);

  const projectedHct = calculateProjectedHctAfterPrbc(4900, 36, 1400, requiredPrbc, 60);
  assert.equal(roundTo(projectedHct, 1), 30.0);
});

test("prime evaluator returns target status and projected hematocrit", () => {
  const evaluated = evaluatePrimeCalculator({
    primeWeightKg: "70",
    primeEbvFactor: "70",
    primeBaselineHct: "36",
    primeVolumeMl: "1400",
    primeTargetHct: "30",
    primePrbcHct: "60",
  });

  assert.equal(evaluated.results.bloodVolumeMl, 4900);
  assert.equal(roundTo(evaluated.results.predictedHct, 1), 28.0);
  assert.equal(roundTo(evaluated.results.hctDrop, 1), 8.0);
  assert.equal(roundTo(evaluated.results.primeToBloodRatio, 2), 0.29);
  assert.equal(Math.round(evaluated.results.redCellDeficitMl), 126);
  assert.equal(Math.round(evaluated.results.prbcVolumeMl), 420);
  assert.equal(roundTo(evaluated.results.projectedHct, 1), 30.0);
  assert.equal(evaluated.results.targetMetWithoutPrbc, false);
  assert.equal(evaluated.results.prbcTargetReachable, true);
});

test("prime evaluator recognizes when the target is already met without PRBC", () => {
  const evaluated = evaluatePrimeCalculator({
    primeWeightKg: "70",
    primeEbvFactor: "70",
    primeBaselineHct: "36",
    primeVolumeMl: "500",
    primeTargetHct: "30",
    primePrbcHct: "60",
  });

  assert.equal(evaluated.results.targetMetWithoutPrbc, true);
  assert.equal(Math.round(evaluated.results.prbcVolumeMl), 0);
  assert.equal(roundTo(evaluated.results.projectedHct, 1), roundTo(evaluated.results.predictedHct, 1));
});

test("prime evaluator flags unreachable targets when PRBC hematocrit is at or below target", () => {
  const evaluated = evaluatePrimeCalculator({
    primeWeightKg: "70",
    primeEbvFactor: "70",
    primeBaselineHct: "36",
    primeVolumeMl: "1400",
    primeTargetHct: "40",
    primePrbcHct: "40",
  });

  assert.equal(evaluated.results.prbcTargetReachable, false);
  assert.equal(evaluated.results.prbcVolumeMl, null);
  assert.equal(evaluated.results.projectedHct, null);
});

test("anticoagulation calculations estimate heparin loading and protamine reversal doses", () => {
  const heparinUnits = calculateHeparinLoadingDose(70, 300);
  assert.equal(heparinUnits, 21000);

  const protamineDose = calculateProtamineDose(heparinUnits, 1);
  assert.equal(protamineDose, 210);

  const evaluated = evaluateAnticoagulationCalculator({
    anticoagWeightKg: "70",
    anticoagEbvFactor: "75",
    anticoagPrimeVolumeMl: "0",
    heparinDosePerKg: "300",
    baselineActSeconds: "130",
    postHeparinActSeconds: "430",
    targetActSeconds: "480",
    protamineRatioMgPer100U: "1",
  });

  assert.equal(evaluated.results.heparinLoadingUnits, 21000);
  assert.equal(evaluated.results.protamineDoseMg, 210);
});

test("drug dose safety check calculates total dose and bolus volume", () => {
  const checked = calculateDrugDoseSafetyCheck({
    weightKg: 70,
    dose: 300,
    concentration: 1000,
    routeType: "bolus",
    doseUnit: "units/kg",
    concentrationUnit: "units/mL",
    referenceLow: 150,
    referenceHigh: 400,
  });

  assert.equal(checked.totalDose, 21000);
  assert.equal(checked.volumeMl, 21);
  assert.equal(checked.doseStatus, "within");
});

test("drug dose safety check flags above-range infusion doses", () => {
  const checked = calculateDrugDoseSafetyCheck({
    weightKg: 80,
    dose: 3,
    concentration: 1,
    routeType: "infusion",
    doseUnit: "mcg/kg/min",
    concentrationUnit: "mcg/mL",
    referenceLow: 0.5,
    referenceHigh: 2,
  });

  assert.equal(checked.totalDose, 240);
  assert.equal(checked.volumeMl, 240);
  assert.equal(checked.doseStatus, "above");
});

test("heparin administration tally sums valid logged doses", () => {
  const total = calculateHeparinAdministrationTotal([
    { time: "08:00", units: 21000 },
    { time: "08:45", units: 5000 },
    { time: "09:20", amountUnits: 3000 },
    { time: "09:50", units: -2000 },
  ]);

  assert.equal(total, 29000);
});

test("protamine reversal can be calculated from the heparin tally", () => {
  const tallyUnits = calculateHeparinAdministrationTotal([
    { time: "08:00", units: 21000 },
    { time: "08:45", units: 5000 },
  ]);

  assert.equal(tallyUnits, 26000);
  assert.equal(calculateProtamineDose(tallyUnits, 1), 260);
});

test("estimated blood volume factor guide follows project teaching tiers", () => {
  assert.equal(suggestEstimatedBloodVolumeFactor(10), 85);
  assert.equal(suggestEstimatedBloodVolumeFactor(11), 80);
  assert.equal(suggestEstimatedBloodVolumeFactor(21), 75);
  assert.equal(suggestEstimatedBloodVolumeFactor(31), 70);
  assert.equal(suggestEstimatedBloodVolumeFactor(41), 65);
  assert.equal(suggestEstimatedBloodVolumeFactor(80), 75);
});

test("heparin dose response curve projects target dose from concentration rise/run", () => {
  const curve = calculateHeparinResponseCurve(100, 520, 24000, 600, 80, 6000);
  assert.equal(roundTo(curve.loadingConcentrationUnitsPerMl, 2), 4);
  assert.equal(roundTo(curve.slopeActPerUnitMl, 2), 105);
  assert.equal(Math.round(curve.requiredHeparinDosePerKg), 357);
  assert.equal(Math.round(curve.requiredHeparinUnits), 28571);
  assert.equal(Math.round(curve.additionalHeparinUnits), 4571);
  assert.equal(curve.targetReachedByTestDose, false);

  const evaluated = evaluateAnticoagulationCalculator({
    anticoagWeightKg: "80",
    anticoagEbvFactor: "75",
    anticoagPrimeVolumeMl: "0",
    heparinDosePerKg: "300",
    baselineActSeconds: "100",
    postHeparinActSeconds: "520",
    targetActSeconds: "600",
    protamineRatioMgPer100U: "1",
  });

  assert.equal(evaluated.results.bloodVolumeMl, 6000);
  assert.equal(evaluated.results.distributionVolumeMl, 6000);
  assert.equal(roundTo(evaluated.results.heparinLoadingConcentrationUnitsPerMl, 2), 4);
  assert.equal(Math.round(evaluated.results.heparinResponseCurve.requiredHeparinUnits), 28571);
});

test("prime volume is included in heparin concentration distribution volume", () => {
  const evaluated = evaluateAnticoagulationCalculator({
    anticoagWeightKg: "80",
    anticoagEbvFactor: "75",
    anticoagPrimeVolumeMl: "1200",
    heparinDosePerKg: "300",
    baselineActSeconds: "100",
    postHeparinActSeconds: "520",
    targetActSeconds: "600",
    protamineRatioMgPer100U: "1",
  });

  assert.equal(evaluated.results.distributionVolumeMl, 7200);
  assert.equal(roundTo(evaluated.results.heparinLoadingConcentrationUnitsPerMl, 2), 3.33);
  assert.equal(Math.round(evaluated.results.heparinResponseCurve.requiredHeparinDosePerKg), 357);
});

test("heparin dose response curve follows the selected target ACT", () => {
  const evaluated = evaluateAnticoagulationCalculator({
    anticoagWeightKg: "70",
    anticoagEbvFactor: "75",
    anticoagPrimeVolumeMl: "0",
    heparinDosePerKg: "300",
    baselineActSeconds: "130",
    postHeparinActSeconds: "430",
    targetActSeconds: "550",
    protamineRatioMgPer100U: "1",
  });

  assert.equal(Math.round(evaluated.results.heparinResponseCurve.requiredHeparinDosePerKg), 420);
  assert.equal(Math.round(evaluated.results.heparinResponseCurve.requiredHeparinUnits), 29400);
  assert.equal(Math.round(evaluated.results.heparinResponseCurve.additionalHeparinUnits), 8400);
});

test("heparin dose response curve exposes high projected dose scenarios", () => {
  const evaluated = evaluateAnticoagulationCalculator({
    anticoagWeightKg: "70",
    anticoagEbvFactor: "75",
    anticoagPrimeVolumeMl: "0",
    heparinDosePerKg: "300",
    baselineActSeconds: "130",
    postHeparinActSeconds: "330",
    targetActSeconds: "500",
    protamineRatioMgPer100U: "1",
  });

  assert.equal(Math.round(evaluated.results.heparinResponseCurve.requiredHeparinDosePerKg), 555);
  assert.equal(evaluated.results.heparinResponseCurve.requiredHeparinDosePerKg >= 500, true);
});

test("validation rejects out of range and negative inputs", () => {
  assert.equal(validatePerfusionField("heightCm", "-1").valid, false);
  assert.equal(validatePerfusionField("saO2", "102").valid, false);
  assert.equal(validatePerfusionField("paO2", "0").valid, true);
  assert.equal(validatePrimeField("primePrbcHct", "95").valid, false);
  assert.equal(validateAnticoagField("heparinDosePerKg", "20").valid, false);
  assert.equal(validateAnticoagField("targetActSeconds", "120").valid, false);
});
