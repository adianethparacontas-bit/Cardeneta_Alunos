/** Os tres trimestres do ano letivo. */
export const TRIMESTRES = [1, 2, 3] as const;
export type Trimestre = (typeof TRIMESTRES)[number];

/** Situacao de uma disciplina e situacao global do aluno (iguais no contrato). */
export const Situacoes = {
  EM_CURSO: 'EM_CURSO',
  APROVADO: 'APROVADO',
  REPROVADO: 'REPROVADO',
} as const;

export type Situacao = (typeof Situacoes)[keyof typeof Situacoes];

/** As tres componentes de uma nota, cada uma opcional ate ser lancada. */
export interface ComponentesNota {
  mac: number | null;
  npp: number | null;
  npt: number | null;
}

/** Como a nota fica guardada no ficheiro JSON. */
export interface NotaArmazenada extends ComponentesNota {
  id: string;
  alunoId: string;
  disciplinaId: string;
  anoLetivo: string;
  trimestre: Trimestre;
  atualizadoEm: string;
}

/** Como a nota sai na API: com o nome da disciplina e a MT calculada. */
export interface Nota extends ComponentesNota {
  alunoId: string;
  disciplinaId: string;
  disciplinaNome: string;
  trimestre: Trimestre;
  anoLetivo: string;
  mt: number | null;
  atualizadoEm: string;
}

/** Quem alterou e o que mudou, tal como sai na API. */
export interface NotaHistorico {
  id: string;
  valorAnterior: ComponentesNota;
  valorNovo: ComponentesNota;
  motivo: string | null;
  alteradoPor: { id: string; nome: string };
  alteradoEm: string;
}

/** O historico tal como fica guardado (com a nota a que pertence). */
export interface RegistoNotaHistorico extends NotaHistorico {
  alunoId: string;
  disciplinaId: string;
  trimestre: Trimestre;
}
