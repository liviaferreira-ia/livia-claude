import { readFile } from "node:fs/promises";
import path from "node:path";
import { A1_DRAFTS } from "@/data/a1Drafts";
import "server-only";

const TYPES: Record<string, string> = {
  "conversa.mp4": "video/mp4", "sua-vez.mp4": "video/mp4",
  "poster.png": "image/png", "dialogue.vtt": "text/vtt; charset=utf-8",
  "practice.vtt": "text/vtt; charset=utf-8",
};

export async function serveLessonMedia(request: Request, id: string, file: string) {
  if (!Object.hasOwn(TYPES, file) || !A1_DRAFTS.some((lesson) => lesson.id === id)) {
    return new Response(null, { status: 404 });
  }
  let bytes: Uint8Array<ArrayBuffer>;
  try {
    bytes = new Uint8Array(await readFile(path.join(process.cwd(), "lesson-media", "a1-drafts", id, "v1", file)));
  } catch {
    return new Response(null, { status: 404 });
  }
  const headers = new Headers({ "Content-Type": TYPES[file], "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
  const size = bytes.byteLength;
  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    let start = 0, end = size - 1;
    if (match && (match[1] || match[2])) {
      start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
      end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    } else start = size;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || start > end) {
      headers.set("Content-Range", `bytes */${size}`);
      return new Response(null, { status: 416, headers });
    }
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    headers.set("Content-Length", String(end - start + 1));
    return new Response(bytes.slice(start, end + 1), { status: 206, headers });
  }
  headers.set("Content-Length", String(size));
  return new Response(bytes, { headers });
}
