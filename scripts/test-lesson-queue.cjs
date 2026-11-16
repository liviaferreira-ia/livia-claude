const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
function load(file, mocks = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, { exports, Map, Set, require(name) {
    if (name in mocks) return mocks[name];
    if (name === "react/jsx-runtime") return require(name);
    throw Error(name);
  } });
  return exports;
}
const drafts = [
  ["pending", 1], ["approved", 1], ["rejected", 1], ["outdated", 2], ["approved-other-unit", 3],
].map(([id, unitNumber], i) => ({ id, unitNumber, number: i + 2, unit: `Tema ${unitNumber}`, title: id, objective: `Objetivo ${id}` }));
let reviews = [
  { lesson_id: "approved", revision: "current", status: "approved" },
  { lesson_id: "rejected", revision: "current", status: "rejected", note: "Corrigir áudio" },
  { lesson_id: "outdated", revision: "previous", status: "approved" },
  { lesson_id: "approved-other-unit", revision: "current", status: "approved" },
];
let databaseDown = false;
const currentRevisions = new Map(drafts.map((item) => [item.id, "current"]));
const page = load("src/app/(app)/professor/aulas/page.tsx", {
  "next/link": { default: ({ prefetch, children, ...props }) => React.createElement("a", props, children) },
  "@/data/lesson": { LESSONS: {
    pilot: { slug: "apresentando-se", title: "Primeiro encontro" },
    legacy: { slug: "legacy", title: "Conteúdo anterior" },
  } },
  "@/data/a1Drafts": { A1_DRAFTS: drafts },
  "@/lib/lesson-reviews-server": {
    loadLessonReviews: async () => { if (databaseDown) throw Error("offline"); return reviews; },
    lessonRevision: (lesson) => currentRevisions.get(lesson.id),
  },
  "@/lib/lesson-review-types": load("src/lib/lesson-review-types.ts"),
}).default;
async function render(status) { return renderToStaticMarkup(await page({ searchParams: Promise.resolve({ status }) })); }
function containsLesson(html, id) { return html.includes(`href="/professor/aulas/${id}"`); }
(async () => {
  let html = await render();
  for (const id of ["pending", "rejected", "outdated"]) assert(containsLesson(html, id));
  for (const id of ["approved", "approved-other-unit", "apresentando-se"]) assert(!containsLesson(html, id));
  assert(html.includes("Pendentes (3)")); assert(html.includes("Aprovadas (3)"));
  assert(html.includes("Corrigir áudio")); assert(!html.includes('id="unidade-3"'));
  html = await render("aprovadas");
  for (const id of ["approved", "approved-other-unit", "apresentando-se"]) assert(containsLesson(html, id));
  for (const id of ["pending", "rejected", "outdated"]) assert(!containsLesson(html, id));
  assert(!html.includes('id="unidade-2"')); assert(html.includes("Consultar aula →"));
  assert((await render("invalid")).includes("Pendentes (3)"));
  // A saved approval removes the lesson from the next queue render.
  reviews.push({ lesson_id: "pending", revision: "current", status: "approved" });
  assert(!containsLesson(await render(), "pending")); assert(containsLesson(await render("aprovadas"), "pending"));
  // A new rejection or a changed revision returns it to the queue.
  reviews.find((item) => item.lesson_id === "pending").status = "rejected";
  assert(containsLesson(await render(), "pending"));
  reviews.find((item) => item.lesson_id === "pending").status = "approved";
  currentRevisions.set("pending", "changed");
  assert(containsLesson(await render(), "pending")); assert(!containsLesson(await render("aprovadas"), "pending"));
  reviews = drafts.map((item) => ({ lesson_id: item.id, revision: currentRevisions.get(item.id), status: "approved" }));
  html = await render();
  assert(html.includes("Nenhuma aula pendente")); assert(html.includes("Pendentes (0)"));
  assert(!html.includes('aria-label="Unidades A1"')); assert(!drafts.some((item) => containsLesson(html, item.id)));
  assert(containsLesson(await render("aprovadas"), "apresentando-se"));
  databaseDown = true; await assert.rejects(() => render(), /offline/);
  console.log("PASS: pending/approved tabs, accurate counts, legacy content separated, empty units hidden, approval removes, rejection/revision restores, empty queue and database failure.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
