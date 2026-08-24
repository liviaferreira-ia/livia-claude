import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve("src/data/curso.ts"), "utf8");

function section(start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  if (from < 0 || to < 0) throw new Error(`Seção curricular ausente: ${start}`);
  return source.slice(from, to);
}

function count(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

const a1 = section("const COURSE_A1", "const COURSE_A2");
const a2 = section("const COURSE_A2", "const b1Unit");
const b1 = section("const COURSE_B1", "const COURSE_B2");

const checks = [
  ["A1 possui 12 unidades", count(a1, /\bn:\s*\d+,/g) === 12],
  ["A1 possui 72 etapas", count(a1, /phase:\s*"(?:learn|understand|practice|speak|mission|mastery)"/g) === 72],
  ["A1 possui 3 checkpoints", count(a1, /checkpoint:/g) === 3],
  ["A2 possui 12 unidades", count(a2, /\bn:\s*\d+,/g) === 12],
  ["A2 possui 72 etapas", count(a2, /phase:\s*"(?:learn|understand|practice|speak|mission|mastery)"/g) === 72],
  ["A2 possui 3 checkpoints", count(a2, /checkpoint:/g) === 3],
  ["B1 possui 14 unidades", count(b1, /\bb1Unit\(/g) === 14],
  ["B1 define as 6 fases do ciclo", count(source.slice(source.indexOf("const b1Unit"), source.indexOf("const COURSE_B1")), /phase:\s*"(?:learn|understand|practice|speak|mission|mastery)"/g) === 6],
  ["B1 possui 3 checkpoints", count(b1, /Checkpoint [123]/g) === 3],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? "✓" : "✗"} ${label}`);
if (failed.length) process.exitCode = 1;
