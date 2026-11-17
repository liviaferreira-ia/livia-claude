"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { markSessionActivity } from "@/lib/sessionActivity";

/**
 * Passagem depois do login com Google: marca a atividade da sessão (senão um registro antigo
 * no navegador podia deslogar na hora) e leva cada pessoa ao lugar certo, como o login por senha:
 * equipe → aulas para revisar; conta nova → diagnóstico de entrada; aluno → início.
 */
export default function EntrarComGoogle() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?error=google");
        return;
      }
      markSessionActivity(user.id);
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      const destination = profile?.role === "teacher" || profile?.role === "admin"
        ? "/professor/aulas"
        : user.user_metadata?.onboarded === true ? "/aluno" : "/onboarding";
      router.replace(destination);
      router.refresh();
    })();
  }, [router]);

  return (
    <div className="login-wrap">
      <p className="muted" style={{ textAlign: "center" }}>Entrando…</p>
    </div>
  );
}
