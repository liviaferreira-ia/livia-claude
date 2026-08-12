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

      {/* círculo "globo" bem sutil atrás dos balões, dá profundidade sem poluir */}
      <circle cx="200" cy="128" r="98" fill="none" stroke="#e7cd7f" strokeWidth="1" opacity="0.12" />
      <circle cx="200" cy="128" r="72" fill="none" stroke="#e7cd7f" strokeWidth="1" opacity="0.1" />

      {/* faixa decorativa dourada embaixo */}
      <path d="M0,250 C90,225 150,285 220,262 C300,236 350,280 400,258 L400,300 L0,300 Z" fill="url(#sc-gold)" opacity="0.85" />
      <path d="M0,268 C90,246 150,300 220,280 C300,258 350,296 400,278 L400,300 L0,300 Z" fill="#ffffff" opacity="0.12" />

      {/* arco decorativo (louros), com folhinhas ao longo do arco */}
      <g stroke="url(#sc-gold)" fill="none" strokeLinecap="round" opacity="0.65">
        <path d="M36,50 C14,104 16,158 42,208" strokeWidth="2.4" />
        <path d="M36,50 l-9,-5 M31,78 l-10,-3 M28,108 l-11,0 M28,138 l-11,2 M31,168 l-10,5 M36,196 l-9,7" strokeWidth="2" />
        <path d="M364,50 C386,104 384,158 358,208" strokeWidth="2.4" />
        <path d="M364,50 l9,-5 M369,78 l10,-3 M372,108 l11,0 M372,138 l11,2 M369,168 l10,5 M364,196 l9,7" strokeWidth="2" />
      </g>

      {/* sparkles douradas espalhadas pelos espaços vazios */}
      <g fill="#e7cd7f" opacity="0.8">
        <path d="M58,42 l4,10 l10,4 l-10,4 l-4,10 l-4,-10 l-10,-4 l10,-4 Z" />
        <path d="M340,86 l3,7 l7,3 l-7,3 l-3,7 l-3,-7 l-7,-3 l7,-3 Z" opacity="0.7" />
        <circle cx="322" cy="52" r="3" />
        <circle cx="70" cy="200" r="2.5" opacity="0.6" />
      </g>

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

      {/* mini balão "..." (conversa continuando), preenche o canto inferior direito */}
      <g opacity="0.92">
        <rect x="322" y="204" width="54" height="34" rx="14" fill="#ffffff" opacity="0.9" />
        <path d="M336,238 L336,250 L348,238 Z" fill="#ffffff" opacity="0.9" />
        <circle cx="339" cy="221" r="3.4" fill="#1f3a5f" />
        <circle cx="349" cy="221" r="3.4" fill="#1f3a5f" />
        <circle cx="359" cy="221" r="3.4" fill="#1f3a5f" />
      </g>
    </svg>
  );
}
