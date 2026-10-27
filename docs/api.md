# Contrato da API - Cardeneta_Aluno

Fonte unica: este documento e vinculativo para o backend e para o frontend.
Se algo tiver de mudar, muda-se aqui primeiro.

## GERAL

Prefixo `/api/v1`, JSON, datas `"YYYY-MM-DD"`, timestamps ISO 8601, ids em string
(UUID). Sessao por cookie HttpOnly `cardeneta_sessao`; o frontend usa
`credentials: "include"` e, em desenvolvimento, o Vite faz proxy de `/api` para
`http://localhost:3000` (mesma origem, sem problemas de CORS).

Respostas: objeto `{ data }`; lista `{ data: [...], meta: { pagina, limite, total } }`
(pagina comeca em 1, limite por defeito 10, maximo 50); catalogos simples
`{ data: [...] }`; sair 204 sem corpo.

Erros: `{ erro: { codigo, mensagem, campos? } }` com
`campos = { nomeDoCampo: "mensagem" }`. Codigos: 400 `VALIDACAO_INVALIDA`;
401 `NAO_AUTENTICADO` ou `CREDENCIAIS_INVALIDAS`; 403 `SEM_PERMISSAO`;
404 `NAO_ENCONTRADO`; 409 `ALUNO_DUPLICADO` ou `FALTA_DUPLICADA`;
422 (regra de negocio) `ALUNO_NAO_ATIVO`, `GRAVIDADE_OBRIGATORIA`,
`ELOGIO_SEM_GRAVIDADE`, `DATA_FUTURA`, `MOTIVO_OBRIGATORIO`;
429 `DEMASIADAS_TENTATIVAS`; 500 `ERRO_INTERNO`.

## ENUMS

Papel: `COORDENADOR | PROFESSOR`.
EstadoAluno: `ATIVO | TRANSFERIDO | DESISTENTE | CONCLUIDO`.
Turno: `MANHA | TARDE | NOITE`.
TipoOcorrencia: `ATRASO | INDISCIPLINA | COMPORTAMENTO_INAPROPRIADO | AGRESSAO | DANOS_MATERIAIS | ELOGIO | OUTRA`.
Gravidade: `LEVE | MODERADA | GRAVE`.
Situacao: `EM_CURSO | APROVADO | REPROVADO`.

## OBJETOS

`Utilizador { id, nome, email, papel, disciplinaIds: string[] }`

`Aluno { id, numeroProcesso, nome, classe (1 a 13), turma, turno, anoLetivo ("2026/2027"), numeroEmergencia, numeroEncarregado (ambos "+244XXXXXXXXX"), nomeEncarregado: string|null, dataNascimento: string|null, estado, criadoEm }`

`AlunoResumo = Aluno + { totalOcorrencias: number|null, ultimaOcorrenciaEm: string|null }` (null quando quem pede e PROFESSOR)

`Ocorrencia { id, alunoId, alunoNome, tipo, gravidade: string|null, descricao, dataOcorrencia, local: string|null, acaoTomada: string|null, encarregadoInformado: boolean, registadaPor: { id, nome }, criadoEm }`

`Disciplina { id, nome, codigo }`
`Professor { id, nome, email, disciplinaIds }`

`Nota { alunoId, disciplinaId, disciplinaNome, trimestre (1|2|3), anoLetivo, mac: number|null, npp: number|null, npt: number|null, mt: number|null, atualizadoEm }` (mt so existe com as tres lancadas; calculada, nunca guardada)

`NotaHistorico { id, valorAnterior: {mac,npp,npt}, valorNovo: {mac,npp,npt}, motivo: string|null, alteradoPor: {id,nome}, alteradoEm }`

`Falta { id, alunoId, data, justificada, motivo: string|null, disciplinaId: string|null, disciplinaNome: string|null, registadaPor: {id,nome}, criadoEm }`

`Boletim { aluno: Aluno, anoLetivo, disciplinas: [{ disciplinaId, disciplinaNome, trimestres: [{ trimestre, mac, npp, npt, mt }], mfd: number|null, situacao }], situacaoAluno, faltas: { total, justificadas, injustificadas, porTrimestre: [{ trimestre, total, justificadas, injustificadas }] }, ocorrenciasRecentes: Ocorrencia[]|null }` (ocorrenciasRecentes null para PROFESSOR)

`Resumo { totalAlunosAtivos, porTurma: [{ classe, turma, turno, total }], maisOcorrencias: [{ aluno: {id,nome,numeroProcesso}, totalOcorrencias }], emRisco: [{ aluno: {id,nome,numeroProcesso}, motivos: string[] }] }`

## ENDPOINTS (C = coordenador, P = professor)

- `POST /auth/login` `{email, palavraPasse}` -> `{ data: Utilizador }` + cookie (publico; limite de tentativas)
- `POST /auth/logout` -> 204
- `GET /auth/me` -> `{ data: Utilizador }`
- `GET /alunos` (C,P) -> lista de `AlunoResumo`. Query: `q`, `classe`, `turma`, `turno`, `estado`, `anoLetivo`, `tipoOcorrencia`, `gravidade`, `de`, `ate`, `minOcorrencias`, `situacao`, `trimestre`, `negativasMin`, `minFaltas`, `faltasJustificadas` (true|false), `ordenar` (nome|ocorrencias|ultimaOcorrencia), `direcao` (asc|desc), `pagina`, `limite`. Filtros de ocorrencias: se quem pede e PROFESSOR, 403.
- `POST /alunos` (C) `{nome, classe, turma, turno, anoLetivo, numeroEmergencia, numeroEncarregado, nomeEncarregado?, dataNascimento?}` -> 201 `{ data: Aluno }` (telefones aceitam `"923456789"` ou `"+244923456789"` e saem normalizados)
- `GET /alunos/:id` (C,P)
- `PATCH /alunos/:id` (C) (os mesmos campos, todos opcionais)
- `PATCH /alunos/:id/estado` (C) `{estado}`
- `GET /alunos/:id/boletim` (C,P) -> `{ data: Boletim }`
- `POST /alunos/:id/ocorrencias` (C) `{tipo, gravidade?, descricao, dataOcorrencia, local?, acaoTomada?, encarregadoInformado}` -> 201
- `GET /alunos/:id/ocorrencias` (C) -> lista
- `GET /ocorrencias` (C) -> lista; query `alunoId`, `tipo`, `gravidade`, `de`, `ate`, `coordenadorId`, `pagina`, `limite`
- `GET /disciplinas` (C,P)
- `POST /disciplinas` (C) `{nome, codigo}`
- `GET /professores` (C)
- `POST /professores` (C) `{nome, email, palavraPasse, disciplinaIds}`
- `PUT /professores/:id/disciplinas` (C) `{disciplinaIds}`
- `GET /alunos/:id/notas?trimestre=` (C,P) -> `{ data: Nota[] }`
- `PUT /alunos/:id/notas/:disciplinaId/:trimestre` (C; P so nas suas disciplinas) `{mac?, npp?, npt?, motivo?}` inteiros 0 a 20; motivo e obrigatorio ao corrigir um valor ja lancado (422 `MOTIVO_OBRIGATORIO`) -> `{ data: Nota }`
- `GET /alunos/:id/notas/:disciplinaId/:trimestre/historico` (C,P) -> `{ data: NotaHistorico[] }`
- `GET /notas/lancamento?classe=&turma=&disciplinaId=&trimestre=` (C,P) -> `{ data: [{ aluno: {id,nome,numeroProcesso}, nota: Nota|null }] }`
- `POST /alunos/:id/faltas` (C; P so nas suas disciplinas) `{data, justificada, motivo?, disciplinaId?}` -> 201
- `GET /alunos/:id/faltas?trimestre=` (C,P) -> `{ data: Falta[], meta: { total, justificadas, injustificadas } }`
- `GET /resumo` (C) -> `{ data: Resumo }`

## CONTAS DE DESENVOLVIMENTO

Criadas pelo seed; a palavra-passe e a mesma para todas e vem do `.env` do
backend (a Adia passa-a ao Jose em privado):

- `coord1@cardeneta.test`, `coord2@cardeneta.test` (COORDENADOR)
- `prof1@cardeneta.test`, `prof2@cardeneta.test`, `prof3@cardeneta.test` (PROFESSOR)
