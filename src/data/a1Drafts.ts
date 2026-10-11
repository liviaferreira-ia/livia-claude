import "server-only";
import data from "./a1Drafts.json";
import type { LessonMedia } from "./lessonMedia";
export type A1Draft = {
  id: string; title: string; unit: string; unitNumber: number; number: number;
  objective: string; situation: string; minutes: string; prerequisite: string;
  explanation: {title: string; phrases: string[]; text: string}[];
  commonMistake: string;
  questions: {prompt: string; options?: string[]; answer: string; feedback: string; hint?: string}[];
  practice: {en: string; pt: string; hint: string}[];
  application: string; model: string; checklist: string[]; review: string; next: string;
  media: LessonMedia;
};
export const A1_DRAFTS: A1Draft[] = data;
