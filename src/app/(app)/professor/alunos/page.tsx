"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  formatDuration,
  formatLastLogin,
  isInactive,
  listStudentActivity,
  practiceTotals,
  type StudentActivity,
} from "@/lib/activity";
import { initials, levelDisplay, useProfile } from "@/lib/profile";

export default function ProfessorAlunosPage() {
  const { ready, isTeacher } = useProfile();
  const [rows, setRows] = useState<StudentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!ready || !isTeacher) return;
    listStudentActivity().then(({ data, error }) => {
      setRows(data);
      setErr(error ?? "");
      setLoading(false);
    });
  }, [ready, isTeacher]);

  if (!ready) {
    return (
      <div className="view">
        <p className="muted">Carregando…</p>
      </div>
    );
  }

  if (!isTeacher) {
    return (
      <div className="view">
        <div className="hero" style={{ maxWidth: 560 }}>
          <div className="eyebrow">Acesso restrito</div>
          <h2>Esta área é do professor</h2>
          <p>Sua conta é de aluno. Se você é professor(a), peça para marcarem sua conta.</p>
          <Link href="/aluno" className="btn light">
            Voltar para a área do aluno →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="view">
      <div className="eyebrow" style={{ marginBottom: 8 }}>
        Painel do professor
      </div>
      <h2 style={{ fontSize: 22, marginBottom: 4 }}>Alunos</h2>
      <p className="muted" style={{ margin: "0 0 20px" }}>
        Último login, tempo médio na plataforma e progresso em prática de cada aluno.
      </p>

      {loading ? (
        <p className="muted">Carregando alunos…</p>
      ) : err ? (
        <div className="card" style={{ padding: 16 }}>
          <p className="muted" style={{ margin: 0 }}>Não consegui carregar os dados: {err}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="card" style={{ padding: 16 }}>
          <p className="muted" style={{ margin: 0 }}>
            Nenhum aluno logou ainda. Assim que alguém entrar na plataforma, aparece aqui.
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div
            className="rosterrow"
            style={{
              borderTop: "none",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--ink-faint)",
            }}
          >
            <span>Aluno</span>
            <span>Último login</span>
            <span>Tempo médio · exercícios</span>
            <span>Status</span>
          </div>
          {rows.map((r) => {
            const totals = practiceTotals(r);
            const avgSeconds = r.session_count > 0 ? r.total_seconds / r.session_count : 0;
            const needsAttention = totals.done === 0 || isInactive(r.last_login_at);
            const name = r.student_name || "Aluno(a)";
            return (
              <div key={r.user_id} className="rosterrow">
                <span className="std">
                  <span className="mini-av" style={{ background: "linear-gradient(135deg,#274a7d,#16263f)" }}>
                    {initials(name)}
                  </span>
                  <span>
                    <b style={{ display: "block", fontSize: 14 }}>{name}</b>
                    <span className="muted" style={{ fontSize: 12.5 }}>
                      {r.level ? levelDisplay(r.level) : "Nível não informado"}
                    </span>
                  </span>
                </span>
                <span style={{ fontSize: 13.5 }}>{formatLastLogin(r.last_login_at)}</span>
                <span style={{ fontSize: 13.5 }}>
                  {formatDuration(avgSeconds)} / sessão
                  <br />
                  <span className="muted" style={{ fontSize: 12.5 }}>
                    {totals.done} exercícios · {totals.pct}% de acerto
                  </span>
                </span>
                <span className={`flag ${needsAttention ? "att" : "ok"}`}>
                  {needsAttention ? "Atenção" : "Em dia"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
