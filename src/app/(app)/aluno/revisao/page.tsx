"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SpeakButton } from "@/components/SpeakButton";
import { SaveWordButton } from "@/components/SaveWordButton";
import { FLASHCARDS, resolveFlashcardLevel } from "@/data/pratica";
import { levelBadge } from "@/data/placement";
import { parseCefrLevel, useProfile } from "@/lib/profile";
import { listMyReviewTargets, type ReviewTarget } from "@/lib/activity";

export default function RevisaoPage() {
  const { profile, ready } = useProfile();
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState(0);
  const [done, setDone] = useState(false);
  const [targets, setTargets] = useState<ReviewTarget[]>([]);

  const cardLevel = resolveFlashcardLevel(parseCefrLevel(profile.level) ?? "A2");
  const CARDS = FLASHCARDS[cardLevel];

  useEffect(() => {
    if (!ready) return;
    void listMyReviewTargets().then(setTargets);
  }, [ready]);

  function grade(ok: boolean) {
    if (ok) setKnown((k) => k + 1);
    if (index === CARDS.length - 1) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setRevealed(false);
  }

  function restart() {
    setStarted(false);
    setIndex(0);
    setRevealed(false);
    setKnown(0);
    setDone(false);
  }

  if (!ready) {
    return (
      <div className="view">
        <p className="muted">Carregando…</p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="view" style={{ maxWidth: 620 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Revisão espaçada · {levelBadge(cardLevel)}</div>
        <h2 style={{ fontSize: 22, marginBottom: 4 }}>{CARDS.length} itens para revisar hoje</h2>
        <p className="muted" style={{ margin: "0 0 20px" }}>
          A revisão na hora certa fixa o que você aprendeu na memória.
        </p>
        {targets.length > 0 && (() => {
          const first = targets[0];
          const ids = targets.filter((item) => item.level === first.level && item.kind === first.kind).map((item) => item.exerciseId).join(",");
          return <div className="hero" style={{ marginBottom: 18 }}>
            <div className="eyebrow">Revisão personalizada</div>
            <h3>{targets.length} {targets.length === 1 ? "questão precisa" : "questões precisam"} de uma nova tentativa</h3>
            <p>Selecionamos os erros mais recentes. Quando você acertar, eles saem automaticamente desta fila.</p>
            <Link className="btn light" href={`/aluno/praticar?tipo=${first.kind}&nivel=${first.level}&erros=${ids}`}>Corrigir meus erros →</Link>
          </div>;
        })()}
        <div className="card" style={{ padding: 8 }}>
          {CARDS.map((c, i) => (
            <div className="m-item" key={i} style={{ cursor: "default" }}>
              <span className="m-ic tint-navy" style={{ fontWeight: 800, fontSize: 12 }}>EN</span>
              <span className="m-body">
                <b>{c.front}</b>
                <span>{c.back}</span>
              </span>
              <span className="m-state todo">Pendente</span>
            </div>
          ))}
        </div>
        <button className="btn primary" style={{ marginTop: 18 }} onClick={() => setStarted(true)}>
          Começar revisão →
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="view" style={{ maxWidth: 620 }}>
        <div className="card done" style={{ padding: 28 }}>
          <div className="big">{known}/{CARDS.length}</div>
          <p className="muted" style={{ margin: "6px 0 20px" }}>
            Você marcou {known} como já sei. Os demais voltam mais cedo na próxima revisão.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn primary" onClick={restart}>Revisar de novo</button>
            <Link href="/aluno" className="btn ghost">Voltar ao início</Link>
          </div>
        </div>
      </div>
    );
  }

  const card = CARDS[index];
  return (
    <div className="view" style={{ maxWidth: 620 }}>
      <div className="lesson-head">
        <div className="eyebrow">Revisão</div>
        <div className="dots">
          {CARDS.map((_, k) => (
            <i key={k} className={k < index ? "on" : k === index ? "cur" : ""} />
          ))}
        </div>
      </div>

      <div className="card flashcard">
        <div className="flash-word">{card.front}</div>
        <div className="flash-sub">{card.sub}</div>
        <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center" }}>
          <SpeakButton text={card.front} />
          <SaveWordButton
            en={card.front}
            pt={card.back}
            example={card.example}
            source={`Revisão · ${levelBadge(cardLevel)}`}
          />
        </div>
        {revealed && (
          <div className="flash-answer">
            <b>{card.back}</b>
            <p>&quot;{card.example}&quot;</p>
          </div>
        )}
      </div>

      {!revealed ? (
        <button className="btn primary" style={{ width: "100%", marginTop: 16 }} onClick={() => setRevealed(true)}>
          Mostrar resposta
        </button>
      ) : (
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button className="btn ghost" style={{ flex: 1 }} onClick={() => grade(false)}>
            ↻ Ainda não
          </button>
          <button className="btn primary" style={{ flex: 1 }} onClick={() => grade(true)}>
            ✓ Já sei
          </button>
        </div>
      )}
    </div>
  );
}
