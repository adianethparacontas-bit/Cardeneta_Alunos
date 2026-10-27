import { randomUUID } from 'node:crypto';
import { comColecao, lerColecao } from '../../storage/armazenamento-json.js';
import { normalizarTexto } from '../../utils/texto.js';
import type { Disciplina } from './tipos.js';

const COLECAO = 'disciplinas';
const VAZIO: Disciplina[] = [];

export interface DadosNovaDisciplina {
  nome: string;
  codigo: string;
}

/** Todas as disciplinas, por ordem alfabetica do nome. */
export async function listarDisciplinas(): Promise<Disciplina[]> {
  const disciplinas = await lerColecao<Disciplina[]>(COLECAO, VAZIO);

  return [...disciplinas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }));
}

export async function procurarDisciplinaPorId(id: string): Promise<Disciplina | null> {
  const disciplinas = await listarDisciplinas();

  return disciplinas.find((disciplina) => disciplina.id === id) ?? null;
}

/**
 * Cria uma disciplina. Devolve null se ja existir outra com o mesmo codigo
 * (comparacao sem acentos nem maiusculas), para o controlador responder 400.
 */
export async function inserirDisciplina(dados: DadosNovaDisciplina): Promise<Disciplina | null> {
  return comColecao<Disciplina[], Disciplina | null>(COLECAO, VAZIO, (atual) => {
    const codigoNormalizado = normalizarTexto(dados.codigo);
    const duplicado = atual.some(
      (disciplina) => normalizarTexto(disciplina.codigo) === codigoNormalizado,
    );

    if (duplicado) {
      return { dados: atual, resultado: null };
    }

    const disciplina: Disciplina = { id: randomUUID(), nome: dados.nome, codigo: dados.codigo };

    return { dados: [...atual, disciplina], resultado: disciplina };
  });
}
