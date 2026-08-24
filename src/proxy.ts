import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

// Áreas que exigem estar logado.
const PROTECTED = ["/aluno", "/professor", "/bem-vindo", "/onboarding", "/pagamento-pendente", "/continuar"];
// Áreas do aluno onde checamos bloqueio por atraso (a do professor não é afetada).
const STUDENT_AREA = ["/aluno", "/bem-vindo", "/onboarding"];

/** Mantém cookies e cabeçalhos de segurança gerados durante a renovação. */
function redirectWithSession(url: URL, response: NextResponse) {
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = response.headers.get(header);
    if (value) redirect.headers.set(header, value);
  }
  return redirect;
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));

  let user: { id: string } | null = null;
  let invalidSession = false;
  try {
    const { data, error } = await supabase.auth.getClaims();
    const subject = data?.claims?.sub;
    if (!error && typeof subject === "string") user = { id: subject };
    invalidSession = Boolean(error);
  } catch {
    // Sessão corrompida ou Auth temporariamente indisponível não deve virar 500.
    invalidSession = true;
  }

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    if (invalidSession) url.searchParams.set("reason", "sessao_expirada");
    return redirectWithSession(url, response);
  }

  const isTeacherArea = path === "/professor" || path.startsWith("/professor/");
  if (isTeacherArea && user) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!error && profile && profile.role !== "teacher" && profile.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/aluno";
      url.search = "";
      return redirectWithSession(url, response);
    }
  }

  const isStudentArea = STUDENT_AREA.some((p) => path === p || path.startsWith(p + "/"));
  if (isStudentArea && user) {
    // A checagem de bloqueio por atraso não depende do trial, então roda em paralelo
    // em vez de esperar a cadeia do trial terminar (reduz round-trips sequenciais
    // ao Supabase nessa rota, que roda em toda navegação da área do aluno).
    const [{ data: trialRow }, { data: activity }] = await Promise.all([
      supabase.from("student_trials").select("status,ends_at,starts_at").eq("student_id", user.id).maybeSingle(),
      supabase.from("student_activity").select("blocked").eq("user_id", user.id).maybeSingle(),
    ]);

    let trial = trialRow;
    // O relógio do trial começa no primeiro acesso autenticado, nunca no cadastro.
    // A RPC só faz algo quando o trial ainda está "pending" sem starts_at (mesma
    // condição do WHERE dela) - fora disso é sempre um no-op no banco, então só
    // chamamos (e reconsultamos) quando pode haver algo pra ativar. Isso evita um
    // round-trip extra ao Supabase em toda navegação depois da primeira.
    if (trial && trial.status === "pending" && !trial.starts_at) {
      await supabase.rpc("activate_my_trial");
      const { data: refreshed } = await supabase
        .from("student_trials")
        .select("status,ends_at,starts_at")
        .eq("student_id", user.id)
        .maybeSingle();
      trial = refreshed;
    }

    const trialEnded = trial?.ends_at ? new Date(trial.ends_at).getTime() <= Date.now() : false;
    if (trial && trial.status !== "converted" && (trialEnded || trial.status === "expired" || trial.status === "cancelled")) {
      const url = request.nextUrl.clone();
      url.pathname = "/continuar";
      return redirectWithSession(url, response);
    }

    if (activity?.blocked) {
      const url = request.nextUrl.clone();
      url.pathname = "/pagamento-pendente";
      return redirectWithSession(url, response);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
