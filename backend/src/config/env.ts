import 'dotenv/config';
import { z } from 'zod';

const esquemaAmbiente = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  DATA_DIR: z.string().min(1).default('./data'),
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
