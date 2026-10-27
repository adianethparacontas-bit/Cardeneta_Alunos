import type { ErrorRequestHandler } from 'express';
import { AppError } from './app-error.js';
import { CodigosErro } from './codigos.js';

export const tratadorDeErros: ErrorRequestHandler = (erro, _req, res, _next) => {
  if (erro instanceof AppError) {
    res.status(erro.status).json({
      erro: {
        codigo: erro.codigo,
        mensagem: erro.message,
        ...(erro.campos ? { campos: erro.campos } : {}),
      },
    });
    return;
  }

  console.error('[erro interno]', erro);

  res.status(500).json({
    erro: {
      codigo: CodigosErro.ERRO_INTERNO,
      mensagem: 'Erro interno do servidor.',
    },
  });
};
