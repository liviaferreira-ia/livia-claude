# Conciliação de pagamentos do Asaas

## O que esta entrega faz

- O indicador **Recebido neste mês** abre um extrato com pagador/aluno, data, valor, forma e link da cobrança.
- Pagamentos recebidos de clientes ainda não vinculados viram **pré-cadastros pendentes**.
- O professor pode aprovar como novo aluno, vincular a um aluno existente ou marcar que o pagador não é aluno.
- Nenhuma conta ou convite é criado automaticamente para um pagador desconhecido.
- Ao aprovar um novo aluno, o e-mail de acesso pode ser diferente do e-mail do pagador.

## Antes de publicar

1. Execute `supabase-setup-14-conciliacao-financeira.sql` no SQL Editor do Supabase.
2. Confirme no servidor: `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN` e `SUPABASE_SERVICE_ROLE_KEY`.
3. Publique a aplicação.
4. No painel **Financeiro**, clique em **Sincronizar Asaas**. A primeira sincronização importa também cobranças ainda sem aluno vinculado.
5. Revise a fila **Pagamentos aguardando aprovação** antes de enviar qualquer acesso.

## Regras de segurança

- Pagamento iniciado pelo trial da própria plataforma continua vinculado automaticamente pelo `externalReference` do aluno.
- Pagamento externo nunca cria acesso sozinho, pois o pagador pode ser um responsável financeiro.
- Escritas na conciliação usam somente rotas autenticadas de professor e `service_role`; o navegador tem apenas leitura protegida por RLS.
