"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LESSONS_BY_LEVEL, resolveLessonLevel } from "@/data/lesson";
import { parseCefrLevel, useProfile } from "@/lib/profile";

/** O item "Minha lição" do menu leva pra lição do nível do aluno. */
export default function LicaoIndex() {
  const { profile, ready } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const level = resolveLessonLevel(parseCefrLevel(profile.level) ?? "A2");
    router.replace(`/aluno/licao/${LESSONS_BY_LEVEL[level][0]}`);
  }, [ready, profile.level, router]);

  return (
    <div className="view">
      <p className="muted">Abrindo sua lição…</p>
    </div>
  );
}
