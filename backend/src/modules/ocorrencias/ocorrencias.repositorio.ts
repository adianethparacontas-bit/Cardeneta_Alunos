import { randomUUID } from 'node:crypto';
import { comColecao, lerColecao } from '../../storage/armazenamento-json.js';
import type { Ocorrencia } from './tipos.js';

const COLECAO = 'ocorrencias';
const VAZIO: Ocorrencia[] = [];

/** A ocorrencia por gravar: sem id nem data de criacao, que o servidor mete. */
export type NovaOcorrencia = Omit<Ocorrencia, 'id' | 'criadoEm'>;

/** Mais recentes primeiro; a data da ocorrencia manda, a criacao desempata. */
function porOrdemDecrescente(a: Ocorrencia, b: Ocorrencia): number {
  if (a.dataOcorrencia !== b.dataOcorrencia) {
    return a.dataOcorrencia < b.dataOcorrencia ? 1 : -1;
  }

  return a.criadoEm < b.criadoEm ? 1 : -1;
}

export async function listarOcorrencias(): Promise<Ocorrencia[]> {
  const ocorrencias = await lerColecao<Ocorrencia[]>(COLECAO, VAZIO);

  return [...ocorrencias].sort(porOrdemDecrescente);
}

export async function ocorrenciasDoAluno(alunoId: string): Promise<Ocorrencia[]> {
  const ocorrencias = await listarOcorrencias();

  return ocorrencias.filter((ocorrencia) => ocorrencia.alunoId === alunoId);
}

export async function inserirOcorrencia(dados: NovaOcorrencia): Promise<Ocorrencia> {
  return comColecao<Ocorrencia[], Ocorrencia>(COLECAO, VAZIO, (atual) => {
    const ocorrencia: Ocorrencia = {
      id: randomUUID(),
      ...dados,
      criadoEm: new Date().toISOString(),
    };

    return { dados: [...atual, ocorrencia], resultado: ocorrencia };
  });
}
