# Progresso pedagógico

## O que causou os registros zerados

O sistema tinha fontes de dados independentes:

- tempo de uso era salvo em `student_activity`;
- seções concluídas eram salvas em `student_lesson_progress`;
- o painel do professor mostrava apenas contadores de exercícios de `student_activity`;
- a tarefa final das lições não registrava cada resposta;
- chamadas RPC antigas não verificavam o erro retornado pelo Supabase.

Por isso era possível estudar por vários minutos e continuar com zero exercícios no painel. Além disso, “% do nível” era calculado a partir da quantidade de respostas, e não das etapas curriculares concluídas.

## Nova fonte de verdade

Execute `supabase-setup-15-progresso-pedagogico.sql` no SQL Editor do Supabase, depois da parte 12 e antes de publicar o código desta entrega.

Para habilitar a trilha B2 de 14 unidades em uma base que já recebeu a parte 15, execute também `supabase-setup-16-progresso-b2.sql` antes de publicar o B2.

Para habilitar a trilha C1 de 14 unidades e reposicionar corretamente a lição antiga de debate, execute `supabase-setup-17-progresso-c1.sql` depois da parte 16.

Cada conclusão passa a ser registrada em `student_course_progress` por:

- aluno;
- nível;
- unidade;
- etapa: aprender, compreender, praticar, falar, missão ou domínio;
- origem e evidência;
- data de conclusão.

`student_activity` mantém uma projeção rápida com total de etapas, unidade atual e próxima etapa. O painel usa essa projeção para mostrar o percentual real do nível.

## Reconciliação histórica

A migração recupera automaticamente:

- seções de lições já salvas, convertendo-as em etapas curriculares;
- tentativas detalhadas de exercícios que existam, elevando contadores resumidos que tenham ficado abaixo da evidência;
- progresso antigo do `localStorage` quando o aluno voltar a acessar, pelo sincronizador já existente.

Não são convertidos em conclusão:

- tempo de tela isolado;
- login sem atividade;
- evento genérico sem nível, unidade ou evidência suficiente.

Essa restrição evita atribuir ao aluno um domínio que não foi demonstrado.

## Critério de domínio

A etapa de domínio da primeira unidade é concluída quando o aluno termina a tarefa final com pelo menos 80% de acerto. Prática, pronúncia e missão possuem registros próprios; repetir uma etapa atualiza a evidência, mas não aumenta artificialmente o percentual curricular.
