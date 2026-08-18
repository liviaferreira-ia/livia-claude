"use client";

import { createClient } from "@/lib/supabase/client";

export type StudentPayment = {
  id: string;
  user_id: string | null;
  asaas_customer_id: string;
  subscription_id: string | null;
  status: string;
  billing_type: string | null;
  value: number;
  net_value: number | null;
  due_date: string | null;
  payment_date: string | null;
  confirmed_date: string | null;
  invoice_url: string | null;
  bank_slip_url: string | null;
  description: string | null;
  updated_at: string;
};

export type PaymentCandidate = {
  id: string;
  asaas_customer_id: string;
  payer_name: string;
  payer_email: string | null;
  payer_phone: string | null;
  status: "pending" | "approved" | "linked" | "ignored";
  linked_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export async function listStudentPayments(): Promise<{ data: StudentPayment[]; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("student_payments")
    .select("*")
    .order("due_date", { ascending: false, nullsFirst: false });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as StudentPayment[], error: null };
}

export async function listPaymentCandidates(): Promise<{ data: PaymentCandidate[]; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("payment_candidates")
    .select("*")
    .eq("status", "pending")
    .order("updated_at", { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as PaymentCandidate[], error: null };
}

export async function resolvePaymentCandidate(values: Record<string, unknown>): Promise<string | null> {
  const res = await fetch("/api/professor/financeiro/pre-cadastros", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const body = await res.json().catch(() => ({}));
  return res.ok ? null : body.error || "Não foi possível resolver o pré-cadastro.";
}
