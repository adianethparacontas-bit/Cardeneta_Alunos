import type { Request, RequestHandler } from 'express';
import { erroNaoAutenticado, erroSemPermissao } from '../errors/app-error.js';
import { lerTokenSessao } from '../modules/auth/jwt.js';
import { NOME_COOKIE_SESSAO } from '../modules/auth/sessao.js';
import { paraUtilizadorPublico, type Papel, type UtilizadorPublico } from '../modules/auth/tipos.js';
import { procurarUtilizadorPorId } from '../modules/auth/utilizadores.repositorio.js';

/**
 * Exige uma sessao valida. Le o cookie, valida o token e volta a carregar o
 * utilizador do armazenamento (para o nome e as disciplinas estarem sempre
 * atualizados). Falha com 401 NAO_AUTENTICADO.
 */
export const exigirAutenticacao: RequestHandler = async (req, _res, next) => {
  try {
    const token: unknown = req.cookies?.[NOME_COOKIE_SESSAO];

    if (typeof token !== 'string' || token.length === 0) {
      throw erroNaoAutenticado('Sessao em falta.');
    }

    const dados = lerTokenSessao(token);

    if (!dados) {
      throw erroNaoAutenticado('Sessao invalida ou expirada.');
    }

    const utilizador = await procurarUtilizadorPorId(dados.utilizadorId);

    if (!utilizador) {
      throw erroNaoAutenticado('Sessao invalida ou expirada.');
    }

    req.utilizador = paraUtilizadorPublico(utilizador);
    next();
  } catch (erro) {
    next(erro);
  }
};

/** Exige um dos papeis indicados. Falha com 403 SEM_PERMISSAO. */
export function exigirPapel(...papeis: Papel[]): RequestHandler {
  return (req, _res, next) => {
    const utilizador = req.utilizador;

    if (!utilizador) {
      next(erroNaoAutenticado('Sessao em falta.'));
      return;
    }

    if (!papeis.includes(utilizador.papel)) {
      next(erroSemPermissao());
      return;
    }

    next();
  };
}

/**
 * Devolve o utilizador autenticado. E seguro chamar isto depois de
 * `exigirAutenticacao`; se por alguma razao faltar, devolve 401.
 */
export function utilizadorAtual(req: Request): UtilizadorPublico {
  if (!req.utilizador) {
    throw erroNaoAutenticado('Sessao em falta.');
  }

  return req.utilizador;
}
