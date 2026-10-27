import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import { env } from './config/env.js';
import { tratadorDeErros } from './errors/error-handler.js';
import { tratadorDeRotaDesconhecida } from './errors/not-found-handler.js';
import { criarLimitadorDeTentativas } from './middlewares/limitador.js';
import { criarRotasApi } from './routes/index.js';

export function criarApp(): Express {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  if (env.NODE_ENV === 'production') {
    app.use(criarLimitadorDeTentativas({ janelaMinutos: 15, maximo: 300 }));
  }

  app.use('/api/v1', criarRotasApi());

  app.use(tratadorDeRotaDesconhecida);
  app.use(tratadorDeErros);

  return app;
}
