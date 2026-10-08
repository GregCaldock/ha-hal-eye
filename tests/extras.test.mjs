import { test } from "node:test";
import assert from "node:assert/strict";
import { loadYaml } from "./load.mjs";

test("every gag sentence intent has a reply, and vice versa", () => {
  const sentences = loadYaml("extras/hal_gags.yaml");
  const pkg = loadYaml("extras/hal_package.yaml");
  assert.equal(sentences.language, "en");
  const s = Object.keys(sentences.intents).sort();
  const p = Object.keys(pkg.intent_script).sort();
  assert.deepEqual(s, p);
  assert.deepEqual(s, ["HalGagDaisy", "HalGagHello", "HalGagPodBayDoors", "HalGagProblem"]);
  for (const k of s) {
    assert.ok(sentences.intents[k].data[0].sentences.length > 0, k);
    assert.ok(pkg.intent_script[k].speech.text.length > 0, k);
  }
});

test("linger helper: template binary_sensor with delay_off and a placeholder satellite", () => {
  const t = loadYaml("extras/linger.yaml");
  const bs = t.template[0].binary_sensor[0];
  assert.equal(bs.unique_id, "hal_active");
  assert.equal(bs.delay_off.seconds, 4);
  assert.match(bs.state, /assist_satellite\.YOUR_SATELLITE/);
  assert.match(bs.state, /listening.*processing.*responding/);
});
