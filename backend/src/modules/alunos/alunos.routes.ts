import { Router } from 'express';
import { exigirAutenticacao, exigirPapel } from '../../middlewares/autenticacao.js';
import { Papeis } from '../auth/tipos.js';
import { atualizar, atualizarEstado, criarAluno, listar, obter } from './alunos.controller.js';

/**
 * Rotas de alunos. Ver e consultar e para coordenadores e professores; criar,
 * editar e mudar o estado e so para coordenadores.
 */
export function criarRotasAlunos(): Router {
  const rotas = Router();

  rotas.use(exigirAutenticacao);

  rotas.get('/', exigirPapel(Papeis.COORDENADOR, Papeis.PROFESSOR), listar);
  rotas.post('/', exigirPapel(Papeis.COORDENADOR), criarAluno);

  rotas.get('/:id', exigirPapel(Papeis.COORDENADOR, Papeis.PROFESSOR), obter);
  rotas.patch('/:id', exigirPapel(Papeis.COORDENADOR), atualizar);
  rotas.patch('/:id/estado', exigirPapel(Papeis.COORDENADOR), atualizarEstado);

  return rotas;
}
