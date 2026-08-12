# Como criar exercícios para a Central School

Especificação técnica para quem for gerar novos exercícios (pessoa ou IA).
Siga à risca: o app lê esses dados direto, sem camada de validação em runtime.

---

## 1. Onde salvar

**Arquivo único:** `src/data/exercises.ts`

Não crie arquivos novos, não crie JSON separado, não mude a estrutura do arquivo.
Os exercícios novos entram **dentro dos arrays que já existem**, antes do `];`
que fecha cada um.

Os arrays são nomeados `<TIPO>_<NÍVEL>`:

```
MC_A1  FILL_A1  TRANSLATE_A1  ORDER_A1
MC_A2  FILL_A2  TRANSLATE_A2  ORDER_A2
MC_B1  FILL_B1  TRANSLATE_B1  ORDER_B1
MC_B2  FILL_B2  TRANSLATE_B2  ORDER_B2
MC_C1  FILL_C1  TRANSLATE_C1  ORDER_C1
MC_C2  FILL_C2  TRANSLATE_C2  ORDER_C2
```

Níveis CEFR válidos: `A1`, `A2`, `B1`, `B2`, `C1`, `C2`. Nada além disso.

Nenhum outro arquivo precisa ser alterado — `EXERCISES` no fim do arquivo já
aponta para todos os arrays, e a contagem exibida na interface é automática.

---

## 2. Os quatro tipos

Os tipos TypeScript estão no topo de `src/data/exercises.ts`. Não altere.

### 2.1 `mc` — Múltipla escolha

```ts
{ id: "a1-mc33", prompt: "She ___ coffee every morning.", options: ["drink", "drinks", "drinking", "drank"], answer: 1, explain: "3ª pessoa (she) no present simple leva -s: drinks." },
```

| Campo | Regra |
|---|---|
| `id` | único no arquivo inteiro (ver §3) |
| `prompt` | frase em inglês com `___` marcando a lacuna |
| `options` | **exatamente 4** alternativas |
| `answer` | índice da correta, **0 a 3** (0 = primeira) |
| `explain` | explicação em português do *porquê* |

### 2.2 `fill` — Completar a lacuna

```ts
{ id: "a1-f33", prompt: "She ___ (watch) TV every night.", hint: "3ª pessoa, verbo em -ch", answers: ["watches"], explain: "watch → watches." },
```

| Campo | Regra |
|---|---|
| `prompt` | precisa conter `___`. O verbo base entre parênteses é opcional, ex.: `(watch)` |
| `hint` | dica curta em português |
| `answers` | **todas** as formas aceitas (ver §4) |
| `explain` | explicação em português |

### 2.3 `translate` — Tradução PT → EN

```ts
{ id: "a1-t33", pt: "Ela assiste TV toda noite.", answers: ["she watches tv every night"], explain: "She watches TV every night." },
```

| Campo | Regra |
|---|---|
| `pt` | frase em **português**, escrita normalmente (maiúscula, acento, ponto) |
| `answers` | traduções aceitas, **em minúsculas** (ver §4) |
| `explain` | a frase correta bem escrita, com maiúsculas e pontuação |

### 2.4 `order` — Ordenar palavras

```ts
{ id: "a1-o33", words: ["TV", "watches", "she", "every", "night"], answer: "she watches tv every night", pt: "Ela assiste TV toda noite." },
```

| Campo | Regra |
|---|---|
| `words` | as palavras **embaralhadas** (nunca na ordem certa) |
| `answer` | a frase correta, **em minúsculas** |
| `pt` | tradução em português |

**Regra crítica:** `words` tem que ser exatamente uma permutação de `answer`
separado por espaços — mesmas palavras, mesma quantidade. Contrações contam
como uma palavra só (`"I'd"`, `"don't"`, `"it's"`).

Errado: `words: ["I", "am", "happy"]` com `answer: "i'm happy"`
Certo: `words: ["I'm", "happy"]` com `answer: "i'm happy"`

Mínimo de 3 palavras. Evite passar de 12 (fica ruim na tela do celular).

---

## 3. IDs

Precisam ser **únicos no arquivo inteiro**, não só dentro do array.

Padrão em uso:

| Nível | mc | fill | translate | order |
|---|---|---|---|---|
| A1 | `a1-mc1` | `a1-f1` | `a1-t1` | `a1-o1` |
| A2 | `mc1` | `f1` | `t1` | `o1` |
| B1 | `b1-mc1` | `b1-f1` | `b1-t1` | `b1-o1` |
| B2 | `b2-mc1` | `b2-f1` | `b2-t1` | `b2-o1` |
| C1 | `c1-mc1` | `c1-f1` | `c1-t1` | `c1-o1` |
| C2 | `c2-mc1` | `c2-f1` | `c2-t1` | `c2-o1` |

> O A2 é o único **sem prefixo de nível** — é o formato original e foi mantido
> assim para não invalidar o progresso já salvo dos alunos. Mantenha.

Continue a numeração de onde parou. Hoje cada array vai até 32, então o
próximo é 33.

---

## 4. Como a correção funciona (importante)

Antes de comparar, o app passa **a resposta do aluno e a sua resposta cadastrada**
por esta função (`normalize`, no fim do arquivo):

```ts
s.toLowerCase()          // minúsculas
 .trim()                 // tira espaço nas pontas
 .replace(/[.,!?;]/g, "")// remove . , ! ? ;
 .replace(/’/g, "'")     // apóstrofo curvo vira reto
 .replace(/\s+/g, " ")   // espaços múltiplos viram um
```

Consequências práticas:

- **Maiúsculas não importam.** Não precisa cadastrar `"She"` e `"she"`.
- **Pontuação final não importa.** `"she watches tv"` e `"She watches TV."` são iguais.
- **Vírgulas não importam.** Não cadastre a mesma frase com e sem vírgula.
- **Acentos IMPORTAM.** `"são paulo"` ≠ `"sao paulo"` — cadastre as duas formas.
- **Apóstrofos importam.** `"dont"` ≠ `"don't"` — cadastre as duas se quiser aceitar.
- **A comparação é exata**, palavra por palavra. Não existe correção parcial.

Por isso, em `fill` e `translate`, cadastre **todas as variantes legítimas**:

```ts
answers: ["i don't have any money", "i do not have any money", "i have no money"]
```

Contrações e formas plenas são as variantes mais esquecidas. Sempre inclua as duas:
`"i'm"` / `"i am"`, `"don't"` / `"do not"`, `"she's"` / `"she is"`,
`"i'd like"` / `"i would like"`.

Diferenças britânico/americano também: `"organised"` / `"organized"`,
`"cancelled"` / `"canceled"`, `"film"` / `"movie"`, `"holiday"` / `"vacation"`.

---

## 5. Qualidade pedagógica

Estas regras valem tanto quanto as técnicas.

1. **Nenhuma questão de enchimento.** Cada exercício cobra um ponto que
   realmente derruba. Se a resposta é óbvia sem pensar, descarte.
2. **Alternativas erradas plausíveis.** Em `mc`, as 3 erradas devem ser erros
   que um brasileiro realmente comete — não absurdos. Ex.: para "an hour",
   as erradas boas são `a`, `the`, `some` (a pessoa erra por olhar a letra "h",
   não o som).
3. **Explique o porquê, não só o quê.** `explain` ruim: "É watches."
   Bom: "Verbos terminados em -ch levam -es: watches."
4. **Respeite o nível CEFR.** Um exercício A1 não pode exigir present perfect.
   Rigor dentro do nível ≠ conteúdo de nível acima.
5. **Mire a interferência do português.** É onde está o ouro:
   - `depend on` (não "depend of")
   - `I have 20 years` → `I am 20 years old`
   - `people are` (não "people is")
   - falsos amigos: `eventually` = "no fim das contas", não "eventualmente";
     `pretend` = "fingir", não "pretender"
6. **Não repita** o que já existe. Ver §5.1.

### 5.1 O que já existe (evitar duplicidade)

Hoje são **768 exercícios**: 128 por nível (32 de cada tipo).

Antes de escrever qualquer coisa, consulte:

- **`docs/EXERCICIOS-EXISTENTES.md`** — lista todos os 768, por nível e tipo,
  com o enunciado de cada um. É o jeito rápido de conferir duplicidade.
- **`src/data/exercises.ts`** — a fonte da verdade. Se algo divergir do
  inventário, vale o código.

Depois de adicionar exercícios, regenere o inventário:

```bash
python3 scripts/inventario-exercicios.py > docs/EXERCICIOS-EXISTENTES.md
```

Atenção: duplicidade não é só a frase idêntica. Cadastrar
`"She ___ coffee every morning"` quando já existe
`"She ___ TV every night"` testando a mesma regra (-s da 3ª pessoa) com o
mesmo grau de dificuldade **também é repetição** — muda a frase, não o
aprendizado. Prefira atacar um aspecto ainda não coberto da regra
(ex.: verbos em -y → -ies, ou o contraste com o plural sem -s).

### Temas por nível já usados

| Nível | Foco |
|---|---|
| A1 | verbo to be, artigos, plural, posse com 's, have/has, can |
| A2 | present simple, passado simples, hotel/restaurante/viagem, preposições |
| B1 | present perfect, condicionais 1 e 2, used to, gerúndio x infinitivo |
| B2 | past perfect, wish, condicional mista, voz passiva, phrasal verbs |
| C1 | inversão, subjuntivo, registro formal, collocations |
| C2 | retórica, inversão enfática, cleft sentences, lest/albeit/notwithstanding |

---

## 6. Checklist antes de entregar

- [ ] Todo `id` é único no arquivo inteiro
- [ ] Todo `mc` tem exatamente 4 `options` e `answer` entre 0 e 3
- [ ] O `answer` aponta mesmo para a alternativa certa (confira um por um)
- [ ] Todo `fill` tem `___` no `prompt`
- [ ] Em todo `order`, `words` é permutação exata de `answer`
- [ ] `answer` (order) e `answers` (fill/translate) estão em **minúsculas**
- [ ] Variantes com contração e sem contração cadastradas
- [ ] Nenhum exercício duplicado
- [ ] `npm run build` passa sem erro

### Script de validação

Rode isto na raiz do projeto para conferir tudo de uma vez:

```bash
python3 - <<'PY'
import re
src = open('src/data/exercises.ts').read()
def norm(s):
    s = s.lower().strip()
    s = re.sub(r'[.,!?;]', '', s).replace('’', "'")
    return re.sub(r'\s+', ' ', s)

problems, ids, total = [], [], 0
for lvl in ["A1","A2","B1","B2","C1","C2"]:
    for kind, pre in [("mc","MC"),("fill","FILL"),("translate","TRANSLATE"),("order","ORDER")]:
        body = re.search(r'const ' + pre + '_' + lvl + r'\s*:\s*\w+\[\]\s*=\s*\[(.*?)\n\];', src, re.S).group(1)
        for iid, rest in re.findall(r'\{\s*id:\s*"([^"]+)"(.*?)\},\s*(?=\n|\Z)', body, re.S):
            ids.append(iid); total += 1
            if kind == "mc":
                n = len(re.findall(r'"(?:[^"\\]|\\.)*"', re.search(r'options:\s*\[(.*?)\]', rest, re.S).group(1)))
                a = int(re.search(r'answer:\s*(\d+)', rest).group(1))
                if n != 4: problems.append(f'{iid}: {n} opções (esperado 4)')
                if a >= n: problems.append(f'{iid}: answer {a} fora do range')
            if kind == "fill" and '___' not in re.search(r'prompt:\s*"((?:[^"\\]|\\.)*)"', rest).group(1):
                problems.append(f'{iid}: prompt sem ___')
            if kind == "order":
                w = re.findall(r'"((?:[^"\\]|\\.)*)"', re.search(r'words:\s*\[(.*?)\]', rest, re.S).group(1))
                ans = re.search(r'answer:\s*"((?:[^"\\]|\\.)*)"', rest).group(1)
                if sorted(norm(" ".join(w)).split()) != sorted(norm(ans).split()):
                    problems.append(f'{iid}: words não formam answer')
print(f'{total} exercícios')
print('IDs duplicados:', sorted({i for i in ids if ids.count(i) > 1}) or 'nenhum')
print('Problemas:', problems or 'nenhum')
PY
```

Saída esperada: `IDs duplicados: nenhum` e `Problemas: nenhum`.

---

## 7. Entrega

1. Ler `docs/EXERCICIOS-EXISTENTES.md` para não repetir
2. Editar `src/data/exercises.ts`
3. Rodar o script de validação acima → tem que dar limpo
4. Regenerar o inventário:
   `python3 scripts/inventario-exercicios.py > docs/EXERCICIOS-EXISTENTES.md`
5. Rodar `npm run build` → tem que compilar sem erro
6. Commit com mensagem descrevendo nível e quantidade

Não é necessário mexer em banco de dados: os exercícios são estáticos e vão
junto com o build.
