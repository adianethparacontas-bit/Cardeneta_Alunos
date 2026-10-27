import { Router } from 'express';
import { env } from '../../config/env.js';
import { exigirAutenticacao } from '../../middlewares/autenticacao.js';
import { criarLimitadorDeTentativas } from '../../middlewares/limitador.js';
import { iniciarSessao, obterSessao, terminarSessao } from './auth.controller.js';

export function criarRotasAuth(): Router {
  const rotas = Router();

  const limitadorDeLogin = criarLimitadorDeTentativas({
    janelaMinutos: env.LOGIN_JANELA_MINUTOS,
    maximo: env.LOGIN_MAX_TENTATIVAS,
    ignorarSucesso: true,
  });

  // Publico, mas com limite de tentativas falhadas.
  rotas.post('/login', limitadorDeLogin, iniciarSessao);

  rotas.post('/logout', exigirAutenticacao, terminarSessao);
  rotas.get('/me', exigirAutenticacao, obterSessao);

  return rotas;
}
