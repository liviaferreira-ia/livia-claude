"use client";

import { useSyncExternalStore } from "react";
import { DESIGN_V2_PARA_TODOS } from "@/lib/design";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-design"] });
  return () => observer.disconnect();
}
const read = () => document.documentElement.getAttribute("data-design") === "v2";
const readOnServer = () => DESIGN_V2_PARA_TODOS;

/** Diz se o design v2 está ligado agora (o AppShell liga para a equipe quando o perfil carrega). */
export function useDesignV2(): boolean {
  return useSyncExternalStore(subscribe, read, readOnServer);
}
