"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { initials, useProfile } from "@/lib/profile";

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
      <div style={{ maxWidth: 640 }}>
        <h2 style={{ fontSize: 26, marginBottom: 4 }}>Minha conta</h2>
        <p className="muted" style={{ marginBottom: 22 }}>
          Seus dados ficam salvos na sua conta e acompanham você em qualquer aparelho.
        </p>

        {/* Cabeçalho com foto */}
        <div className="card" style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <div className="avatar-lg">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="Foto de perfil" />
            ) : (
              <span>{initials(profile.name)}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{profile.name || "Aluno(a)"}</div>
            <div className="muted" style={{ fontSize: 13.5 }}>{email}</div>
            <div style={{ marginTop: 8 }}>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                style={{ display: "none" }}
              />
              <button
                className="btn ghost"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Enviando…" : profile.avatarUrl ? "Trocar foto" : "Adicionar foto"}
              </button>
            </div>
          </div>
          {profile.level && <span className="level-badge">{profile.level}</span>}
        </div>

        {msg && (
          <p className={`auth-msg ${msg.includes("✅") ? "ok" : "err"}`} style={{ maxWidth: "none" }}>
            {msg}
          </p>
        )}

        {/* Dados */}
        <div className="card" style={{ marginTop: 18 }}>
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

          <div style={{ marginTop: 18, fontSize: 14, lineHeight: 2 }}>
            <div>
              <b>Objetivo:</b> {profile.goal || "—"}
            </div>
            <div>
              <b>Nível:</b> {profile.level || "—"}
            </div>
          </div>
          <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
            Quer mudar seu objetivo ou nível?{" "}
            <Link href="/onboarding" style={{ color: "var(--navy)", fontWeight: 700 }}>
              Refazer o diagnóstico
            </Link>
          </p>
        </div>

        {/* Conta */}
        <div className="card" style={{ marginTop: 18 }}>
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
