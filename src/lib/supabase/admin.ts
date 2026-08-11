import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/**
 * Cliente Supabase com a service role key — ignora RLS e tem acesso à Admin API
 * (convidar/criar usuários). NUNCA importar isso de um arquivo "use client".
 * Precisa da variável de ambiente SUPABASE_SERVICE_ROLE_KEY (pega em
 * Supabase → Project Settings → API → service_role secret).
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada no servidor.");
  }
  return createSupabaseClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
