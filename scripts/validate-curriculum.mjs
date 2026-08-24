import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve("src/data/curso.ts"), "utf8");
const exerciseSource = readFileSync(resolve("src/data/exercises.ts"), "utf8");
const expansionSource = readFileSync(resolve("src/data/exercise-expansion.ts"), "utf8");
const practiceSource = readFileSync(resolve("src/app/(app)/aluno/praticar/page.tsx"), "utf8");
const pronunciationSource = readFileSync(resolve("src/app/(app)/aluno/pronuncia/page.tsx"), "utf8");
const roleplaySource = readFileSync(resolve("src/app/(app)/aluno/roleplay/page.tsx"), "utf8");

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
const b2 = section("const COURSE_B2", "const COURSE_C1");
const c1 = section("const COURSE_C1", "const COURSE_C2");
const c2 = section("const COURSE_C2", "export const COURSES");
const literalExerciseIds = [...`${exerciseSource}\n${expansionSource}`.matchAll(/\bid:\s*["`]([^"`]+)["`]/g)].map((match) => match[1]);
const uniqueExerciseIds = new Set(literalExerciseIds);
const levelAwareModules = [practiceSource, pronunciationSource, roleplaySource];

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
  ["B2 possui 14 unidades", count(b2, /\bb2Unit\(/g) === 14],
  ["B2 define as 6 fases do ciclo", count(source.slice(source.indexOf("const b2Unit"), source.indexOf("const COURSE_B2")), /phase:\s*"(?:learn|understand|practice|speak|mission|mastery)"/g) === 6],
  ["B2 possui 3 checkpoints", count(b2, /Checkpoint [123]/g) === 3],
  ["C1 possui 14 unidades", count(c1, /\bc1Unit\(/g) === 14],
  ["C1 define as 6 fases do ciclo", count(source.slice(source.indexOf("const c1Unit"), source.indexOf("const COURSE_C1")), /phase:\s*"(?:learn|understand|practice|speak|mission|mastery)"/g) === 6],
  ["C1 possui 3 checkpoints", count(c1, /Checkpoint [123]/g) === 3],
  ["C2 possui 14 unidades", count(c2, /\bc2Unit\(/g) === 14],
  ["C2 define as 6 fases do ciclo", count(source.slice(source.indexOf("const c2Unit"), source.indexOf("const COURSE_C2")), /phase:\s*"(?:learn|understand|practice|speak|mission|mastery)"/g) === 6],
  ["C2 possui 3 checkpoints", count(c2, /Checkpoint [123]/g) === 3],
  ["A trilha envia nível e unidade aos 3 módulos de cada nível", count(source, /\/aluno\/(?:praticar|pronuncia|roleplay)\?level=(?:A1|A2|B1|B2|C1|C2)&unit=1/g) === 18],
  ["Prática, pronúncia e roleplay respeitam o nível da trilha", levelAwareModules.every((moduleSource) => moduleSource.includes("useCourseContextFromLocation"))],
  ["B1 e B2 usam bancos de exercícios próprios", /B1:\s*\{\s*mc:\s*\[\.\.\.MC_B1/.test(exerciseSource) && /B2:\s*\{\s*mc:\s*\[\.\.\.MC_B2/.test(exerciseSource)],
  ["IDs literais de exercícios não se repetem", literalExerciseIds.length === uniqueExerciseIds.size],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? "✓" : "✗"} ${label}`);
if (failed.length) process.exitCode = 1;
