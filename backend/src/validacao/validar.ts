import { z, type ZodTypeAny } from 'zod';
import { erroValidacao, type CamposDeErro } from '../errors/app-error.js';

/**
 * Valida dados com um esquema Zod e, se falhar, lanca um erro no formato do
 * contrato: 400 VALIDACAO_INVALIDA com `campos` = { nomeDoCampo: mensagem }.
 */
export function validar<Esquema extends ZodTypeAny>(
  esquema: Esquema,
  dados: unknown,
): z.infer<Esquema> {
  const resultado = esquema.safeParse(dados);

  if (resultado.success) {
    return resultado.data;
  }

  const campos: CamposDeErro = {};

  for (const problema of resultado.error.issues) {
    const campo = problema.path.join('.') || 'corpo';
    campos[campo] = problema.message;
  }

  throw erroValidacao(campos);
}
