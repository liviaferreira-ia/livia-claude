# Fila de aprovação das aulas

`/professor/aulas` abre em **Pendentes**. Só entram aulas sem decisão, reprovadas ou com uma versão diferente daquela que foi aprovada. Aprovações válidas saem dessa lista e ficam em **Aprovadas**, acessível em `/professor/aulas?status=aprovadas`.

As contagens são calculadas a partir das decisões do banco e da revisão atual do conteúdo. A primeira aula, “Primeiro encontro”, já publicada no fluxo anterior, aparece somente em Aprovadas. Unidades sem aulas no filtro atual ficam ocultas; quando não há pendências, a página informa isso. As demais lições anteriores da plataforma ficam em uma seção de consulta recolhida e não entram na contagem das novas aulas A1.

Após aprovar, a professora pode usar **Continuar revisão das pendentes**. Esse link e o retorno ao final da aula fazem uma nova requisição da lista para evitar restaurar uma visita anterior em cache. A aula e os vídeos continuam acessíveis em Aprovadas para consulta ou uma nova solicitação de correção.

Nenhuma decisão, conteúdo de aula ou publicação é alterado por essa organização. Não há migração de banco. Uma reprovação ou uma alteração do conteúdo faz a aula voltar à fila pela regra de revisão já existente.

Verificação: `node scripts/test-lesson-queue.cjs` cobre filtros, contagens, publicação legada, unidades vazias, aprovação removendo da fila, reprovação e conteúdo alterado voltando à fila, estado sem pendências e falha de banco. O teste usa decisões simuladas e não grava aprovações reais.
