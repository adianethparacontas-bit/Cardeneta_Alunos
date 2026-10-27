import { comColecao, lerColecao } from '../../storage/armazenamento-json.js';
import type { UtilizadorArmazenado } from './tipos.js';

const COLECAO = 'utilizadores';
const VAZIO: UtilizadorArmazenado[] = [];

/** Os emails nao sao sensiveis ao caso nem a espacos a volta. */
export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function listarUtilizadores(): Promise<UtilizadorArmazenado[]> {
  return lerColecao<UtilizadorArmazenado[]>(COLECAO, VAZIO);
}

export async function procurarUtilizadorPorEmail(
  email: string,
): Promise<UtilizadorArmazenado | null> {
  const alvo = normalizarEmail(email);
  const utilizadores = await listarUtilizadores();

  return utilizadores.find((utilizador) => normalizarEmail(utilizador.email) === alvo) ?? null;
}

export async function procurarUtilizadorPorId(id: string): Promise<UtilizadorArmazenado | null> {
  const utilizadores = await listarUtilizadores();

  return utilizadores.find((utilizador) => utilizador.id === id) ?? null;
}

/**
 * Insere um utilizador novo. Devolve false se ja existir alguem com o mesmo
 * email (verificacao feita dentro da fila, para nao haver corridas).
 */
export async function inserirUtilizador(
  utilizador: UtilizadorArmazenado,
): Promise<UtilizadorArmazenado | null> {
  return comColecao<UtilizadorArmazenado[], UtilizadorArmazenado | null>(
    COLECAO,
    VAZIO,
    (atual) => {
      const jaExiste = atual.some(
        (existente) => normalizarEmail(existente.email) === normalizarEmail(utilizador.email),
      );

      if (jaExiste) {
        return { dados: atual, resultado: null };
      }

      return { dados: [...atual, utilizador], resultado: utilizador };
    },
  );
}

/** Substitui um utilizador existente pelo id. Devolve null se nao existir. */
export async function atualizarUtilizador(
  utilizador: UtilizadorArmazenado,
): Promise<UtilizadorArmazenado | null> {
  return comColecao<UtilizadorArmazenado[], UtilizadorArmazenado | null>(
    COLECAO,
    VAZIO,
    (atual) => {
      const indice = atual.findIndex((existente) => existente.id === utilizador.id);

      if (indice === -1) {
        return { dados: atual, resultado: null };
      }

      const proximo = [...atual];
      proximo[indice] = utilizador;

      return { dados: proximo, resultado: utilizador };
    },
  );
}
