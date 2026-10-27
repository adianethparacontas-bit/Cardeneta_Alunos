# Relatorio do projeto - Cardeneta do Aluno

Relatorio de atividade do projeto **Cardeneta do Aluno**. Somos a Adia e o Jose,
e vamos construindo isto passo a passo para praticar o fluxo completo do GitHub
(branches, commits pequenos, pull requests, revisao, CI e tags).

## Indice

- Introducao
- Suposicoes a confirmar
- Passo 00 - Preparacao
- Passo 01 - Backend base
- Passo 02 - CI
- Passo 03 - Armazenamento JSON *(a fazer)*
- Passo 04 - Autenticacao e papeis *(a fazer)*
- Passo 05 - Alunos *(a fazer)*
- Passo 06 - Ocorrencias *(a fazer)*
- Passo 07 - Disciplinas, professores e notas *(a fazer)*
- Passo 08 - Faltas *(a fazer)*
- Passo 09 - Pesquisa e filtros avancados *(a fazer)*
- Passo 10 - Boletim e painel *(a fazer)*
- Passo 11 - Seed de dados ficticios *(a fazer)*
- Passo 12 - Frontend base *(a fazer)*
- Passo 13 - Lista e pagina do aluno *(a fazer)*
- Passo 14 - Formularios *(a fazer)*
- Passo 15 - Lancamento de notas *(a fazer)*
- Passo 16 - Pesquisa avancada e painel inicial *(a fazer)*
- Passo 17 - Boletim imprimivel e polimento *(a fazer)*
- Passo 18 - Testes, README final e tag v1.0.0 *(a fazer)*

## Introducao

A **Cardeneta do Aluno** e uma aplicacao web mobile-first para a cardeneta de
alunos de uma escola. Tem dois papeis: **coordenador** (faz tudo) e
**professor** (ve alunos e boletins, e lanca/corrige notas e registra faltas
apenas das disciplinas que leciona). Nao ha base de dados: os dados ficam em
ficheiros JSON na pasta `backend/data`, escondidos atras de repositorios, para
se poder trocar por uma BD no futuro.

Trata dados de menores, por isso adotamos uma regra fixa: **nunca entra nada
real no repositorio**. Todos os dados sao ficticios, os ficheiros de dados estao
no `.gitignore` e nao se registam telefones nem notas nos logs.

Temos tambem uma divisao de trabalho combinada: a Adia faz os passos 0 a 7 e o
Jose faz o passo 8 (faltas) e o 11 (seed) em branches proprias, seguindo depois
para o frontend (passos 12 a 17). Cada um na sua maquina, para o GitHub mostrar
os dois como autores.

## Suposicoes a confirmar

Estas regras sao **suposicoes simplificadas** do regulamento da escola. Ficam
todas reunidas num unico modulo de funcoes puras, com constantes configuraveis e
testes, comentadas como "a confirmar com o regulamento da escola":

- **Escala das notas**: inteiros de 0 a 20.
- **Componentes**: MAC (media das avaliacoes continuas), NPP (prova do
  professor) e NPT (prova trimestral), cada um opcional ate ser lancado.
- **Media trimestral (MT)** = (MAC + NPP + NPT) / 3, so existe quando as tres
  componentes estao lancadas.
- **Media final da disciplina (MFD)** = media das tres MT, so existe quando
  existem as tres.
- **Aprovacao**: positivo com MFD >= 10; situacao da disciplina EM_CURSO,
  APROVADO ou REPROVADO; situacao do aluno REPROVADO se alguma disciplina estiver
  reprovada, APROVADO se todas estiverem aprovadas e EM_CURSO nos restantes
  casos.
- **Arredondamento**: por defeito, arredondar as unidades.
- **Limite de faltas injustificadas** para o aluno em risco no painel: valor
  configuravel (a confirmar).
- **Aluno em risco**: 3 ou mais disciplinas com MT abaixo de 10 num trimestre,
  ou faltas injustificadas acima do limite configuravel.

Os calculos nunca se guardam: calculam-se sempre ao ler.

## Passo 00 - Preparacao

### Objetivo

Preparar o esqueleto do repositorio antes de escrever codigo: verificar o estado
do git e do remote, garantir que a pasta nao esta dentro do OneDrive, e criar os
ficheiros base de higiene do projeto (`.gitignore`, `.editorconfig`, `.nvmrc`,
README inicial e este relatorio).

### O que fizemos e porquê

- **Diagnostico primeiro.** Corremos `git status`, `git remote -v`,
  `git branch -a` e listamos a estrutura. Concluimos que o repositorio ja estava
  inicializado, com o remote `origin` apontado para
  `https://github.com/adianethparacontas-bit/Cardeneta_Alunos.git`, branch `main`
  sem commits, e apenas as pastas `Backend` e `Frontend` (vazias).
- **OneDrive.** A pasta do projeto e `C:\Users\DELL\Cardeneta_Aluno` e o OneDrive
  e `C:\Users\DELL\OneDrive`, portanto **nao esta dentro do OneDrive**. Nao foi
  preciso mover nada (so avisamos: se algum dia moverem o projeto para dentro do
  OneDrive, a sincronizacao pode estragar o `.git` e o `node_modules`).
- **Nomes das pastas.** Renomeamos `Backend` para `backend` e `Frontend` para
  `frontend`, para ficar consistente com o resto do projeto (`backend/data`,
  `DATA_DIR`, `npm run seed`) e evitar problemas de maiusculas/minusculas no CI
  (Linux distingue maiusculas, Windows nao).
- **`.gitignore`.** Ignoramos `node_modules`, `.env` e variantes (mantendo o
  `.env.example`), `dist`, `coverage`, logs e ficheiros de sistema/editor. Em
  particular, ignoramos `backend/data/*.json` mantendo o `.gitkeep`, porque os
  dados sao de menores e nunca entram no repositorio.
- **`.editorconfig`.** Normalizamos UTF-8, indentacao de 2 espacos, fim de linha
  LF, newline final e remocao de espacos a direita (exceto em Markdown).
- **`.nvmrc`.** Fixamos Node 20, que e a versao pedida para o projeto e a que
  sera usada no CI. Nota: a maquina local tem Node 22, por isso convem instalar
  o Node 20 (nvm-windows) para ficar igual ao CI.
- **`README.md`.** Escrevemos um README inicial com descricao, estado, estrutura,
  tecnologias previstas, pre-requisitos, a lista de **evolucao futura** (fora do
  ambito: SMS/email, fotografias, importacao CSV, PDF no servidor, varias
  escolas) e a nota de privacidade.
- **`docs/relatorio.md`.** Criamos este relatorio com indice, introducao,
  suposicoes a confirmar e a secao do Passo 0.

### Ficheiros criados

- `.gitignore`
- `.editorconfig`
- `.nvmrc`
- `README.md`
- `docs/relatorio.md`
- `backend/data/.gitkeep`
- Renomeadas: `Backend` -> `backend`, `Frontend` -> `frontend`

### Como correr e testar

Nao ha codigo de aplicacao neste passo, por isso nao ha `tsc`, testes nem build
para correr. A verificacao foi estrutural.

### Resultado

`git status --short` depois de preparar os ficheiros para o commit:

```
A  .editorconfig
A  .gitignore
A  .nvmrc
A  README.md
A  backend/data/.gitkeep
A  docs/relatorio.md
```

O git avisou que os ficheiros com fim de linha LF serao convertidos para CRLF no
checkout (comportamento normal do git no Windows). O `.editorconfig` continua a
pedir LF no conteudo; nao alteramos nada por causa disto.

Nota: a pasta `frontend/` esta vazia e por isso nao aparece no `git` (o git nao
versiona pastas vazias). Sera criada a serio no Passo 12 (frontend base).

### Capturas

Nao aplicavel: este passo nao tem interface.

### Commit

`d5046bb` - `chore: preparacao inicial do projeto`
`docs: relatorio do passo 00` (commit seguinte, neste mesmo PR)

## Passo 01 - Backend base

### Objetivo

Levantar o esqueleto do backend: projetos e scripts (Node 20 + TypeScript com
ESM), configuracao validada com Zod, erros centrais no formato da API,
`GET /api/v1/saude` e o primeiro teste com Supertest.

### O que fizemos e porquê

- **Estrutura por modulos.** Criamos `src/modules/saude` com `routes` e
  `controller`, e um `src/routes/index.ts` que agrega tudo sob `/api/v1`. Assim
  ja fica o molde para os modulos seguintes (alunos, ocorrencias, etc.).
- **ESM com NodeNext.** O backend e ESM (`"type": "module"`) com
  `module`/`moduleResolution` em `NodeNext`. Isto obriga a usar a extensao `.js`
  nos imports relativos (mesmo apontando para ficheiros `.ts`), que e o correto
  para o Node conseguir correr o build. Foi a decisao mais "chata" mas a mais
  correta.
- **Config com Zod (`src/config/env.ts`).** Lemos `NODE_ENV`, `PORT` e `DATA_DIR`
  do ambiente, com valores por defeito, e falhamos logo no arranque se algo
  estiver invalido. Deixamos de fora, de proposito, o segredo de sessao: so entra
  no Passo 04, quando houver autenticacao.
- **Erros centrais.** Criamos `AppError` (com `status`, `codigo`, `mensagem` e
  `campos` opcionais), um conjunto de codigos em `src/errors/codigos.ts`, um
  `tratadorDeErros` que responde sempre no formato
  `{ erro: { codigo, mensagem, campos? } }` e um `tratadorDeRotaDesconhecida`
  para 404. Os codigos de 401/403/409/429 ja ficam definidos para os passos
  seguintes.
- **`createApp()` separado do `server.ts`.** `src/app.ts` devolve a app Express
  (sem `listen`), o que permite testar com Supertest sem abrir portas.
  `src/server.ts` e so o arranque.
- **Middlewares base.** `express.json()`, `cookie-parser` e `cors` (com
  `credentials`). O `express-rate-limit` fica montado apenas quando
  `NODE_ENV=production`, para nao interferir com os testes nem com o
  desenvolvimento; o limite apertado do login entra no Passo 04.
- **Dois tsconfig.** `tsconfig.json` serve o editor e o `typecheck` (inclui
  `src`, `tests` e `vitest.config.ts`, com `noEmit`); `tsconfig.build.json`
  compila so o `src` para `dist`. Assim os testes sao verificados por tipos mas
  nao vao parar ao build.
- **Resposta do `/saude`.** Devolvemos `{ data: { status: "ok" } }` para ja
  seguirmos o formato `{ data, meta }` que vamos usar nas listagens.

### Ficheiros criados

- `backend/.env.example`
- `backend/package.json`, `backend/package-lock.json`
- `backend/tsconfig.json`, `backend/tsconfig.build.json`
- `backend/vitest.config.ts`
- `backend/src/app.ts`, `backend/src/server.ts`
- `backend/src/config/env.ts`
- `backend/src/errors/codigos.ts`, `app-error.ts`, `error-handler.ts`,
  `not-found-handler.ts`
- `backend/src/routes/index.ts`
- `backend/src/modules/saude/saude.routes.ts`,
  `backend/src/modules/saude/saude.controller.ts`
- `backend/tests/saude.test.ts`

### Como correr e testar

A partir da pasta `backend`:

```
npm install
npm run typecheck
npm test
npm run build
npm run dev        # arranca em http://localhost:3000/api/v1
```

Nao precisamos de `.env` neste passo: `PORT`, `NODE_ENV` e `DATA_DIR` tem valores
por defeito. O `.env` so passa a ser preciso no Passo 04.

### Resultado dos testes

`npm run typecheck` (sem erros, por isso sem saida):

```
> cardeneta-aluno-backend@0.1.0 typecheck
> tsc --noEmit
```

`npm test`:

```
 RUN  v2.1.9 C:/Users/DELL/Cardeneta_Aluno/backend

 ✓ tests/saude.test.ts (2 tests) 71ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  09:07:48
   Duration  3.52s (transform 339ms, setup 0ms, collect 1.77s, tests 71ms, environment 0ms, prepare 783ms)
```

`npm run build`: correu sem erros e gerou `dist/` com `app.js`, `server.js`,
`config/`, `errors/`, `modules/` e `routes/`.

Tambem arrancamos o build (`node dist/server.js`) e fizemos pedidos reais:

```
GET /api/v1/saude  -> HTTP 200
{"data":{"status":"ok"}}

GET /api/v1/nao-existe  -> HTTP 404
{"erro":{"codigo":"NAO_ENCONTRADO","mensagem":"Rota nao encontrada: GET /api/v1/nao-existe"}}
```

### Capturas

Nao aplicavel: este passo nao tem interface. (As capturas do Passo 00
continuam pendentes: a pasta `docs/capturas` ainda nao existe.)

### Problemas que apareceram

- **`docs/capturas` nao existe.** Os ficheiros
  `passo-00-pr-aberto.png`, `passo-00-aprovacao.png` e `passo-00-merged.png`
  nao estavam no repositorio, por isso nao fizemos o commit
  `docs: capturas do passo 00`. Fica pendente ate os PNG existirem. Nao
  referenciamos capturas que nao existem.
- **`.nvmrc` apareceu vazio no working tree.** Ao sincronizar, o `.nvmrc` estava
  reduzido a uma linha vazia (perdeu o `20`), o que impedia o `git checkout main`.
  Repusemos o conteudo (`20`).
- **Aviso do `npm audit` (7 vulnerabilidades).** Aparecem `@vitest/mocker`,
  `esbuild`, `tinypool` e `zod`. As tres primeiras sao dependencias de
  desenvolvimento (correm so nos testes, nao vao para producao) e a correcao
  exige saltos de versao maiores (`vitest@5`). A do `zod` e sobre validacao de
  colecoes muito grandes. Decidimos **nao** forcar `npm audit fix --force` neste
  passo, para nao misturar atualizacoes de major com o esqueleto base, e fica
  proposta uma atualizacao de dependencias como passo proprio.
- **Avisos LF/CRLF do git.** Sao normais no Windows (o git normaliza no commit).
  Nao alteramos nada.

### Commit

`5976e9e` - `feat(backend): base do servidor, config e rota de saude`

## Passo 02 - CI

### Objetivo

Ter o GitHub Actions a correr automaticamente o typecheck, os testes e o build do
backend em cada push e em cada pull request, para nao integrarmos nada partido.

### O que fizemos e porquê

- **Um workflow so para o backend** (`.github/workflows/ci-backend.yml`), com um
  job chamado "Typecheck, testes e build". O do frontend entra mais tarde (passo
  do frontend, que e do Jose).
- **Node 20 a partir do `.nvmrc`** (`node-version-file: backend/.nvmrc`), para o
  CI usar exatamente a mesma versao que o projeto pede, sem a repetir no YAML.
- **`npm ci` com cache** (`cache: npm` e `cache-dependency-path` para o
  `package-lock.json` do backend), que e mais rapido e respeita o lockfile.
- **`working-directory: backend`** no job inteiro, para nao andarmos a repetir
  `cd backend` em cada passo.
- **Filtro de `paths`** (`backend/**` e o proprio workflow): o CI do backend so
  corre quando mexemos no backend. Assim uma alteracao so de documentacao nao
  gasta minutos de CI.
- Decidimos tambem correr o `build` no CI, e nao so o typecheck e os testes,
  porque um erro de configuracao de build so aparece nessa fase.

### Ficheiros criados

- `.github/workflows/ci-backend.yml`

### Como correr e testar

Localmente, a partir de `backend`:

```
npm run typecheck
npm test
npm run build
```

No GitHub, o resultado aparece no separador **Actions** do repositorio, no
workflow **CI backend**.

### Resultado dos testes (local)

```
> cardeneta-aluno-backend@0.1.0 typecheck
> tsc --noEmit

 RUN  v2.1.9 C:/Users/DELL/Cardeneta_Aluno/backend

 ✓ tests/saude.test.ts (2 tests) 83ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  09:17:59
   Duration  3.97s (transform 467ms, setup 0ms, collect 2.09s, tests 83ms, environment 1ms, prepare 877ms)

> cardeneta-aluno-backend@0.1.0 build
> tsc -p tsconfig.build.json
```

O workflow em si ainda **nao foi executado** quando escrevemos esta secao, porque
so passa a existir a partir deste push. Nao inventamos um resultado verde: o que
esta aqui e a saida local. Assim que o push for feito, o resultado real deve ser
confirmado no separador Actions.

### Capturas

<!-- CAPTURA: passo-02-ci-verde.png | separador Actions do GitHub, workflow "CI backend" a verde, com os passos Typecheck, Testes e Build visiveis -->

<!-- CAPTURA: passo-02-verificacoes-local.png | terminal local com npm run typecheck, npm test e npm run build a passar -->

### Problemas que apareceram

- **Nada a apontar neste passo.** O workflow foi escrito, mas a sua execucao real
  so pode ser vista depois do push, no GitHub.

### Commit

`e5da659` - `ci: pipeline do backend com typecheck, testes e build`
