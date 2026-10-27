import type { Disciplina, Professor, Resposta } from "../types/api";
import { pedidoApi } from "./api-client";

export const listarDisciplinas = () => pedidoApi<Resposta<Disciplina[]>>("/disciplinas");
export const criarDisciplina = (nome: string, codigo: string) =>
  pedidoApi<Resposta<Disciplina>>("/disciplinas", { method: "POST", body: JSON.stringify({ nome, codigo }) });
export const listarProfessores = () => pedidoApi<Resposta<Professor[]>>("/professores");
export const criarProfessor = (nome: string, email: string, palavraPasse: string, disciplinaIds: string[]) =>
  pedidoApi<Resposta<Professor>>("/professores", {
    method: "POST",
    body: JSON.stringify({ nome, email, palavraPasse, disciplinaIds }),
  });
export const atualizarDisciplinasProfessor = (id: string, disciplinaIds: string[]) =>
  pedidoApi<Resposta<Professor>>(`/professores/${id}/disciplinas`, {
    method: "PUT",
    body: JSON.stringify({ disciplinaIds }),
  });
