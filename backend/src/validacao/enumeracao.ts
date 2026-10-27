/**
 * Cria um z.enum a partir de um mapa de constantes, para nao repetirmos a lista
 * de valores em dois sitios (tipo e validacao).
 */
import { z } from 'zod';

export function enumeracao<T extends string>(
  valores: Record<string, T>,
  mensagem = 'Opcao invalida.',
): z.ZodEnum<[T, ...T[]]> {
  const lista = Object.values(valores) as [T, ...T[]];

  return z.enum(lista, { errorMap: () => ({ message: mensagem }) });
}
