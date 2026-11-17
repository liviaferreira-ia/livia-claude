/**
 * Nome que a pessoa escolheu (display_name), com o nome do cadastro/Google como reserva.
 * O login com Google sobrescreve "name" e "full_name" a cada entrada (17/11/2026); por isso o nome
 * escolhido fica em display_name, que só a própria plataforma grava.
 */
export function chosenName(meta: Record<string, unknown> | null | undefined): string {
  const pick = (key: string) => (typeof meta?.[key] === "string" ? (meta[key] as string).trim() : "");
  return pick("display_name") || pick("name") || pick("full_name");
}
