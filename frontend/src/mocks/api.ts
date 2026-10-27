import { alunos, disciplinas, faltas, notas, ocorrencias, palavraPasseDemonstracao, utilizadores } from "./data";
import type {
  Aluno,
  AlunoResumo,
  Boletim,
  ComponentesNota,
  DisciplinaBoletim,
  EstadoAluno,
  Falta,
  FiltrosAlunos,
  Gravidade,
  Nota,
  NotaHistorico,
  NovaFalta,
  NovaOcorrencia,
  Ocorrencia,
  Papel,
  Resumo,
  Situacao,
  Trimestre,
  TipoOcorrencia,
  Utilizador,
} from "../types/api";

type MockResponse<T = unknown> = { data: T } | { data: unknown[]; meta: { pagina: number; limite: number; total: number } };

export class ErroMock extends Error {
  constructor(
    public readonly status: number,
    public readonly codigo: string,
    message: string,
    public readonly campos?: Record<string, string>,
  ) {
    super(message);
    this.name = "ErroMock";
  }
}

const historicos = new Map<string, NotaHistorico[]>();
const tentativas = new Map<string, number>();
let sessaoId: string | null = null;
let proximoAluno = 13;

function falhar(status: number, codigo: string, mensagem: string, campos?: Record<string, string>): never {
  throw new ErroMock(status, codigo, mensagem, campos);
}

function utilizadorAtual(): Utilizador {
  const user = utilizadores.find((item) => item.id === sessaoId);
  if (!user) falhar(401, "NAO_AUTENTICADO", "Inicie sessão para continuar.");
  return user;
}

function exigirPapel(...papeis: Papel[]) {
  const user = utilizadorAtual();
  if (!papeis.includes(user.papel)) falhar(403, "SEM_PERMISSAO", "Não tem permissão para esta ação.");
  return user;
}

function objeto(body: BodyInit | null | undefined): Record<string, unknown> {
  if (!body) return {};
  try {
    return JSON.parse(String(body)) as Record<string, unknown>;
  } catch {
    falhar(400, "VALIDACAO_INVALIDA", "O corpo do pedido não é JSON válido.");
  }
}

function envelope<T>(data: T): MockResponse<T> {
  return { data };
}

function compararData(data: string, de?: string, ate?: string) {
  return (!de || data >= de) && (!ate || data <= ate);
}

function lista<T>(items: T[], pagina: number, limite: number) {
  const inicio = (pagina - 1) * limite;
  return { data: items.slice(inicio, inicio + limite), meta: { pagina, limite, total: items.length } };
}

function resumoAluno(aluno: Aluno, papel: Papel): AlunoResumo {
  const doAluno = ocorrencias.filter((item) => item.alunoId === aluno.id);
  const datas = doAluno.map((item) => item.dataOcorrencia).sort();
  return {
    ...aluno,
    totalOcorrencias: papel === "PROFESSOR" ? null : doAluno.length,
    ultimaOcorrenciaEm: papel === "PROFESSOR" ? null : datas[datas.length - 1] ?? null,
  };
}

function parseFiltros(params: URLSearchParams): FiltrosAlunos {
  return Object.fromEntries(params.entries()) as FiltrosAlunos;
}

function tratarAlunos(params: URLSearchParams, method: string, body: Record<string, unknown>) {
  const user = exigirPapel("COORDENADOR", "PROFESSOR");
  if (method === "GET") {
    const filtros = parseFiltros(params);
    const camposOcorrencias = ["tipoOcorrencia", "gravidade", "de", "ate", "minOcorrencias"];
    if (user.papel === "PROFESSOR" && camposOcorrencias.some((campo) => params.has(campo))) {
      falhar(403, "SEM_PERMISSAO", "Professores não podem filtrar alunos por ocorrências.");
    }
    const pagina = Math.max(1, Number(params.get("pagina") ?? 1));
    const limite = Math.min(50, Math.max(1, Number(params.get("limite") ?? 10)));
    let result = alunos.filter((aluno) => {
      const resumo = resumoAluno(aluno, user.papel);
      if (filtros.q && !`${aluno.nome} ${aluno.numeroProcesso}`.toLowerCase().includes(String(filtros.q).toLowerCase())) return false;
      if (filtros.classe && aluno.classe !== Number(filtros.classe)) return false;
      if (filtros.turma && aluno.turma !== filtros.turma) return false;
      if (filtros.turno && aluno.turno !== filtros.turno) return false;
      if (filtros.estado && aluno.estado !== filtros.estado) return false;
      if (filtros.anoLetivo && aluno.anoLetivo !== filtros.anoLetivo) return false;
      if (filtros.tipoOcorrencia && !ocorrencias.some((item) => item.alunoId === aluno.id && item.tipo === filtros.tipoOcorrencia && compararData(item.dataOcorrencia, filtros.de, filtros.ate))) return false;
      if (filtros.gravidade && !ocorrencias.some((item) => item.alunoId === aluno.id && item.gravidade === filtros.gravidade && compararData(item.dataOcorrencia, filtros.de, filtros.ate))) return false;
      if (filtros.minOcorrencias && (resumo.totalOcorrencias ?? 0) < Number(filtros.minOcorrencias)) return false;
      if (filtros.minFaltas && faltas.filter((item) => item.alunoId === aluno.id).length < Number(filtros.minFaltas)) return false;
      if (filtros.faltasJustificadas !== undefined && faltas.some((item) => item.alunoId === aluno.id && item.justificada === (String(filtros.faltasJustificadas) === "true")) === false) return false;
      if (filtros.situacao && !notasAluno(aluno.id).some((item) => situacaoNota(item.mt) === filtros.situacao)) return false;
      if (filtros.negativasMin && notasAluno(aluno.id).filter((item) => item.mt !== null && item.mt < 10).length < Number(filtros.negativasMin)) return false;
      if (filtros.trimestre && !notasAluno(aluno.id).some((item) => item.trimestre === Number(filtros.trimestre))) return false;
      return true;
    }).map((aluno) => resumoAluno(aluno, user.papel));
    if (filtros.ordenar === "nome") result.sort((a, b) => a.nome.localeCompare(b.nome));
    if (filtros.ordenar === "ocorrencias") result.sort((a, b) => (a.totalOcorrencias ?? 0) - (b.totalOcorrencias ?? 0));
    if (filtros.ordenar === "ultimaOcorrencia") result.sort((a, b) => (a.ultimaOcorrenciaEm ?? "").localeCompare(b.ultimaOcorrenciaEm ?? ""));
    if (filtros.direcao === "desc") result.reverse();
    return lista(result, pagina, limite);
  }

  if (method === "POST") {
    exigirPapel("COORDENADOR");
    const erros: Record<string, string> = {};
    for (const field of ["nome", "turma", "anoLetivo", "numeroEmergencia", "numeroEncarregado"]) {
      if (!String(body[field] ?? "").trim()) erros[field] = "Este campo é obrigatório.";
    }
    for (const field of ["numeroEmergencia", "numeroEncarregado"]) {
      if (body[field] && !/^(?:\+244)?9\d{8}$/.test(String(body[field]).replace(/\s/g, ""))) erros[field] = "Introduza um número angolano válido.";
    }
    if (Object.keys(erros).length) falhar(400, "VALIDACAO_INVALIDA", "Verifique os campos indicados.", erros);
    const id = `a-${String(proximoAluno++).padStart(3, "0")}`;
    const novo: Aluno = {
      id, numeroProcesso: `2026${String(proximoAluno).padStart(4, "0")}`,
      nome: String(body.nome).trim(), classe: Number(body.classe), turma: String(body.turma),
      turno: body.turno as Aluno["turno"], anoLetivo: String(body.anoLetivo),
      numeroEmergencia: normalizarTelefone(body.numeroEmergencia),
      numeroEncarregado: normalizarTelefone(body.numeroEncarregado),
      nomeEncarregado: body.nomeEncarregado ? String(body.nomeEncarregado) : null,
      dataNascimento: body.dataNascimento ? String(body.dataNascimento) : null,
      estado: "ATIVO", criadoEm: new Date().toISOString(),
    };
    alunos.unshift(novo);
    return envelope(novo);
  }
  return null;
}

function normalizarTelefone(valor: unknown) {
  const digits = String(valor ?? "").replace(/\D/g, "");
  return `+244${digits.startsWith("244") ? digits.slice(3) : digits}`;
}

function notasAluno(alunoId: string) {
  return notas.filter((item) => item.alunoId === alunoId);
}

function situacaoNota(mt: number | null): Situacao {
  return mt === null ? "EM_CURSO" : mt >= 10 ? "APROVADO" : "REPROVADO";
}

function ocorrenciasDoAluno(id: string) {
  return ocorrencias.filter((item) => item.alunoId === id);
}

function construirBoletim(aluno: Aluno, papel: Papel): Boletim {
  const disciplinasBoletim: DisciplinaBoletim[] = disciplinas.map((disciplina) => {
    const componentes = notas.find((item) => item.alunoId === aluno.id && item.disciplinaId === disciplina.id && item.trimestre === 1);
    const itens = ([1, 2, 3] as const).map((trimestre) => {
      const nota = notas.find((item) => item.alunoId === aluno.id && item.disciplinaId === disciplina.id && item.trimestre === trimestre);
      const base = { mac: nota?.mac ?? null, npp: nota?.npp ?? null, npt: nota?.npt ?? null };
      return { trimestre, ...base, mt: nota?.mt ?? null };
    });
    const mfd = itens.every((item) => item.mt !== null)
      ? Math.round(itens.reduce((total, item) => total + (item.mt ?? 0), 0) / 3)
      : null;
    return { disciplinaId: disciplina.id, disciplinaNome: disciplina.nome, trimestres: itens, mfd, situacao: situacaoNota(componentes?.mt ?? null) };
  });
  const faltasAluno = faltas.filter((item) => item.alunoId === aluno.id);
  const justificadas = faltasAluno.filter((item) => item.justificada).length;
  const recent = ocorrenciasDoAluno(aluno.id).sort((a, b) => b.dataOcorrencia.localeCompare(a.dataOcorrencia)).slice(0, 5);
  return {
    aluno, anoLetivo: aluno.anoLetivo, disciplinas: disciplinasBoletim, situacaoAluno: "EM_CURSO",
    faltas: {
      total: faltasAluno.length, justificadas, injustificadas: faltasAluno.length - justificadas,
      porTrimestre: ([1, 2, 3] as const).map((trimestre) => {
        const total = faltasAluno.filter((item) => {
          const month = Number(item.data.slice(5, 7));
          return (trimestre === 1 && month >= 9 && month <= 12) || (trimestre === 2 && month >= 1 && month <= 3) || (trimestre === 3 && month >= 4 && month <= 7);
        });
        const just = total.filter((item) => item.justificada).length;
        return { trimestre, total: total.length, justificadas: just, injustificadas: total.length - just };
      }),
    },
    ocorrenciasRecentes: papel === "PROFESSOR" ? null : recent,
  };
}

function tratarNotas(path: string, method: string, body: Record<string, unknown>, params: URLSearchParams) {
  const user = exigirPapel("COORDENADOR", "PROFESSOR");
  const match = path.match(/^\/alunos\/([^/]+)\/notas(?:\/([^/]+)\/(\d+)(?:\/historico)?)?$/);
  if (!match) return null;
  const aluno = alunos.find((item) => item.id === match[1]);
  if (!aluno) falhar(404, "NAO_ENCONTRADO", "Aluno não encontrado.");
  const disciplinaId = match[2];
  if (!disciplinaId) {
    const trimestre = params.get("trimestre");
    return envelope(notasAluno(aluno.id).filter((item) => !trimestre || item.trimestre === Number(trimestre)));
  }
  const trimestre = Number(match[3]) as Trimestre;
  const key = `${aluno.id}:${disciplinaId}:${trimestre}`;
  if (path.endsWith("/historico")) return envelope(historicos.get(key) ?? []);
  if (method !== "PUT") return null;
  if (user.papel === "PROFESSOR" && !user.disciplinaIds.includes(disciplinaId)) falhar(403, "SEM_PERMISSAO", "Só pode lançar notas nas suas disciplinas.");
  const disciplina = disciplinas.find((item) => item.id === disciplinaId);
  if (!disciplina) falhar(404, "NAO_ENCONTRADO", "Disciplina não encontrada.");
  const current = notas.find((item) => item.alunoId === aluno.id && item.disciplinaId === disciplinaId && item.trimestre === trimestre);
  const fields: (keyof ComponentesNota)[] = ["mac", "npp", "npt"];
  const updated = { mac: current?.mac ?? null, npp: current?.npp ?? null, npt: current?.npt ?? null };
  for (const field of fields) {
    if (body[field] !== undefined) {
      const value = body[field] === null || body[field] === "" ? null : Number(body[field]);
      if (value !== null && (!Number.isInteger(value) || value < 0 || value > 20)) falhar(400, "VALIDACAO_INVALIDA", "As notas devem ser inteiros entre 0 e 20.", { [field]: "Introduza um inteiro entre 0 e 20." });
      if (current?.[field] !== null && current?.[field] !== undefined && current[field] !== value && !String(body.motivo ?? "").trim()) {
        falhar(422, "MOTIVO_OBRIGATORIO", "Indique o motivo da correção.", { motivo: "Obrigatório ao corrigir uma nota já lançada." });
      }
      updated[field] = value;
    }
  }
  const changedExisting = fields.some((field) => current?.[field] !== null && current?.[field] !== undefined && current[field] !== updated[field]);
  if (current && changedExisting) {
    const history = historicos.get(key) ?? [];
    history.unshift({
      id: crypto.randomUUID(), valorAnterior: { mac: current.mac, npp: current.npp, npt: current.npt },
      valorNovo: updated, motivo: String(body.motivo), alteradoPor: { id: user.id, nome: user.nome },
      alteradoEm: new Date().toISOString(),
    });
    historicos.set(key, history);
  }
  const mt = Object.values(updated).every((value) => value !== null)
    ? Math.round(((updated.mac ?? 0) + (updated.npp ?? 0) + (updated.npt ?? 0)) / 3)
    : null;
  const saved: Nota = {
    alunoId: aluno.id, disciplinaId, disciplinaNome: disciplina.nome,
    trimestre, anoLetivo: aluno.anoLetivo, ...updated, mt, atualizadoEm: new Date().toISOString(),
  };
  const index = notas.findIndex((item) => item.alunoId === aluno.id && item.disciplinaId === disciplinaId && item.trimestre === trimestre);
  if (index >= 0) notas[index] = saved;
  else notas.push(saved);
  return envelope(saved);
}

export async function pedidoMock<T>(input: string, init: RequestInit = {}): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 120));
  const url = new URL(input, window.location.origin);
  const path = url.pathname.replace(/^\/api\/v1/, "");
  const method = (init.method ?? "GET").toUpperCase();
  const body = objeto(init.body);
  const params = url.searchParams;

  if (path === "/auth/login" && method === "POST") {
    const email = String(body.email ?? "").toLowerCase();
    const tries = tentativas.get(email) ?? 0;
    if (tries >= 5) falhar(429, "DEMASIADAS_TENTATIVAS", "Limite de tentativas atingido. Tente novamente mais tarde.");
    const user = utilizadores.find((item) => item.email === email);
    if (!user || body.palavraPasse !== palavraPasseDemonstracao) {
      tentativas.set(email, tries + 1);
      falhar(401, "CREDENCIAIS_INVALIDAS", "Email ou palavra-passe incorretos.");
    }
    tentativas.delete(email);
    sessaoId = user.id;
    return envelope(user) as T;
  }
  if (path === "/auth/logout" && method === "POST") {
    sessaoId = null;
    return undefined as T;
  }
  if (path === "/auth/me" && method === "GET") return envelope(utilizadorAtual()) as T;
  if (path === "/alunos" ) {
    const response = tratarAlunos(params, method, body);
    if (response) return response as T;
  }
  if (path === "/resumo" && method === "GET") {
    exigirPapel("COORDENADOR");
    const agrupado = new Map<string, Resumo["porTurma"][number]>();
    alunos.filter((item) => item.estado === "ATIVO").forEach((item) => {
      const key = `${item.classe}-${item.turma}-${item.turno}`;
      const group = agrupado.get(key) ?? { classe: item.classe, turma: item.turma, turno: item.turno, total: 0 };
      group.total++;
      agrupado.set(key, group);
    });
    const response: Resumo = {
      totalAlunosAtivos: alunos.filter((item) => item.estado === "ATIVO").length,
      porTurma: [...agrupado.values()],
      maisOcorrencias: alunos.map((aluno) => ({ aluno: { id: aluno.id, nome: aluno.nome, numeroProcesso: aluno.numeroProcesso }, totalOcorrencias: ocorrenciasDoAluno(aluno.id).length })).filter((item) => item.totalOcorrencias).sort((a, b) => b.totalOcorrencias - a.totalOcorrencias).slice(0, 5),
      emRisco: alunos.filter((aluno) => notasAluno(aluno.id).filter((nota) => nota.mt !== null && nota.mt < 10).length >= 2).slice(0, 4).map((aluno) => ({ aluno: { id: aluno.id, nome: aluno.nome, numeroProcesso: aluno.numeroProcesso }, motivos: ["Notas abaixo de 10"] })),
    };
    return envelope(response) as T;
  }
  if (path === "/disciplinas" && method === "GET") {
    exigirPapel("COORDENADOR", "PROFESSOR");
    return envelope(disciplinas) as T;
  }
  if (path === "/professores" && method === "GET") {
    exigirPapel("COORDENADOR");
    return envelope(utilizadores.filter((item) => item.papel === "PROFESSOR").map(({ id, nome, email, disciplinaIds }) => ({ id, nome, email, disciplinaIds }))) as T;
  }
  if (path === "/notas/lancamento" && method === "GET") {
    const user = exigirPapel("COORDENADOR", "PROFESSOR");
    const disciplinaId = params.get("disciplinaId") ?? "";
    if (user.papel === "PROFESSOR" && !user.disciplinaIds.includes(disciplinaId)) falhar(403, "SEM_PERMISSAO", "Só pode consultar as suas disciplinas.");
    const trimestre = Number(params.get("trimestre"));
    const rows = alunos.filter((item) => item.classe === Number(params.get("classe")) && item.turma === params.get("turma")).map((aluno) => ({
      aluno: { id: aluno.id, nome: aluno.nome, numeroProcesso: aluno.numeroProcesso },
      nota: notas.find((item) => item.alunoId === aluno.id && item.disciplinaId === disciplinaId && item.trimestre === trimestre) ?? null,
    }));
    return envelope(rows) as T;
  }
  const notaResponse = tratarNotas(path, method, body, params);
  if (notaResponse) return notaResponse as T;

  const student = path.match(/^\/alunos\/([^/]+)(?:\/(.*))?$/);
  if (student) {
    const [, id, subpath = ""] = student;
    const aluno = alunos.find((item) => item.id === id);
    if (!aluno) falhar(404, "NAO_ENCONTRADO", "Aluno não encontrado.");
    if (!subpath && method === "GET") {
      exigirPapel("COORDENADOR", "PROFESSOR");
      return envelope(aluno) as T;
    }
    if (!subpath && method === "PATCH") {
      exigirPapel("COORDENADOR");
      Object.assign(aluno, body);
      for (const key of ["numeroEmergencia", "numeroEncarregado"] as const) {
        if (body[key]) aluno[key] = normalizarTelefone(body[key]);
      }
      return envelope(aluno) as T;
    }
    if (subpath === "estado" && method === "PATCH") {
      exigirPapel("COORDENADOR");
      aluno.estado = body.estado as EstadoAluno;
      return envelope(aluno) as T;
    }
    if (subpath === "boletim" && method === "GET") return envelope(construirBoletim(aluno, utilizadorAtual().papel)) as T;
    if (subpath === "ocorrencias") {
      if (method === "GET") {
        exigirPapel("COORDENADOR");
        return lista(ocorrenciasDoAluno(id!).sort((a, b) => b.dataOcorrencia.localeCompare(a.dataOcorrencia)), Number(params.get("pagina") ?? 1), Number(params.get("limite") ?? 10)) as T;
      }
      if (method === "POST") {
        const user = exigirPapel("COORDENADOR");
        const request = body as unknown as NovaOcorrencia;
        if (aluno.estado !== "ATIVO") falhar(422, "ALUNO_NAO_ATIVO", "Só pode registar ocorrências de alunos ativos.");
        if (request.tipo === "ELOGIO" && request.gravidade) falhar(422, "ELOGIO_SEM_GRAVIDADE", "Elogios não devem ter gravidade.");
        if (request.tipo !== "ELOGIO" && !request.gravidade) falhar(422, "GRAVIDADE_OBRIGATORIA", "Selecione a gravidade.", { gravidade: "Obrigatória para este tipo." });
        if (request.dataOcorrencia > new Date().toISOString().slice(0, 10)) falhar(422, "DATA_FUTURA", "A data não pode ser futura.", { dataOcorrencia: "Escolha uma data de hoje ou anterior." });
        const entry: Ocorrencia = {
          id: crypto.randomUUID(), alunoId: id!, alunoNome: aluno.nome, tipo: request.tipo,
          gravidade: request.tipo === "ELOGIO" ? null : request.gravidade ?? null,
          descricao: request.descricao, dataOcorrencia: request.dataOcorrencia, local: request.local ?? null,
          acaoTomada: request.acaoTomada ?? null, encarregadoInformado: request.encarregadoInformado,
          registadaPor: { id: user.id, nome: user.nome }, criadoEm: new Date().toISOString(),
        };
        ocorrencias.unshift(entry);
        return envelope(entry) as T;
      }
    }
    if (subpath === "faltas") {
      if (method === "GET") {
        exigirPapel("COORDENADOR", "PROFESSOR");
        const items = faltas.filter((item) => item.alunoId === id);
        const just = items.filter((item) => item.justificada).length;
        const result = lista(items, Number(params.get("pagina") ?? 1), Number(params.get("limite") ?? 50));
        return { ...result, meta: { ...result.meta, total: items.length, justificadas: just, injustificadas: items.length - just } } as T;
      }
      if (method === "POST") {
        const user = exigirPapel("COORDENADOR", "PROFESSOR");
        const request = body as unknown as NovaFalta;
        if (user.papel === "PROFESSOR" && (!request.disciplinaId || !user.disciplinaIds.includes(request.disciplinaId))) falhar(403, "SEM_PERMISSAO", "Só pode registar faltas nas suas disciplinas.");
        if (faltas.some((item) => item.alunoId === id && item.data === request.data && item.disciplinaId === (request.disciplinaId ?? null))) falhar(409, "FALTA_DUPLICADA", "Já existe uma falta para este aluno nessa data.");
        const disciplina = disciplinas.find((item) => item.id === request.disciplinaId);
        const falta: Falta = {
          id: crypto.randomUUID(), alunoId: id!, data: request.data, justificada: request.justificada,
          motivo: request.motivo ?? null, disciplinaId: request.disciplinaId ?? null, disciplinaNome: disciplina?.nome ?? null,
          registadaPor: { id: user.id, nome: user.nome }, criadoEm: new Date().toISOString(),
        };
        faltas.unshift(falta);
        return envelope(falta) as T;
      }
    }
  }
  if (path === "/ocorrencias" && method === "GET") {
    exigirPapel("COORDENADOR");
    const items = ocorrencias.filter((item) =>
      (!params.has("alunoId") || item.alunoId === params.get("alunoId")) &&
      (!params.has("tipo") || item.tipo === params.get("tipo")) &&
      (!params.has("gravidade") || item.gravidade === params.get("gravidade")) &&
      compararData(item.dataOcorrencia, params.get("de") ?? undefined, params.get("ate") ?? undefined),
    );
    return lista(items, Number(params.get("pagina") ?? 1), Number(params.get("limite") ?? 10)) as T;
  }
  if (path.startsWith("/disciplinas") && method === "POST") {
    exigirPapel("COORDENADOR");
    return envelope({ id: crypto.randomUUID(), nome: body.nome, codigo: body.codigo }) as T;
  }
  if (path.startsWith("/professores") && method === "POST") {
    exigirPapel("COORDENADOR");
    return envelope({ id: crypto.randomUUID(), nome: body.nome, email: body.email, disciplinaIds: body.disciplinaIds }) as T;
  }
  const professorDisciplinas = path.match(/^\/professores\/([^/]+)\/disciplinas$/);
  if (professorDisciplinas && method === "PUT") {
    exigirPapel("COORDENADOR");
    const professor = utilizadores.find((item) => item.id === professorDisciplinas[1] && item.papel === "PROFESSOR");
    if (!professor) falhar(404, "NAO_ENCONTRADO", "Professor não encontrado.");
    professor.disciplinaIds = Array.isArray(body.disciplinaIds) ? body.disciplinaIds.map(String) : [];
    return envelope({ id: professor.id, nome: professor.nome, email: professor.email, disciplinaIds: professor.disciplinaIds }) as T;
  }
  falhar(404, "NAO_ENCONTRADO", "A rota de demonstração ainda não está disponível.");
}

export function reiniciarMocks() {
  sessaoId = null;
  tentativas.clear();
}

export type { Gravidade, TipoOcorrencia };
