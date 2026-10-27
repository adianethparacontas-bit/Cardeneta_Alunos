/** Estados possiveis de um aluno, tal como o contrato define. */
export const EstadosAluno = {
  ATIVO: 'ATIVO',
  TRANSFERIDO: 'TRANSFERIDO',
  DESISTENTE: 'DESISTENTE',
  CONCLUIDO: 'CONCLUIDO',
} as const;

export type EstadoAluno = (typeof EstadosAluno)[keyof typeof EstadosAluno];

/** Turnos da escola. */
export const Turnos = {
  MANHA: 'MANHA',
  TARDE: 'TARDE',
  NOITE: 'NOITE',
} as const;

export type Turno = (typeof Turnos)[keyof typeof Turnos];

/** O aluno tal como fica guardado e como sai na API. */
export interface Aluno {
  id: string;
  numeroProcesso: string;
  nome: string;
  classe: number;
  turma: string;
  turno: Turno;
  anoLetivo: string;
  numeroEmergencia: string;
  numeroEncarregado: string;
  nomeEncarregado: string | null;
  dataNascimento: string | null;
  estado: EstadoAluno;
  criadoEm: string;
}

/**
 * O aluno com os contadores que so o coordenador pode ver. Para um professor
 * os dois campos vem a null (o contrato exige isso).
 */
export interface AlunoResumo extends Aluno {
  totalOcorrencias: number | null;
  ultimaOcorrenciaEm: string | null;
}
