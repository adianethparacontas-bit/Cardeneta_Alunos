import type { RequestHandler } from 'express';
import { CodigosErro } from './codigos.js';

export const tratadorDeRotaDesconhecida: RequestHandler = (req, res) => {
  res.status(404).json({
    erro: {
      codigo: CodigosErro.NAO_ENCONTRADO,
      mensagem: `Rota nao encontrada: ${req.method} ${req.originalUrl}`,
    },
  });
};
