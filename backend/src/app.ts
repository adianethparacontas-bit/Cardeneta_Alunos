import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { tratadorDeErros } from './errors/error-handler.js';
import { tratadorDeRotaDesconhecida } from './errors/not-found-handler.js';
import { rotasApi } from './routes/index.js';

export function criarApp(): Express {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  if (env.NODE_ENV === 'production') {
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 300,
        standardHeaders: true,
        legacyHeaders: false,
      }),
    );
  }

  app.use('/api/v1', rotasApi);

  app.use(tratadorDeRotaDesconhecida);
  app.use(tratadorDeErros);

  return app;
}
