/** Tipos compartilhados (servidor e navegador) do curso em vídeo e do painel da aula — design v2. */

export type CourseItem = {
  id: string; unitNumber: number; unit: string; number: number;
  title: string; objective: string; minutes: string; href: string; poster: string;
  /** Aluno concluiu a aula. Na visão da professora: aula aprovada. */
  done: boolean;
  /** Para alunos, a aula está trancada até concluir a anterior. */
  lockedForStudents: boolean;
  /** Quem está vendo pode abrir (aluno: destravada; equipe: sempre). */
  open: boolean;
};

/** Painel lateral da aula: progresso do curso, aulas por unidade e Anterior/Próxima. */
export type LessonOutline = {
  mode: "student" | "teacher";
  currentId: string;
  progressLabel: string;
  doneLabel: string;
  items: CourseItem[];
  /** Caminho no topo da aula. */
  breadcrumb: { label: string; href?: string }[];
};

/** Soma das durações estimadas ("10–15") de uma lista de aulas, como faixa. */
export function durationRange(items: { minutes: string }[]): string {
  let min = 0, max = 0, known = 0;
  for (const item of items) {
    const parts = item.minutes.split(/[–-]/).map((part) => Number(part.trim())).filter((n) => Number.isFinite(n) && n > 0);
    if (!parts.length) continue;
    known += 1; min += parts[0]; max += parts[parts.length - 1];
  }
  if (!known) return "";
  const fmt = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}` : `${m} min`);
  return min === max ? `~${fmt(min)}` : `${fmt(min)} a ${fmt(max)}`;
}
