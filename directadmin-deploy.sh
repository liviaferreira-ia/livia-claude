#!/bin/bash
# ============================================================
# Central School — publicar build no servidor (DirectAdmin + Node.js Selector)
# Servidor real: DirectAdmin (não cPanel), LiteSpeed + CloudLinux (CageFS).
# SSH externo não funciona aqui (porta 22 fechada, CSF filtra o resto) —
# rode este script pelo Terminal de comando web do próprio painel:
#   DirectAdmin → Recursos Avançados → Sistema e arquivos → Terminal de comando
#
# Uso:
#   cd domains/centralschool.com.br
#   tar xzf central-school-build.tar.gz
#   source ~/nodevenv/domains/centralschool.com.br/<versão>/bin/activate
#   bash directadmin-deploy.sh
#
# Pré-requisito: o app já foi criado em DirectAdmin → Node.js Selector, com:
#   - App Root:              domains/centralschool.com.br  (sem public_html —
#                             os arquivos ficam soltos direto nessa pasta)
#   - Application URL:       centralschool.com.br
#   - Application startup file: server.js
#   - Node.js version:       22.x (mais recente disponível)
# IMPORTANTE: extraia o .tar.gz nessa pasta ANTES de criar o app no Node.js
# Selector. Se a pasta ainda não existir na hora de criar, o painel não
# escreve o .htaccess do Passenger — se isso acontecer, "Destroy" o app e
# recriar depois de a pasta existir.
#
# Variáveis de ambiente: nenhuma necessária hoje (Supabase URL/chave pública
# já vêm hardcoded em src/lib/supabase/config.ts). Se entrar alguma chave de
# API no futuro (ex.: OpenAI/Azure), cadastre na seção "Variáveis de
# ambiente" do próprio Node.js Selector — esse ambiente não lê arquivo .env.
#
# Aviso normal, não bloqueia nada: a glibc do servidor é antiga pro binário
# nativo do SWC, então o Next.js cai pro modo WASM sozinho (só compila um
# pouco mais devagar).
# ============================================================
set -euo pipefail

if [ ! -f package.json ]; then
  echo "Não achei package.json aqui. Rode este script dentro da pasta do app" >&2
  echo "(depois de extrair o central-school-build.tar.gz)." >&2
  exit 1
fi

echo "==> Instalando dependências de produção..."
npm ci --omit=dev

echo "==> Pedindo pro Passenger reiniciar o app..."
mkdir -p tmp
touch tmp/restart.txt

echo "==> Pronto! Se ainda não atualizar, clique em 'Reiniciar' no"
echo "    Node.js Selector também — às vezes precisa dos dois."
