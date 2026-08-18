"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_KEY = "central_privacy_consent_v2";
const OPEN_EVENT = "central:open-privacy-consent";

type ConsentChoice = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
  version: 2;
};

function saveChoice(analytics: boolean, marketing: boolean) {
  const choice: ConsentChoice = {
    necessary: true,
    analytics,
    marketing,
    decidedAt: new Date().toISOString(),
    version: 2,
  };
  window.localStorage.setItem(CONSENT_KEY, JSON.stringify(choice));
  window.dispatchEvent(new CustomEvent("central:privacy-consent-changed", { detail: choice }));
}

/**
 * Banner de primeiro acesso. Integrações analíticas futuras devem consultar
 * `central_privacy_consent_v2` antes de carregar qualquer script opcional.
 */
export function PrivacyConsent() {
  const [open, setOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpen(!window.localStorage.getItem(CONSENT_KEY));
    }, 0);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(OPEN_EVENT, reopen);
    };
  }, []);

  function choose(nextAnalytics: boolean, nextMarketing: boolean) {
    const isChangingPreviousChoice = Boolean(window.localStorage.getItem(CONSENT_KEY));
    saveChoice(nextAnalytics, nextMarketing);
    if (isChangingPreviousChoice) {
      // Tags já carregadas não podem ser desfeitas com segurança. Recarregar
      // garante que a nova escolha seja aplicada desde o início da navegação.
      window.location.reload();
      return;
    }
    setOpen(false);
    setCustomizing(false);
  }

  if (!open) return null;

  return (
    <section className="privacy-consent" role="dialog" aria-modal="false" aria-labelledby="privacy-consent-title">
      <div>
        <b id="privacy-consent-title">Sua privacidade importa</b>
        <p>
          Usamos armazenamento necessário para login, segurança e preferências. Com sua
          permissão, usamos Analytics para medir o uso e tecnologias do Google e da Meta para
          avaliar campanhas e publicidade. Saiba mais
          na nossa <Link href="/privacidade">Política de Privacidade</Link>.
        </p>
        {customizing && (
          <div className="privacy-options">
            <label>
              <input type="checkbox" checked disabled />
              <span><b>Necessários</b><small>Login, segurança e preferências básicas.</small></span>
            </label>
            <label>
              <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
              <span><b>Analytics</b><small>Medição de visitas e desempenho do site.</small></span>
            </label>
            <label>
              <input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} />
              <span><b>Marketing</b><small>Google Ads, Meta Pixel e medição de campanhas.</small></span>
            </label>
          </div>
        )}
      </div>
      <div className="privacy-consent-actions">
        <button className="btn ghost" type="button" onClick={() => choose(false, false)}>
          Somente necessários
        </button>
        {customizing ? (
          <button className="btn primary" type="button" onClick={() => choose(analytics, marketing)}>
            Salvar preferências
          </button>
        ) : (
          <>
            <button className="btn ghost" type="button" onClick={() => setCustomizing(true)}>
              Personalizar
            </button>
            <button className="btn primary" type="button" onClick={() => choose(true, true)}>
              Aceitar todos
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export function PrivacyPreferencesButton() {
  return (
    <button
      className="privacy-link-button"
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
    >
      Preferências de privacidade
    </button>
  );
}
