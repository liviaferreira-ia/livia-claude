/** Estrelas discretas cintilando no fundo de uma seção (só decoração, sem JS). Posições fixas e "aleatórias". */
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const STARS = Array.from({ length: 34 }, (_, i) => ({
  left: (rand(i + 1) * 100).toFixed(2),
  top: (rand(i + 101) * 100).toFixed(2),
  size: 6 + Math.round(rand(i + 201) * 10),
  delay: (rand(i + 301) * 6).toFixed(2),
  dur: (3.5 + rand(i + 401) * 4).toFixed(2),
  red: i % 7 === 0,
}));

export function StarField() {
  return (
    <div className="lp-starfield" aria-hidden>
      {STARS.map((s, i) => (
        <i
          key={i}
          className={s.red ? "red" : ""}
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
        />
      ))}
    </div>
  );
}
