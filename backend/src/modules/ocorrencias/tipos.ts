/** Tipos de ocorrencia do contrato. */
export const TiposOcorrencia = {
  ATRASO: 'ATRASO',
  INDISCIPLINA: 'INDISCIPLINA',
  COMPORTAMENTO_INAPROPRIADO: 'COMPORTAMENTO_INAPROPRIADO',
  AGRESSAO: 'AGRESSAO',
  DANOS_MATERIAIS: 'DANOS_MATERIAIS',
  ELOGIO: 'ELOGIO',
  OUTRA: 'OUTRA',
} as const;

export type TipoOcorrencia = (typeof TiposOcorrencia)[keyof typeof TiposOcorrencia];

/** Gravidades; um elogio nunca tem gravidade. */
export const Gravidades = {
  LEVE: 'LEVE',
  MODERADA: 'MODERADA',
  GRAVE: 'GRAVE',
} as const;

export type Gravidade = (typeof Gravidades)[keyof typeof Gravidades];

/** Quem registou a ocorrencia, tal como sai na API. */
export interface RegistoOcorrencia {
  id: string;
  nome: string;
}

/** A ocorrencia tal como fica guardada e como sai na API. */
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
  registadaPor: RegistoOcorrencia;
  criadoEm: string;
}
