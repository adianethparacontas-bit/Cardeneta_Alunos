import { Situacoes, type ComponentesNota, type Situacao, type Trimestre } from './tipos.js';

/**
 * Regras de calculo das notas.
 *
 * SAO SUPOSICOES do regulamento da escola, a confirmar:
 * - escala de 0 a 20;
 * - media trimestral (MT) = (MAC + NPP + NPT) / 3, so existe com as tres lancadas;
 * - media final da disciplina (MFD) = media das tres MT, so existe com as tres;
 * - aprovacao a partir de 10 valores;
 * - arredondamento as unidades (Math.round).
 *
 * Estao todas aqui, em funcoes puras, para se mudarem num unico sitio e serem
 * testadas sem base de dados nem servidor.
 */

export const NOTA_MINIMA = 0;
export const NOTA_MAXIMA = 20;
export const NOTA_MINIMA_POSITIVA = 10;

function arredondar(valor: number): number {
  return Math.round(valor);
}

/** Media trimestral; null enquanto faltar alguma das tres componentes. */
export function mediaTrimestral(componentes: ComponentesNota): number | null {
  const { mac, npp, npt } = componentes;

  if (mac === null || npp === null || npt === null) {
    return null;
  }

  return arredondar((mac + npp + npt) / 3);
}

/** Media final da disciplina; null enquanto faltar alguma das tres MT. */
export function mediaFinalDisciplina(mediasDosTrimestres: (number | null)[]): number | null {
  if (mediasDosTrimestres.length !== 3) {
    return null;
  }

  if (mediasDosTrimestres.some((media) => media === null)) {
    return null;
  }

  const soma = (mediasDosTrimestres as number[]).reduce((total, media) => total + media, 0);

  return arredondar(soma / 3);
}

/** Situacao de uma disciplina a partir da MFD. */
export function situacaoDaDisciplina(mfd: number | null): Situacao {
  if (mfd === null) {
    return Situacoes.EM_CURSO;
  }

  return mfd >= NOTA_MINIMA_POSITIVA ? Situacoes.APROVADO : Situacoes.REPROVADO;
}

/**
 * Situacao global do aluno: reprovado se alguma disciplina estiver reprovada,
 * aprovado se todas estiverem aprovadas, em curso nos restantes casos.
 */
export function situacaoDoAluno(situacoes: Situacao[]): Situacao {
  if (situacoes.some((situacao) => situacao === Situacoes.REPROVADO)) {
    return Situacoes.REPROVADO;
  }

  if (situacoes.length > 0 && situacoes.every((situacao) => situacao === Situacoes.APROVADO)) {
    return Situacoes.APROVADO;
  }

  return Situacoes.EM_CURSO;
}

/** Ordem canonica dos trimestres, para varrer sempre 1, 2, 3. */
export const TRIMESTRES_ORDENADOS: Trimestre[] = [1, 2, 3];
