import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { ehPapel, type Papel, type UtilizadorPublico } from './tipos.js';

/** O que guardamos dentro do token de sessao. */
export interface DadosSessao {
  utilizadorId: string;
  papel: Papel;
}

/**
 * Cria o token que vai dentro do cookie. Guardamos apenas o id e o papel: o
 * resto (nome, disciplinas) le-se sempre do armazenamento, para nao ficar
 * desatualizado dentro do cookie.
 */
export function criarTokenSessao(utilizador: UtilizadorPublico): string {
  return jwt.sign({ papel: utilizador.papel }, env.SESSION_SECRET, {
    subject: utilizador.id,
    expiresIn: env.SESSION_DURACAO_HORAS * 3600,
  });
}

/** Le e valida o token; devolve null se estiver invalido ou expirado. */
export function lerTokenSessao(token: string): DadosSessao | null {
  try {
    const conteudo = jwt.verify(token, env.SESSION_SECRET);

    if (typeof conteudo === 'string') {
      return null;
    }

    const { sub, papel } = conteudo as { sub?: unknown; papel?: unknown };

    if (typeof sub !== 'string' || sub.length === 0 || !ehPapel(papel)) {
      return null;
    }

    return { utilizadorId: sub, papel };
  } catch {
    return null;
  }
}
