"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  EXERCISES,
  categoriesFor,
  normalize,
  resolveExerciseLevel,
  type Fill,
  type Kind,
  type LevelBank,
  type MC,
  type Order,
  type Translate,
} from "@/data/exercises";
import { parseCefrLevel, useProfile } from "@/lib/profile";

const TINTS: Record<Kind, string> = {
  mc: "tint-navy",
  fill: "tint-gold",
  translate: "tint-navy",
  order: "tint-warn",
};

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PraticarPage() {
  const { profile, ready, bumpPractice } = useProfile();
  const [kind, setKind] = useState<Kind | null>(null);

  const studentLevel = parseCefrLevel(profile.level) ?? "A2";
  const contentLevel = resolveExerciseLevel(studentLevel);
  const categories = categoriesFor(contentLevel);
  const bank = EXERCISES[contentLevel];

  if (!kind) {
    return (
      <div className="view">
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          Praticar
        </div>
        <h2 style={{ fontSize: 24, marginBottom: 4 }}>Escolha um tipo de exercício</h2>
        <p className="muted" style={{ margin: "0 0 22px" }}>
          Exercícios do nível {contentLevel}, embaralhados a cada rodada.
        </p>
        {contentLevel !== studentLevel && (
          <p className="muted" style={{ margin: "-14px 0 22px", fontSize: 13 }}>
            Ainda não temos exercícios específicos pro nível {studentLevel} — praticando com os de{" "}
            {contentLevel} por enquanto.
          </p>
        )}
        <div className="cat-grid">
          {categories.map((cat) => {
            const stat = ready ? profile.stats.practice[cat.kind] : { done: 0, correct: 0 };
            return (
              <button key={cat.kind} className="cat-card" onClick={() => setKind(cat.kind)}>
                <div className={`cat-ic ${TINTS[cat.kind]}`} style={{ fontWeight: 800 }}>
                  {cat.kind === "mc" ? "ABC" : cat.kind === "fill" ? "__" : cat.kind === "translate" ? "PT" : "1·2"}
                </div>
                <h3>{cat.title}</h3>
                <p>{cat.desc}</p>
                <div className="cat-meta">
                  {cat.count} exercícios
                  {stat.done > 0 && ` · você fez ${stat.done} (${Math.round((stat.correct / stat.done) * 100)}% ✓)`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Runner
      kind={kind}
      bank={bank}
      categories={categories}
      onExit={() => setKind(null)}
      bump={bumpPractice}
    />
  );
}

function Runner({
  kind,
  bank,
  categories,
  onExit,
  bump,
}: {
  kind: Kind;
  bank: LevelBank;
  categories: { kind: Kind; title: string; desc: string; count: number }[];
  onExit: () => void;
  bump: (k: Kind, correct: boolean) => void;
}) {
  const queue = useMemo(
    () => shuffle(bank[kind] as readonly (MC | Fill | Translate | Order)[]),
    [bank, kind],
  );
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [wasRight, setWasRight] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  // per-question inputs
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [built, setBuilt] = useState<number[]>([]);

  const item = queue[i];
  const title = categories.find((c) => c.kind === kind)!.title;

  function resetInputs() {
    setSelected(null);
    setText("");
    setBuilt([]);
  }

  function evaluate(): { ok: boolean; explain: string } {
    if (kind === "mc") {
      const q = item as MC;
      return { ok: selected === q.answer, explain: q.explain };
    }
    if (kind === "fill") {
      const q = item as Fill;
      return { ok: q.answers.some((a) => normalize(a) === normalize(text)), explain: q.explain };
    }
    if (kind === "translate") {
      const q = item as Translate;
      return { ok: q.answers.some((a) => normalize(a) === normalize(text)), explain: q.explain };
    }
    const q = item as Order;
    const attempt = built.map((idx) => q.words[idx]).join(" ");
    return { ok: normalize(attempt) === normalize(q.answer), explain: `Resposta: “${q.answer}”` };
  }

  function check() {
    if (answered) {
      // next
      if (i === queue.length - 1) {
        setDone(true);
        return;
      }
      setI((n) => n + 1);
      setAnswered(false);
      setWasRight(false);
      resetInputs();
      return;
    }
    if (kind === "mc" && selected === null) return;
    if ((kind === "fill" || kind === "translate") && !text.trim()) return;
    if (kind === "order" && built.length === 0) return;
    const { ok } = evaluate();
    setWasRight(ok);
    setAnswered(true);
    if (ok) setCorrect((c) => c + 1);
    bump(kind, ok);
  }

  if (done) {
    const pct = Math.round((correct / queue.length) * 100);
    return (
      <div className="view" style={{ maxWidth: 640 }}>
        <div className="card done" style={{ padding: 28 }}>
          <div className="big">
            {correct}/{queue.length}
          </div>
          <p className="muted" style={{ margin: "6px 0 20px" }}>
            {pct}% de acerto em {title}. Seu progresso foi salvo. 💾
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn primary" onClick={onExit}>
              Escolher outro tipo
            </button>
            <Link href="/aluno" className="btn ghost">
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fb = answered ? evaluate() : null;

  return (
    <div className="view" style={{ maxWidth: 640 }}>
      <div className="lesson-head">
        <div>
          <div className="eyebrow" style={{ color: "var(--gold)" }}>
            {title}
          </div>
          <h2 style={{ fontSize: 20, marginTop: 4 }}>
            Questão {i + 1} de {queue.length}
          </h2>
        </div>
        <button className="btn ghost" onClick={onExit} style={{ padding: "8px 14px" }}>
          Sair
        </button>
      </div>

      <div className="card" style={{ padding: 26 }}>
        {kind === "mc" && <McView item={item as MC} selected={selected} answered={answered} onSelect={setSelected} />}
        {(kind === "fill" || kind === "translate") && (
          <FillView
            item={item as Fill | Translate}
            kind={kind}
            text={text}
            answered={answered}
            onChange={setText}
            onEnter={check}
          />
        )}
        {kind === "order" && (
          <OrderView item={item as Order} built={built} answered={answered} onChange={setBuilt} />
        )}

        {fb && (
          <div className={`fb ${wasRight ? "ok" : "no"}`}>
            <strong>{wasRight ? "✓ Correto! " : "✗ Quase lá. "}</strong>
            {fb.explain}
          </div>
        )}

        <button className="btn primary" style={{ width: "100%", marginTop: 18 }} onClick={check}>
          {answered ? (i === queue.length - 1 ? "Ver resultado" : "Próxima →") : "Verificar"}
        </button>
      </div>
    </div>
  );
}

function McView({
  item,
  selected,
  answered,
  onSelect,
}: {
  item: MC;
  selected: number | null;
  answered: boolean;
  onSelect: (n: number) => void;
}) {
  return (
    <>
      <p className="q-prompt">{item.prompt}</p>
      <div style={{ marginTop: 12 }}>
        {item.options.map((opt, k) => {
          let cls = "opt";
          if (answered) {
            if (k === item.answer) cls += " ok";
            else if (k === selected) cls += " no";
          } else if (k === selected) cls += " ok";
          return (
            <button key={k} className={cls} disabled={answered} onClick={() => onSelect(k)}>
              <span className="k">{"ABCD"[k]}</span>
              {opt}
            </button>
          );
        })}
      </div>
    </>
  );
}

function FillView({
  item,
  kind,
  text,
  answered,
  onChange,
  onEnter,
}: {
  item: Fill | Translate;
  kind: Kind;
  text: string;
  answered: boolean;
  onChange: (v: string) => void;
  onEnter: () => void;
}) {
  const isTranslate = kind === "translate";
  return (
    <>
      <p className="q-prompt">
        {isTranslate ? (item as Translate).pt : (item as Fill).prompt.replace("___", "______")}
      </p>
      <p className="muted" style={{ margin: "0 0 16px" }}>
        {isTranslate ? "Traduza para o inglês." : (item as Fill).hint}
      </p>
      <input
        className="fill-input"
        value={text}
        disabled={answered}
        autoComplete="off"
        autoCapitalize="off"
        placeholder="Digite em inglês…"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter()}
      />
    </>
  );
}

function OrderView({
  item,
  built,
  answered,
  onChange,
}: {
  item: Order;
  built: number[];
  answered: boolean;
  onChange: (b: number[]) => void;
}) {
  return (
    <>
      <p className="muted" style={{ margin: "0 0 4px" }}>
        Monte a frase: <b style={{ color: "var(--ink)" }}>{item.pt}</b>
      </p>
      <div className="answer-line">
        {built.length === 0 ? (
          <span className="answer-empty">Toque nas palavras abaixo…</span>
        ) : (
          built.map((idx, pos) => (
            <button
              key={pos}
              className="word-chip"
              disabled={answered}
              onClick={() => onChange(built.filter((_, p) => p !== pos))}
            >
              {item.words[idx]}
            </button>
          ))
        )}
      </div>
      <div className="word-bank">
        {item.words.map((w, idx) => (
          <button
            key={idx}
            className={`word-chip${built.includes(idx) ? " used" : ""}`}
            disabled={answered || built.includes(idx)}
            onClick={() => onChange([...built, idx])}
          >
            {w}
          </button>
        ))}
      </div>
    </>
  );
}
