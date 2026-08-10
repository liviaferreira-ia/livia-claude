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

const COURSE_A1: Course = {
  pct: 8,
  units: [
    {
      n: 1,
      title: "Primeiros passos",
      objective: "Apresentar-se e usar o verbo to be.",
      status: "current",
      pct: 25,
      lessons: [
        { title: "Verbo to be (am/is/are)", meta: "Gramática · 8 min", status: "done" },
        {
          title: "Múltipla escolha e completar (A1)",
          meta: "Prática · 10 min",
          status: "now",
          href: "/aluno/praticar",
        },
        { title: "Se apresentando", meta: "Conversa · 6 min", status: "locked" },
        { title: "Roleplay: primeiro encontro", meta: "Voz · 5 min", status: "locked" },
      ],
    },
    {
      n: 2,
      title: "Minha família",
      objective: "Falar sobre a família usando possessivos e have/has.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Possessivos (my, your, his...)", meta: "Gramática · 7 min", status: "locked" },
        { title: "have / has", meta: "Gramática · 7 min", status: "locked" },
        { title: "Roleplay: apresentando a família", meta: "Voz · 5 min", status: "locked" },
      ],
    },
    {
      n: 3,
      title: "Números e rotina simples",
      objective: "Usar números, idade e frases afirmativas/negativas simples.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Números e idade", meta: "Vocabulário · 6 min", status: "locked" },
        { title: "Frases afirmativas e negativas", meta: "Gramática · 7 min", status: "locked" },
        { title: "Tradução e ordenar frases (A1)", meta: "Prática · 8 min", status: "locked" },
      ],
    },
  ],
};

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

const COURSE_B1: Course = {
  pct: 8,
  units: [
    {
      n: 1,
      title: "Experiências de vida",
      objective: "Falar sobre experiências e vivências usando present perfect.",
      status: "current",
      pct: 25,
      lessons: [
        { title: "Present perfect x passado simples", meta: "Gramática · 10 min", status: "done" },
        {
          title: "Múltipla escolha e completar (B1)",
          meta: "Prática · 12 min",
          status: "now",
          href: "/aluno/praticar",
        },
        { title: "Contando uma experiência", meta: "Conversa · 8 min", status: "locked" },
        { title: "Roleplay: entrevista de experiências", meta: "Voz · 6 min", status: "locked" },
      ],
    },
    {
      n: 2,
      title: "Planos e hipóteses",
      objective: "Fazer planos, dar conselhos e imaginar situações hipotéticas.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Segunda condicional", meta: "Gramática · 9 min", status: "locked" },
        { title: "Conselhos com should/must", meta: "Gramática · 8 min", status: "locked" },
        { title: "Roleplay: pedindo conselho", meta: "Voz · 6 min", status: "locked" },
      ],
    },
    {
      n: 3,
      title: "Recomendações e opiniões",
      objective: "Usar voz passiva simples, relative clauses e discurso indireto básico.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Voz passiva no dia a dia", meta: "Gramática · 9 min", status: "locked" },
        { title: "Relative clauses (who/which)", meta: "Gramática · 8 min", status: "locked" },
        { title: "Tradução e ordenar frases (B1)", meta: "Prática · 10 min", status: "locked" },
      ],
    },
  ],
};

const COURSE_B2: Course = {
  pct: 8,
  units: [
    {
      n: 1,
      title: "Contando histórias",
      objective: "Narrar eventos e experiências recentes com mais precisão.",
      status: "current",
      pct: 25,
      lessons: [
        { title: "Past perfect x present perfect continuous", meta: "Gramática · 10 min", status: "done" },
        {
          title: "Múltipla escolha e completar (B2)",
          meta: "Prática · 12 min",
          status: "now",
          href: "/aluno/praticar",
        },
        { title: "Contando uma história real", meta: "Conversa · 8 min", status: "locked" },
        { title: "Roleplay: contando o que aconteceu", meta: "Voz · 6 min", status: "locked" },
      ],
    },
    {
      n: 2,
      title: "Resolvendo problemas",
      objective: "Pedir serviços e lidar com imprevistos.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Voz passiva e causativo (have something done)", meta: "Gramática · 9 min", status: "locked" },
        { title: "Especulando com might/could have", meta: "Gramática · 8 min", status: "locked" },
        { title: "Roleplay: reclamação e solução", meta: "Voz · 6 min", status: "locked" },
      ],
    },
    {
      n: 3,
      title: "Conectando ideias com fluência",
      objective: "Usar conectivos, phrasal verbs e comparações elaboradas com naturalidade.",
      status: "locked",
      pct: 0,
      lessons: [
        { title: "Conectivos: although, despite, however", meta: "Gramática · 9 min", status: "locked" },
        { title: "Phrasal verbs do dia a dia", meta: "Vocabulário · 8 min", status: "locked" },
        { title: "Tradução e ordenar frases (B2)", meta: "Prática · 10 min", status: "locked" },
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
  A1: COURSE_A1,
  A2: COURSE_A2,
  B1: COURSE_B1,
  B2: COURSE_B2,
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
