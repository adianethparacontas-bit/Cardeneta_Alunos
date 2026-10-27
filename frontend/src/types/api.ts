export const Papeis = ["COORDENADOR", "PROFESSOR"] as const;
export type Papel = (typeof Papeis)[number];
export const EstadosAluno = ["ATIVO", "TRANSFERIDO", "DESISTENTE", "CONCLUIDO"] as const;
export type EstadoAluno = (typeof EstadosAluno)[number];
export const Turnos = ["MANHA", "TARDE", "NOITE"] as const;
export type Turno = (typeof Turnos)[number];
export const TiposOcorrencia = [
  "ATRASO",
  "INDISCIPLINA",
  "COMPORTAMENTO_INAPROPRIADO",
  "AGRESSAO",
  "DANOS_MATERIAIS",
  "ELOGIO",
  "OUTRA",
] as const;
export type TipoOcorrencia = (typeof TiposOcorrencia)[number];
export const Gravidades = ["LEVE", "MODERADA", "GRAVE"] as const;
export type Gravidade = (typeof Gravidades)[number];
export const Situacoes = ["EM_CURSO", "APROVADO", "REPROVADO"] as const;
export type Situacao = (typeof Situacoes)[number];
export type Trimestre = 1 | 2 | 3;

export interface Utilizador {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  disciplinaIds: string[];
}

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

export interface AlunoResumo extends Aluno {
  totalOcorrencias: number | null;
  ultimaOcorrenciaEm: string | null;
}

export interface PessoaResumo {
  id: string;
  nome: string;
}

export interface Ocorrencia {
  id: string;
  alunoId: string;
  alunoNome: string;
  tipo: TipoOcorrencia;
  gravidade: Gravidade | null;
  descricao: string;
  dataOcorrencia: string;
  local: string | null;
  acaoTomada: string | null;
  encarregadoInformado: boolean;
  registadaPor: PessoaResumo;
  criadoEm: string;
}

export interface Disciplina {
  id: string;
  nome: string;
  codigo: string;
}

export interface Professor {
  id: string;
  nome: string;
  email: string;
  disciplinaIds: string[];
}

export interface Nota {
  alunoId: string;
  disciplinaId: string;
  disciplinaNome: string;
  trimestre: Trimestre;
  anoLetivo: string;
  mac: number | null;
  npp: number | null;
  npt: number | null;
  mt: number | null;
  atualizadoEm: string;
}

export interface ComponentesNota {
  mac: number | null;
  npp: number | null;
  npt: number | null;
}

export interface NotaHistorico {
  id: string;
  valorAnterior: ComponentesNota;
  valorNovo: ComponentesNota;
  motivo: string | null;
  alteradoPor: PessoaResumo;
  alteradoEm: string;
}

export interface Falta {
  id: string;
  alunoId: string;
  data: string;
  justificada: boolean;
  motivo: string | null;
  disciplinaId: string | null;
  disciplinaNome: string | null;
  registadaPor: PessoaResumo;
  criadoEm: string;
}

export interface TrimestreBoletim extends ComponentesNota {
  trimestre: Trimestre;
  mt: number | null;
}

export interface DisciplinaBoletim {
  disciplinaId: string;
  disciplinaNome: string;
  trimestres: TrimestreBoletim[];
  mfd: number | null;
  situacao: Situacao;
}

export interface FaltasPorTrimestre {
  trimestre: Trimestre;
  total: number;
  justificadas: number;
  injustificadas: number;
}

export interface Boletim {
  aluno: Aluno;
  anoLetivo: string;
  disciplinas: DisciplinaBoletim[];
  situacaoAluno: Situacao;
  faltas: {
    total: number;
    justificadas: number;
    injustificadas: number;
    porTrimestre: FaltasPorTrimestre[];
  };
  ocorrenciasRecentes: Ocorrencia[] | null;
}

export interface Resumo {
  totalAlunosAtivos: number;
  porTurma: { classe: number; turma: string; turno: Turno; total: number }[];
  maisOcorrencias: {
    aluno: Pick<Aluno, "id" | "nome" | "numeroProcesso">;
    totalOcorrencias: number;
  }[];
  emRisco: {
    aluno: Pick<Aluno, "id" | "nome" | "numeroProcesso">;
    motivos: string[];
  }[];
}

export interface ErroApi {
  erro: {
    codigo: string;
    mensagem: string;
    campos?: Record<string, string>;
  };
}

export interface Resposta<T> {
  data: T;
}

export interface MetaLista {
  pagina: number;
  limite: number;
  total: number;
}

export interface RespostaLista<T> {
  data: T[];
  meta: MetaLista;
}

export interface FiltrosAlunos {
  q?: string;
  classe?: number;
  turma?: string;
  turno?: Turno;
  estado?: EstadoAluno;
  anoLetivo?: string;
  tipoOcorrencia?: TipoOcorrencia;
  gravidade?: Gravidade;
  de?: string;
  ate?: string;
  minOcorrencias?: number;
  situacao?: Situacao;
  trimestre?: Trimestre;
  negativasMin?: number;
  minFaltas?: number;
  faltasJustificadas?: boolean;
  ordenar?: "nome" | "ocorrencias" | "ultimaOcorrencia";
  direcao?: "asc" | "desc";
  pagina?: number;
  limite?: number;
}

export interface NovoAluno {
  nome: string;
  classe: number;
  turma: string;
  turno: Turno;
  anoLetivo: string;
  numeroEmergencia: string;
  numeroEncarregado: string;
  nomeEncarregado?: string;
  dataNascimento?: string;
}

export interface NovaOcorrencia {
  tipo: TipoOcorrencia;
  gravidade?: Gravidade;
  descricao: string;
  dataOcorrencia: string;
  local?: string;
  acaoTomada?: string;
  encarregadoInformado: boolean;
}

export interface LancamentoNota {
  mac?: number | null;
  npp?: number | null;
  npt?: number | null;
  motivo?: string;
}

export interface NovaFalta {
  data: string;
  justificada: boolean;
  motivo?: string;
  disciplinaId?: string;
}
