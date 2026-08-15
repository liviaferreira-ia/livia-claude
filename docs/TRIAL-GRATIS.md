# Período gratuito de 7 dias

## Jornada implementada

1. A pessoa cria a conta em `/experimente`, sem informar cartão.
2. O relógio de sete dias começa no primeiro acesso autenticado.
3. Nos três últimos dias, a plataforma mostra um aviso com os dias restantes. Durante o trial, o Tutor com IA aceita até 10 mensagens por hora por conta para controlar custo.
4. Ao terminar, as atividades são pausadas e `/continuar` preserva o acesso à contratação.
5. A pessoa vê o valor, aceita expressamente a recorrência e só então abre o Checkout hospedado do Asaas.
6. O retorno do navegador não libera acesso. Apenas Webhooks `CHECKOUT_PAID`, `PAYMENT_CONFIRMED` ou `PAYMENT_RECEIVED` convertem o trial.
7. Perfil, respostas e progresso permanecem salvos durante todo o fluxo.

Contas antigas e alunos convidados não recebem trial automaticamente. A regra vale apenas para cadastros originados em `/experimente`.

## Configuração antes de publicar

1. Rodar `supabase-setup-13-trial-gratis.sql` no banco.
2. Configurar no Node.js Selector:
   - `TRIAL_MONTHLY_PRICE` — número em reais, por exemplo `99.90`;
   - `TRIAL_PLAN_NAME` — opcional;
   - credenciais já previstas: `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN` e `CRON_SECRET`.
3. No Asaas, adicionar ao Webhook existente os eventos:
   - `CHECKOUT_CREATED`;
   - `CHECKOUT_CANCELED`;
   - `CHECKOUT_EXPIRED`;
   - `CHECKOUT_PAID`;
   - além dos eventos de cobrança que a integração já utiliza.
4. Confirmar que o cron diário de `/api/cron/bloquear-atrasados` continua ativo.

Sem `TRIAL_MONTHLY_PRICE`, o teste gratuito funciona, mas a tela final encaminha para o atendimento e não cria checkout.

## Validação recomendada

Testar primeiro com `ASAAS_API_BASE_URL=https://sandbox.asaas.com/api/v3` e dados fictícios:

- cadastro com e sem confirmação de e-mail;
- início do prazo somente no primeiro acesso;
- conta convidada fora do fluxo de trial;
- aviso com três dias e um dia restante;
- redirecionamento ao fim do prazo;
- clique duplo em “Quero continuar” sem checkout duplicado;
- retorno de sucesso sem Webhook não libera acesso;
- `CHECKOUT_PAID` libera acesso e mantém bloqueio manual do professor;
- cancelamento/expiração permite gerar um novo checkout;
- renovação mensal gera cobranças conciliadas no painel financeiro.

## Comunicação

Esta versão entrega avisos dentro da plataforma. E-mail e WhatsApp proativos exigem um provedor transacional e consentimentos próprios; não foram simulados nem enviados pelo sistema.
