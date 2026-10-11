# Revisão e publicação das novas aulas A1

## Funcionamento

As 49 novas aulas têm decisão individual no painel `/professor/aulas`. O piloto Primeiro encontro, já publicado anteriormente, mantém seu fluxo existente. Aprovar uma nova aula publica sua versão atual na biblioteca `/aluno/aulas`; reprovar exige uma observação e retira a aula dessa biblioteca. A decisão é compartilhada entre dispositivos e contas da equipe, com data, responsável e histórico no Supabase.

O painel da Livia mantém acesso às aulas pendentes, reprovadas e aprovadas, incluindo vídeos e gabaritos. Os alunos só recebem o conteúdo das versões aprovadas. Há exercícios interativos com orientação e novas tentativas. A aprovação não marca aulas concluídas nem altera a trilha ou o progresso anterior dos alunos.

Cada aprovação identifica o conteúdo e os cinco arquivos de mídia por SHA-256. Um deploy que modifica o conteúdo ou a mídia invalida a aprovação anterior: a aula volta à revisão e fica indisponível aos alunos até nova aprovação. A revisão antiga e seu comentário permanecem no histórico. O cache de hashes vive apenas no processo atual; alterações de conteúdo/mídia são publicadas pelo fluxo de build/deploy com reinício da aplicação.

Se outra decisão for salva enquanto a página estiver aberta, o banco rejeita a decisão desatualizada. A professora deve atualizar a página antes de continuar. A gravação da decisão e do histórico ocorre na mesma transação. Falhas de consulta não liberam aulas aos alunos.

## Ativação

1. Executar **todo** `supabase-setup-22-revisao-aulas.sql` no SQL Editor do projeto `jqxiztixsegcufolbzwm`. O arquivo é idempotente e não aprova nenhuma aula por conta própria.
2. Confirmar a aplicação da migração antes de enviar o pacote de deploy ao servidor.
3. Publicar pelo fluxo `/escola`, conferir BUILD_ID, marcador, consumo do pacote, log novo e chunks exclusivos.
4. Com a sessão da Livia, reprovar uma aula com comentário e confirmar a permanência no painel. Aprovar somente um material que ela realmente validou; confirmar a biblioteca e reprodução no aluno. Não criar aprovações fictícias no banco de produção para testar.

## Verificações

- `npm run build`
- ESLint nos arquivos alterados
- `npm run validate:curriculum`
- `node scripts/test-lesson-publication.cjs`: autorização, decisões inválidas, conflito, liberação/retirada, falha de banco, proteção de caminhos e requisições parciais dos vídeos.
- Teste isolado PostgreSQL/PGlite: migração aplicada duas vezes, RLS, permissões, comentário obrigatório, publicação/retirada, conflito de decisão e privacidade do histórico. Não acessa produção.
- Playwright com decisões simuladas: caixa de correção, aprovação, reprovação posterior, conflito sem mudança visual indevida, cinco exercícios com erro/nova tentativa/acerto, dois vídeos, desktop/celular e ausência de erros JavaScript.

Evidências locais: `output/central-school/a1-aprovacao/` no workspace da agência. Páginas temporárias de preview devem ser removidas antes do build final. Testes simulados não substituem a validação na sessão real da Livia após a migração e o deploy.
