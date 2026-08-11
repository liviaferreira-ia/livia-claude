import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

// Áreas que exigem estar logado.
const PROTECTED = ["/aluno", "/professor", "/bem-vindo", "/onboarding", "/pagamento-pendente"];
// Áreas do aluno onde checamos bloqueio por atraso (a do professor não é afetada).
const STUDENT_AREA = ["/aluno", "/bem-vindo", "/onboarding"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  const isStudentArea = STUDENT_AREA.some((p) => path === p || path.startsWith(p + "/"));
  if (isStudentArea && user) {
    const { data: activity } = await supabase
      .from("student_activity")
      .select("blocked")
      .eq("user_id", user.id)
      .maybeSingle();
    if (activity?.blocked) {
      const url = request.nextUrl.clone();
      url.pathname = "/pagamento-pendente";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
