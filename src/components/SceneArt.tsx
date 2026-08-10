type Props = { className?: string };

/** Ilustração vetorial da marca (painel marinho com balões de fala e ondas douradas). */
export function SceneArt({ className }: Props) {
  return (
    <svg
      viewBox="0 0 400 300"
      width={400}
      height={300}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Aprenda a falar inglês"
      style={{
        width: "100%",
        maxWidth: "100%",
        height: "auto",
        aspectRatio: "4 / 3",
        display: "block",
        borderRadius: 16,
      }}
    >
      <defs>
        <linearGradient id="sc-navy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#24406a" />
          <stop offset="1" stopColor="#16263f" />
        </linearGradient>
        <linearGradient id="sc-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e7cd7f" />
          <stop offset="1" stopColor="#b0821e" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="400" height="300" rx="16" fill="url(#sc-navy)" />

      {/* faixa decorativa dourada embaixo */}
      <path d="M0,250 C90,225 150,285 220,262 C300,236 350,280 400,258 L400,300 L0,300 Z" fill="url(#sc-gold)" opacity="0.85" />
      <path d="M0,268 C90,246 150,300 220,280 C300,258 350,296 400,278 L400,300 L0,300 Z" fill="#ffffff" opacity="0.12" />

      {/* arco decorativo (louros) */}
      <path d="M40,60 C20,110 22,160 46,206" fill="none" stroke="url(#sc-gold)" strokeWidth="2.2" strokeLinecap="round" opacity="0.5" />
      <path d="M360,60 C380,110 378,160 354,206" fill="none" stroke="url(#sc-gold)" strokeWidth="2.2" strokeLinecap="round" opacity="0.5" />

      {/* balão branco "Hello!" */}
      <g>
        <rect x="70" y="70" width="150" height="72" rx="20" fill="#ffffff" />
        <path d="M104,138 L104,164 L128,138 Z" fill="#ffffff" />
        <text x="145" y="118" textAnchor="middle" fontFamily="Georgia, serif" fontSize="34" fontStyle="italic" fill="#1f3a5f">Hello!</text>
      </g>

      {/* balão dourado "Olá!" */}
      <g>
        <rect x="212" y="126" width="120" height="60" rx="18" fill="url(#sc-gold)" />
        <path d="M300,182 L300,204 L278,182 Z" fill="#b0821e" />
        <text x="272" y="166" textAnchor="middle" fontFamily="Georgia, serif" fontSize="28" fontStyle="italic" fill="#16263f">Olá!</text>
      </g>

      {/* ondas de som */}
      <g stroke="#e7cd7f" strokeWidth="3" strokeLinecap="round" opacity="0.9">
        <path d="M96,232 q6,-14 12,0" fill="none" />
        <path d="M112,228 q8,-22 16,0" fill="none" />
        <path d="M132,224 q10,-30 20,0" fill="none" />
        <path d="M156,228 q8,-22 16,0" fill="none" />
        <path d="M176,232 q6,-14 12,0" fill="none" />
      </g>
    </svg>
  );
}
