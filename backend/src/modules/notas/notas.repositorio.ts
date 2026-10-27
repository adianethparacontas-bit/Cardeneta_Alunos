import { randomUUID } from 'node:crypto';
import { comColecao, lerColecao } from '../../storage/armazenamento-json.js';
import type {
  ComponentesNota,
  NotaArmazenada,
  RegistoNotaHistorico,
  Trimestre,
} from './tipos.js';

const COLECAO = 'notas';
const COLECAO_HISTORICO = 'notas-historico';
const VAZIO: NotaArmazenada[] = [];
const VAZIO_HISTORICO: RegistoNotaHistorico[] = [];

const COMPONENTES: (keyof ComponentesNota)[] = ['mac', 'npp', 'npt'];

export interface ParametrosGravarNota {
  alunoId: string;
  disciplinaId: string;
  anoLetivo: string;
  trimestre: Trimestre;
  /** So as componentes que vieram no pedido. */
  valores: Partial<ComponentesNota>;
  motivo: string | null;
  alteradoPor: { id: string; nome: string };
}

export type ResultadoGravarNota =
  | { estado: 'ok'; nota: NotaArmazenada }
  | { estado: 'motivo-obrigatorio' };

type ResultadoInterno =
  | { estado: 'motivo-obrigatorio' }
  | { estado: 'ok'; nota: NotaArmazenada; historico: RegistoNotaHistorico | null };

function mesmaNota(a: NotaArmazenada, b: Omit<NotaArmazenada, 'id' | 'atualizadoEm'>): boolean {
  return (
    a.alunoId === b.alunoId &&
    a.disciplinaId === b.disciplinaId &&
    a.anoLetivo === b.anoLetivo &&
    a.trimestre === b.trimestre
  );
}

export async function listarNotas(): Promise<NotaArmazenada[]> {
  return lerColecao<NotaArmazenada[]>(COLECAO, VAZIO);
}

/** Notas de um aluno num ano letivo, opcionalmente de um trimestre. */
export async function notasDoAluno(
  alunoId: string,
  anoLetivo: string,
  trimestre?: Trimestre,
): Promise<NotaArmazenada[]> {
  const notas = await listarNotas();

  return notas.filter(
    (nota) =>
      nota.alunoId === alunoId &&
      nota.anoLetivo === anoLetivo &&
      (trimestre === undefined || nota.trimestre === trimestre),
  );
}

export async function historicoDaNota(
  alunoId: string,
  disciplinaId: string,
  trimestre: Trimestre,
): Promise<RegistoNotaHistorico[]> {
  const historico = await lerColecao<RegistoNotaHistorico[]>(COLECAO_HISTORICO, VAZIO_HISTORICO);

  return historico
    .filter(
      (registo) =>
        registo.alunoId === alunoId &&
        registo.disciplinaId === disciplinaId &&
        registo.trimestre === trimestre,
    )
    .sort((a, b) => (a.alteradoEm < b.alteradoEm ? 1 : -1));
}

/**
 * Grava (cria ou corrige) uma nota de um aluno numa disciplina e trimestre.
 *
 * Regra de negocio: se estivermos a mudar uma componente que ja tinha valor,
 * exige-se um motivo (o contrato quer 422 MOTIVO_OBRIGATORIO). Nesse caso
 * guarda-se tambem uma entrada de historico, com o que estava e o que ficou.
 */
export async function gravarNota(
  parametros: ParametrosGravarNota,
): Promise<ResultadoGravarNota> {
  const interno = await comColecao<NotaArmazenada[], ResultadoInterno>(
    COLECAO,
    VAZIO,
    (atual) => {
      const indice = atual.findIndex((nota) =>
        mesmaNota(nota, {
          alunoId: parametros.alunoId,
          disciplinaId: parametros.disciplinaId,
          anoLetivo: parametros.anoLetivo,
          trimestre: parametros.trimestre,
          mac: null,
          npp: null,
          npt: null,
        }),
      );

      const existente = indice === -1 ? null : (atual[indice] as NotaArmazenada);
      const anterior: ComponentesNota = existente
        ? { mac: existente.mac, npp: existente.npp, npt: existente.npt }
        : { mac: null, npp: null, npt: null };

      const novo: ComponentesNota = { ...anterior };
      let corrigiu = false;

      for (const componente of COMPONENTES) {
        const valorNovo = parametros.valores[componente];

        if (valorNovo === undefined) {
          continue;
        }

        if (valorNovo === anterior[componente]) {
          continue;
        }

        if (anterior[componente] !== null) {
          corrigiu = true;
        }

        novo[componente] = valorNovo;
      }

      if (corrigiu && !parametros.motivo) {
        return { dados: atual, resultado: { estado: 'motivo-obrigatorio' } };
      }

      const atualizadoEm = new Date().toISOString();
      const nota: NotaArmazenada = existente
        ? { ...existente, ...novo, atualizadoEm }
        : {
            id: randomUUID(),
            alunoId: parametros.alunoId,
            disciplinaId: parametros.disciplinaId,
            anoLetivo: parametros.anoLetivo,
            trimestre: parametros.trimestre,
            ...novo,
            atualizadoEm,
          };

      const proximo = existente ? substituir(atual, indice, nota) : [...atual, nota];

      const historico: RegistoNotaHistorico | null = corrigiu
        ? {
            id: randomUUID(),
            alunoId: parametros.alunoId,
            disciplinaId: parametros.disciplinaId,
            trimestre: parametros.trimestre,
            valorAnterior: anterior,
            valorNovo: novo,
            motivo: parametros.motivo,
            alteradoPor: parametros.alteradoPor,
            alteradoEm: atualizadoEm,
          }
        : null;

      return { dados: proximo, resultado: { estado: 'ok', nota, historico } };
    },
  );

  if (interno.estado === 'motivo-obrigatorio') {
    return { estado: 'motivo-obrigatorio' };
  }

  if (interno.historico) {
    const registo = interno.historico;

    await comColecao<RegistoNotaHistorico[], void>(
      COLECAO_HISTORICO,
      VAZIO_HISTORICO,
      (atual) => ({ dados: [...atual, registo], resultado: undefined }),
    );
  }

  return { estado: 'ok', nota: interno.nota };
}

function substituir(notas: NotaArmazenada[], indice: number, nota: NotaArmazenada): NotaArmazenada[] {
  const proximo = [...notas];
  proximo[indice] = nota;

  return proximo;
}
