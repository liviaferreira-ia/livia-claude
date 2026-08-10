"use client";

import { useState } from "react";

const skills = [
  { label: "Fala", pct: 58, val: "média" },
  { label: "Gramática", pct: 52, val: "média" },
  { label: "Pronúncia", pct: 44, val: "baixa", warn: true },
];

export default function ProfessorAlunaPage() {
  const [note, setNote] = useState("");
  const [rated, setRated] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <div className="view">
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <span className="avatar" style={{ width: 52, height: 52, fontSize: 19 }}>MS</span>
        <div>
          <h2 style={{ fontSize: 22 }}>Marina Souza</h2>
          <div className="muted" style={{ fontSize: 13.5 }}>
            Nível A2 · foco em viagem · estuda 4 dias/semana
          </div>
        </div>
      </div>

      <div className="grid cols-2">
        <div>
          <div className="card stat">
            <div className="eyebrow">Habilidades e confiança</div>
            <div style={{ marginTop: 12 }}>
              {skills.map((s) => (
                <div className="skill-row" key={s.label}>
                  <span className="lbl">{s.label}</span>
                  <span className="track">
                    <i
                      style={{
                        width: `${s.pct}%`,
                        background: s.warn
                          ? "linear-gradient(90deg,var(--warn),var(--gold))"
                          : undefined,
                      }}
                    />
                  </span>
                  <span className="val">{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card stat" style={{ marginTop: 18 }}>
            <div className="eyebrow">Resumo da IA · última prática por voz</div>
            <p style={{ fontSize: 14, margin: "12px 0 8px", lineHeight: 1.55 }}>
              Marina completou o roleplay de <b>check-in no hotel</b>. Comunicou-se
              com clareza, mas trocou o passado simples (<i>&quot;I go&quot;</i> em vez de{" "}
              <i>&quot;I went&quot;</i>) e o som <b>&quot;th&quot;</b> saiu como &quot;d&quot;.{" "}
              <span className="est-note">· evidência: 3 turnos</span>
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button
                className="pill-btn"
                style={rated === "util" ? { borderColor: "var(--good)", color: "var(--good)" } : undefined}
                onClick={() => setRated("util")}
              >
                👍 Útil
              </button>
              <button
                className="pill-btn"
                style={rated === "incorreto" ? { borderColor: "var(--bad)", color: "var(--bad)" } : undefined}
                onClick={() => setRated("incorreto")}
              >
                👎 Incorreto
              </button>
              {rated && (
                <span className="muted" style={{ fontSize: 12, alignSelf: "center" }}>
                  Obrigado pelo retorno!
                </span>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="card stat">
            <div className="eyebrow">Foco recomendado para a aula</div>
            <ul style={{ margin: "12px 0 0", paddingLeft: 18, fontSize: 14, lineHeight: 1.7 }}>
              <li>Passado simples de verbos irregulares (go, have, do)</li>
              <li>Som &quot;th&quot; — exercício de articulação</li>
              <li>Vocabulário de viagem já dominado ✓</li>
            </ul>
          </div>

          <div className="card stat" style={{ marginTop: 18 }}>
            <div className="eyebrow">Anotações do professor</div>
            <textarea
              value={note}
              onChange={(e) => { setNote(e.target.value); setSaved(false); }}
              placeholder="Ex.: Reforçar 'th' na aula de quinta; Marina responde bem a roleplays…"
              style={{
                width: "100%",
                marginTop: 12,
                border: "1.5px solid var(--line)",
                background: "var(--panel-2)",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 14,
                fontFamily: "inherit",
                color: "var(--ink)",
                resize: "vertical",
                minHeight: 80,
              }}
            />
            <button
              className="btn primary"
              style={{ marginTop: 12, width: "100%" }}
              onClick={() => setSaved(true)}
            >
              {saved ? "Anotação salva ✓" : "Salvar anotação"}
            </button>
            <p className="est-note" style={{ marginTop: 10 }}>
              Suas anotações são privadas e não entram automaticamente no contexto da IA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
