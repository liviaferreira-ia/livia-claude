#!/bin/bash
# ============================================================
# Central School — publicar build no servidor (cPanel ou DirectAdmin)
# Rode este script DENTRO do servidor (via SSH/terminal), depois de
# enviar e extrair o pacote central-school-build.tar.gz na pasta do
# app (ex.: ~/domains/centralschool.com.br).
#
# Uso:
#   cd ~/domains/centralschool.com.br
#   tar xzf central-school-build.tar.gz
#   bash server-deploy.sh
#
# Pré-requisito: o app Node já foi criado no painel —
# cPanel: "Setup Node.js App" · DirectAdmin: "Node.js Selector" —
# com:
#   - Application root:      domains/centralschool.com.br
#   - Application URL:       centralschool.com.br
#   - Application startup file: server.js
#   - Node.js version:       a mais recente disponível
# Os dois painéis usam o mesmo Passenger por baixo, então o "restart
# via tmp/restart.txt" abaixo funciona nos dois.
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

echo "==> Pronto! Se o painel (Setup Node.js App / Node.js Selector) mostrar"
echo "    erro, clique em 'Restart' lá também — algumas versões exigem os dois."
