# Relatorio do frontend

## F1 - Base

Criamos a aplicacao React e TypeScript com Vite em `frontend/`, instalamos o
Tailwind CSS e o React Router, e configuramos o proxy `/api` para
`http://localhost:3000`. Tambem adicionamos `frontend/.env.example` com
`VITE_USAR_MOCKS=true` e a CI em `.github/workflows/ci-frontend.yml`, a usar
Node 20 e a executar typecheck, testes e build.

No primeiro scaffold, o `create-vite` mais recente falhou ao procurar o
template. Repetimos com `create-vite@6.4.1`, que concluiu a criacao. Na
validacao, o typecheck detetou tipos Vite duplicados entre Vitest e Vite; usamos
Vitest 3 para alinhar as dependencias. A primeira verificacao completa depois
do ajuste passou: `npm --prefix frontend run typecheck`, `npm --prefix
frontend test` (1 teste) e `npm --prefix frontend run build`.

O Node local e v24.15.0; a CI fica fixada em Node 20 conforme pedido. Ainda nao
validamos visualmente a 390 px.

<!-- CAPTURA: passoF1-inicio.png | ecrã inicial, estado carregado e sem sessão (modo telemóvel 390x844) -->

Commit da funcionalidade: `b04bce5` (`feat(frontend): criar base da aplicacao`).
