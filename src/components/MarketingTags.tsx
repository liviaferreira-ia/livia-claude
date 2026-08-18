"use client";

import { useEffect } from "react";

const CONSENT_KEY = "central_privacy_consent_v2";

type ConsentChoice = { analytics?: boolean; marketing?: boolean };
type MetaPixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
};
type TrackingWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: MetaPixelFunction;
  _fbq?: MetaPixelFunction;
};

function readConsent(): ConsentChoice {
  try {
    return JSON.parse(window.localStorage.getItem(CONSENT_KEY) ?? "{}") as ConsentChoice;
  } catch {
    return {};
  }
}

function loadGoogle(analytics: boolean, marketing: boolean) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const primaryId = analytics ? gaId : marketing ? adsId : undefined;
  if (!primaryId || document.querySelector("script[data-central-google-tag]")) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryId)}`;
  script.dataset.centralGoogleTag = "true";
  document.head.appendChild(script);

  const trackedWindow = window as TrackingWindow;
  trackedWindow.dataLayer = trackedWindow.dataLayer ?? [];
  trackedWindow.gtag = (...args: unknown[]) => trackedWindow.dataLayer?.push(args);
  trackedWindow.gtag("js", new Date());
  if (analytics && gaId) trackedWindow.gtag("config", gaId);
  if (marketing && adsId) trackedWindow.gtag("config", adsId);
}

function loadMeta() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const trackedWindow = window as TrackingWindow;
  if (!pixelId || trackedWindow.fbq || document.querySelector("script[data-central-meta-pixel]")) return;

  const fbq: MetaPixelFunction = ((...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  }) as MetaPixelFunction;
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  trackedWindow.fbq = fbq;
  trackedWindow._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  script.dataset.centralMetaPixel = "true";
  document.head.appendChild(script);
  fbq("init", pixelId);
  fbq("track", "PageView");
}

function applyConsent() {
  const consent = readConsent();
  if (consent.analytics || consent.marketing) loadGoogle(Boolean(consent.analytics), Boolean(consent.marketing));
  if (consent.marketing) loadMeta();
}

/** Carrega tags opcionais apenas depois do consentimento registrado. */
export function MarketingTags() {
  useEffect(() => {
    applyConsent();
    window.addEventListener("central:privacy-consent-changed", applyConsent);
    return () => window.removeEventListener("central:privacy-consent-changed", applyConsent);
  }, []);
  return null;
}
