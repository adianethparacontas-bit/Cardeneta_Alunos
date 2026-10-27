import type { RequestHandler } from 'express';

export const obterSaude: RequestHandler = (_req, res) => {
  res.json({
    data: {
      status: 'ok',
    },
  });
};
