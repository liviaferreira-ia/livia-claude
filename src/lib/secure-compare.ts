import { timingSafeEqual } from "node:crypto";

/** Compara dois segredos em tempo constante -- evita vazar por diferença de tempo de resposta. */
export function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
