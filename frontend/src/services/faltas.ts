import type { Falta, NovaFalta, Resposta } from "../types/api";
import { pedidoApi, queryString } from "./api-client";

export interface FaltasAluno extends Resposta<Falta[]> {
  meta: { total: number; justificadas: number; injustificadas: number };
}

export const listarFaltas = (alunoId: string, trimestre?: number) =>
  pedidoApi<FaltasAluno>(`/alunos/${alunoId}/faltas${queryString({ trimestre })}`);

export const criarFalta = (alunoId: string, falta: NovaFalta) =>
  pedidoApi<Resposta<Falta>>(`/alunos/${alunoId}/faltas`, {
    method: "POST",
    body: JSON.stringify(falta),
  });
