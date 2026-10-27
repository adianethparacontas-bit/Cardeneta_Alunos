import type { RequestHandler } from 'express';
import { z } from 'zod';
import { erroCredenciaisInvalidas } from '../../errors/app-error.js';
import { utilizadorAtual } from '../../middlewares/autenticacao.js';
import { validar } from '../../validacao/validar.js';
import { criarTokenSessao } from './jwt.js';
import { verificarSenha } from './senhas.js';
import { NOME_COOKIE_SESSAO, opcoesDoCookieSessao, opcoesParaLimparCookieSessao } from './sessao.js';
import { paraUtilizadorPublico } from './tipos.js';
import { procurarUtilizadorPorEmail } from './utilizadores.repositorio.js';

const esquemaLogin = z.object({
  email: z.string({ required_error: 'O email e obrigatorio.' }).trim().min(1, 'O email e obrigatorio.').email('Email invalido.'),
  palavraPasse: z
    .string({ required_error: 'A palavra-passe e obrigatoria.' })
    .min(1, 'A palavra-passe e obrigatoria.'),
});

export const iniciarSessao: RequestHandler = async (req, res, next) => {
  try {
    const { email, palavraPasse } = validar(esquemaLogin, req.body);

    const utilizador = await procurarUtilizadorPorEmail(email);
    const senhaValida = utilizador ? await verificarSenha(palavraPasse, utilizador.senhaHash) : false;

    if (!utilizador || !senhaValida) {
      throw erroCredenciaisInvalidas();
    }

    const publico = paraUtilizadorPublico(utilizador);

    res.cookie(NOME_COOKIE_SESSAO, criarTokenSessao(publico), opcoesDoCookieSessao());
    res.json({ data: publico });
  } catch (erro) {
    next(erro);
  }
};

export const terminarSessao: RequestHandler = (_req, res) => {
  res.clearCookie(NOME_COOKIE_SESSAO, opcoesParaLimparCookieSessao());
  res.status(204).send();
};

export const obterSessao: RequestHandler = (req, res) => {
  res.json({ data: utilizadorAtual(req) });
};
