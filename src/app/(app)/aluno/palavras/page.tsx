"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SpeakButton } from "@/components/SpeakButton";
import { listWords, removeWord, type SavedWord } from "@/lib/vocab";

type Mode = "list" | "quiz";

export default function MinhasPalavrasPage() {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<Mode>("list");

  // Estado do modo revisão
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    // Em callback, não no corpo do efeito — evita renderização em cascata.
    Promise.resolve().then(() => {
      void listWords().then((data) => { setWords(data); setLoaded(true); });
    });
  }, []);

  async function handleRemove(en: string) {
    await removeWord(en);
    setWords(await listWords());
  }

  function startQuiz() {
    setIndex(0);
    setRevealed(false);
    setKnown(0);
    setFinished(false);
    setMode("quiz");
  }

  function grade(ok: boolean) {
    if (ok) setKnown((k) => k + 1);
    if (index === words.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setRevealed(false);
  }

  if (!loaded) {
    return (
      <div className="view">
        <p className="muted">Carregando…</p>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="view" style={{ maxWidth: 620 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          Minhas palavras
        </div>
        <h2 style={{ fontSize: 22, marginBottom: 6 }}>Sua lista está vazia</h2>
        <p className="muted" style={{ margin: "0 0 20px" }}>
          Enquanto estuda, toque em <b>☆ Salvar</b> ao lado de qualquer palavra ou expressão para
          guardá-la aqui e revisar quando quiser.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/aluno/licao" className="btn primary">
            Ir para minha lição →
          </Link>
          <Link href="/aluno/revisao" className="btn ghost">
            Revisão do meu nível
          </Link>
        </div>
      </div>
    );
  }

  // ----- Modo revisão -----
  if (mode === "quiz") {
    if (finished) {
      return (
        <div className="view" style={{ maxWidth: 620 }}>
          <div className="card done" style={{ padding: 28 }}>
            <div className="big">
              {known}/{words.length}
            </div>
            <p className="muted" style={{ margin: "6px 0 20px" }}>
              Você já sabe {known} das suas palavras salvas.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="btn primary" onClick={startQuiz}>
                Revisar de novo
              </button>
              <button className="btn ghost" onClick={() => setMode("list")}>
                Ver minha lista
              </button>
            </div>
          </div>
        </div>
      );
    }

    const card = words[index];
    return (
      <div className="view" style={{ maxWidth: 620 }}>
        <div className="lesson-head">
          <div className="eyebrow">Minhas palavras</div>
          <div className="dots">
            {words.map((_, k) => (
              <i key={k} className={k < index ? "on" : k === index ? "cur" : ""} />
            ))}
          </div>
        </div>

        <div className="card flashcard">
          <div className="flash-word">{card.en}</div>
          {card.source && <div className="flash-sub">{card.source}</div>}
          <div style={{ marginTop: 12 }}>
            <SpeakButton text={card.en} />
          </div>
          {revealed && (
            <div className="flash-answer">
              <b>{card.pt}</b>
              {card.example && <p>&quot;{card.example}&quot;</p>}
            </div>
          )}
        </div>

        {!revealed ? (
          <button
            className="btn primary"
            style={{ width: "100%", marginTop: 16 }}
            onClick={() => setRevealed(true)}
          >
            Mostrar tradução
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

  // ----- Lista -----
  return (
    <div className="view" style={{ maxWidth: 720 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>
        Minhas palavras
      </div>
      <h2 style={{ fontSize: 22, marginBottom: 4 }}>
        {words.length} {words.length === 1 ? "palavra salva" : "palavras salvas"}
      </h2>
      <p className="muted" style={{ margin: "0 0 18px" }}>
        As palavras que você guardou enquanto estudava. Revise quando quiser.
      </p>

      <button className="btn primary" style={{ marginBottom: 18 }} onClick={startQuiz}>
        Revisar minhas palavras →
      </button>

      <div className="card" style={{ padding: "6px 20px" }}>
        {words.map((w) => (
          <div className="vrow" key={w.en}>
            <span className="vmain">
              <span className="ven" style={{ display: "block" }}>
                {w.en}
              </span>
              <span className="vpt" style={{ display: "block" }}>
                {w.pt}
                {w.source && (
                  <span className="muted" style={{ fontSize: 12 }}>
                    {" "}
                    · {w.source}
                  </span>
                )}
              </span>
            </span>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <SpeakButton text={w.en} />
              <button
                type="button"
                className="pill-btn"
                title="Remover da lista"
                onClick={() => void handleRemove(w.en)}
              >
                Remover
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
