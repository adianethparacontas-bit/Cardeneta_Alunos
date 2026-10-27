import { Router } from 'express';
import { obterSaude } from './saude.controller.js';

export const rotasSaude = Router();

rotasSaude.get('/', obterSaude);
