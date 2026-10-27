import type {
  Aluno,
  AlunoResumo,
  Boletim,
  FiltrosAlunos,
  NovoAluno,
  Resposta,
  RespostaLista,
} from "../types/api";
import { pedidoApi, queryString } from "./api-client";

export const listarAlunos = (filtros: FiltrosAlunos = {}) =>
  pedidoApi<RespostaLista<AlunoResumo>>(`/alunos${queryString(filtros)}`);

export const obterAluno = (id: string) => pedidoApi<Resposta<Aluno>>(`/alunos/${id}`);

export const criarAluno = (novo: NovoAluno) =>
  pedidoApi<Resposta<Aluno>>("/alunos", { method: "POST", body: JSON.stringify(novo) });

export const atualizarAluno = (id: string, alteracoes: Partial<NovoAluno>) =>
  pedidoApi<Resposta<Aluno>>(`/alunos/${id}`, { method: "PATCH", body: JSON.stringify(alteracoes) });

export const mudarEstadoAluno = (id: string, estado: Aluno["estado"]) =>
  pedidoApi<Resposta<Aluno>>(`/alunos/${id}/estado`, { method: "PATCH", body: JSON.stringify({ estado }) });

export const obterBoletim = (id: string) => pedidoApi<Resposta<Boletim>>(`/alunos/${id}/boletim`);
