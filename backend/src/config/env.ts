import 'dotenv/config';
import { z } from 'zod';

/**
 * Segredo usado quando nao ha SESSION_SECRET definido. Serve so para
 * desenvolvimento e testes; em producao o arranque falha se estiver em uso.
 */
const SEGREDO_DE_DESENVOLVIMENTO = 'segredo-de-desenvolvimento-nao-usar-em-producao';

const esquemaAmbiente = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().max(65535).default(3000),
    DATA_DIR: z.string().min(1).default('./data'),
    SESSION_SECRET: z
      .string()
      .min(16, 'O SESSION_SECRET tem de ter pelo menos 16 caracteres.')
      .default(SEGREDO_DE_DESENVOLVIMENTO),
    SESSION_DURACAO_HORAS: z.coerce.number().int().positive().max(720).default(12),
    LOGIN_JANELA_MINUTOS: z.coerce.number().int().positive().default(15),
    LOGIN_MAX_TENTATIVAS: z.coerce.number().int().positive().default(5),
  })
  .superRefine((valores, contexto) => {
    if (valores.NODE_ENV === 'production' && valores.SESSION_SECRET === SEGREDO_DE_DESENVOLVIMENTO) {
      contexto.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SESSION_SECRET'],
        message: 'O SESSION_SECRET tem de ser definido com um valor proprio em producao.',
      });
    }
  });

const resultado = esquemaAmbiente.safeParse(process.env);

if (!resultado.success) {
  const problemas = resultado.error.issues
    .map((problema) => `${problema.path.join('.')}: ${problema.message}`)
    .join('; ');

  throw new Error(`Configuracao de ambiente invalida -> ${problemas}`);
}

export const env = resultado.data;

export type Ambiente = typeof env;
