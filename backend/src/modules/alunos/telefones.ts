import { erroValidacao } from '../../errors/app-error.js';

const DIGITOS_NACIONAIS = /^\d{9}$/;
const INDICATIVO_PAIS = '244';

/**
 * Normaliza um numero angolano para o formato `+244XXXXXXXXX`.
 *
 * Aceita, por exemplo, `923456789`, `+244923456789`, `244923456789`,
 * `00244923456789` e variantes com espacos, pontos, parenteses ou hifens.
 * Lanca 400 VALIDACAO_INVALIDA (com o nome do campo) se nao for valido.
 */
export function normalizarTelefone(campo: string, valor: string): string {
  const digitos = extrairDigitos(valor);

  if (!DIGITOS_NACIONAIS.test(digitos)) {
    throw erroValidacao({
      [campo]: 'Numero invalido. Use 9 digitos (ex.: 923456789).',
    });
  }

  return `+${INDICATIVO_PAIS}${digitos}`;
}

function extrairDigitos(valor: string): string {
  let digitos = valor.replace(/[\s().\u2013\u2014-]/g, '');

  if (digitos.startsWith('+')) {
    digitos = digitos.slice(1);
  } else if (digitos.startsWith('00')) {
    digitos = digitos.slice(2);
  }

  // So tiramos o indicativo do pais quando o numero tem mesmo o tamanho certo,
  // para nao estragar um numero nacional que comece por 244.
  if (digitos.length === 12 && digitos.startsWith(INDICATIVO_PAIS)) {
    digitos = digitos.slice(INDICATIVO_PAIS.length);
  }

  return digitos;
}
