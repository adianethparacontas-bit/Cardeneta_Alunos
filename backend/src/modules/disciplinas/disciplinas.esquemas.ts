import { z } from 'zod';

export const esquemaCriarDisciplina = z.object({
  nome: z
    .string({ required_error: 'O nome e obrigatorio.' })
    .trim()
    .min(1, 'O nome e obrigatorio.'),
  codigo: z
    .string({ required_error: 'O codigo e obrigatorio.' })
    .trim()
    .min(1, 'O codigo e obrigatorio.'),
});
