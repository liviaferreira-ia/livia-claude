// Trilha do curso (unidades e lições), organizada por nível CEFR (A1-C2).
// Segue o mesmo padrão de `exercises.ts`: nem todo nível tem trilha própria
// ainda — `resolveCourseLevel` cai pro nível populado mais próximo.

import { nearestLevelWithContent, type CefrLevel } from "@/data/placement";

export type LessonStatus = "done" | "now" | "locked";
export type Lesson = { title: string; meta: string; status: LessonStatus; href?: string };
export type UnitStatus = "done" | "current" | "locked";
export type Unit = {
  n: number;
  title: string;
  objective: string;
  status: UnitStatus;
  pct: number;
  lessons: Lesson[];
};
export type Course = { pct: number; units: Unit[] };

const EMPTY_COURSE: Course = { pct: 0, units: [] };

const COURSE_A2: Course = {
  pct: 58,
  units: [
    {
      n: 1,
      title: "Apresentações",
      objective: "Cumprimentar, falar seu nome e de onde você é.",
      status: "done",
      pct: 100,
      lessons: [
        { title: "Olá e tchau", meta: "Vocabulário · 6 min", status: "done" },
        { title: "Verbo to be", meta: "Gramática · 9 min", status: "done" },
        { title: "Diga de onde você é", meta: "Conversa · 7 min", status: "done" },
      ],
    },
    {
      n: 2,
      title: "Rotina diária",
      objective: "Falar sobre horários e atividades do dia a dia.",
      status: "done",
      pct: 100,
      lessons: [
        { title: "Present simple", meta: "Gramática · 10 min", status: "done" },
        { title: "Que horas são?", meta: "Vocabulário · 7 min", status: "done" },
        { title: "Minha rotina", meta: "Escrita · 8 min", status: "done" },
      ],
    },
    {
      n: 3,
      title: "No hotel",
      objective: "Reservar, fazer check-in e pedir informações.",
      status: "current",
      pct: 40,
      lessons: [
        { title: "Vocabulário do hotel", meta: "Vocabulário · 8 min", status: "done" },
        {
          title: "Reservas e check-in",
          meta: "Gramática + prática · 10 min",
          status: "now",
          href: "/aluno/licao",
        },
        { title: "Pedindo informações", meta: "Conversa · 8 min", status: "locked" },
        { title: "Roleplay: check-in", meta: "Voz · 5 min", status: "locked" },
      ],
    },
    {
      n: 4,
      title: "No restaurante",
      objective: "Pedir comida, tirar dúvidas e pagar a conta.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Vocabulário de comida", meta: "Vocabulário · 8 min", status: "locked" },
        { title: "Fazendo um pedido", meta: "Conversa · 9 min", status: "locked" },
        { title: "Roleplay: no restaurante", meta: "Voz · 5 min", status: "locked" },
      ],
    },
  ],
};

const COURSE_C1: Course = {
  pct: 8,
  units: [
    {
      n: 1,
      title: "Opiniões e debate",
      objective: "Argumentar, discordar com educação e defender um ponto de vista.",
      status: "current",
      pct: 25,
      lessons: [
        { title: "Conectivos de argumentação", meta: "Gramática · 10 min", status: "done" },
        {
          title: "Múltipla escolha e completar (C1)",
          meta: "Prática · 12 min",
          status: "now",
          href: "/aluno/praticar",
        },
        { title: "Discordando com tato", meta: "Conversa · 8 min", status: "locked" },
        { title: "Roleplay: debate rápido", meta: "Voz · 6 min", status: "locked" },
      ],
    },
    {
      n: 2,
      title: "Comunicação no trabalho",
      objective: "Negociar prazos, dar feedback e escrever e-mails formais.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Voz passiva em relatórios", meta: "Gramática · 9 min", status: "locked" },
        { title: "E-mails formais", meta: "Escrita · 10 min", status: "locked" },
        { title: "Roleplay: negociação", meta: "Voz · 6 min", status: "locked" },
      ],
    },
    {
      n: 3,
      title: "Nuance e expressões idiomáticas",
      objective: "Usar phrasal verbs, collocations e inversão com naturalidade.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Phrasal verbs no trabalho", meta: "Vocabulário · 9 min", status: "locked" },
        { title: "Inversão para ênfase", meta: "Gramática · 10 min", status: "locked" },
        { title: "Tradução e ordenar frases (C1)", meta: "Prática · 10 min", status: "locked" },
      ],
    },
  ],
};

export const COURSES: Record<CefrLevel, Course> = {
  A1: EMPTY_COURSE,
  A2: COURSE_A2,
  B1: EMPTY_COURSE,
  B2: EMPTY_COURSE,
  C1: COURSE_C1,
  C2: EMPTY_COURSE,
};

export function courseHasContent(level: CefrLevel): boolean {
  return COURSES[level].units.length > 0;
}

/** Nível de trilha a mostrar: o do aluno, ou o mais próximo já populado. */
export function resolveCourseLevel(level: CefrLevel): CefrLevel {
  return nearestLevelWithContent(level, courseHasContent, "A2");
}
