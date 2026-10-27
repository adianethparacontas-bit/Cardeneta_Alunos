import type { UtilizadorPublico } from '../modules/auth/tipos.js';

/**
 * Acrescenta o utilizador autenticado ao pedido. E preenchido pelo middleware
 * `exigirAutenticacao`; nos controladores le-se com `utilizadorAtual`.
 */
declare global {
  namespace Express {
    interface Request {
      utilizador?: UtilizadorPublico;
    }
  }
}

export {};
