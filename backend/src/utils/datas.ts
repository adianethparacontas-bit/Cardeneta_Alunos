const FORMATO_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Data de hoje no formato AAAA-MM-DD, no fuso local de quem corre o servidor. */
export function hojeIso(referencia: Date = new Date()): string {
  const ano = referencia.getFullYear();
  const mes = String(referencia.getMonth() + 1).padStart(2, '0');
  const dia = String(referencia.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

/** Verifica que a string e uma data real no formato AAAA-MM-DD. */
export function ehDataIsoValida(valor: string): boolean {
  const partes = FORMATO_DATA.exec(valor);

  if (!partes) {
    return false;
  }

  const [, ano, mes, dia] = partes;

  if (!ano || !mes || !dia) {
    return false;
  }

  const data = new Date(`${ano}-${mes}-${dia}T00:00:00Z`);

  return (
    data.getUTCFullYear() === Number(ano) &&
    data.getUTCMonth() + 1 === Number(mes) &&
    data.getUTCDate() === Number(dia)
  );
}

/** Ano de inicio de um ano letivo: "2026/2027" -> 2026. */
export function anoDeInicio(anoLetivo: string): string {
  return anoLetivo.slice(0, 4);
}
