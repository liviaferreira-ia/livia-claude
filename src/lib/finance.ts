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

export async function listStudentPayments(): Promise<{ data: StudentPayment[]; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("student_payments")
    .select("*")
    .order("due_date", { ascending: false, nullsFirst: false });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as StudentPayment[], error: null };
}
