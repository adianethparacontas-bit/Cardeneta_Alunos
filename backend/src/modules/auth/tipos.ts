/** Papeis previstos no contrato. */
export const Papeis = {
  COORDENADOR: 'COORDENADOR',
  PROFESSOR: 'PROFESSOR',
} as const;

export type Papel = (typeof Papeis)[keyof typeof Papeis];

export const PAPEIS: readonly Papel[] = [Papeis.COORDENADOR, Papeis.PROFESSOR];

export function ehPapel(valor: unknown): valor is Papel {
  return valor === Papeis.COORDENADOR || valor === Papeis.PROFESSOR;
}

/** Como o utilizador fica guardado no ficheiro JSON (inclui o hash da senha). */
export interface UtilizadorArmazenado {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  disciplinaIds: string[];
  senhaHash: string;
  criadoEm: string;
}

/** Como o utilizador sai na API: exatamente os campos do contrato. */
export interface UtilizadorPublico {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  disciplinaIds: string[];
}

/** Remove o hash da senha e os campos internos antes de responder. */
export function paraUtilizadorPublico(utilizador: UtilizadorArmazenado): UtilizadorPublico {
  return {
    id: utilizador.id,
    nome: utilizador.nome,
    email: utilizador.email,
    papel: utilizador.papel,
    disciplinaIds: [...utilizador.disciplinaIds],
  };
}
