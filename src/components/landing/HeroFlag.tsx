/**
 * Bandeira americana "sugerida" no fundo do topo da página inicial (ideia do Fabio, 20/11/2026).
 * Não é a bandeira literal: listras onduladas quase transparentes que balançam devagar e algumas
 * estrelas discretas no lugar do canto azul. Só decoração (aria-hidden), sem JS.
 * O balanço só liga com .lp-motion (desligado com "reduzir movimento").
 */

const WAVE = 1200; // largura de uma onda (a animação desloca exatamente isso, então o laço é contínuo)
const ROWS = 13;
const ROW_H = 46;
const AMP = 16;

function y(row: number, x: number) {
  return row * ROW_H + AMP * Math.sin((2 * Math.PI * x) / WAVE);
}

/** Faixa entre a borda de cima (row) e a de baixo (row + 1), com duas ondas de largura (0 a 2400). */
function stripe(row: number) {
  const top: string[] = [];
  const bottom: string[] = [];
  for (let x = 0; x <= WAVE * 2; x += 24) {
    top.push(`${x},${y(row, x).toFixed(1)}`);
    bottom.unshift(`${x},${y(row + 1, x).toFixed(1)}`);
  }
  return `M${top.join(" L")} L${bottom.join(" L")} Z`;
}

const STARS = Array.from({ length: 20 }, (_, i) => ({ cx: 20 + (i % 5) * 44 + (Math.floor(i / 5) % 2) * 22, cy: 18 + Math.floor(i / 5) * 30 }));
const STAR = "M0,-7 L2.06,-2.16 L6.66,-2.16 L2.94,0.82 L4.12,5.66 L0,2.8 L-4.12,5.66 L-2.94,0.82 L-6.66,-2.16 L-2.06,-2.16 Z";

export function HeroFlag() {
  return (
    <div className="lp-hero-flag" aria-hidden>
      <svg className="lp-flag-cloth" viewBox={`0 0 ${WAVE} ${ROWS * ROW_H}`} preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id="lp-flag-shade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#0a3161" stopOpacity="0" />
            <stop offset=".25" stopColor="#0a3161" stopOpacity=".55" />
            <stop offset=".5" stopColor="#0a3161" stopOpacity="0" />
            <stop offset=".75" stopColor="#0a3161" stopOpacity=".55" />
            <stop offset="1" stopColor="#0a3161" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="lp-flag-wave">
          {Array.from({ length: ROWS }, (_, row) => (row % 2 === 0 ? <path key={row} className="lp-flag-red" d={stripe(row)} /> : null))}
          {/* sombra do tecido (dobras) que anda junto com a onda */}
          <rect className="lp-flag-shade" x="0" y={-AMP} width={WAVE * 2} height={ROWS * ROW_H + AMP * 2} fill="url(#lp-flag-shade)" />
        </g>
      </svg>
      <svg className="lp-flag-stars" viewBox="0 0 240 130" focusable="false">
        {STARS.map((s, i) => <path key={i} d={STAR} transform={`translate(${s.cx} ${s.cy})`} />)}
      </svg>
    </div>
  );
}
