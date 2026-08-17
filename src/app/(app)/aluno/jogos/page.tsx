"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  EXERCISES,
  normalize,
  resolveExerciseLevel,
  type MC,
  type Order,
  type Translate,
} from "@/data/exercises";
import { parseCefrLevel, useProfile } from "@/lib/profile";
import styles from "./jogos.module.css";

type GameKey = "speed" | "order" | "memory";
type Phase = "idle" | "playing" | "finished";

type SpeedState = {
  phase: Phase;
  questions: MC[];
  index: number;
  seconds: number;
  score: number;
  answered: number;
  selected: number | null;
};

type WordToken = { id: string; word: string };

type OrderState = {
  phase: Phase;
  rounds: Order[];
  index: number;
  available: WordToken[];
  built: WordToken[];
  score: number;
  feedback: "correct" | "wrong" | null;
};

type MemoryCard = {
  id: string;
  pairId: string;
  label: string;
  language: "EN" | "PT";
  matched: boolean;
};

type MemoryState = {
  phase: Phase;
  cards: MemoryCard[];
  flipped: string[];
  attempts: number;
  matches: number;
  locked: boolean;
};

const EMPTY_SPEED: SpeedState = {
  phase: "idle",
  questions: [],
  index: 0,
  seconds: 60,
  score: 0,
  answered: 0,
  selected: null,
};

const EMPTY_ORDER: OrderState = {
  phase: "idle",
  rounds: [],
  index: 0,
  available: [],
  built: [],
  score: 0,
  feedback: null,
};

const EMPTY_MEMORY: MemoryState = {
  phase: "idle",
  cards: [],
  flipped: [],
  attempts: 0,
  matches: 0,
  locked: false,
};

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function wordTokens(round: Order): WordToken[] {
  return shuffle(round.words.map((word, index) => ({ id: `${round.id}-${index}`, word })));
}

function memoryDeck(items: Translate[]): MemoryCard[] {
  const pairs = shuffle(items).slice(0, 6);
  return shuffle(
    pairs.flatMap((item) => [
      { id: `${item.id}-en`, pairId: item.id, label: item.answers[0], language: "EN" as const, matched: false },
      { id: `${item.id}-pt`, pairId: item.id, label: item.pt, language: "PT" as const, matched: false },
    ]),
  );
}

const GAME_CARDS: Array<{
  key: GameKey;
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
  icon: string;
}> = [
  {
    key: "speed",
    eyebrow: "Velocidade",
    title: "Palavra Relâmpago",
    description: "Acerte o máximo de questões antes que o relógio chegue a zero.",
    meta: "60 segundos · múltipla escolha",
    icon: "⚡",
  },
  {
    key: "order",
    eyebrow: "Raciocínio",
    title: "Monte a Frase",
    description: "Organize as palavras e reconstrua cinco frases do seu nível.",
    meta: "5 rodadas · ordem das palavras",
    icon: "🧩",
  },
  {
    key: "memory",
    eyebrow: "Vocabulário",
    title: "Memória Bilíngue",
    description: "Encontre os pares entre palavras em inglês e seus significados.",
    meta: "6 pares · inglês e português",
    icon: "🧠",
  },
];

export default function JogosPage() {
  const { profile, ready, bumpPractice } = useProfile();
  const [activeGame, setActiveGame] = useState<GameKey | null>(null);
  const [speed, setSpeed] = useState<SpeedState>(EMPTY_SPEED);
  const [order, setOrder] = useState<OrderState>(EMPTY_ORDER);
  const [memory, setMemory] = useState<MemoryState>(EMPTY_MEMORY);
  const memoryTimer = useRef<number | null>(null);

  const studentLevel = parseCefrLevel(profile.level) ?? "A2";
  const contentLevel = resolveExerciseLevel(studentLevel);
  const bank = EXERCISES[contentLevel];

  useEffect(() => {
    if (activeGame !== "speed" || speed.phase !== "playing") return;
    const timer = window.setInterval(() => {
      setSpeed((current) => {
        if (current.seconds <= 1) return { ...current, seconds: 0, phase: "finished" };
        return { ...current, seconds: current.seconds - 1 };
      });
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [activeGame, speed.phase]);

  useEffect(() => () => {
    if (memoryTimer.current !== null) window.clearTimeout(memoryTimer.current);
  }, []);

  function openGame(game: GameKey) {
    setActiveGame(game);
    if (game === "speed") startSpeed();
    if (game === "order") startOrder();
    if (game === "memory") startMemory();
  }

  function closeGame() {
    if (memoryTimer.current !== null) window.clearTimeout(memoryTimer.current);
    setActiveGame(null);
    setSpeed(EMPTY_SPEED);
    setOrder(EMPTY_ORDER);
    setMemory(EMPTY_MEMORY);
  }

  function startSpeed() {
    setSpeed({ ...EMPTY_SPEED, phase: "playing", questions: shuffle(bank.mc).slice(0, 10) });
  }

  function answerSpeed(option: number) {
    const question = speed.questions[speed.index];
    if (!question || speed.selected !== null || speed.phase !== "playing") return;
    const correct = option === question.answer;
    bumpPractice("mc", correct, question.id, contentLevel, "Jogo · Palavra Relâmpago");
    setSpeed((current) => ({
      ...current,
      selected: option,
      score: current.score + (correct ? 1 : 0),
      answered: current.answered + 1,
    }));
  }

  function nextSpeed() {
    setSpeed((current) => {
      const nextIndex = current.index + 1;
      if (nextIndex >= current.questions.length) return { ...current, phase: "finished" };
      return { ...current, index: nextIndex, selected: null };
    });
  }

  function startOrder() {
    const rounds = shuffle(bank.order).slice(0, 5);
    setOrder({
      ...EMPTY_ORDER,
      phase: "playing",
      rounds,
      available: rounds[0] ? wordTokens(rounds[0]) : [],
    });
  }

  function chooseWord(token: WordToken) {
    if (order.feedback || order.phase !== "playing") return;
    setOrder((current) => ({
      ...current,
      available: current.available.filter((item) => item.id !== token.id),
      built: [...current.built, token],
    }));
  }

  function returnWord(token: WordToken) {
    if (order.feedback || order.phase !== "playing") return;
    setOrder((current) => ({
      ...current,
      available: [...current.available, token],
      built: current.built.filter((item) => item.id !== token.id),
    }));
  }

  function checkOrder() {
    const round = order.rounds[order.index];
    if (!round || order.built.length !== round.words.length || order.feedback) return;
    const correct = normalize(order.built.map((item) => item.word).join(" ")) === normalize(round.answer);
    bumpPractice("order", correct, round.id, contentLevel, "Jogo · Monte a Frase");
    setOrder((current) => ({
      ...current,
      feedback: correct ? "correct" : "wrong",
      score: current.score + (correct ? 1 : 0),
    }));
  }

  function retryOrder() {
    const round = order.rounds[order.index];
    if (!round) return;
    setOrder((current) => ({ ...current, available: wordTokens(round), built: [], feedback: null }));
  }

  function nextOrder() {
    setOrder((current) => {
      const nextIndex = current.index + 1;
      const nextRound = current.rounds[nextIndex];
      if (!nextRound) return { ...current, phase: "finished", feedback: null };
      return {
        ...current,
        index: nextIndex,
        available: wordTokens(nextRound),
        built: [],
        feedback: null,
      };
    });
  }

  function startMemory() {
    if (memoryTimer.current !== null) window.clearTimeout(memoryTimer.current);
    setMemory({ ...EMPTY_MEMORY, phase: "playing", cards: memoryDeck(bank.translate) });
  }

  function flipMemory(card: MemoryCard) {
    if (memory.locked || card.matched || memory.flipped.includes(card.id) || memory.phase !== "playing") return;
    if (memory.flipped.length === 0) {
      setMemory((current) => ({ ...current, flipped: [card.id] }));
      return;
    }

    const firstId = memory.flipped[0];
    const firstCard = memory.cards.find((item) => item.id === firstId);
    if (!firstCard) return;
    const isMatch = firstCard.pairId === card.pairId;
    const willFinish = isMatch && memory.matches + 1 === 6;
    setMemory((current) => ({
      ...current,
      flipped: [firstId, card.id],
      attempts: current.attempts + 1,
      locked: true,
    }));

    memoryTimer.current = window.setTimeout(() => {
      setMemory((current) => {
        if (!isMatch) return { ...current, flipped: [], locked: false };
        const nextMatches = current.matches + 1;
        return {
          ...current,
          cards: current.cards.map((item) =>
            item.pairId === card.pairId ? { ...item, matched: true } : item,
          ),
          flipped: [],
          matches: nextMatches,
          locked: false,
          phase: willFinish ? "finished" : "playing",
        };
      });
      if (willFinish) {
        bumpPractice("translate", true, `memory-${contentLevel}`, contentLevel, "Jogo · Memória Bilíngue");
      }
    }, 650);
  }

  if (!ready) {
    return <div className="view"><p className="muted">Carregando jogos…</p></div>;
  }

  if (!activeGame) {
    return (
      <div className="view">
        <section className={styles.intro}>
          <div>
            <div className="eyebrow">Central Games · nível {contentLevel}</div>
            <h2>Aprender também pode ser jogo.</h2>
            <p>Escolha um desafio curto, pratique o conteúdo do seu nível e avance na meta do dia.</p>
          </div>
          <div className={styles.introBadge} aria-hidden="true">★</div>
        </section>

        <div className={styles.gameGrid}>
          {GAME_CARDS.map((game) => (
            <button key={game.key} className={styles.gameCard} onClick={() => openGame(game.key)}>
              <span className={styles.gameIcon} aria-hidden="true">{game.icon}</span>
              <span className={styles.cardEyebrow}>{game.eyebrow}</span>
              <strong>{game.title}</strong>
              <span className={styles.cardDescription}>{game.description}</span>
              <span className={styles.cardMeta}>{game.meta}</span>
              <span className={styles.playAction}>Jogar agora <b>→</b></span>
            </button>
          ))}
        </div>

        <div className={styles.tip}>
          <span aria-hidden="true">💡</span>
          <div><b>Dica de estudo</b><p>Jogue uma partida curta e depois revise as respostas que errou.</p></div>
        </div>
      </div>
    );
  }

  const gameInfo = GAME_CARDS.find((game) => game.key === activeGame)!;
  const speedQuestion = speed.questions[speed.index];
  const orderRound = order.rounds[order.index];

  return (
    <div className="view">
      <div className={styles.gameTopbar}>
        <button className={styles.backButton} onClick={closeGame}>← Todos os jogos</button>
        <span className={styles.levelPill}>Nível {contentLevel}</span>
      </div>

      <section className={styles.stage}>
        <header className={styles.stageHeader}>
          <span className={styles.stageIcon} aria-hidden="true">{gameInfo.icon}</span>
          <div><span>{gameInfo.eyebrow}</span><h2>{gameInfo.title}</h2></div>
        </header>

        {activeGame === "speed" && speed.phase === "playing" && speedQuestion && (
          <div className={styles.gameBody}>
            <div className={styles.scoreRow}>
              <span>Questão <b>{speed.index + 1}/{speed.questions.length}</b></span>
              <span className={speed.seconds <= 10 ? styles.timerDanger : styles.timer}>⏱ {speed.seconds}s</span>
              <span>Pontos <b>{speed.score}</b></span>
            </div>
            <div className={styles.progress}><i style={{ width: `${(speed.index / speed.questions.length) * 100}%` }} /></div>
            <div className={styles.questionCard}>
              <span className={styles.promptLabel}>Escolha a opção correta</span>
              <h3>{speedQuestion.prompt}</h3>
              <div className={styles.optionGrid}>
                {speedQuestion.options.map((option, index) => {
                  const selected = speed.selected === index;
                  const correct = speedQuestion.answer === index;
                  const resultClass = speed.selected === null ? "" : correct ? styles.correct : selected ? styles.wrong : styles.dimmed;
                  return <button key={option} className={`${styles.option} ${resultClass}`} disabled={speed.selected !== null} onClick={() => answerSpeed(index)}><span>{String.fromCharCode(65 + index)}</span>{option}</button>;
                })}
              </div>
              {speed.selected !== null && (
                <div className={speed.selected === speedQuestion.answer ? styles.feedbackGood : styles.feedbackBad}>
                  <div><b>{speed.selected === speedQuestion.answer ? "Boa! Resposta correta." : "Quase! Veja a explicação."}</b><p>{speedQuestion.explain}</p></div>
                  <button className="btn light" onClick={nextSpeed}>{speed.index + 1 === speed.questions.length ? "Ver resultado" : "Próxima →"}</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeGame === "speed" && speed.phase === "finished" && (
          <ResultPanel icon="⚡" title="Rodada concluída!" score={`${speed.score} de ${speed.answered}`} text={speed.score >= Math.max(1, speed.answered * 0.7) ? "Ótimo ritmo! Você dominou a maior parte das questões." : "Bom treino! Revise os erros e tente superar sua pontuação."} onRestart={startSpeed} onClose={closeGame} />
        )}

        {activeGame === "order" && order.phase === "playing" && orderRound && (
          <div className={styles.gameBody}>
            <div className={styles.scoreRow}><span>Rodada <b>{order.index + 1}/{order.rounds.length}</b></span><span>Pontos <b>{order.score}</b></span></div>
            <div className={styles.progress}><i style={{ width: `${(order.index / order.rounds.length) * 100}%` }} /></div>
            <div className={styles.questionCard}>
              <span className={styles.promptLabel}>Monte a frase em inglês</span>
              <h3 className={styles.translation}>{orderRound.pt}</h3>
              <div className={`${styles.sentenceArea} ${order.feedback === "correct" ? styles.sentenceCorrect : order.feedback === "wrong" ? styles.sentenceWrong : ""}`}>
                {order.built.length === 0 && <span className={styles.placeholder}>Toque nas palavras abaixo…</span>}
                {order.built.map((token) => <button key={token.id} onClick={() => returnWord(token)}>{token.word}</button>)}
              </div>
              <div className={styles.wordBank}>
                {order.available.map((token) => <button key={token.id} onClick={() => chooseWord(token)}>{token.word}</button>)}
              </div>
              {!order.feedback && <button className="btn light" disabled={order.built.length !== orderRound.words.length} onClick={checkOrder}>Conferir frase</button>}
              {order.feedback === "wrong" && <div className={styles.feedbackBad}><div><b>A ordem ainda não está certa.</b><p>Reorganize as palavras e tente novamente.</p></div><button className="btn light" onClick={retryOrder}>Tentar novamente</button></div>}
              {order.feedback === "correct" && <div className={styles.feedbackGood}><div><b>Frase perfeita!</b><p>{orderRound.answer}</p></div><button className="btn light" onClick={nextOrder}>{order.index + 1 === order.rounds.length ? "Ver resultado" : "Próxima →"}</button></div>}
            </div>
          </div>
        )}

        {activeGame === "order" && order.phase === "finished" && (
          <ResultPanel icon="🧩" title="Desafio concluído!" score={`${order.score} de ${order.rounds.length}`} text={order.score === order.rounds.length ? "Excelente! Você montou todas as frases sem errar." : "Cada tentativa ajuda a fixar a estrutura das frases."} onRestart={startOrder} onClose={closeGame} />
        )}

        {activeGame === "memory" && memory.phase === "playing" && (
          <div className={styles.gameBody}>
            <div className={styles.scoreRow}><span>Pares <b>{memory.matches}/6</b></span><span>Tentativas <b>{memory.attempts}</b></span></div>
            <div className={styles.memoryGrid}>
              {memory.cards.map((card) => {
                const visible = card.matched || memory.flipped.includes(card.id);
                return <button key={card.id} className={`${styles.memoryCard} ${visible ? styles.memoryVisible : ""} ${card.matched ? styles.memoryMatched : ""}`} disabled={card.matched || memory.locked} onClick={() => flipMemory(card)} aria-label={visible ? `${card.language}: ${card.label}` : "Carta virada"}><span className={styles.cardBack}>?</span><span className={styles.cardFront}><small>{card.language}</small>{card.label}</span></button>;
              })}
            </div>
          </div>
        )}

        {activeGame === "memory" && memory.phase === "finished" && (
          <ResultPanel icon="🧠" title="Memória completa!" score={`${memory.attempts} tentativas`} text={memory.attempts <= 9 ? "Memória afiada! Você encontrou os pares rapidamente." : "Muito bem! Jogue novamente para tentar usar menos tentativas."} onRestart={startMemory} onClose={closeGame} />
        )}
      </section>

      <p className={styles.footerNote}>Seus resultados de exercício também contam para a meta diária.</p>
      <Link href="/aluno" className={styles.dashboardLink}>Voltar ao meu painel</Link>
    </div>
  );
}

function ResultPanel({ icon, title, score, text, onRestart, onClose }: { icon: string; title: string; score: string; text: string; onRestart: () => void; onClose: () => void }) {
  return (
    <div className={styles.resultPanel}>
      <span className={styles.resultIcon} aria-hidden="true">{icon}</span>
      <span className={styles.resultLabel}>Resultado da partida</span>
      <h3>{title}</h3>
      <strong>{score}</strong>
      <p>{text}</p>
      <div><button className="btn light" onClick={onRestart}>Jogar novamente</button><button className="btn ghost" onClick={onClose}>Escolher outro jogo</button></div>
    </div>
  );
}
