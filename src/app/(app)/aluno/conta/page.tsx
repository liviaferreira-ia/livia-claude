"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { initials, levelDisplay, useProfile } from "@/lib/profile";

export default function MinhaContaPage() {
  const { profile, email, ready, updateIdentity, uploadAvatar, signOut } = useProfile();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  // Nome exibido: enquanto não editar, usa o da conta.
  const nameValue = name ?? profile.name;

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMsg("Escolha um arquivo de imagem (JPG ou PNG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg("A imagem é muito grande (máximo 5 MB).");
      return;
    }
    setUploading(true);
    setMsg("");
    const { error } = await uploadAvatar(file);
    setUploading(false);
    setMsg(error ? `Não consegui enviar a foto: ${error}` : "Foto atualizada! ✅");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function saveName() {
    setSavingName(true);
    setMsg("");
    const { error } = await updateIdentity({ name: nameValue.trim() });
    setSavingName(false);
    setMsg(error ? "Não consegui salvar o nome agora." : "Nome atualizado! ✅");
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  if (!ready) {
    return (
      <div className="view">
        <p className="muted">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="view">
      <div style={{ maxWidth: 680 }}>
        <h2 style={{ fontSize: 26, marginBottom: 4 }}>Minha conta</h2>
        <p className="muted" style={{ marginBottom: 22 }}>
          Seus dados ficam salvos na sua conta e acompanham você em qualquer aparelho.
        </p>

        {/* Cabeçalho com foto */}
        <div className="profile-hero">
          <div className="profile-hero-banner" />
          <div className="profile-hero-body">
            <div className="profile-hero-avatar">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt="Foto de perfil" />
              ) : (
                <span>{initials(profile.name)}</span>
              )}
            </div>
            <div className="profile-hero-info">
              <h2>{profile.name || "Aluno(a)"}</h2>
              <div className="profile-hero-tags">
                {profile.level && <span className="level-badge">{levelDisplay(profile.level)}</span>}
                <span className="muted">{email}</span>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              style={{ display: "none" }}
            />
            <button
              className="btn ghost profile-hero-btn"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Enviando…" : profile.avatarUrl ? "Trocar foto" : "Adicionar foto"}
            </button>
          </div>
        </div>

        {msg && (
          <p className={`auth-msg ${msg.includes("✅") ? "ok" : "err"}`} style={{ maxWidth: "none" }}>
            {msg}
          </p>
        )}

        {/* Dados */}
        <div className="card" style={{ marginTop: 18, padding: 22 }}>
          <div className="eyebrow">Seus dados</div>
          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="nome">Nome</label>
            <input id="nome" value={nameValue} onChange={(e) => setName(e.target.value)} />
          </div>
          <button
            className="btn primary"
            style={{ marginTop: 12, opacity: savingName ? 0.6 : 1 }}
            onClick={saveName}
            disabled={savingName || !nameValue.trim()}
          >
            {savingName ? "Salvando…" : "Salvar nome"}
          </button>
        </div>

        {/* Objetivo e nível */}
        <div className="card" style={{ marginTop: 18, padding: 22 }}>
          <div className="sec-h" style={{ marginBottom: 2 }}>
            <h3 style={{ fontSize: 15 }}>Objetivo e nível</h3>
            <span className="muted">seu diagnóstico de entrada</span>
          </div>
          <div style={{ marginTop: 6 }}>
            <div className="m-item" style={{ cursor: "default" }}>
              <span className="m-ic tint-navy" style={{ fontSize: 18 }}>
                🎯
              </span>
              <span className="m-body">
                <b>Objetivo</b>
                <span>{profile.goal || "Não definido"}</span>
              </span>
            </div>
            <div className="m-item" style={{ cursor: "default" }}>
              <span className="m-ic tint-gold" style={{ fontSize: 18 }}>
                📈
              </span>
              <span className="m-body">
                <b>Nível</b>
                <span>{(profile.level && levelDisplay(profile.level)) || "Não definido"}</span>
              </span>
            </div>
          </div>
          <Link href="/onboarding" className="btn ghost" style={{ width: "100%", marginTop: 14 }}>
            ↺ Refazer o diagnóstico
          </Link>
        </div>

        {/* Conta */}
        <div className="card" style={{ marginTop: 18, padding: 22 }}>
          <div className="eyebrow">Conta</div>
          <p className="muted" style={{ fontSize: 13, margin: "10px 0 12px" }}>
            Sair encerra a sessão neste aparelho. Você pode entrar de novo quando quiser.
          </p>
          <button className="btn primary" style={{ width: "100%" }} onClick={handleSignOut}>
            ↩ Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
