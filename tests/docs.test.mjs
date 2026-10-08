import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (f) => readFileSync(new URL(`../${f}`, import.meta.url), "utf8");

test("README: triggers_update is framed as older-button-card only (7+ auto-tracks)", () => {
  const r = read("README.md");
  assert.doesNotMatch(r, /only redraws automatically when the card's own `entity` changes/);
  assert.match(r, /button-card 7/);
  assert.match(read("examples/overlay.yaml"), /button-card (< ?7|6)/);
});

test("README: YAML-mode install uses an absolute include path", () => {
  assert.match(read("README.md"), /!include_dir_merge_named \/config\/button_card_templates/);
  assert.doesNotMatch(read("README.md"), /!include_dir_merge_named button_card_templates/);
});

test("linger helper is installed as a package, never pasted as a second template: key", () => {
  for (const f of ["extras/linger.yaml", "extras/README.md"]) {
    const t = read(f);
    assert.match(t, /packages\//, f);
    assert.doesNotMatch(t, /Add (it )?(under `template:`|to `configuration\.yaml`)/, f);
  }
});
