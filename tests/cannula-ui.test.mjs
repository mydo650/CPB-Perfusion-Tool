import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const cannulaHtml = readFileSync(new URL("../cannula-selection.html", import.meta.url), "utf8");
const appJs = readFileSync(new URL("../app.js", import.meta.url), "utf8");

test("paired cannula compare view exposes both arterial and venous controls", () => {
  const requiredIds = [
    "cannulaArterialManufacturer",
    "cannulaVenousManufacturer",
    "cannulaArterialFamily",
    "cannulaVenousFamily",
    "cannulaArterialSizeButtons",
    "cannulaVenousSizeButtons",
    "cannulaArterialChart",
    "cannulaVenousChart",
    "cannulaArterialRecommendedOutput",
    "cannulaVenousRecommendedOutput",
  ];

  requiredIds.forEach((id) => {
    assert.ok(cannulaHtml.includes(`id="${id}"`), `expected ${id} in cannula-selection.html`);
    assert.ok(appJs.includes(`#${id}`), `expected ${id} selector in app.js`);
  });
});

test("cannula setup selectors render before target flow and graphs", () => {
  assert.ok(
    cannulaHtml.indexOf('id="cannulaArterialManufacturer"') < cannulaHtml.indexOf('id="cannulaFlowSlider"'),
    "arterial manufacturer select should appear before the target flow slider",
  );
  assert.ok(
    cannulaHtml.indexOf('id="cannulaVenousManufacturer"') < cannulaHtml.indexOf('id="cannulaFlowSlider"'),
    "venous manufacturer select should appear before the target flow slider",
  );
  assert.ok(
    cannulaHtml.indexOf('id="cannulaFlowSlider"') < cannulaHtml.indexOf('id="cannulaArterialChart"'),
    "arterial chart should render under the target flow slider",
  );
  assert.ok(
    cannulaHtml.indexOf('id="cannulaFlowSlider"') < cannulaHtml.indexOf('id="cannulaVenousChart"'),
    "venous chart should render under the target flow slider",
  );
});

test("legacy single-view cannula IDs are not present anymore", () => {
  const retiredIds = [
    "cannulaManufacturer",
    "cannulaFamily",
    "cannulaSizeButtons",
    "cannulaChart",
    "cannulaRecommendedOutput",
    "cannulaSelectedOutput",
    "cannulaPressureOutput",
  ];

  retiredIds.forEach((id) => {
    assert.ok(!cannulaHtml.includes(`id="${id}"`), `did not expect retired id ${id} in cannula-selection.html`);
  });
});

test("cannula catalog includes the newly added size-only families", () => {
  const expectedFamilies = [
    "DLP arterial",
    "Bio-Medicus NextGen arterial",
    "Optisite arterial",
    "DLP single-stage straight venous",
    "MC2 two-stage venous",
    "Right-angle plastic-tip venous",
  ];

  expectedFamilies.forEach((familyLabel) => {
    assert.ok(appJs.includes(`label: "${familyLabel}"`), `expected family ${familyLabel} in app.js`);
  });
});
