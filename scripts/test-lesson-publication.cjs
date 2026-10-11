const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
function load(file, mocks) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, Request, Response, Headers, Uint8Array, process, require(name) { if (name in mocks) return mocks[name]; throw new Error(name); } });
  return exports;
}
const id = "a1-u01-l02-como-voce-esta", revision = "a".repeat(64);
let permission = 200, published = false, databaseDown = false, reads = 0, rpcCalls = 0, rpcError = null, rpcArray = true;
const bytes = Buffer.from("0123456789");
const media = load("src/lib/lesson-media-server.ts", { "server-only": {}, "node:fs/promises": { readFile: async () => { reads++; return bytes; } }, "node:path": { default: path }, "@/data/a1Drafts": { A1_DRAFTS: [{ id }] } });
const staff = { requireStaff: async () => permission === 200 ? { user: { id: "teacher" }, supabase: { rpc: async () => { rpcCalls++; const review = { lesson_id: id, revision, status: "approved", updated_at: "2026-10-10T23:00:00Z" }; return { data: rpcArray ? [review] : review, error: rpcError }; } } } : { error: new Response(null, { status: permission }) } };
const teacherMedia = load("src/app/(app)/professor/aulas/midia/[id]/[file]/route.ts", { "@/lib/staff-server": staff, "@/lib/lesson-media-server": media });
const studentMedia = load("src/app/(app)/aluno/aulas/midia/[id]/[file]/route.ts", { "@/data/a1Drafts": { A1_DRAFTS: [{ id }] }, "@/lib/supabase/server": { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: permission === 401 ? null : { id: "student" } } }) } }) }, "@/lib/lesson-reviews-server": { isLessonPublished: async () => { if (databaseDown) throw Error("offline"); return published; } }, "@/lib/lesson-media-server": media });
const api = load("src/app/api/professor/aulas/[id]/revisao/route.ts", { "next/server": { NextResponse: Response }, "@/data/a1Drafts": { A1_DRAFTS: [{ id }] }, "@/lib/staff-server": staff, "@/lib/lesson-reviews-server": { lessonRevision: () => revision } });
const statuses = load("src/lib/lesson-review-types.ts", {});
async function video(handler, file = "conversa.mp4", range, identifier = id) { return handler.GET(new Request("https://example.com/video", { headers: range ? { range } : {} }), { params: Promise.resolve({ id: identifier, file }) }); }
async function decide(body = { status: "approved", revision, expectedUpdatedAt: null }, identifier = id) { return api.POST(new Request("https://example.com/review", { method: "POST", body: JSON.stringify(body) }), { params: Promise.resolve({ id: identifier }) }); }
(async () => {
  for (const code of [401, 403]) { permission = code; assert.equal((await video(teacherMedia)).status, code); assert.equal((await decide()).status, code); }
  permission = 401; assert.equal((await video(studentMedia)).status, 401); assert.equal(reads, 0); assert.equal(rpcCalls, 0);
  permission = 200; assert.equal((await video(studentMedia)).status, 404); assert.equal(reads, 0);
  published = true; let response = await video(studentMedia, "conversa.mp4", "bytes=2-4"); assert.equal(response.status, 206); assert.equal(await response.text(), "234"); assert.equal(response.headers.get("cache-control"), "private, no-store");
  published = false; const before = reads; assert.equal((await video(studentMedia)).status, 404); assert.equal(reads, before);
  databaseDown = true; assert.equal((await video(studentMedia)).status, 503); assert.equal(reads, before); databaseDown = false;
  assert.equal((await video(teacherMedia)).status, 200); // Teachers can review rejected/pending media.
  assert.equal((await video(teacherMedia, "../.env")).status, 404); assert.equal((await video(teacherMedia, "poster.png", undefined, "../../private")).status, 404);
  for (const range of ["bytes=10-", "bytes=4-2", "bytes=-0", "bytes=1-2,4-5", "invalid"]) assert.equal((await video(teacherMedia, "conversa.mp4", range)).status, 416);
  assert.equal(await (await video(teacherMedia, "sua-vez.mp4", "bytes=-3")).text(), "789"); assert.equal(await (await video(teacherMedia, "sua-vez.mp4", "bytes=8-")).text(), "89");
  const valid = { status: "approved", revision, expectedUpdatedAt: null };
  for (const invalid of [{ ...valid, status: "unknown" }, { ...valid, expectedUpdatedAt: "bad" }, { ...valid, expectedUpdatedAt: undefined }, { ...valid, status: "rejected", note: "  " }, { ...valid, status: "rejected", note: "x".repeat(2001) }]) assert.equal((await decide(invalid)).status, 400);
  assert.equal(rpcCalls, 0); assert.equal((await decide({ ...valid, revision: "old" })).status, 409); assert.equal((await decide(valid, "unknown")).status, 404);
  response = await decide(); assert.equal(response.status, 200); assert.equal((await response.json()).review.lesson_id, id);
  rpcArray = false; assert.equal((await decide()).status, 200);
  rpcError = { code: "40001" }; assert.equal((await decide()).status, 409); rpcError = { code: "database_down" }; assert.equal((await decide()).status, 500);
  assert.equal(statuses.reviewStatus(null, revision), "pending"); assert.equal(statuses.reviewStatus({ status: "approved", revision: "old" }, revision), "outdated"); assert.equal(statuses.reviewStatus({ status: "rejected", revision }, revision), "rejected");
  console.log("PASS: review authorization/validation, stale revision/decision, RPC response formats, student approval gate, withdrawal, database failure, teacher preview, ranges and path protection.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
