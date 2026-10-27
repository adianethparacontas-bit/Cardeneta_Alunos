import { z } from 'zod';
import { NOTA_MAXIMA, NOTA_MINIMA } from './calculos.js';
import type { Trimestre } from './tipos.js';

export const esquemaTrimestre = z.coerce
  .number({ invalid_type_error: 'O trimestre tem de ser 1, 2 ou 3.' })
  .int('O trimestre tem de ser 1, 2 ou 3.')
  .min(1, 'O trimestre tem de ser 1, 2 ou 3.')
  .max(3, 'O trimestre tem de ser 1, 2 ou 3.')
  .transform((valor) => valor as Trimestre);

const esquemaComponente = z
  .number({ invalid_type_error: 'A nota tem de ser um numero.' })
  .int('A nota tem de ser um numero inteiro.')
  .min(NOTA_MINIMA, `A nota vai de ${NOTA_MINIMA} a ${NOTA_MAXIMA}.`)
  .max(NOTA_MAXIMA, `A nota vai de ${NOTA_MINIMA} a ${NOTA_MAXIMA}.`);

export const esquemaGravarNota = z
  .object({
    mac: esquemaComponente.optional(),
    npp: esquemaComponente.optional(),
    npt: esquemaComponente.optional(),
    motivo: z.string().trim().min(1, 'O motivo nao pode ficar vazio.').nullish(),
  })
  .refine((dados) => dados.mac !== undefined || dados.npp !== undefined || dados.npt !== undefined, {
    message: 'Indique pelo menos uma componente da nota.',
    path: ['mac'],
  });

export const esquemaFiltrosNotas = z.object({
  trimestre: esquemaTrimestre.optional(),
});

export const esquemaLancamento = z.object({
  classe: z.coerce
    .number({ required_error: 'A classe e obrigatoria.' })
    .int('A classe tem de ser um numero inteiro.')
    .min(1, 'A classe vai de 1 a 13.')
    .max(13, 'A classe vai de 1 a 13.'),
  turma: z
    .string({ required_error: 'A turma e obrigatoria.' })
    .trim()
    .min(1, 'A turma e obrigatoria.'),
  disciplinaId: z
    .string({ required_error: 'A disciplina e obrigatoria.' })
    .trim()
    .min(1, 'A disciplina e obrigatoria.'),
  trimestre: esquemaTrimestre,
});
