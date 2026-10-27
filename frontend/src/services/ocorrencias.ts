import type { NovaOcorrencia, Ocorrencia, Resposta, RespostaLista } from "../types/api";
import { pedidoApi, queryString } from "./api-client";

export interface FiltrosOcorrencias {
  alunoId?: string;
  tipo?: string;
  gravidade?: string;
  de?: string;
  ate?: string;
  coordenadorId?: string;
  pagina?: number;
  limite?: number;
}

export const listarOcorrencias = (filtros: FiltrosOcorrencias = {}) =>
  pedidoApi<RespostaLista<Ocorrencia>>(`/ocorrencias${queryString(filtros)}`);

export const listarOcorrenciasAluno = (id: string, pagina = 1) =>
  pedidoApi<RespostaLista<Ocorrencia>>(`/alunos/${id}/ocorrencias${queryString({ pagina })}`);

export const criarOcorrencia = (id: string, nova: NovaOcorrencia) =>
  pedidoApi<Resposta<Ocorrencia>>(`/alunos/${id}/ocorrencias`, {
    method: "POST",
    body: JSON.stringify(nova),
  });
