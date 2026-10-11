import "server-only";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { A1_DRAFTS, type A1Draft } from "@/data/a1Drafts";
import { createClient } from "@/lib/supabase/server";
import { reviewStatus, type LessonReview } from "./lesson-review-types";

const revisions = new Map<string, string>();
export function lessonRevision(lesson: A1Draft) {
  const cached = revisions.get(lesson.id);
  if (cached) return cached;
  const hash = createHash("sha256").update(JSON.stringify(lesson));
  for (const file of ["conversa.mp4", "sua-vez.mp4", "poster.png", "dialogue.vtt", "practice.vtt"]) {
    hash.update(readFileSync(path.join(process.cwd(), "lesson-media", "a1-drafts", lesson.id, "v1", file)));
  }
  const revision = hash.digest("hex");
  revisions.set(lesson.id, revision);
  return revision;
}

export async function loadLessonReviews() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("lesson_reviews").select("*");
  if (error) throw new Error("Não foi possível carregar as decisões das aulas. Tente novamente.");
  return (data ?? []) as LessonReview[];
}

export async function publishedLessons() {
  const reviews = await loadLessonReviews();
  return A1_DRAFTS.filter((lesson) => reviews.some((review) => review.lesson_id === lesson.id && reviewStatus(review, lessonRevision(lesson)) === "approved"));
}

export async function isLessonPublished(lesson: A1Draft) {
  const reviews = await loadLessonReviews();
  return reviewStatus(reviews.find((review) => review.lesson_id === lesson.id), lessonRevision(lesson)) === "approved";
}
