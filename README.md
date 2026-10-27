# Cardeneta do Aluno

Aplicacao web, mobile-first, para a cardeneta de alunos de uma escola. Permite
gerir alunos, ocorrencias, disciplinas, notas, faltas e um boletim consolidado,
com dois papeis de utilizador: **coordenador** (faz tudo) e **professor** (ve
alunos e boletins; lanca e corrige notas e regista faltas apenas das disciplinas
que leciona).

Este projeto e tambem um exercicio do fluxo completo do GitHub (branches,
commits pequenos, pull requests, revisao, CI e tags). Por isso cada passo e
pequeno, estavel e bem feito.

## Estado

Em construcao. Passo atual: **01 - Backend base**.

O backend ja tem o esqueleto: servidor Express com config validada (Zod), erros
centrais no formato `{ erro: { codigo, mensagem, campos? } }` e o endpoint
`GET /api/v1/saude`. O frontend ainda nao existe.

## Estrutura

```
backend/    API Node + Express + TypeScript (a construir)
frontend/   Aplicacao React + Vite + Tailwind (a construir)
docs/       Documentacao, relatorio e capturas de ecra
```

## Tecnologias previstas

- **Backend**: Node 20, Express, TypeScript, Zod, JWT em cookie HttpOnly,
  bcryptjs, cookie-parser, cors, express-rate-limit, dotenv, tsx, Vitest e
  Supertest.
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, React Router,
  lucide-react, Vitest e React Testing Library.

Sem base de dados: os dados ficam em ficheiros JSON na pasta `backend/data`,
escondidos atras de repositorios, para se poder trocar por uma BD no futuro.

## Pre-requisitos

- Node 20 (ver `.nvmrc`).
- Windows (PowerShell).

## Como instalar e correr

Ainda nao aplicavel neste passo. Sera preenchido a medida que os passos avancam.

## Fora do ambito (evolucao futura)

- Envio de SMS ou email aos encarregados.
- Fotografias dos alunos.
- Importacao de alunos por CSV.
- Geracao de PDF no servidor.
- Suporte a varias escolas.

## Privacidade

Este projeto trata dados de menores. **Nunca entram dados reais no repositorio:
tudo e ficticio.** Os ficheiros de dados em `backend/data` estao no `.gitignore`
(apenas o `.gitkeep` e versionado), os numeros de telefone sao obviamente falsos
e nao se registam telefones nem notas nos logs.
