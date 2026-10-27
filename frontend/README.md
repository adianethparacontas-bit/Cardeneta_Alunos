# Frontend — Cardeneta do Aluno

Aplicação React mobile-first para alunos, ocorrências, notas, faltas e boletins.
O frontend usa os serviços em `src/services/` e pode trabalhar com dados
fictícios locais ou com a API em `/api/v1`.

## Requisitos

- Node.js 20.
- npm incluído com o Node.
- Para a API real: backend iniciado em `http://localhost:3000`.

## Instalar e correr com mocks

Na raiz do repositório, em PowerShell:

```powershell
npm --prefix frontend ci
Copy-Item frontend\.env.example frontend\.env.local
npm --prefix frontend run dev
```

Abra o endereço apresentado pelo Vite. `VITE_USAR_MOCKS=true` ativa os dados
locais fictícios e mostra a faixa **MODO DEMONSTRAÇÃO (dados falsos)**.

Contas apenas para demonstração:

- `coord1@cardeneta.test`, `coord2@cardeneta.test` — coordenadores.
- `prof1@cardeneta.test`, `prof2@cardeneta.test`, `prof3@cardeneta.test` —
  professores.
- Palavra-passe comum dos mocks: `demo123`.

Essa palavra-passe existe somente nos mocks. Não é uma credencial do backend.
Os dados são gerados para demonstração; nunca introduza dados reais de alunos.

## Correr contra o backend

Inicie o backend numa janela PowerShell:

```powershell
npm --prefix backend run dev
```

Na pasta `frontend`, copie `.env.example` para `.env.local` se ainda não o fez
e altere o valor para:

```dotenv
VITE_USAR_MOCKS=false
```

Na raiz do repositório, inicie o Vite:

```powershell
npm --prefix frontend run dev
```

O Vite encaminha `/api` para `http://localhost:3000`, e o cliente envia
`credentials: "include"` para usar o cookie de sessão. Use as contas e a
palavra-passe configuradas no ambiente privado do backend; não guarde essa
palavra-passe neste repositório. Para voltar aos mocks, restaure
`VITE_USAR_MOCKS=true` e reinicie o Vite.

O contrato vinculativo está em `docs/api.md` no branch que contém a
implementação do backend. O cliente e os mocks seguem esse contrato; o
frontend não altera a sua definição.

## Verificações

Na raiz do repositório:

```powershell
npm --prefix frontend run typecheck
npm --prefix frontend test
npm --prefix frontend run build
```

## Tecnologia

React, TypeScript, Vite, Tailwind CSS, React Router, lucide-react, Vitest,
React Testing Library e `fetch` nativo.
