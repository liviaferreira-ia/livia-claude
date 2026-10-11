export type LessonReview = {
  lesson_id: string;
  revision: string;
  status: "approved" | "rejected";
  note: string | null;
  reviewed_by: string | null;
  updated_at: string;
};
export type ReviewStatus = "pending" | "approved" | "rejected" | "outdated";
export const REVIEW_LABELS: Record<ReviewStatus, string> = {
  pending: "Pendente de revisão", approved: "Aprovada e publicada",
  rejected: "Reprovada · corrigir", outdated: "Conteúdo alterado · revisar novamente",
};
export function reviewStatus(review: LessonReview | null | undefined, revision: string): ReviewStatus {
  if (!review) return "pending";
  if (review.revision !== revision) return "outdated";
  return review.status;
}
