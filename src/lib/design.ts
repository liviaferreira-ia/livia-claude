/**
 * Redesign da plataforma ("design v2"), aprovado por Fabio em 16 e 17/11/2026.
 * Referência: design system da Central School (cores da bandeira americana em
 * versão clean, Playfair Display + DM Sans, tema claro como padrão).
 *
 * Regra de validação da Livia: o visual novo aparece primeiro só para a equipe
 * (professora e admin). Depois da aprovação dela, trocar para `true` libera o
 * visual novo para todos os alunos, já no HTML do servidor (sem piscar).
 */
export const DESIGN_V2_PARA_TODOS = false;

/** Chave local que lembra que esta conta usa o visual novo, para aplicar antes do perfil carregar. */
export const DESIGN_STORAGE_KEY = "central_design";

export function designV2Ativo(isStaff: boolean): boolean {
  return DESIGN_V2_PARA_TODOS || isStaff;
}
