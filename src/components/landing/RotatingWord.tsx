"use client";

import { useEffect, useState } from "react";

/** Troca a palavra a cada poucos segundos ("Inglês para viajar / para o trabalho..."). Parado se o sistema pede menos movimento. */
export function RotatingWord({ words, interval = 2600 }: { words: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className="lp-rotator" aria-live="off">
      <span key={index} className="lp-rotator-word">{words[index]}</span>
    </span>
  );
}
