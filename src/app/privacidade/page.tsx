import Link from "next/link";
import { Crest } from "@/components/Crest";
import { PrivacyPreferencesButton } from "@/components/PrivacyConsent";

export const metadata = {
  title: "Política de Privacidade | Central School",
  description: "Saiba como a Central School coleta, utiliza e protege dados pessoais.",
};

export default function PrivacyPage() {
  return (
    <div className="privacy-page">
      <header className="privacy-header">
        <Link href="/" className="lp-brand">
          <Crest size={34} />
          <div><b>Central School</b><small>ENGLISH AS A LIFESTYLE</small></div>
        </Link>
        <Link href="/" className="btn ghost">Voltar ao site</Link>
      </header>

      <main className="privacy-content">
        <span className="lp-eyebrow">Privacidade e proteção de dados</span>
        <h1>Política de Privacidade</h1>
        <p className="privacy-updated">Atualizada em 15 de agosto de 2026.</p>

        <p>
          Esta política explica como a Central School trata dados pessoais na landing page, na
          plataforma de aprendizagem e no relacionamento com alunos, responsáveis e interessados.
          Buscamos usar somente os dados necessários, com transparência, segurança e respeito à
          Lei Geral de Proteção de Dados Pessoais (LGPD).
        </p>

        <h2>1. Quem controla os dados</h2>
        <p>
          A Central School é responsável pelas decisões sobre o tratamento dos dados descritos
          nesta política. Dúvidas e solicitações de privacidade podem ser encaminhadas pelo canal
          oficial informado na seção &ldquo;Contato&rdquo; desta página.
        </p>

        <h2>2. Quais dados podemos tratar</h2>
        <ul>
          <li>identificação e contato, como nome, e-mail e foto de perfil;</li>
          <li>objetivo de aprendizagem, nível de inglês e preferências informadas pelo aluno;</li>
          <li>progresso, exercícios, atividades, frequência e tempo de uso da plataforma;</li>
          <li>mensagens enviadas ao professor e textos enviados ao tutor com inteligência artificial;</li>
          <li>transcrições produzidas pelos recursos de voz do navegador, quando utilizados;</li>
          <li>situação de cobranças e identificadores de pagamento recebidos do Asaas;</li>
          <li>dados técnicos, registros de segurança, falhas e informações do dispositivo ou navegador.</li>
        </ul>
        <p>Não armazenamos na plataforma o número completo do cartão nem sua senha bancária.</p>

        <h2>3. Para que utilizamos os dados</h2>
        <ul>
          <li>criar e proteger a conta, autenticar acessos e manter a sessão;</li>
          <li>personalizar a trilha, acompanhar o progresso e prestar apoio pedagógico;</li>
          <li>oferecer exercícios, conversação, pronúncia e tutor de inteligência artificial;</li>
          <li>responder contatos, prestar suporte e comunicar informações sobre o serviço;</li>
          <li>administrar cobranças, liberar ou suspender acesso conforme a situação contratual;</li>
          <li>prevenir fraude, investigar falhas e manter a plataforma segura;</li>
          <li>cumprir obrigações legais, regulatórias e contratuais.</li>
        </ul>

        <h2>4. Bases legais</h2>
        <p>
          Dependendo da finalidade, o tratamento pode ocorrer para executar contrato ou procedimentos
          solicitados pelo titular, cumprir obrigação legal, proteger direitos, atender interesse
          legítimo com avaliação adequada ou mediante consentimento. O consentimento é usado para
          tecnologias opcionais quando aplicável e pode ser revogado.
        </p>

        <h2>5. Compartilhamento e operadores</h2>
        <p>Podemos utilizar fornecedores estritamente para operar o serviço, incluindo:</p>
        <ul>
          <li><b>Supabase</b>, para autenticação, banco de dados e armazenamento;</li>
          <li><b>Asaas</b>, para cobranças e confirmações de pagamento;</li>
          <li><b>OpenAI</b>, para processar interações enviadas ao tutor de conversa;</li>
          <li><b>Google Analytics e Google Ads</b>, para medição de audiência, conversões e campanhas, somente após a autorização aplicável;</li>
          <li><b>Meta</b>, por meio do Meta Pixel, para mensuração e publicidade, somente após a autorização aplicável;</li>
          <li>provedores de hospedagem, infraestrutura e comunicação necessários ao funcionamento.</li>
        </ul>
        <p>
          Dados também podem ser compartilhados quando houver obrigação legal ou ordem de autoridade
          competente. Alguns fornecedores podem processar dados fora do Brasil, com medidas contratuais
          e de segurança aplicáveis.
        </p>

        <h2>6. Cookies e armazenamento no navegador</h2>
        <p>
          Utilizamos cookies ou tecnologias equivalentes necessárias para autenticação, segurança,
          preferência de tema e continuidade do progresso. A recusa de itens opcionais não impede a
          navegação. Cookies de Analytics ajudam a entender visitas e desempenho. Cookies de
          marketing, incluindo Google Ads e Meta Pixel, ajudam a medir campanhas e podem apoiar a
          personalização de publicidade. Essas categorias opcionais não são ativadas antes da
          autorização correspondente. A preferência pode ser alterada a qualquer momento:
        </p>
        <PrivacyPreferencesButton />

        <h2>7. Retenção e segurança</h2>
        <p>
          Conservamos dados pelo período necessário às finalidades informadas e aos prazos legais.
          Aplicamos controles de acesso, autenticação, registros de auditoria e outras medidas para
          reduzir riscos. Nenhum sistema, contudo, elimina integralmente todos os riscos de segurança.
        </p>

        <h2>8. Direitos do titular</h2>
        <p>
          Nos termos da LGPD, o titular pode solicitar confirmação e acesso, correção, informações
          sobre compartilhamento, portabilidade quando aplicável, revisão de decisões automatizadas,
          anonimização, bloqueio ou eliminação nos casos legais, além de revogar consentimento.
          Algumas informações podem ser mantidas para cumprimento de obrigações legais ou defesa de direitos.
        </p>

        <h2>9. Crianças e adolescentes</h2>
        <p>
          Quando o serviço for utilizado por criança ou adolescente, o tratamento deve observar seu
          melhor interesse e, quando exigido, a participação do responsável legal. O responsável pode
          entrar em contato para exercer direitos ou esclarecer o uso da plataforma.
        </p>

        <h2>10. Contato</h2>
        <p>
          Para exercer direitos ou tratar de privacidade, fale com a Central School pelo WhatsApp
          oficial: <a href="https://wa.me/5511933779408" target="_blank" rel="noopener noreferrer">(11) 93377-9408</a>.
          Poderemos solicitar informações suficientes para confirmar a identidade do solicitante e
          proteger a conta contra pedidos indevidos.
        </p>

        <h2>11. Atualizações</h2>
        <p>
          Esta política pode ser atualizada para refletir mudanças na plataforma, nos fornecedores ou
          na legislação. A versão vigente e sua data de atualização permanecerão publicadas nesta página.
        </p>
      </main>
    </div>
  );
}
