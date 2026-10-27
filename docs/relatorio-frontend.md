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

## F6 - Formulários

Implementamos os formulários de criação/edição de aluno em
`frontend/src/pages/AlunoFormularioPage.tsx`, de ocorrência em
`frontend/src/pages/OcorrenciaFormularioPage.tsx` e de falta em
`frontend/src/pages/FaltaFormularioPage.tsx`. A ficha permite mudar o estado
do aluno. Os formulários apresentam `erro.campos` junto aos campos, ocultam
gravidade para elogios, normalizam telefones no mock e respeitam as permissões
de disciplina dos professores. Reforçamos no mock a validação de dados,
duplicação de alunos/faltas e as regras de ocorrência e aluno ativo.

Validamos criação de aluno e telefone normalizado, registo de elogio sem
gravidade e registo de falta por professor na sua disciplina. Também
verificamos respostas 401, 403, 409 e 422 e erros associados a campos. A
primeira tentativa do teste de falta consultou o seletor antes do catálogo
terminar de carregar; a seguinte identificou duas faltas válidas da mesma
disciplina (a seed e a nova). Aguardamos o catálogo e confirmamos os dois
registos. A validação final passou com `npm --prefix frontend run typecheck`,
`npm --prefix frontend test` (2 ficheiros, 16 testes aprovados) e
`npm --prefix frontend run build`.

<!-- CAPTURA: passoF6-aluno-novo.png | formulário de criação de aluno preenchido com dados fictícios, coordenador (modo telemóvel 390x844) -->
<!-- CAPTURA: passoF6-ocorrencia-elogio.png | formulário de ocorrência com tipo Elogio, gravidade ausente e campos fictícios, coordenador (modo telemóvel 390x844) -->
<!-- CAPTURA: passoF6-falta-professor.png | formulário de falta com disciplina do professor selecionada, dados fictícios (modo telemóvel 390x844) -->

Commit da funcionalidade: `ce8e739` (`feat(frontend): formularios de aluno, ocorrencia e falta`).

## F7 - Lançamento de notas em lote

Implementamos `frontend/src/pages/NotasPage.tsx` para escolher classe, turma,
disciplina e trimestre e lançar MAC, NPP e NPT por aluno. A lista de
disciplinas do professor é limitada às suas atribuições; calculamos MT no
cliente apenas quando as três componentes existem. Ao corrigir uma componente
já lançada, mostramos o campo obrigatório para o motivo. Após guardar,
atualizamos localmente a referência da nota para manter correta a distinção
entre primeiro lançamento e correção subsequente.

Validamos a correção de MAC por professor, o motivo obrigatório e a MT
resultante. A primeira execução do teste selecionou uma navegação duplicada;
depois ajustamos para usar o link visível. Em seguida, a mensagem de sucesso
não era encontrada quando a lista recarregava. Passamos a aplicar localmente a
resposta `{ data: Nota }`, preservando a confirmação e a base para próximas
correções. A validação completa passou: `npm --prefix frontend run typecheck`,
`npm --prefix frontend test` (2 ficheiros, 17 testes aprovados) e
`npm --prefix frontend run build`.

<!-- CAPTURA: passoF7-lancamento-notas.png | lançamento de notas na 7.ª classe A, professora com Língua Portuguesa selecionada, motivo de correção visível (modo telemóvel 390x844) -->

Commit da funcionalidade: `cdbb11b` (`feat(frontend): lancamento de notas em lote`).

## F8 - Pesquisa avançada de alunos

Expandimos `frontend/src/pages/AlunosPage.tsx` com filtros de ocorrências
(tipo, gravidade, período e mínimo), situação escolar, trimestre, notas
negativas, faltas justificadas e ordenação. Os filtros de ocorrências só são
apresentados a coordenadores. Ajustamos o mock para combinar tipo, gravidade e
datas na mesma ocorrência; assim não associamos, por engano, o elogio de um
aluno a uma gravidade pertencente a outro registo.

Validamos este caso combinado (elogio e gravidade leve em datas coincidentes,
sem ocorrência que satisfaça ambos), além dos fluxos existentes. Passaram
`npm --prefix frontend run typecheck`, `npm --prefix frontend test` (2
ficheiros, 18 testes aprovados) e `npm --prefix frontend run build`.

<!-- CAPTURA: passoF8-pesquisa-avancada.png | lista sem resultados após filtros combinados de ocorrência tipo Elogio, gravidade Leve e datas, coordenador (modo telemóvel 390x844) -->

Commit da funcionalidade: `116f5ca` (`feat(frontend): pesquisa avancada de alunos`).

## F9 - Boletim imprimível e polimento

Implementamos `frontend/src/pages/BoletimPage.tsx` com resultados por
disciplina e trimestre, MFD, situação escolar, assiduidade e ocorrências
recentes. O botão de impressão usa `window.print()` e as regras `@media print`
removem navegação/faixa de demonstração e o estilo de ecrã. O professor pode
abrir o boletim, mas as ocorrências são omitidas. Também adicionamos alvos
maiores, tabelas roláveis em ecrãs estreitos e estrutura acessível para os
dados tabulares.

O primeiro typecheck apontou `replaceAll` incompatível com o target ES2020;
substituímos por uma expressão regular compatível. Validamos o boletim de
coordenador e professor, incluindo a ausência da secção de ocorrências no
perfil de professor. Passaram `npm --prefix frontend run typecheck`,
`npm --prefix frontend test` (2 ficheiros, 20 testes aprovados) e
`npm --prefix frontend run build`.

<!-- CAPTURA: passoF9-boletim-coordenador.png | boletim completo com notas, faltas e ocorrências recentes, coordenador autenticado (modo telemóvel 390x844) -->
<!-- CAPTURA: passoF9-boletim-professor.png | boletim com notas e faltas, sem secção de ocorrências, professor autenticado (modo telemóvel 390x844) -->
<!-- CAPTURA: passoF9-impressao.png | pré-visualização de impressão do boletim sem navegação e sem faixa de demonstração, coordenador (modo telemóvel 390x844) -->

Commit da funcionalidade: `fd8111b` (`feat(frontend): boletim imprimivel, acessibilidade e polimento mobile`).

## F10a - Testes principais, README e auditoria

Organizamos testes de contrato dos fluxos principais em
`frontend/src/fluxos-principais.test.ts`: login, pesquisa paginada, validação e
registo de ocorrência, e correção de nota com motivo. Os testes de interface em
`frontend/src/App.test.tsx` também exercitam estes percursos completos.
Documentamos instalação, execução com mocks e configuração para apontar ao
backend em `frontend/README.md`.

Passaram `npm --prefix frontend run typecheck`, `npm --prefix frontend test`
(3 ficheiros, 23 testes aprovados) e `npm --prefix frontend run build`.
Executamos `npm --prefix frontend audit --omit=dev`: **0 vulnerabilidades nas
dependências de produção**. A saída da instalação com dependências de
desenvolvimento incluídas reportou 3 vulnerabilidades (1 moderada e 2
críticas); portanto, as críticas reportadas não atingem as dependências de
produção. Não executamos `npm audit fix --force`.

Seguimos apenas com mocks, conforme combinado. Não iniciamos nem testamos o
backend e não fizemos a integração real F10b.

Commits:

- `7204bca` — `test(frontend): testes dos fluxos principais`
- `d6cabf2` — `docs(frontend): readme do frontend`
