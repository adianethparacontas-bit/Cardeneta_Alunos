import { z } from 'zod';
import { ehDataIsoValida } from '../utils/datas.js';

/** Data no formato AAAA-MM-DD, validada a serio (nao aceita 2026-02-31). */
export const esquemaDataIso = z
  .string({ required_error: 'A data e obrigatoria.' })
  .refine((valor) => ehDataIsoValida(valor), 'Data invalida (use AAAA-MM-DD).');
