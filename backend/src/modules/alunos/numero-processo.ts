import { anoDeInicio } from '../../utils/datas.js';
import type { Aluno } from './tipos.js';

/**
 * Gera o numero de processo do aluno no formato `AAAA-0001`, onde o ano vem do
 * ano letivo (ex.: "2026/2027" -> "2026") e o sequencial continua a partir do
 * maior que ja exista para esse ano. O numero e atribuido uma unica vez e nunca
 * mais muda.
 */
export function gerarNumeroProcesso(anoLetivo: string, existentes: Aluno[]): string {
  const prefixo = `${anoDeInicio(anoLetivo)}-`;

  const maiorSequencia = existentes
    .filter((aluno) => aluno.numeroProcesso.startsWith(prefixo))
    .map((aluno) => Number.parseInt(aluno.numeroProcesso.slice(prefixo.length), 10))
    .filter((numero) => Number.isInteger(numero) && numero > 0)
    .reduce((maior, numero) => Math.max(maior, numero), 0);

  return `${prefixo}${String(maiorSequencia + 1).padStart(4, '0')}`;
}
