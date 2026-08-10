import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  return (
    <div className="login-wrap">
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 20 }}>
        <ThemeToggle />
      </div>
      <div className="login-card">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <BrandLockup width={230} />
        </div>
        <p className="muted" style={{ fontSize: 14, marginTop: 16 }}>
          Entre para continuar seus estudos.
        </p>

        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" placeholder="voce@exemplo.com" />
        </div>
        <div className="field">
          <label htmlFor="senha">Senha</label>
          <input id="senha" type="password" placeholder="••••••••" />
        </div>

        <Link href="/aluno" className="btn primary" style={{ width: "100%", marginTop: 20 }}>
          Entrar
        </Link>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 12,
            fontSize: 13,
          }}
        >
          <Link href="/aluno" className="btn ghost" style={{ flex: 1 }}>
            Entrar como aluno
          </Link>
          <Link href="/professor" className="btn ghost" style={{ flex: 1 }}>
            Como professor
          </Link>
        </div>

        <p className="muted" style={{ fontSize: 13, marginTop: 16 }}>
          Primeira vez?{" "}
          <Link href="/onboarding" style={{ color: "var(--navy)", fontWeight: 700 }}>
            Fazer o diagnóstico rápido
          </Link>
        </p>

        <p className="est-note" style={{ marginTop: 10 }}>
          Protótipo — o login real (Supabase) entra na Etapa 2. Por enquanto os
          botões levam direto às telas.
        </p>
      </div>
    </div>
  );
}
