import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";

export default function TermosTestePage() {
  return (
    <main className="view" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}><BrandLockup width={220} /></div>
      <div className="card" style={{ padding: 28 }}>
        <div className="eyebrow">Condições comerciais</div>
        <h1 style={{ fontSize: 28, marginTop: 6 }}>Período gratuito de 7 dias</h1>
        <div className="muted" style={{ lineHeight: 1.75, marginTop: 18 }}>
          <p>O período gratuito começa no primeiro acesso autenticado à plataforma e termina sete dias depois.</p>
          <p>Não solicitamos cartão no cadastro e não fazemos cobrança automática ao final do teste.</p>
          <p>Quando o período terminar, o acesso às atividades será pausado. O perfil e o progresso continuarão salvos.</p>
          <p>Para continuar, o aluno deverá escolher “Quero continuar”, conferir o valor mensal exibido e aceitar expressamente a assinatura recorrente antes de abrir o ambiente de pagamento do Asaas.</p>
          <p>A assinatura poderá ser cancelada pelos canais de atendimento da Central School. Até que a contratação seja confirmada pelo Asaas, nenhum acesso pago será considerado ativo.</p>
        </div>
        <Link href="/experimente" className="btn primary" style={{ display: "inline-block", marginTop: 18 }}>Voltar ao cadastro</Link>
      </div>
    </main>
  );
}
