import Link from "next/link";
import { Crest } from "@/components/Crest";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PrivacyConsent, PrivacyPreferencesButton } from "@/components/PrivacyConsent";

// Provisório (número pessoal da Livia, sinalizado desde 2026-08-12) — trocar pelo WhatsApp definitivo da Central School assim que houver um.
const WHATSAPP = "5511933779408";
const WA_MSG = "Olá! Vim pelo site e quero conhecer os planos da Central School.";
const waLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WA_MSG)}`;
const waPlanLink = (plan: string) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Quero receber valores, horários e detalhes do plano ${plan} da Central School.`)}`;

const WaIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
    <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.8-.8-1.4-1.7-1.5-2-.2-.3 0-.4.1-.6l.4-.5c.1-.1.2-.3.2-.5s0-.4-.1-.5c-.1-.1-.7-1.6-.9-2.2-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.3.3-1 .9-1 2.3s1 2.7 1.1 2.9c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z" />
  </svg>
);

const CheckIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m5 12 4 4L19 6" />
  </svg>
);

const features = [
  { eyebrow: "Trilha completa", title: "Do A1 ao C2, sem estudar no escuro", desc: "Conteúdo organizado por nível para você saber o que praticar agora e enxergar o próximo passo.", symbol: "A1", tone: "navy" },
  { eyebrow: "Conversação", title: "Tutor com IA para perder o medo", desc: "Converse no seu nível, receba correções gentis e pratique quantas vezes precisar.", symbol: "IA", tone: "gold" },
  { eyebrow: "Situações reais", title: "Roleplays por voz", desc: "Treine diálogos de viagem, trabalho e rotina antes de viver essas conversas fora da plataforma.", symbol: "VOZ", tone: "navy" },
  { eyebrow: "Prática leve", title: "Central Games", desc: "Vocabulário, frases e memória em jogos rápidos que também contam para a sua meta diária.", symbol: "PLAY", tone: "green" },
  { eyebrow: "Consistência", title: "Progresso que fica visível", desc: "Acompanhe acertos, tempo de estudo, sequência e metas para transformar intenção em hábito.", symbol: "%", tone: "gold" },
  { eyebrow: "Acompanhamento", title: "Professor de verdade nos planos", desc: "Tecnologia para praticar mais; orientação humana para adaptar o caminho aos seus objetivos.", symbol: "CS", tone: "navy" },
];

const plans = [
  { name: "Essencial", audience: "Para criar base e consistência", frequency: "2 aulas por semana", items: ["Comunicação do dia a dia", "Material e plataforma digital", "Avaliações mensais de progresso"] },
  { name: "Carreira", audience: "Para usar inglês no trabalho", frequency: "3 aulas por semana", items: ["Inglês aplicado à sua rotina", "Módulos por área ou setor", "Mentoria personalizada"], featured: true },
  { name: "Global", audience: "Para avançar com mais intensidade", frequency: "4 aulas por semana", items: ["Conversação avançada", "Feedback contínuo", "Prática e imersão cultural"] },
];

const faq = [
  { q: "O que está incluído nos 7 dias grátis?", a: "Você conhece a plataforma, faz o onboarding de nível e pratica com a trilha, exercícios, jogos, revisão, roleplay e Tutor com IA dentro dos limites do período gratuito." },
  { q: "Preciso colocar cartão para experimentar?", a: "Não. O cadastro não pede cartão e não existe cobrança automática ao final. Você só contrata se decidir continuar e confirmar essa escolha." },
  { q: "Quando começam os sete dias?", a: "O período começa no seu primeiro acesso confirmado, não no momento em que você preenche o cadastro." },
  { q: "Preciso saber inglês para começar?", a: "Não. A plataforma possui trilhas do nível iniciante A1 ao avançado C2 e ajuda você a começar do ponto adequado." },
  { q: "As aulas com professor estão no teste gratuito?", a: "O teste gratuito é da plataforma digital. As aulas e o acompanhamento personalizado fazem parte dos planos da escola, montados conforme objetivo e disponibilidade." },
  { q: "Consigo estudar pelo celular?", a: "Sim. A plataforma funciona pelo navegador no celular e no computador, sem precisar instalar aplicativo." },
  { q: "Vocês atendem alunos com 60 anos ou mais?", a: "Sim. A Central School possui um programa individual e personalizado, com ritmo e abordagem pensados para alunos 60+." },
];

export default function LandingPage() {
  return (
    <div className="lp-page">
      <header className="lp-header">
        <Link href="/" className="lp-brand" aria-label="Central School — página inicial">
          <Crest size={36} />
          <div><b>Central School</b><small>ENGLISH AS A LIFESTYLE</small></div>
        </Link>
        <nav className="lp-nav" aria-label="Navegação principal">
          <a href="#plataforma">Plataforma</a><a href="#como-funciona">Como funciona</a><a href="#planos">Planos</a><a href="#faq">Dúvidas</a>
        </nav>
        <div className="lp-header-cta">
          <ThemeToggle />
          <Link href="/login" className="lp-login-link">Já sou aluno</Link>
          <Link href="/experimente" className="btn primary lp-header-trial">Testar grátis</Link>
        </div>
      </header>

      <main>
        <section className="lp-hero lp-section">
          <div className="lp-hero-grid">
            <div className="lp-hero-copy">
              <span className="lp-eyebrow">Inglês para usar, não só para estudar</span>
              <h1 className="lp-h1">Pare de adiar.<br /><em>Comece a falar.</em></h1>
              <p className="lp-sub">Pratique inglês todos os dias com uma trilha do seu nível, conversas com IA, situações reais e jogos — e conte com acompanhamento humano nos planos da escola.</p>
              <div className="lp-cta-row">
                <Link href="/experimente" className="btn primary lp-main-cta">Começar meus 7 dias grátis <span aria-hidden>→</span></Link>
                <a href="#plataforma" className="btn ghost lp-see-product">Ver a plataforma</a>
              </div>
              <div className="lp-trust-row" aria-label="Condições do teste gratuito">
                <span>{CheckIcon} Sem cartão</span><span>{CheckIcon} Sem cobrança automática</span><span>{CheckIcon} Progresso salvo</span>
              </div>
            </div>

            <div className="lp-product-preview" aria-label="Prévia da plataforma Central School">
              <div className="lp-preview-top"><div className="lp-preview-brand"><Crest size={27} /><b>Central School</b></div><span>Olá, Ana</span></div>
              <div className="lp-preview-body">
                <div className="lp-preview-sidebar" aria-hidden><i className="active" /><i /><i /><i /><i /></div>
                <div className="lp-preview-content">
                  <div className="lp-preview-welcome"><div><small>SUA JORNADA · A1</small><strong>Continue de onde parou</strong><span>Rotina e apresentações</span></div><b>42%</b></div>
                  <div className="lp-preview-metrics">
                    <div><span>Meta diária</span><strong>3/5</strong><i><b style={{ width: "60%" }} /></i></div>
                    <div><span>Sequência</span><strong>4 dias</strong><small>Continue assim!</small></div>
                  </div>
                  <div className="lp-preview-actions">
                    <div className="tutor"><span>IA</span><div><b>Tutor de conversa</b><small>Pratique sem medo de errar</small></div></div>
                    <div className="games"><span>▶</span><div><b>Central Games</b><small>Aprenda enquanto joga</small></div></div>
                  </div>
                </div>
              </div>
              <div className="lp-preview-float"><span>✓</span><div><b>Exercício concluído</b><small>Seu progresso foi salvo</small></div></div>
            </div>
          </div>
        </section>

        <section className="lp-proof-strip" aria-label="Resumo da experiência">
          <div><strong>A1–C2</strong><span>trilha para todos os níveis</span></div><div><strong>15 min</strong><span>já ajudam a manter o hábito</span></div><div><strong>7 dias</strong><span>para conhecer sem cartão</span></div><div><strong>Humano + IA</strong><span>prática e orientação juntas</span></div>
        </section>

        <section className="lp-section lp-problem-section">
          <div className="lp-section-heading"><span className="lp-eyebrow">Se estudar não virou conversa…</span><h2 className="lp-h2">Talvez não falte esforço.<br />Falte uma forma melhor de praticar.</h2><p>Na Central School, o inglês deixa de ser uma matéria distante e entra na sua rotina com passos pequenos, contexto real e continuidade.</p></div>
          <div className="lp-problem-grid">
            <article><span>01</span><h3>Você sabe, mas trava</h3><p>A prática de conversa ajuda a transformar conhecimento passivo em resposta espontânea.</p></article>
            <article><span>02</span><h3>Você começa e para</h3><p>Metas curtas, jogos e progresso visível tornam mais fácil voltar no dia seguinte.</p></article>
            <article><span>03</span><h3>O conteúdo parece genérico</h3><p>A trilha respeita seu nível e os planos conectam o estudo aos seus objetivos reais.</p></article>
          </div>
        </section>

        <section className="lp-product-section" id="plataforma"><div className="lp-section">
          <div className="lp-section-heading light"><span className="lp-eyebrow">A Central por dentro</span><h2 className="lp-h2">Uma plataforma feita para você voltar amanhã</h2><p>Não é uma coleção solta de exercícios. É um ambiente de prática que combina direção, variedade e constância.</p></div>
          <div className="lp-feature-grid">{features.map((feature) => <article className="lp-feature-card" key={feature.title}><span className={`lp-feature-symbol ${feature.tone}`}>{feature.symbol}</span><small>{feature.eyebrow}</small><h3>{feature.title}</h3><p>{feature.desc}</p></article>)}</div>
        </div></section>

        <section className="lp-section" id="como-funciona">
          <div className="lp-section-heading"><span className="lp-eyebrow">Começar é simples</span><h2 className="lp-h2">Sete dias para sentir a diferença na prática</h2></div>
          <div className="lp-journey">
            <article><span>1</span><div><small>EM POUCOS MINUTOS</small><h3>Crie sua conta</h3><p>Informe nome e e-mail. Não pedimos cartão.</p></div></article>
            <article><span>2</span><div><small>NO PRIMEIRO ACESSO</small><h3>Monte sua jornada</h3><p>Escolha seu nível, objetivo e ritmo de estudo.</p></div></article>
            <article><span>3</span><div><small>POR SETE DIAS</small><h3>Pratique de verdade</h3><p>Explore aulas, exercícios, Tutor, roleplays e Central Games.</p></div></article>
            <article><span>4</span><div><small>SEM SURPRESA</small><h3>Decida se quer continuar</h3><p>Seu progresso fica salvo. Só existe cobrança se você contratar.</p></div></article>
          </div>
          <div className="lp-trial-offer"><div><span className="lp-eyebrow">Experimente agora</span><h2>Seu primeiro passo não precisa ser uma compra.</h2><p>Conheça a plataforma por sete dias e decida com a experiência, não com uma promessa.</p></div><div className="lp-trial-offer-action"><strong>R$ 0</strong><span>por 7 dias</span><Link href="/experimente" className="btn primary">Criar minha conta grátis →</Link><small>Sem cartão · sem cobrança automática</small></div></div>
        </section>

        <section className="lp-section" id="planos">
          <div className="lp-section-heading"><span className="lp-eyebrow">Aulas + plataforma</span><h2 className="lp-h2">Escolha o nível de acompanhamento</h2><p>Os planos são personalizados conforme objetivo, disponibilidade e ritmo. Fale com a escola para receber valores e horários.</p></div>
          <div className="lp-plans">{plans.map((plan) => <article className={`lp-plan ${plan.featured ? "featured" : ""}`} key={plan.name}>{plan.featured && <span className="lp-plan-badge">MAIS ACOMPANHAMENTO</span>}<small>{plan.audience}</small><h3>{plan.name}</h3><div className="lp-plan-frequency">{plan.frequency}</div><ul>{plan.items.map((item) => <li key={item}>{item}</li>)}</ul><a href={waPlanLink(plan.name)} target="_blank" rel="noopener noreferrer" className={plan.featured ? "btn primary" : "btn ghost"}>Receber valores e horários</a></article>)}</div>
          <div className="lp-senior-callout"><div className="lp-senior-mark">60+</div><div><span className="lp-eyebrow">Programa individual</span><h3>Inglês também é para a sua próxima fase.</h3><p>Aulas personalizadas, ritmo respeitado e tecnologia sem complicação para alunos com 60 anos ou mais.</p></div><a href={waPlanLink("60+")} target="_blank" rel="noopener noreferrer" className="btn ghost">Conhecer o programa</a></div>
        </section>

        <section className="lp-philosophy"><div className="lp-section lp-philosophy-grid"><div className="lp-philosophy-crest"><Crest size={150} /></div><div><span className="lp-eyebrow">English as a Lifestyle</span><h2 className="lp-h2">Inglês que encontra espaço na sua vida.</h2><p>Aprender um idioma não precisa ser uma corrida nem uma coleção de regras. A Central School une conversação, personalização, cultura e prática digital para que o inglês se torne familiar — um pouco a cada dia.</p></div></div></section>

        <section className="lp-section" id="faq"><div className="lp-section-heading"><span className="lp-eyebrow">Sem letras miúdas</span><h2 className="lp-h2">Perguntas frequentes</h2></div><div className="lp-faq">{faq.map((item) => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div></section>

        <section className="lp-final-cta" id="contato"><div><span className="lp-eyebrow">Você não precisa esperar se sentir pronto</span><h2>Comece pequeno. Comece hoje.</h2><p>Sete dias para explorar a plataforma, praticar no seu ritmo e descobrir se a Central School combina com você.</p></div><div className="lp-final-actions"><Link href="/experimente" className="btn primary">Começar grátis →</Link><a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-wa">{WaIcon} Conversar no WhatsApp</a></div></section>
      </main>

      <footer className="lp-footer"><Link href="/" className="lp-brand"><Crest size={32} /><div><b>Central School</b><small>ENGLISH AS A LIFESTYLE</small></div></Link><div className="lp-footer-links"><a href="#plataforma">Plataforma</a><a href="#planos">Planos</a><Link href="/login">Área do aluno</Link><Link href="/privacidade">Privacidade</Link><PrivacyPreferencesButton /><a href={waLink} target="_blank" rel="noopener noreferrer">WhatsApp</a></div><div>© {new Date().getFullYear()} Central School</div></footer>
      <PrivacyConsent />
    </div>
  );
}
