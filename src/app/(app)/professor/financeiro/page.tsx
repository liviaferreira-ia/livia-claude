"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { listStudentActivity, type StudentActivity } from "@/lib/activity";
import { listStudentPayments, type StudentPayment } from "@/lib/finance";
import { initials, useProfile } from "@/lib/profile";

const PAID = new Set(["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH", "DUNNING_RECEIVED"]);
const PENDING = new Set(["PENDING", "AWAITING_RISK_ANALYSIS"]);

function money(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

function dateLabel(value: string | null): string {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function statusInfo(status: string | null) {
  if (status === "OVERDUE") return { label: "Em atraso", cls: "bad", key: "overdue" };
  if (status && PAID.has(status)) return { label: "Pago", cls: "ok", key: "paid" };
  if (status && PENDING.has(status)) return { label: "Aguardando", cls: "att", key: "pending" };
  if (status === "REFUNDED" || status === "REFUND_REQUESTED") {
    return { label: "Estornado", cls: "att", key: "other" };
  }
  if (status === "DELETED") return { label: "Cancelado", cls: "att", key: "other" };
  return { label: status ? status.replaceAll("_", " ") : "Sem cobrança", cls: "att", key: "unlinked" };
}

function currentPayment(payments: StudentPayment[]): StudentPayment | null {
  const overdue = payments
    .filter((p) => p.status === "OVERDUE")
    .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""));
  if (overdue[0]) return overdue[0];
  const pending = payments
    .filter((p) => PENDING.has(p.status))
    .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"));
  return pending[0] ?? null;
}

function lastPaid(payments: StudentPayment[]): StudentPayment | null {
  return (
    payments
      .filter((p) => PAID.has(p.status))
      .sort((a, b) => (b.payment_date ?? b.confirmed_date ?? "").localeCompare(a.payment_date ?? a.confirmed_date ?? ""))[0] ??
    null
  );
}

export default function ProfessorFinanceiroPage() {
  const { ready, isTeacher } = useProfile();
  const [students, setStudents] = useState<StudentActivity[]>([]);
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const load = useCallback(async () => {
    const [studentResult, paymentResult] = await Promise.all([listStudentActivity(), listStudentPayments()]);
    setStudents(studentResult.data);
    setPayments(paymentResult.data);
    setError(studentResult.error || paymentResult.error || "");
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!ready || !isTeacher) return;
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [ready, isTeacher, load]);

  const grouped = useMemo(() => {
    const result = new Map<string, StudentPayment[]>();
    for (const payment of payments) {
      if (!payment.user_id) continue;
      const current = result.get(payment.user_id) ?? [];
      current.push(payment);
      result.set(payment.user_id, current);
    }
    return result;
  }, [payments]);

  const rows = useMemo(() => {
    return students.map((student) => {
      const history = grouped.get(student.user_id) ?? [];
      const current = currentPayment(history);
      const paid = lastPaid(history);
      const info = statusInfo(current?.status ?? (paid ? "RECEIVED" : null));
      const linked = Boolean(student.asaas_customer_id);
      return { student, history, current, paid, info: linked ? info : statusInfo(null) };
    });
  }, [students, grouped]);

  const filtered = rows.filter(({ student, info }) => {
    const matchesQuery = (student.student_name ?? "").toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (filter === "all" || info.key === filter);
  });

  const month = new Date().toISOString().slice(0, 7);
  const receivedThisMonth = payments
    .filter((p) => PAID.has(p.status) && (p.payment_date ?? p.confirmed_date ?? "").startsWith(month))
    .reduce((sum, p) => sum + Number(p.value), 0);
  const overdueStudents = rows.filter((r) => r.info.key === "overdue").length;
  const pendingPayments = payments.filter((p) => PENDING.has(p.status)).length;
  const linkedStudents = students.filter((s) => s.asaas_customer_id).length;
  const selectedRow = rows.find((r) => r.student.user_id === selected) ?? null;

  async function synchronize() {
    setSyncing(true);
    setSyncMessage("");
    try {
      const res = await fetch("/api/professor/financeiro/sincronizar", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Não foi possível sincronizar.");
      setSyncMessage(`${body.payments} cobranças de ${body.students} alunos sincronizadas.`);
      await load();
    } catch (err) {
      setSyncMessage(err instanceof Error ? err.message : "Falha de conexão.");
    } finally {
      setSyncing(false);
    }
  }

  if (!ready || loading) return <div className="view"><p className="muted">Carregando financeiro…</p></div>;
  if (!isTeacher) {
    return (
      <div className="view">
        <div className="hero" style={{ maxWidth: 560 }}>
          <div className="eyebrow">Acesso restrito</div>
          <h2>Esta área é do professor</h2>
          <Link href="/aluno" className="btn light">Voltar para a área do aluno →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="view">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Painel do professor</div>
          <h2 style={{ fontSize: 22, marginBottom: 4 }}>Financeiro</h2>
          <p className="muted" style={{ margin: 0 }}>Mensalidades, vencimentos e histórico de pagamentos dos alunos.</p>
        </div>
        <button className="btn primary" onClick={synchronize} disabled={syncing} style={{ opacity: syncing ? 0.6 : 1 }}>
          {syncing ? "Sincronizando…" : "↻ Sincronizar Asaas"}
        </button>
      </div>

      {syncMessage && <p className="est-note" style={{ marginTop: 10 }}>{syncMessage}</p>}
      {error && <div className="card" style={{ padding: 16, marginTop: 18 }}><p className="muted" style={{ margin: 0 }}>Não consegui carregar: {error}</p></div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, margin: "24px 0" }}>
        {[
          [money(receivedThisMonth), "Recebido neste mês"],
          [String(pendingPayments), "Cobranças a vencer"],
          [String(overdueStudents), "Alunos em atraso"],
          [`${linkedStudents}/${students.length}`, "Alunos vinculados ao Asaas"],
        ].map(([value, label]) => (
          <div className="card stat" key={label} style={{ padding: 18 }}>
            <b style={{ display: "block", fontSize: 23 }}>{value}</b>
            <span className="muted" style={{ fontSize: 12.5 }}>{label}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 14, marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input
          aria-label="Buscar aluno"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar aluno…"
          style={{ flex: "1 1 240px" }}
        />
        <select aria-label="Filtrar situação" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ minWidth: 180 }}>
          <option value="all">Todas as situações</option>
          <option value="overdue">Em atraso</option>
          <option value="pending">Aguardando</option>
          <option value="paid">Pago</option>
          <option value="unlinked">Sem cobrança</option>
        </select>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
          <thead>
            <tr style={{ color: "var(--ink-faint)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em" }}>
              {['Aluno', 'Situação', 'Valor', 'Vencimento', 'Último pagamento', 'Ações'].map((label) => (
                <th key={label} style={{ padding: "14px 16px", textAlign: "left", borderBottom: "1px solid var(--line)" }}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ student, history, current, paid, info }) => {
              const name = student.student_name || "Aluno(a)";
              return (
                <tr key={student.user_id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: 16 }}>
                    <span className="std">
                      <span className="mini-av" style={{ background: "linear-gradient(135deg,#274a7d,#16263f)" }}>{initials(name)}</span>
                      <span><b style={{ display: "block", fontSize: 14 }}>{name}</b><span className="muted" style={{ fontSize: 12 }}>{history.length} cobranças</span></span>
                    </span>
                  </td>
                  <td style={{ padding: 16 }}><span className={`flag ${info.cls}`}>{info.label}</span></td>
                  <td style={{ padding: 16, fontWeight: 700 }}>{current ? money(Number(current.value)) : "—"}</td>
                  <td style={{ padding: 16 }}>{dateLabel(current?.due_date ?? null)}</td>
                  <td style={{ padding: 16 }}>{paid ? dateLabel(paid.payment_date ?? paid.confirmed_date) : "—"}</td>
                  <td style={{ padding: 16 }}>
                    <button className="btn light" style={{ padding: "8px 12px" }} onClick={() => setSelected(student.user_id)}>Ver histórico</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="muted" style={{ padding: 20, margin: 0 }}>Nenhum aluno encontrado.</p>}
      </div>

      {selectedRow && (
        <div className="card" style={{ padding: 20, marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <div><div className="eyebrow">Histórico financeiro</div><h3 style={{ margin: "5px 0 0" }}>{selectedRow.student.student_name || "Aluno(a)"}</h3></div>
            <button className="btn light" onClick={() => setSelected(null)}>Fechar</button>
          </div>
          {selectedRow.history.length === 0 ? (
            <p className="muted">Este aluno ainda não possui cobranças sincronizadas.</p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 14 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
                <thead><tr>{['Vencimento', 'Pagamento', 'Valor', 'Forma', 'Status', 'Cobrança'].map((x) => <th key={x} style={{ padding: 10, textAlign: "left", borderBottom: "1px solid var(--line)", fontSize: 12 }}>{x}</th>)}</tr></thead>
                <tbody>{selectedRow.history.map((payment) => {
                  const info = statusInfo(payment.status);
                  return <tr key={payment.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: 10 }}>{dateLabel(payment.due_date)}</td>
                    <td style={{ padding: 10 }}>{dateLabel(payment.payment_date ?? payment.confirmed_date)}</td>
                    <td style={{ padding: 10 }}>{money(Number(payment.value))}</td>
                    <td style={{ padding: 10 }}>{payment.billing_type?.replaceAll("_", " ") ?? "—"}</td>
                    <td style={{ padding: 10 }}><span className={`flag ${info.cls}`}>{info.label}</span></td>
                    <td style={{ padding: 10 }}>{payment.invoice_url ? <a href={payment.invoice_url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700 }}>Abrir ↗</a> : "—"}</td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
