import { Router } from 'express';
import { exigirAutenticacao, exigirPapel } from '../../middlewares/autenticacao.js';
import { Papeis } from '../auth/tipos.js';
import { listar } from './ocorrencias.controller.js';

/**
 * Lista geral de ocorrencias (com filtros). O contrato da esta rota so ao
 * coordenador, porque as ocorrencias nao sao visiveis aos professores.
 */
export function criarRotasOcorrencias(): Router {
  const rotas = Router();

  rotas.use(exigirAutenticacao);
  rotas.get('/', exigirPapel(Papeis.COORDENADOR), listar);

  return rotas;
}
