"use client";

import { useEffect } from "react";

/**
 * Movimento da página inicial (pedido do Fabio, 20/11/2026: "mais movimento, menos página morta").
 * - Liga a classe `lp-motion` no <html>; todo o CSS de animação depende dela, então sem JS
 *   (ou com "reduzir movimento" ligado no sistema) a página fica estática e completa.
 * - [data-reveal]: aparece suavemente quando entra na tela (atraso escalonado por --i).
 * - [data-count]: número conta de 0 até o valor quando aparece (o HTML já vem com o valor final).
 */
export function LandingMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("lp-motion");

    const counters = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    const format = (n: number) => n.toLocaleString("pt-BR");
    counters.forEach((el) => { el.textContent = format(0) + (el.dataset.suffix ?? ""); });

    const animateCount = (el: HTMLElement) => {
      const target = Number(el.dataset.count) || 0;
      const suffix = el.dataset.suffix ?? "";
      const duration = 1400;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        el.textContent = format(Math.round(target * eased)) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        if (el.hasAttribute("data-reveal")) el.classList.add("is-in");
        if (el.hasAttribute("data-count")) animateCount(el);
        observer.unobserve(el);
      }
    }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });

    document.querySelectorAll("[data-reveal], [data-count]").forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      root.classList.remove("lp-motion");
    };
  }, []);

  return null;
}
