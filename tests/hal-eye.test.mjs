import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadYaml, compile } from "./load.mjs";

const T = loadYaml("hal-eye.yaml");
const base = T.hal_eye;
const overlay = T.hal_eye_overlay;
const SAT = "assist_satellite.test";

// button-card merges template variables base → overlay → instance.
const vars = (inst = {}, tpl = overlay) =>
  ({ ...base.variables, ...(tpl === overlay ? overlay.variables : {}), ...inst });
const ent = (state) => (state === undefined ? undefined : { entity_id: SAT, state });
const face = (state, states = {}, inst = {}) =>
  compile(base.custom_fields.face)(ent(state), states, vars(inst, base));
const displayTpl = () => overlay.styles.card.find((o) => "display" in o).display;
const display = (state, states = {}, inst = {}) =>
  compile(displayTpl())(ent(state), states, vars(inst));
const on = (id) => ({ [id]: { entity_id: id, state: "on" } });
const off = (id) => ({ [id]: { entity_id: id, state: "off" } });

test("satellite states map to animation classes", () => {
  const cases = [["idle", "st-idle"], ["listening", "st-listen"], ["processing", "st-think"],
    ["responding", "st-speak"], ["unavailable", "st-idle"], ["unknown", "st-idle"],
    ["muted", "st-idle"], [undefined, "st-idle"]];
  for (const [s, cls] of cases) assert.match(face(s), new RegExp(`hal-wrap ${cls}"`), `state ${s}`);
});

test("speaking_entity forces speak only while the satellite is not active", () => {
  const sp = { speaking_entity: "input_boolean.tts" };
  assert.match(face("idle", on("input_boolean.tts"), sp), /st-speak/);
  assert.match(face("idle", off("input_boolean.tts"), sp), /st-idle/);
  assert.match(face("listening", on("input_boolean.tts"), sp), /st-listen/);
  assert.match(face("idle", {}, sp), /st-idle/); // speaking entity missing
});

test("eye_size: default, override, blank", () => {
  assert.match(face("idle"), /width:38vw/);
  assert.match(face("idle", {}, { eye_size: "50vmin" }), /width:50vmin/);
  assert.match(face("idle", {}, { eye_size: "" }), /width:38vw/);
});

test("overlay shows only while the satellite is active", () => {
  for (const s of ["listening", "processing", "responding"]) assert.equal(display(s), "block", s);
  for (const s of ["idle", "unavailable", "unknown", "muted", undefined]) assert.equal(display(s), "none", String(s));
});

test("overlay follows active_entity when set", () => {
  const a = { active_entity: "binary_sensor.linger" };
  assert.equal(display("idle", on("binary_sensor.linger"), a), "block");
  assert.equal(display("listening", off("binary_sensor.linger"), a), "none");
});

test("overlay falls back to satellite when active_entity is missing", () => {
  const a = { active_entity: "binary_sensor.typo" };
  assert.equal(display("listening", {}, a), "block");
  assert.equal(display("idle", {}, a), "none");
});

test("speaking_entity shows the overlay; mute beats everything", () => {
  const v = { speaking_entity: "input_boolean.tts", mute_entity: "input_boolean.mute" };
  assert.equal(display("idle", { ...on("input_boolean.tts"), ...off("input_boolean.mute") }, v), "block");
  assert.equal(display("idle", { ...on("input_boolean.tts"), ...on("input_boolean.mute") }, v), "none");
  assert.equal(display("listening", on("input_boolean.mute"), v), "none");
  assert.equal(display("listening", {}, { mute_entity: "input_boolean.gone" }), "block");
});

test("structure: chaining, defaults, fixed overlay", () => {
  assert.equal(overlay.template, "hal_eye");
  assert.deepEqual(base.variables, { eye_size: "38vw", speaking_entity: "" });
  assert.deepEqual(overlay.variables, { active_entity: "", mute_entity: "" });
  const card = Object.assign({}, ...overlay.styles.card);
  assert.equal(card.position, "fixed");
  assert.equal(String(card["z-index"]), "99999");
  assert.match(base.extra_styles, /@keyframes hal-breathe/);
  assert.doesNotMatch(base.extra_styles, /hal-cap/); // captions dropped
});

test("hygiene: no house-specific strings in the repo files", () => {
  const banned = /m5stack|hal_office|hal_kitchen|hal_muted|hal_announcing|caldock\.com|office_lights|patmore/i;
  for (const f of ["hal-eye.yaml"]) {
    assert.doesNotMatch(readFileSync(new URL(`../${f}`, import.meta.url), "utf8"), banned, f);
  }
});
