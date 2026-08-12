#!/usr/bin/env python3
"""
Gera o inventário de exercícios existentes a partir de src/data/exercises.ts.

Uso (na raiz do projeto):
    python3 scripts/inventario-exercicios.py > docs/EXERCICIOS-EXISTENTES.md

Rode sempre que adicionar exercícios, para o inventário não ficar desatualizado.
"""

import re
import sys

LABEL = {
    "mc": "Múltipla escolha",
    "fill": "Completar a lacuna",
    "translate": "Tradução PT → EN",
    "order": "Ordenar palavras",
}
LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]
KINDS = [("mc", "MC"), ("fill", "FILL"), ("translate", "TRANSLATE"), ("order", "ORDER")]


def main() -> int:
    try:
        src = open("src/data/exercises.ts", encoding="utf-8").read()
    except FileNotFoundError:
        print("Rode este script na raiz do projeto.", file=sys.stderr)
        return 1

    body_by_key = {}
    total = 0
    for lvl in LEVELS:
        for kind, prefix in KINDS:
            m = re.search(
                r"const " + prefix + "_" + lvl + r"\s*:\s*\w+\[\]\s*=\s*\[(.*?)\n\];",
                src,
                re.S,
            )
            if not m:
                print(f"Array {prefix}_{lvl} não encontrado.", file=sys.stderr)
                return 1
            items = re.findall(r'\{\s*id:\s*"([^"]+)"(.*?)\},\s*(?=\n|\Z)', m.group(1), re.S)
            body_by_key[(lvl, kind)] = items
            total += len(items)

    out = [
        "# Exercícios que já existem",
        "",
        "Gerado automaticamente a partir de `src/data/exercises.ts`. **Não edite à mão.**",
        "",
        f"**Total atual: {total} exercícios.**",
        "",
        "Use como referência para não criar exercícios repetidos. A fonte da verdade é",
        "sempre o arquivo `src/data/exercises.ts` — se houver divergência, vale o código.",
        "",
        "Para regenerar: `python3 scripts/inventario-exercicios.py > docs/EXERCICIOS-EXISTENTES.md`",
    ]

    for lvl in LEVELS:
        out += ["", f"## {lvl}", ""]
        for kind, _ in KINDS:
            items = body_by_key[(lvl, kind)]
            out += [f"### {LABEL[kind]} ({len(items)})", ""]
            for iid, rest in items:
                if kind in ("mc", "fill"):
                    field = "prompt"
                elif kind == "translate":
                    field = "pt"
                else:
                    field = "answer"
                txt = re.search(field + r':\s*"((?:[^"\\]|\\.)*)"', rest).group(1)
                out.append(f"- `{iid}` — {txt.replace('|', chr(92) + '|')}")
            out.append("")

    print("\n".join(out))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
