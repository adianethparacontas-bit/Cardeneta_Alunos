# Relatorio do projeto - Cardeneta do Aluno

Relatorio de atividade do projeto **Cardeneta do Aluno**. Somos a Adia e o Jose,
e vamos construindo isto passo a passo para praticar o fluxo completo do GitHub
(branches, commits pequenos, pull requests, revisao, CI e tags).

## Indice

- Introducao
- Suposicoes a confirmar
- Passo 00 - Preparacao
- Passo 01 - Backend base *(a fazer)*
- Passo 02 - CI *(a fazer)*
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
