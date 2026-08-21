"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { LEVEL_ORDER, type CefrLevel } from "@/data/placement";
import { markContentValidated } from "@/lib/content-validation";
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
  const { profile, ready, isTeacher, bumpPractice } = useProfile();
  const [kind, setKind] = useState<Kind | null>(null);
  const [reviewLevel, setReviewLevel] = useState<CefrLevel | null>(null);
  const [smartReviewLevel, setSmartReviewLevel] = useState<CefrLevel | null>(null);
  const [reviewIds, setReviewIds] = useState<string[]>([]);
  const [queryReady, setQueryReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const requested = new URLSearchParams(window.location.search).get("revisao");
      const params = new URLSearchParams(window.location.search);
      const requestedLevel = params.get("nivel");
      const requestedKind = params.get("tipo");
      setReviewLevel(
        requested && (LEVEL_ORDER as string[]).includes(requested)
          ? requested as CefrLevel
          : null,
      );
      setSmartReviewLevel(requestedLevel && (LEVEL_ORDER as string[]).includes(requestedLevel) ? requestedLevel as CefrLevel : null);
      setReviewIds((params.get("erros") ?? "").split(",").filter(Boolean).slice(0, 20));
      if (requestedKind && (["mc", "fill", "translate", "order"] as string[]).includes(requestedKind)) setKind(requestedKind as Kind);
      setQueryReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const reviewMode = ready && isTeacher && reviewLevel !== null;
  const smartReviewMode = !reviewMode && smartReviewLevel !== null && reviewIds.length > 0;
  const studentLevel = reviewMode ? reviewLevel : smartReviewLevel ?? parseCefrLevel(profile.level) ?? "A2";
  const contentLevel = reviewMode ? reviewLevel : smartReviewMode ? smartReviewLevel : resolveExerciseLevel(studentLevel);
  const categories = categoriesFor(contentLevel);
  const bank = EXERCISES[contentLevel];

  if (!queryReady || !ready) {
    return <div className="view"><p className="muted">Carregando…</p></div>;
  }

  if (!kind) {
    return (
      <div className="view">
        {reviewMode && (
          <div className="objbar" style={{ marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <b>Modo de revisão pedagógica · {contentLevel}</b>
              <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>
                Suas respostas servem apenas para conferir o conteúdo e não entram no progresso dos alunos.
              </div>
            </div>
            <Link className="pill-btn" href="/professor/validacao-conteudo">Voltar à validação</Link>
          </div>
        )}
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          {reviewMode ? "Revisão pedagógica" : "Praticar"}
        </div>
        <h2 style={{ fontSize: 24, marginBottom: 4 }}>{reviewMode ? `Exercícios do nível ${contentLevel}` : "Escolha um tipo de exercício"}</h2>
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
            const stat = !reviewMode ? profile.stats.practice[cat.kind] : { done: 0, correct: 0 };
            return (
              <button key={cat.kind} className="cat-card" onClick={() => setKind(cat.kind)}>
                <div className={`cat-ic ${TINTS[cat.kind]}`} style={{ fontWeight: 800 }}>
                  {cat.kind === "mc" ? "ABC" : cat.kind === "fill" ? "__" : cat.kind === "translate" ? "PT" : "1·2"}
                </div>
                <h3>{cat.title}</h3>
                <p>{cat.desc}</p>
                <div className="cat-meta">
                  {cat.count} exercícios
                  {!reviewMode && stat.done > 0 && ` · você fez ${stat.done} (${Math.round((stat.correct / stat.done) * 100)}% ✓)`}
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
      bump={reviewMode ? () => {} : bumpPractice}
      reviewMode={reviewMode}
      level={contentLevel}
      filterIds={smartReviewMode ? reviewIds : []}
      returnHref={smartReviewMode ? "/aluno/revisao" : reviewMode ? "/professor/validacao-conteudo" : "/aluno"}
    />
  );
}

function Runner({
  kind,
  bank,
  categories,
  onExit,
  bump,
  reviewMode,
  level,
  filterIds,
  returnHref,
}: {
  kind: Kind;
  bank: LevelBank;
  categories: { kind: Kind; title: string; desc: string; count: number }[];
  onExit: () => void;
  bump: (k: Kind, correct: boolean, exerciseId?: string, level?: CefrLevel, title?: string) => void;
  reviewMode: boolean;
  level: CefrLevel;
  filterIds: string[];
  returnHref: string;
}) {
  const queue = useMemo(
    () => {
      const source = bank[kind] as readonly (MC | Fill | Translate | Order)[];
      const selected = filterIds.length ? source.filter((item) => filterIds.includes(item.id)) : source;
      return shuffle(selected);
    },
    [bank, kind, filterIds],
  );
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [wasRight, setWasRight] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [validationState, setValidationState] = useState<"idle" | "saving" | "saved" | "error">("idle");

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
    bump(kind, ok, item.id, level, title);
  }

  async function validateLevel() {
    setValidationState("saving");
    const failure = await markContentValidated(level);
    setValidationState(failure ? "error" : "saved");
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
            {pct}% de acerto em {title}. {reviewMode ? "Revisão concluída sem alterar o progresso dos alunos." : "Seu progresso foi salvo. 💾"}
          </p>
          {reviewMode && validationState === "error" && (
            <p className="auth-msg err" role="alert">Não foi possível validar o nível. Tente novamente.</p>
          )}
          {reviewMode && validationState === "saved" && (
            <p className="auth-msg ok" role="status">Nível {level} validado com sucesso.</p>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {reviewMode && (
              <button
                className="btn primary"
                disabled={validationState === "saving" || validationState === "saved"}
                onClick={() => void validateLevel()}
              >
                {validationState === "saving" ? "Validando…" : validationState === "saved" ? `${level} validado` : `Validar nível ${level}`}
              </button>
            )}
            <button className="btn primary" onClick={onExit}>
              Escolher outro tipo
            </button>
            <Link href={returnHref} className="btn ghost">
              {reviewMode ? "Voltar à validação" : filterIds.length ? "Voltar à revisão" : "Voltar ao início"}
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
          } else if (k === selected) cls += " sel";
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
