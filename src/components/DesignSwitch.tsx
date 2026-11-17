"use client";

import type { ReactNode } from "react";
import { useDesignV2 } from "@/lib/useDesignV2";

/** Mostra a versão do design v2 quando ele está ligado; senão, a versão atual. Só uma das duas entra na página. */
export function DesignSwitch({ v1, v2 }: { v1: ReactNode; v2: ReactNode }) {
  return useDesignV2() ? v2 : v1;
}
