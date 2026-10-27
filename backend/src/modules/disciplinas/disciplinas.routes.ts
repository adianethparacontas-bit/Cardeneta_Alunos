import { Router } from 'express';
import { exigirAutenticacao, exigirPapel } from '../../middlewares/autenticacao.js';
import { Papeis } from '../auth/tipos.js';
import { criar, listar } from './disciplinas.controller.js';

/** Disciplinas: a lista e para os dois papeis, criar e so do coordenador. */
export function criarRotasDisciplinas(): Router {
  const rotas = Router();

  rotas.use(exigirAutenticacao);

  rotas.get('/', exigirPapel(Papeis.COORDENADOR, Papeis.PROFESSOR), listar);
  rotas.post('/', exigirPapel(Papeis.COORDENADOR), criar);

  return rotas;
}
