import type { LancamentoNota, Nota, NotaHistorico, Resposta, Trimestre } from "../types/api";
import { pedidoApi, queryString } from "./api-client";

export interface LinhaLancamento {
  aluno: { id: string; nome: string; numeroProcesso: string };
  nota: Nota | null;
}

export const listarNotasAluno = (alunoId: string, trimestre?: Trimestre) =>
  pedidoApi<Resposta<Nota[]>>(`/alunos/${alunoId}/notas${queryString({ trimestre })}`);

export const guardarNota = (
  alunoId: string,
  disciplinaId: string,
  trimestre: Trimestre,
  dados: LancamentoNota,
) =>
  pedidoApi<Resposta<Nota>>(`/alunos/${alunoId}/notas/${disciplinaId}/${trimestre}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

export const historicoNota = (alunoId: string, disciplinaId: string, trimestre: Trimestre) =>
  pedidoApi<Resposta<NotaHistorico[]>>(`/alunos/${alunoId}/notas/${disciplinaId}/${trimestre}/historico`);

export const listarLancamento = (classe: number, turma: string, disciplinaId: string, trimestre: Trimestre) =>
  pedidoApi<Resposta<LinhaLancamento[]>>(
    `/notas/lancamento${queryString({ classe, turma, disciplinaId, trimestre })}`,
  );
