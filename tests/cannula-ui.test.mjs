import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const cannulaHtml = readFileSync(new URL("../cannula-selection.html", import.meta.url), "utf8");
const appJs = readFileSync(new URL("../app.js", import.meta.url), "utf8");

test("cannula compare view exposes arterial, venous, and bicaval controls", () => {
  const requiredIds = [
    "cannulaBicavalToggle",
    "cannulaArterialManufacturer",
    "cannulaVenousManufacturer",
    "cannulaBicavalManufacturer",
    "cannulaArterialFamily",
    "cannulaVenousFamily",
    "cannulaBicavalFamily",
    "cannulaArterialSizeButtons",
    "cannulaVenousSizeButtons",
    "cannulaBicavalSizeButtons",
    "cannulaArterialChart",
    "cannulaVenousChart",
    "cannulaBicavalChart",
    "cannulaArterialRecommendedOutput",
    "cannulaVenousRecommendedOutput",
    "cannulaBicavalRecommendedOutput",
  ];

  requiredIds.forEach((id) => {
    assert.ok(cannulaHtml.includes(`id="${id}"`), `expected ${id} in cannula-selection.html`);
    assert.ok(appJs.includes(`#${id}`), `expected ${id} selector in app.js`);
  });
});

test("bicaval mode is toggle-driven and hidden by default", () => {
  const expectedSnippets = [
    "bicavalEnabled: false",
    "getActiveCannulaSides",
    "syncCannulaBicavalVisibility",
    "has-bicaval",
  ];

  assert.ok(cannulaHtml.includes('id="cannulaBicavalSetupPanel"'), "expected bicaval setup panel id");
  assert.ok(cannulaHtml.includes('id="cannulaBicavalComparePanel"'), "expected bicaval compare panel id");
  assert.ok(cannulaHtml.includes('id="cannulaBicavalSetupPanel"') && cannulaHtml.includes("hidden"), "expected bicaval panels hidden by default");

  expectedSnippets.forEach((snippet) => {
    assert.ok(appJs.includes(snippet), `expected bicaval toggle snippet ${snippet} in app.js`);
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
    cannulaHtml.indexOf('id="cannulaBicavalManufacturer"') < cannulaHtml.indexOf('id="cannulaFlowSlider"'),
    "bicaval manufacturer select should appear before the target flow slider",
  );
  assert.ok(
    cannulaHtml.indexOf('id="cannulaFlowSlider"') < cannulaHtml.indexOf('id="cannulaArterialChart"'),
    "arterial chart should render under the target flow slider",
  );
  assert.ok(
    cannulaHtml.indexOf('id="cannulaFlowSlider"') < cannulaHtml.indexOf('id="cannulaVenousChart"'),
    "venous chart should render under the target flow slider",
  );
  assert.ok(
    cannulaHtml.indexOf('id="cannulaFlowSlider"') < cannulaHtml.indexOf('id="cannulaBicavalChart"'),
    "bicaval chart should render under the target flow slider",
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

test("cannula recommendation logic tracks auto-selected families and recommended sizes", () => {
  const expectedSnippets = [
    "familyManualOverride",
    "getRecommendedCannulaFamilyId",
    "getRecommendedCannulaSizeForFamily",
    "syncCannulaRecommendedSelection",
  ];

  expectedSnippets.forEach((snippet) => {
    assert.ok(appJs.includes(snippet), `expected recommendation helper ${snippet} in app.js`);
  });
});

test("venous and bicaval selectors include role guidance hooks", () => {
  const requiredIds = [
    "cannulaVenousRoleHint",
    "cannulaBicavalRoleHint",
  ];
  const expectedSnippets = [
    "getCannulaRoleMetadata",
    "Typical bicaval role: SVC cannula",
    "Typical bicaval role: IVC cannula",
    "Possible SVC role",
    "Possible IVC role",
    "Two-stage",
  ];

  requiredIds.forEach((id) => {
    assert.ok(cannulaHtml.includes(`id=\"${id}\"`), `expected ${id} in cannula-selection.html`);
  });

  expectedSnippets.forEach((snippet) => {
    assert.ok(appJs.includes(snippet), `expected role guidance snippet ${snippet} in app.js`);
  });
});
