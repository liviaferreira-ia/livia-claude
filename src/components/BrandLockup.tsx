"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  /** Largura do logo em pixels (no tema claro). */
  width?: number;
};

// logo-stacked.png = 2626 x 1264 ; crest.png = 2062 x 1533
const STACKED_RATIO = 1264 / 2626;
const CREST_RATIO = 1533 / 2062;

/**
 * Marca da Central School.
 * - Tema claro: logo oficial empilhado (crest + "CENTRAL SCHOOL" + slogan).
 * - Tema escuro: brasão + texto claro (o texto oficial é azul-marinho e sumiria no escuro).
 */
export function BrandLockup({ width = 300 }: Props) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const check = () =>
      setDark(document.documentElement.getAttribute("data-theme") === "dark");
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  }, []);

  if (dark) {
    const crestW = Math.round(width * 0.42);
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <Image
          src="/crest.png"
          alt="Central School"
          width={crestW}
          height={Math.round(crestW * CREST_RATIO)}
          priority
        />
        <div
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: Math.round(width * 0.13),
            fontWeight: 700,
            color: "var(--ink)",
            letterSpacing: "0.01em",
            lineHeight: 1.05,
          }}
        >
          Central School
        </div>
        <div
          style={{
            fontSize: Math.max(9, Math.round(width * 0.038)),
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--gold)",
          }}
        >
          English as a Lifestyle
        </div>
      </div>
    );
  }

  return (
    <Image
      src="/logo-stacked.png"
      alt="Central School — English as a Lifestyle"
      width={width}
      height={Math.round(width * STACKED_RATIO)}
      priority
    />
  );
}
