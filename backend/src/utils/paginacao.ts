import { z } from 'zod';

export const LIMITE_POR_DEFEITO = 10;
export const LIMITE_MAXIMO = 50;

export const esquemaPaginacao = z.object({
  pagina: z.coerce
    .number({ invalid_type_error: 'A pagina tem de ser um numero.' })
    .int('A pagina tem de ser um numero inteiro.')
    .positive('A pagina comeca em 1.')
    .default(1),
  limite: z.coerce
    .number({ invalid_type_error: 'O limite tem de ser um numero.' })
    .int('O limite tem de ser um numero inteiro.')
    .positive('O limite tem de ser pelo menos 1.')
    .max(LIMITE_MAXIMO, `O limite maximo e ${LIMITE_MAXIMO}.`)
    .default(LIMITE_POR_DEFEITO),
});

export interface Paginacao {
  pagina: number;
  limite: number;
}

export interface MetaLista {
  pagina: number;
  limite: number;
  total: number;
}

/**
 * Corta a lista a pagina pedida. A contagem total e sempre a lista inteira (ja
 * filtrada), para o frontend saber quantas paginas existem.
 */
export function paginar<T>(itens: T[], paginacao: Paginacao): { itens: T[]; meta: MetaLista } {
  const inicio = (paginacao.pagina - 1) * paginacao.limite;

  return {
    itens: itens.slice(inicio, inicio + paginacao.limite),
    meta: {
      pagina: paginacao.pagina,
      limite: paginacao.limite,
      total: itens.length,
    },
  };
}
