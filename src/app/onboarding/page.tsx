"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Crest } from "@/components/Crest";
import { PlacementTest } from "@/components/PlacementTest";
import { createClient } from "@/lib/supabase/client";
import { chosenName } from "@/lib/display-name";
import { billingContactError, formatCpf, formatPhone, isValidCpf, isValidPhone } from "@/lib/billing-contact";

type Option = { emoji: string; label: string; desc: string };

const GOALS: Option[] = [
  { emoji: "✈️", label: "Viagem", desc: "Conversar em viagens, hotéis, restaurantes." },
  { emoji: "💼", label: "Trabalho", desc: "Reuniões, e-mails e entrevistas." },
  { emoji: "💬", label: "Conversação", desc: "Falar no dia a dia com mais confiança." },
  { emoji: "🎓", label: "Provas", desc: "Preparar para exames e certificações." },
];

const TIMES: Option[] = [
  { emoji: "☕", label: "Leve", desc: "~15 min por dia." },
  { emoji: "🔥", label: "Firme", desc: "~30 min por dia." },
  { emoji: "🚀", label: "Intenso", desc: "45 min ou mais por dia." },
];

/** Traduz a intensidade escolhida em meta semanal (dias/semana), o único campo que a plataforma já usa pra acompanhar frequência. */
const WEEKLY_GOAL_BY_TIME: Record<string, number> = { Leve: 3, Firme: 5, Intenso: 6 };

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  // Teste grátis sem WhatsApp/CPF (ex.: entrou pelo Google): pede os dois no primeiro passo.
  const [needBilling, setNeedBilling] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [cpf, setCpf] = useState("");
  const [billingError, setBillingError] = useState("");

  const total = 4;

  // Pré-preenche o nome com o que foi informado no cadastro da conta.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const n = chosenName(data.user?.user_metadata);
      if (n) setName(n);
      const uid = data.user?.id;
      if (!uid) return;
      Promise.all([
        supabase.from("student_trials").select("student_id").eq("student_id", uid).maybeSingle(),
        supabase.from("student_activity").select("whatsapp, cpf").eq("user_id", uid).maybeSingle(),
      ]).then(([trial, activity]) => {
        if (!trial.data) return;
        if (activity.data?.whatsapp) setWhatsapp(formatPhone(activity.data.whatsapp));
        if (!activity.data?.cpf || !activity.data?.whatsapp) setNeedBilling(true);
      });
    });
  }, []);

  async function finish() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { onboarded: true, name: name.trim(), display_name: name.trim(), goal, level },
    });
    if (error) {
      setSaving(false);
      alert("Não consegui salvar seu perfil agora. Tente de novo em instantes.");
      return;
    }
    try {
      await fetch("/api/aluno/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekly_goal: WEEKLY_GOAL_BY_TIME[time] ?? 3 }),
      });
    } catch {
      // Meta semanal é só uma preferência inicial (o professor pode ajustar depois) — não trava o onboarding se isso falhar.
    }
    setSaving(false);
    router.push("/bem-vindo");
  }

  async function nextFromName() {
    if (!needBilling) return setStep(1);
    setBillingError("");
    setSaving(true);
    const { error } = await createClient().rpc("save_billing_contact", { p_whatsapp: whatsapp, p_cpf: cpf });
    setSaving(false);
    if (error) return setBillingError(billingContactError(error.message));
    setNeedBilling(false);
    setStep(1);
  }

  const canAdvance =
    (step === 0 && name.trim().length > 1 && (!needBilling || (isValidPhone(whatsapp) && isValidCpf(cpf)))) ||
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
                onKeyDown={(e) => e.key === "Enter" && canAdvance && !needBilling && setStep(1)}
              />
            </div>
            {needBilling && (
              <>
                <div className="field">
                  <label htmlFor="ob-whatsapp">WhatsApp</label>
                  <input id="ob-whatsapp" type="tel" inputMode="numeric" value={whatsapp} onChange={(e) => setWhatsapp(formatPhone(e.target.value))} autoComplete="tel-national" placeholder="(11) 98765-4321" />
                </div>
                <div className="field">
                  <label htmlFor="ob-cpf">CPF</label>
                  <input id="ob-cpf" inputMode="numeric" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} placeholder="000.000.000-00" />
                  <small className="muted">Usado só para o cadastro e a cobrança, se você decidir continuar depois do teste.</small>
                </div>
                {cpf.length === 14 && !isValidCpf(cpf) && <p className="auth-msg err" role="alert">Confira o CPF: os números não conferem.</p>}
                {billingError && <p className="auth-msg err" role="alert">{billingError}</p>}
              </>
            )}
          </>
        )}

        {step === 1 && (
          <StepOptions
            title={`Qual é o seu objetivo, ${name.split(" ")[0]}?`}
            subtitle="Isso ajuda a plataforma e seus professores a escolher os temas e as práticas certas para você."
            options={GOALS}
            selected={goal}
            onSelect={setGoal}
          />
        )}

        {step === 2 && <PlacementTest value={level} onComplete={setLevel} />}

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
              disabled={!canAdvance || saving}
              onClick={() => (step === 0 ? nextFromName() : setStep((s) => s + 1))}
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
