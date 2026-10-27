import { Router } from 'express';
import { criarRotasAlunos } from '../modules/alunos/alunos.routes.js';
import { criarRotasAuth } from '../modules/auth/auth.routes.js';
import { rotasSaude } from '../modules/saude/saude.routes.js';

/**
 * Monta todas as rotas de /api/v1. E uma funcao (e nao um router global) para
 * cada aplicacao ter os seus proprios limitadores, o que mantem os testes
 * isolados entre si.
 */
export function criarRotasApi(): Router {
  const rotas = Router();

  rotas.use('/saude', rotasSaude);
  rotas.use('/auth', criarRotasAuth());
  rotas.use('/alunos', criarRotasAlunos());

  return rotas;
}
