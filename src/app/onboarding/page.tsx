"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Crest } from "@/components/Crest";
import { createClient } from "@/lib/supabase/client";

type Option = { emoji: string; label: string; desc: string };

const GOALS: Option[] = [
  { emoji: "✈️", label: "Viagem", desc: "Conversar em viagens, hotéis, restaurantes." },
  { emoji: "💼", label: "Trabalho", desc: "Reuniões, e-mails e entrevistas." },
  { emoji: "💬", label: "Conversação", desc: "Falar no dia a dia com mais confiança." },
  { emoji: "🎓", label: "Provas", desc: "Preparar para exames e certificações." },
];

const LEVELS: Option[] = [
  { emoji: "🌱", label: "Iniciante", desc: "Sei pouca coisa (A1–A2)." },
  { emoji: "🌿", label: "Intermediário", desc: "Me viro em conversas simples (A2–B1)." },
  { emoji: "🌳", label: "Avançado", desc: "Falo bem, quero fluência (B2+)." },
];

const TIMES: Option[] = [
  { emoji: "☕", label: "Leve", desc: "~15 min por dia." },
  { emoji: "🔥", label: "Firme", desc: "~30 min por dia." },
  { emoji: "🚀", label: "Intenso", desc: "45 min ou mais por dia." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);

  const total = 4;

  // Pré-preenche o nome com o que foi informado no cadastro da conta.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const n = data.user?.user_metadata?.name;
      if (typeof n === "string" && n) setName(n);
    });
  }, []);

  async function finish() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { onboarded: true, name: name.trim(), goal, level },
    });
    setSaving(false);
    if (error) {
      alert("Não consegui salvar seu perfil agora. Tente de novo em instantes.");
      return;
    }
    router.push("/bem-vindo");
  }

  const canAdvance =
    (step === 0 && name.trim().length > 1) ||
    (step === 1 && goal) ||
    (step === 2 && level) ||
    (step === 3 && time);

  return (
    <div className="ob-wrap">
      <div className="ob-card">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <Crest size={56} />
        </div>

        <div className="ob-steps">
          {Array.from({ length: total }).map((_, i) => (
            <i key={i} className={i <= step ? "on" : ""} />
          ))}
        </div>

        {step === 0 && (
          <>
            <h2 style={{ fontSize: 21, textAlign: "center" }}>Bem-vinda à Central School! 🎓</h2>
            <p className="muted" style={{ fontSize: 14, textAlign: "center", margin: "6px 0 20px" }}>
              Vamos criar o seu perfil. Como podemos te chamar?
            </p>
            <div className="field">
              <label htmlFor="nome">Seu nome</label>
              <input
                id="nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu primeiro nome"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && canAdvance && setStep(1)}
              />
            </div>
          </>
        )}

        {step === 1 && (
          <StepOptions
            title={`Qual é o seu objetivo, ${name.split(" ")[0]}?`}
            subtitle="Isso ajuda a IA a escolher os temas e as práticas certas para você."
            options={GOALS}
            selected={goal}
            onSelect={setGoal}
          />
        )}

        {step === 2 && (
          <StepOptions
            title="Como você avalia seu inglês hoje?"
            subtitle="Sem estresse — vamos ajustar isso conforme você pratica."
            options={LEVELS}
            selected={level}
            onSelect={setLevel}
          />
        )}

        {step === 3 && (
          <StepOptions
            title="Quanto tempo por semana você quer estudar?"
            subtitle="Vamos montar sua meta e a missão diária com base nisso."
            options={TIMES}
            selected={time}
            onSelect={setTime}
          />
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
          {step > 0 ? (
            <button className="btn ghost" onClick={() => setStep((s) => s - 1)}>
              ← Voltar
            </button>
          ) : (
            <button className="btn ghost" onClick={() => router.back()}>
              ← Voltar
            </button>
          )}
          {step < total - 1 ? (
            <button
              className="btn primary"
              style={{ flex: 1, opacity: canAdvance ? 1 : 0.5 }}
              disabled={!canAdvance}
              onClick={() => setStep((s) => s + 1)}
            >
              Continuar →
            </button>
          ) : (
            <button
              className="btn primary"
              style={{ flex: 1, opacity: canAdvance && !saving ? 1 : 0.5 }}
              disabled={!canAdvance || saving}
              onClick={finish}
            >
              {saving ? "Salvando…" : "Começar a estudar →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepOptions({
  title,
  subtitle,
  options,
  selected,
  onSelect,
}: {
  title: string;
  subtitle: string;
  options: Option[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <>
      <h2 style={{ fontSize: 21, textAlign: "center" }}>{title}</h2>
      <p className="muted" style={{ fontSize: 14, textAlign: "center", margin: "6px 0 20px" }}>
        {subtitle}
      </p>
      {options.map((opt) => (
        <button
          key={opt.label}
          className={`ob-opt${selected === opt.label ? " sel" : ""}`}
          onClick={() => onSelect(opt.label)}
        >
          <span className="emoji">{opt.emoji}</span>
          <span>
            <b>{opt.label}</b>
            <span>{opt.desc}</span>
          </span>
        </button>
      ))}
    </>
  );
}
