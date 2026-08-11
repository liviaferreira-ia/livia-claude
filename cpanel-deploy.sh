#!/bin/bash
# ============================================================
# Central School — publicar build no servidor cPanel
# Rode este script DENTRO do servidor (via SSH/terminal do cPanel),
# depois de enviar e extrair o pacote central-school-build.tar.gz
# na pasta do app (ex.: ~/domains/centralschool.com.br).
#
# Uso:
#   cd ~/domains/centralschool.com.br
#   tar xzf central-school-build.tar.gz
#   bash cpanel-deploy.sh
#
# Pré-requisito: o app Node já foi criado em
# cPanel → Setup Node.js App, com:
#   - Application root:      domains/centralschool.com.br
#   - Application URL:       centralschool.com.br
#   - Application startup file: server.js
#   - Node.js version:       a mais recente disponível
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

echo "==> Pronto! Se o painel 'Setup Node.js App' mostrar erro, clique em"
echo "    'Restart' lá também — algumas versões do cPanel exigem os dois."
