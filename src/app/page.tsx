import Link from "next/link";
import { Crest } from "@/components/Crest";
import { SceneArt } from "@/components/SceneArt";
import { ThemeToggle } from "@/components/ThemeToggle";

// Provisório (número da Livia, 2026-08-12) — trocar pro WhatsApp definitivo da Central School depois.
const WHATSAPP = "5511933779408";
const WA_MSG =
  "Olá! Vim pelo site e quero saber mais sobre o curso de inglês da Central School. 😊";
const waLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WA_MSG)}`;

const WaIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
    <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.8-.8-1.4-1.7-1.5-2-.2-.3 0-.4.1-.6l.4-.5c.1-.1.2-.3.2-.5s0-.4-.1-.5c-.1-.1-.7-1.6-.9-2.2-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.3.3-1 .9-1 2.3s1 2.7 1.1 2.9c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z" />
  </svg>
);

// TODO: trocar os href="#" das redes pelos links reais (Instagram/Facebook/YouTube)
const IgIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></svg>
);
const FbIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13 22v-8h3l.5-4H13V7.5c0-1.1.3-1.8 1.9-1.8H17V2.1C16.6 2.1 15.3 2 13.9 2 11 2 9 3.7 9 6.9V10H6v4h3v8h4z" /></svg>
);
const YtIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M22 8.2a2.6 2.6 0 0 0-1.8-1.8C18.6 6 12 6 12 6s-6.6 0-8.2.4A2.6 2.6 0 0 0 2 8.2 27 27 0 0 0 1.6 12 27 27 0 0 0 2 15.8a2.6 2.6 0 0 0 1.8 1.8C5.4 18 12 18 12 18s6.6 0 8.2-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22.4 12 27 27 0 0 0 22 8.2zM10 15V9l5.2 3L10 15z" /></svg>
);

const differentials = [
  {
    tint: "tint-navy",
    title: "Foco em conversação",
    desc: "Você usa o inglês em situações reais desde a primeira aula — nada de decoreba.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" /></svg>
    ),
  },
  {
    tint: "tint-gold",
    title: "Aulas personalizadas",
    desc: "Do iniciante ao avançado, no seu objetivo — e um programa exclusivo para alunos 60+.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
  },
  {
    tint: "tint-navy",
    title: "Imersão cultural",
    desc: "Mais do que aulas: vivências que ampliam horizontes e viram um estilo de vida.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" /></svg>
    ),
  },
];

const plans = [
  {
    name: "Essencial",
    aud: "Para começar",
    freq: "2 aulas por semana",
    items: ["Comunicação do dia a dia", "Material digital incluso", "Avaliações mensais de progresso"],
  },
  {
    name: "Carreira",
    aud: "Para profissionais",
    freq: "3 aulas por semana",
    items: ["Inglês aplicado ao trabalho", "Módulos por área/setor", "Mentoria personalizada"],
  },
  {
    name: "Global",
    aud: "Para fluência",
    freq: "4 aulas por semana",
    items: ["Conversação avançada", "Professores nativos", "Imersão cultural"],
  },
];

const method = ["Aprender", "Ouvir", "Falar", "Praticar", "Evoluir"];

const features = [
  {
    tint: "tint-navy",
    title: "Aulas por nível",
    desc: "Uma trilha do A1 ao C2, no seu ritmo.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
    ),
  },
  {
    tint: "tint-gold",
    title: "Tutor de conversa",
    desc: "Converse com a IA e receba correções gentis.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    ),
  },
  {
    tint: "tint-warn",
    title: "Pronúncia",
    desc: "Ouça a referência, repita em voz alta e compare sua fala.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h3l3 8 4-16 3 8h5" /></svg>
    ),
  },
  {
    tint: "tint-navy",
    title: "Roleplay por voz",
    desc: "Situações reais: hotel, restaurante, viagem.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></svg>
    ),
  },
];

const faq = [
  {
    q: "Preciso saber inglês para começar?",
    a: "Não! Temos trilhas do zero (A1) ao avançado (C2). No cadastro a gente já ajusta ao seu nível e você começa do ponto certo.",
  },
  {
    q: "Como funciona o acompanhamento do professor?",
    a: "A tecnologia acelera a sua prática, mas quem guia é um professor de verdade — que acompanha seu progresso e prepara as aulas para o que você realmente precisa.",
  },
  {
    q: "Consigo estudar pelo celular?",
    a: "Sim. A plataforma funciona no computador e no celular, direto no navegador, sem precisar instalar nada.",
  },
  {
    q: "Quanto tempo por dia preciso estudar?",
    a: "Você escolhe. A partir de 15 minutos por dia já dá para manter o hábito e evoluir de forma consistente.",
  },
  {
    q: "Vocês têm curso para quem tem 60 anos ou mais?",
    a: "Temos sim — um programa exclusivo, com aulas individuais e personalizadas para alunos 60+. Porque o inglês é para todos.",
  },
  {
    q: "Como eu começo?",
    a: "É só falar com a gente no WhatsApp. Tiramos suas dúvidas e te ajudamos a começar hoje mesmo.",
  },
];

const quotes = [
  {
    text: "Em poucos meses saí do “travado” pra conversar numa viagem. O app com a professora fez toda a diferença.",
    who: "Marina S.",
    role: "aluna · nível A2 (exemplo)",
  },
  {
    text: "Consigo praticar de manhã antes do trabalho. É a primeira vez que mantenho a rotina de estudar inglês.",
    who: "Lucas R.",
    role: "aluno · nível B1 (exemplo)",
  },
  {
    text: "Como professora, adoro ver o progresso de cada aluno e preparar a aula com o que eles realmente precisam.",
    who: "Prof. Fernanda",
    role: "professora (exemplo)",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Cabeçalho */}
      <header className="lp-header">
        <Link href="/" className="lp-brand">
          <Crest size={34} />
          <div>
            <b>Central School</b>
            <small>ENGLISH AS A LIFESTYLE</small>
          </div>
        </Link>
        <nav className="lp-nav">
          <a href="#metodo">Método</a>
          <a href="#curso">O curso</a>
          <a href="#planos">Planos</a>
          <a href="#sobre">Sobre</a>
          <a href="#faq">Dúvidas</a>
          <a href="#contato">Contato</a>
        </nav>
        <div className="lp-header-cta">
          <ThemeToggle />
          <Link href="/login" className="btn ghost" style={{ padding: "10px 16px" }}>
            Área do aluno
          </Link>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-wa">
            {WaIcon}
            WhatsApp
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="lp-section" style={{ paddingTop: 56 }}>
        <div className="lp-hero-grid">
          <div>
            <span className="lp-eyebrow">Escola de inglês · English as a Lifestyle</span>
            <h1 className="lp-h1">
              Fale inglês <em>de verdade</em>, no seu ritmo.
            </h1>
            <p className="lp-sub">
              Metodologia voltada para conversação: você usa o inglês em situações reais desde a
              primeira aula — e pratica todos os dias na nossa plataforma, com o acompanhamento dos
              professores. English as a lifestyle.
            </p>
            <div className="lp-cta-row">
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-wa" style={{ padding: "14px 22px", fontSize: 16 }}>
                {WaIcon}
                Falar no WhatsApp
              </a>
              <Link href="/login" className="btn primary" style={{ padding: "14px 22px", fontSize: 16 }}>
                Área do aluno →
              </Link>
            </div>
          </div>
          <div>
            <SceneArt />
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="lp-section" style={{ paddingTop: 0 }}>
        <h2 className="lp-h2">Por que a Central School</h2>
        <div className="lp-cards">
          {differentials.map((d) => (
            <div className="lp-card" key={d.title}>
              <span className={`ic ${d.tint}`}>{d.icon}</span>
              <h3>{d.title}</h3>
              <p>{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Método */}
      <section className="lp-section" id="metodo" style={{ paddingTop: 20 }}>
        <span className="lp-eyebrow" style={{ display: "block", textAlign: "center" }}>
          O método
        </span>
        <h2 className="lp-h2" style={{ marginTop: 8 }}>
          Um ciclo simples que faz você falar
        </h2>
        <div className="lp-method">
          {method.map((m, i) => (
            <div className="lp-step" key={m}>
              <div className="n">{String(i + 1).padStart(2, "0")}</div>
              <b>{m}</b>
            </div>
          ))}
        </div>
      </section>

      {/* O curso / features */}
      <section className="lp-section" id="curso" style={{ paddingTop: 20 }}>
        <h2 className="lp-h2">O que você pratica</h2>
        <div className="lp-cards">
          {features.map((f) => (
            <div className="lp-card" key={f.title}>
              <span className={`ic ${f.tint}`}>{f.icon}</span>
              <h3 style={{ fontSize: 18 }}>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Planos */}
      <section className="lp-section" id="planos" style={{ paddingTop: 20 }}>
        <h2 className="lp-h2">Escolha o seu plano</h2>
        <p className="lp-sub" style={{ textAlign: "center", margin: "10px auto 0" }}>
          Todos com o acompanhamento dos nossos professores. Valores sob consulta — fale com a
          gente e monte o plano ideal para você.
        </p>
        <div className="lp-plans">
          {plans.map((p) => (
            <div className="lp-plan" key={p.name}>
              <h3>{p.name}</h3>
              <div className="aud">{p.aud}</div>
              <div className="price">Valor a consultar</div>
              <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
                {p.freq}
              </div>
              <ul>
                {p.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa"
                style={{ justifyContent: "center" }}
              >
                {WaIcon}
                Quero este plano
              </a>
            </div>
          ))}
        </div>
        <p className="muted" style={{ textAlign: "center", fontSize: 13, marginTop: 18 }}>
          👵👴 Também temos um <b>programa exclusivo para alunos 60+</b>, com aulas individuais e
          personalizadas.
        </p>
      </section>

      {/* Sobre a escola */}
      <section className="lp-section" id="sobre" style={{ paddingTop: 20 }}>
        <div className="two-col">
          <div>
            <span className="lp-eyebrow">Sobre a escola</span>
            <h2 className="lp-h2" style={{ textAlign: "left", marginTop: 8 }}>
              Inglês como parte da sua vida
            </h2>
            <p className="lp-sub" style={{ marginTop: 14 }}>
              Nossa missão é inserir o aluno em contextos reais, transformando o aprendizado de
              inglês em um estilo de vida sofisticado e natural. Aqui você não decora —{" "}
              <b>vive o idioma</b>.
            </p>
            <p className="lp-sub" style={{ marginTop: 12 }}>
              Unimos <b>personalização, conversação e imersão cultural</b>, com professores
              dedicados e uma plataforma para praticar todo dia. E temos um programa exclusivo para
              alunos <b>60+</b> — porque o inglês é para todos.
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <Crest size={168} />
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="lp-section" id="depoimentos" style={{ paddingTop: 20 }}>
        <h2 className="lp-h2">Quem estuda, recomenda</h2>
        <div className="lp-quotes">
          {quotes.map((q) => (
            <div className="lp-quote" key={q.who}>
              <p>“{q.text}”</p>
              <div className="who">
                {q.who}
                <span>{q.role}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="muted" style={{ textAlign: "center", fontSize: 12.5, marginTop: 18 }}>
          Depoimentos ilustrativos — serão substituídos por relatos reais de alunos.
        </p>
      </section>

      {/* FAQ */}
      <section className="lp-section" id="faq" style={{ paddingTop: 20 }}>
        <h2 className="lp-h2">Perguntas frequentes</h2>
        <div className="lp-faq">
          {faq.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="lp-band" id="contato">
        <h2>Pronto pra começar a falar inglês?</h2>
        <p>Fale com a gente no WhatsApp, tire suas dúvidas e comece hoje mesmo.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-wa" style={{ padding: "14px 24px", fontSize: 16 }}>
            {WaIcon}
            Falar no WhatsApp
          </a>
          <Link href="/login" className="btn light" style={{ padding: "14px 24px", fontSize: 16 }}>
            Área do aluno
          </Link>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="lp-footer">
        <Link href="/" className="lp-brand">
          <Crest size={30} />
          <div>
            <b style={{ fontFamily: "Georgia, serif", fontSize: 15 }}>Central School</b>
          </div>
        </Link>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <a href="#metodo">Método</a>
          <a href="#planos">Planos</a>
          <Link href="/login">Área do aluno</Link>
          <a href={waLink} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </div>
        <div className="lp-social" aria-label="Redes sociais">
          <a href="#" aria-label="Instagram">{IgIcon}</a>
          <a href="#" aria-label="Facebook">{FbIcon}</a>
          <a href="#" aria-label="YouTube">{YtIcon}</a>
        </div>
        <div>© {new Date().getFullYear()} Central School · English as a Lifestyle</div>
      </footer>
    </div>
  );
}
