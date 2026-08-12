"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getMyContactInfo, updateContactInfo } from "@/lib/activity";
import { initials, levelDisplay, useProfile } from "@/lib/profile";
import { AvatarCropper } from "@/components/AvatarCropper";

export default function MinhaContaPage() {
  const { profile, email, ready, updateIdentity, uploadAvatar, signOut } = useProfile();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [msg, setMsg] = useState("");

  const [whatsapp, setWhatsapp] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [contactLoaded, setContactLoaded] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [contactMsg, setContactMsg] = useState("");

  useEffect(() => {
    if (!ready) return;
    getMyContactInfo().then(({ whatsapp, birthdate }) => {
      setWhatsapp(whatsapp);
      setBirthdate(birthdate);
      setContactLoaded(true);
    });
  }, [ready]);

  async function saveContact() {
    setSavingContact(true);
    setContactMsg("");
    const { error } = await updateContactInfo(whatsapp, birthdate);
    setSavingContact(false);
    setContactMsg(error ? "Não consegui salvar agora." : "Dados salvos! ✅");
  }

  // Nome exibido: enquanto não editar, usa o da conta.
  const nameValue = name ?? profile.name;

  /** Escolheu o arquivo: valida e abre o recorte (o envio só acontece depois). */
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMsg("Escolha um arquivo de imagem (JPG ou PNG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMsg("A imagem é muito grande (máximo 10 MB).");
      return;
    }
    setMsg("");
    setPendingPhoto(file);
  }

  /** Confirmou o enquadramento: envia a versão já recortada. */
  async function handleCropped(blob: Blob) {
    setUploading(true);
    const { error } = await uploadAvatar(blob);
    setUploading(false);
    setPendingPhoto(null);
    setMsg(error ? `Não consegui enviar a foto: ${error}` : "Foto atualizada! ✅");
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
      {pendingPhoto && (
        <AvatarCropper
          file={pendingPhoto}
          saving={uploading}
          onCancel={() => setPendingPhoto(null)}
          onConfirm={handleCropped}
        />
      )}
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

        {/* Contato */}
        <div className="card" style={{ marginTop: 18, padding: 22 }}>
          <div className="eyebrow">WhatsApp e data de nascimento</div>
          <p className="muted" style={{ fontSize: 13, margin: "6px 0 14px" }}>
            Usamos isso pra mandar lembretes de aula e recados, e pra indicar o conteúdo certo pra sua idade.
          </p>
          {!contactLoaded ? (
            <p className="muted" style={{ margin: 0 }}>
              Carregando…
            </p>
          ) : (
            <>
              <div className="field">
                <label htmlFor="whatsapp">WhatsApp</label>
                <input
                  id="whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 91234-5678"
                />
              </div>
              <div className="field" style={{ marginTop: 10 }}>
                <label htmlFor="nascimento">Data de nascimento</label>
                <input
                  id="nascimento"
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                />
              </div>
              {contactMsg && (
                <p className={`auth-msg ${contactMsg.includes("✅") ? "ok" : "err"}`} style={{ maxWidth: "none" }}>
                  {contactMsg}
                </p>
              )}
              <button
                className="btn primary"
                style={{ marginTop: 12, opacity: savingContact ? 0.6 : 1 }}
                onClick={saveContact}
                disabled={savingContact}
              >
                {savingContact ? "Salvando…" : "Salvar"}
              </button>
            </>
          )}
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
