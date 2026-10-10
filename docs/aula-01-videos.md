# Aula 1 — vídeos com Livia e Fabio

A lição A1 `apresentando-se` agora inclui a conversa aprovada com os avatares na introdução e no listening, além do vídeo “Sua vez” nas expressões. A página da lição indica onde assistir. O diálogo textual acompanha o vídeo, com traduções e botões para repetir cada fala.

Os arquivos ficam em `public/lessons/apresentando-se/v1/`. Os vídeos usam vozes sintéticas em inglês e legendas em português incorporadas à imagem; os VTT também estão disponíveis. O vídeo de prática oferece pausas de sete segundos, sem gravação ou avaliação da fala.

Nenhuma migração de banco. Os cinco IDs de etapa, as regras de conclusão, as rotas protegidas e a persistência do progresso permanecem os mesmos. Reproduzir um vídeo não conclui a etapa automaticamente. As aulas 2 e 3 continuam como materiais locais aguardando revisão pedagógica.

Validação: build de produção e TypeScript; ESLint nos arquivos alterados; validador de currículo; teste do componente no Chrome com reprodução dos dois vídeos, busca por capítulo, largura de 390px sem rolagem horizontal, erro de carregamento com link alternativo e redirecionamento de aluno sem sessão para login. O componente foi testado em uma rota temporária removida antes da entrega. Não foi realizado teste com aluno autenticado real.
