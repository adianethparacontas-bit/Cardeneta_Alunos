import { Router } from 'express';
import { exigirAutenticacao, exigirPapel } from '../../middlewares/autenticacao.js';
import { Papeis } from '../auth/tipos.js';
import { atualizarDisciplinas, criar, listar } from './professores.controller.js';

/** Professores: tudo so para o coordenador (o professor nao gere colegas). */
export function criarRotasProfessores(): Router {
  const rotas = Router();

  rotas.use(exigirAutenticacao);
  rotas.use(exigirPapel(Papeis.COORDENADOR));

  rotas.get('/', listar);
  rotas.post('/', criar);
  rotas.put('/:id/disciplinas', atualizarDisciplinas);

  return rotas;
}
