/**
 * Redesign da plataforma ("design v2"), aprovado por Fabio em 16 e 17/11/2026.
 * Referência: design system da Central School (cores da bandeira americana em
 * versão clean, Playfair Display + DM Sans, tema claro como padrão).
 *
 * Regra de validação da Livia: o visual novo aparece primeiro só para a equipe
 * (professora e admin). Depois da aprovação dela, trocar para `true` libera o
 * visual novo para todos os alunos, já no HTML do servidor (sem piscar).
 */
export const DESIGN_V2_PARA_TODOS = true; // Liberado para todos por decisão do Fabio em 17/11/2026, antes da validação da Livia.

/**
 * Site de vendas (página inicial) no design v2: versão clean preparada em 17/11/2026.
 * Fabio gostou; quem decide é a Livia. Se ela não aprovar, trocar para `false`:
 * o site volta ao visual atual mesmo com o resto da plataforma no v2.
 */
export const SITE_DESIGN_V2 = true; // Publicado para o público por decisão do Fabio em 17/11/2026.

/** Chave local que lembra que esta conta usa o visual novo, para aplicar antes do perfil carregar. */
export const DESIGN_STORAGE_KEY = "central_design";

/**
 * Modo de teste (17/11/2026): liga o visual novo só neste navegador, para testar o lado do aluno
 * (cadeados e conclusão de aula) com uma conta de aluno de teste durante a validação da Livia.
 * Ligar: abrir qualquer página com ?visual=novo. Desligar: ?visual=atual.
 */
export const DESIGN_TEST_KEY = "central_design_teste";

export function designV2Ativo(isStaff: boolean): boolean {
  return DESIGN_V2_PARA_TODOS || isStaff;
}
