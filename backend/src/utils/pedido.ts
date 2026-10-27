import type { Request } from 'express';

/** Le um parametro do caminho como texto. Se faltar, devolve texto vazio. */
export function parametroDoCaminho(req: Request, nome: string): string {
  const valor = req.params[nome];

  return typeof valor === 'string' ? valor : '';
}
