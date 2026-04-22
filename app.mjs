import { evaluateCalculator, roundTo } from "./calculations.mjs";

const form = document.querySelector("#calculator-form");
const summary = document.querySelector("#validationSummary");

const outputs = {
  bsa: {
    value: document.querySelector("#bsaOutput"),
    status: document.querySelector("#bsaStatus"),
    formatter: (value) => `${roundTo(value, 2).toFixed(2)} m²`,
    empty: "Enter height and weight.",
  },
  flow: {
    value: document.querySelector("#flowOutput"),
    status: document.querySelector("#flowStatus"),
    formatter: (value) => `${roundTo(value, 2).toFixed(2)} L/min`,
    empty: "Enter BSA inputs and target cardiac index.",
  },
  do2i: {
    value: document.querySelector("#do2iOutput"),
    status: document.querySelector("#do2iStatus"),
    formatter: (value) => `${Math.round(value)} mL O2/min/m²`,
    empty: "Enter hemoglobin, SaO2, PaO2, and target cardiac index.",
  },
};

const dependencyMessages = {
  bsa: ["heightCm", "weightKg"],
  flow: ["heightCm", "weightKg", "targetCi"],
  do2i: ["targetCi", "hgb", "saO2", "paO2"],
};

function render() {
  const formData = new FormData(form);
  const rawInputs = Object.fromEntries(formData.entries());
  const evaluation = evaluateCalculator(rawInputs);

  const invalidMessages = [];

  for (const element of form.elements) {
    if (!(element instanceof HTMLInputElement)) {
      continue;
    }

    const fieldState = evaluation.fields[element.name];
    const isInvalid = Boolean(fieldState && !fieldState.valid && element.value !== "");
    element.setAttribute("aria-invalid", String(isInvalid));

    if (isInvalid) {
      invalidMessages.push(fieldState.message);
    }
  }

  summary.textContent = invalidMessages[0] ?? "";

  updateResult("bsa", evaluation);
  updateResult("flow", evaluation);
  updateResult("do2i", evaluation);
}

function updateResult(key, evaluation) {
  const slot = outputs[key];
  const value = evaluation.results[key];

  if (value !== null) {
    slot.value.textContent = slot.formatter(value);
    slot.status.textContent = "Calculation ready.";
    return;
  }

  slot.value.textContent = "--";
  const missingDependency = dependencyMessages[key]
    .map((field) => evaluation.fields[field])
    .find((field) => !field.valid);

  slot.status.textContent = missingDependency?.message ?? slot.empty;
}

form.addEventListener("input", render);
form.addEventListener("change", render);

render();
