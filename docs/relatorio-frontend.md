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

## F2 - Tipos, cliente e mocks

Definimos em `frontend/src/types/api.ts` os enums, objetos, envelopes e
parametros tipados do contrato. Criamos `frontend/src/services/` com o cliente
fetch (`credentials: "include"`, erros normalizados e evento de sessão
expirada) e serviços por domínio. Em `frontend/src/mocks/` mantemos dados
fictícios em memória para 12 alunos, disciplinas, notas, faltas, ocorrências e
as cinco contas indicadas no contrato. A palavra-passe de demonstração e
`demo123`, apenas para as contas falsas dos mocks.

Os mocks cobrem autenticação, paginação e filtros de alunos, permissões por
papel/disciplina, regras principais de ocorrência, correção de notas com
motivo obrigatório, histórico, faltas e resumo. O `AuthProvider` e as rotas
protegidas já estão preparados; mostramos a faixa de demonstração sempre que
`VITE_USAR_MOCKS` não seja `false`.

Validamos com `npm --prefix frontend run typecheck`, `npm --prefix frontend
test` (2 ficheiros, 4 testes aprovados) e `npm --prefix frontend run build`.
No primeiro typecheck surgiram imports não usados, uma API de array posterior
ao target TypeScript e tipos de query incompatíveis; corrigimos os três pontos
e repetimos a validação com sucesso.

Commit da funcionalidade: `ed813ff` (`feat(frontend): tipos, cliente e mocks`).

## F3 - Login e navegação

Implementamos o formulário de entrada em `frontend/src/pages/LoginPage.tsx`,
com estado de submissão, mensagens gerais e erros de campo, e adicionamos o
layout em `frontend/src/components/AppShell.tsx`. A navegação inferior mostra
Ocorrências só para coordenadores; as rotas também verificam a sessão e o
papel. O cliente redireciona sessões expiradas para o login.

Validamos login de coordenador, credenciais inválidas e typecheck com
`npm --prefix frontend run typecheck`, `npm --prefix frontend test` (2
ficheiros, 6 testes aprovados) e `npm --prefix frontend run build`. A tentativa
de procurar a faixa de demonstração como um elemento com nome acessível falhou;
ajustamos a asserção para localizar o texto visível, e os testes passaram.

<!-- CAPTURA: passoF3-login.png | ecrã de login, estado vazio com faixa de demonstração e papel por autenticar (modo telemóvel 390x844) -->

Commit da funcionalidade: `ab90d3e` (`feat(frontend): login e navegacao por papel`).

## F4 - Painel e lista de alunos

Criamos o painel inicial em `frontend/src/pages/PainelPage.tsx` e a lista em
`frontend/src/pages/AlunosPage.tsx`, com pesquisa por nome/número de processo,
filtros simples de classe, turma e estado, paginação, estados de carregamento,
erro e vazio, e ligações `tel:` para os contactos fictícios. O painel de
coordenador usa `GET /resumo`; para professor mostramos uma entrada adequada
ao papel, sem chamar o endpoint reservado ao coordenador.

Fechamos também o teste que tinha falhado antes de parar: verificamos o título
do painel por `getByRole("heading")` e procuramos o contacto dentro do cartão
do aluno filtrado, confirmando o `href` exato `tel:+244923100002`. A primeira
tentativa após a correção revelou que a versão instalada das definições de
Testing Library não aceita `exact` em `ByRoleOptions`; a seguinte mostrou que
existiam vários elementos `article` na página. Em vez de enfraquecer as
asserções, escopamos o contacto ao cartão de “Bento Miguel”. A validação final
passou: `npm --prefix frontend run typecheck`, `npm --prefix frontend test`
(2 ficheiros, 7 testes aprovados) e `npm --prefix frontend run build`.

<!-- CAPTURA: passoF4-painel.png | painel carregado de coordenador, cartões de risco e turmas (modo telemóvel 390x844) -->
<!-- CAPTURA: passoF4-alunos.png | lista carregada filtrada para 8.ª classe, cartões e contactos tel: de coordenador (modo telemóvel 390x844) -->

Commit da funcionalidade: `761a0ea` (`feat(frontend): painel inicial e lista de alunos com pesquisa e paginacao`).

## F5 - Página do aluno

Criamos `frontend/src/pages/AlunoPage.tsx` com separadores para dados,
ocorrências, notas e faltas. A ficha apresenta os contactos como ligações
telefónicas, os registos e notas existentes e estados vazios quando ainda não
há informação. Para professores, o separador e o pedido de ocorrências não são
renderizados; a página carrega os restantes dados através dos serviços por
domínio.

Validamos navegação do aluno e leitura de ocorrências, notas e faltas com
`npm --prefix frontend run typecheck`, `npm --prefix frontend test` (2
ficheiros, 8 testes aprovados) e `npm --prefix frontend run build`.

<!-- CAPTURA: passoF5-aluno-dados.png | ficha do aluno no separador Dados, coordenador autenticado e contactos fictícios (modo telemóvel 390x844) -->
<!-- CAPTURA: passoF5-aluno-ocorrencias.png | ficha no separador Ocorrências, ocorrência fictícia visível como coordenador (modo telemóvel 390x844) -->
<!-- CAPTURA: passoF5-aluno-professor.png | ficha no separador Notas, professor autenticado sem separador Ocorrências (modo telemóvel 390x844) -->

Commit da funcionalidade: `458e7f9` (`feat(frontend): pagina do aluno com separadores Dados, Ocorrencias, Notas e Faltas`).
