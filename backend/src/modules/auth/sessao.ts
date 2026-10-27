import type { CookieOptions } from 'express';
import { env } from '../../config/env.js';

export const NOME_COOKIE_SESSAO = 'cardeneta_sessao';

/**
 * O cookie e HttpOnly (o JavaScript do browser nao lhe toca), SameSite=Lax e
 * so vai por HTTPS em producao.
 */
function opcoesBase(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  };
}

export function opcoesDoCookieSessao(): CookieOptions {
  return {
    ...opcoesBase(),
    maxAge: env.SESSION_DURACAO_HORAS * 3600 * 1000,
  };
}

/** Ao terminar a sessao limpamos o cookie com as mesmas opcoes base. */
export function opcoesParaLimparCookieSessao(): CookieOptions {
  return opcoesBase();
}
