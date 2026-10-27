/** Compara texto sem acentos e sem depender de maiusculas/minusculas. */
export function normalizarTexto(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Compara nomes ignorando espacos repetidos, acentos e maiusculas. */
export function normalizarNome(valor: string): string {
  return normalizarTexto(valor).replace(/\s+/g, ' ');
}

/** Ordena nomes segundo as regras do portugues. */
export function compararNomes(a: string, b: string): number {
  return a.localeCompare(b, 'pt', { sensitivity: 'base' });
}
