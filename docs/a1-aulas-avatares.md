# Curso A1 com avatares — revisão pedagógica

Escopo solicitado por Fabio em 10/10/2026: produzir todas as unidades propostas. São 50 aulas em 12 unidades: seis na primeira unidade e quatro em cada uma das demais. Primeiro encontro já estava publicado; os outros 49 materiais são rascunhos para validação da Livia.

Cada rascunho inclui diálogo em inglês, tradução em português, explicação, cinco questões com gabarito e feedback, prática oral com pausas de sete segundos, aplicação pessoal, autoavaliação e revisão para o dia seguinte. Há dois vídeos por aula, com os sprites aprovados e vozes sintéticas Aria/Guy. Os diálogos representam situações fictícias.

## Acesso

Entrar com a conta de professora/admin e abrir **Professor → Aulas para revisar** (`/professor/aulas`). As unidades e os links completos aparecem nessa biblioteca. Não dependem do nível ou do progresso de um aluno.

Os rascunhos não foram adicionados a `LESSONS`, à trilha do aluno ou às funções de conclusão. A revisão é somente leitura e não altera dados de alunos. A liberação deve ocorrer depois da validação pedagógica e da definição do encaixe na trilha existente.

## Arquivos e proteção

- `src/data/a1Drafts.json`: conteúdo dos 49 rascunhos; importado somente no servidor.
- `lesson-media/a1-drafts/<id>/v1/`: MP4, VTT e cartaz, fora de `public/`.
- `/professor/aulas/midia/<id>/<file>`: entrega arquivos após `requireStaff()`, com whitelist de nomes/IDs, resposta privada sem cache e suporte a byte ranges.
- O proxy também verifica o papel, incluindo os cartazes PNG dessa rota.
- O pacote de deploy precisa incluir `lesson-media/`. Não mover rascunhos para uma pasta pública.

Não é necessária migração SQL. Os dados e o progresso existentes permanecem no fluxo anterior. Conclusão de telas e autoavaliação não certificam domínio A1; o conteúdo de passado simples no final exige avaliação da professora sobre dificuldade e adequação.

## Produção e evidências

Fontes locais: `clientes/central-school/aulas/catalogo-a1.json` e `a1/unidade-XX/NN-*/aula.json` no workspace da agência. Scripts locais produzem as mídias, verificam decodificação completa, montam as páginas e copiam apenas os arquivos necessários para este repositório.

Validação técnica: build, lint dos arquivos alterados, validação do currículo existente, exercícios/reprodução/celular nas páginas locais e testes da rota privada (papéis, intervalos e caminhos). Evidências do deploy ficam em `output/central-school/a1-completo/` no workspace. Uma verificação do servidor não substitui a revisão humana do conteúdo nem um teste autenticado da conta da Livia.
