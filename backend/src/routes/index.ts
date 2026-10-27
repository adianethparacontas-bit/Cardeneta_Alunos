import { Router } from 'express';
import { rotasSaude } from '../modules/saude/saude.routes.js';

export const rotasApi = Router();

rotasApi.use('/saude', rotasSaude);
