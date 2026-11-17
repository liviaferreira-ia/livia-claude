"use client";

import { useEffect } from "react";

/**
 * Mantém o visual atual na página onde for usado, mesmo para quem está no design v2.
 * Usado no site de vendas quando SITE_DESIGN_V2 = false (decisão da Livia).
 */
export function SiteKeepV1() {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute("data-design");
    if (previous) root.removeAttribute("data-design");
    return () => { if (previous) root.setAttribute("data-design", previous); };
  }, []);
  return null;
}
