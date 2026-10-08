// Test helper: load repo YAML as JSON (python3 + PyYAML, no npm deps) and turn a
// button-card "[[[ ... ]]]" JS template into a callable function.
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const PY = "import json,sys,yaml; json.dump(yaml.safe_load(open(sys.argv[1])), sys.stdout)";

export function loadYaml(rel) {
  const path = fileURLToPath(new URL(`../${rel}`, import.meta.url));
  return JSON.parse(execFileSync("python3", ["-c", PY, path]).toString());
}

export function compile(tpl) {
  const m = /^\s*\[\[\[([\s\S]*)\]\]\]\s*$/.exec(tpl ?? "");
  if (!m) throw new Error(`not a [[[ ]]] template: ${String(tpl).slice(0, 40)}`);
  return new Function("entity", "states", "variables", m[1]);
}
