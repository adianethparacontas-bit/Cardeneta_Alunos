import { ErroMock, pedidoMock } from "../mocks/api";
import type { ErroApi } from "../types/api";

const raizApi = "/api/v1";
const usaMocks = import.meta.env.VITE_USAR_MOCKS !== "false";

export class ErroApiCliente extends Error {
  constructor(
    public readonly status: number,
    public readonly codigo: string,
    message: string,
    public readonly campos?: Record<string, string>,
  ) {
    super(message);
    this.name = "ErroApiCliente";
  }
}

function emitirNaoAutenticado() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("api:nao-autenticado"));
  }
}

export async function pedidoApi<T>(rota: string, init: RequestInit = {}): Promise<T> {
  const url = `${raizApi}${rota}`;
  if (usaMocks) {
    try {
      return await pedidoMock<T>(url, init);
    } catch (error) {
      if (error instanceof ErroMock) {
        if (error.status === 401) emitirNaoAutenticado();
        throw new ErroApiCliente(error.status, error.codigo, error.message, error.campos);
      }
      throw error;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch (error) {
    throw new ErroApiCliente(
      0,
      "ERRO_REDE",
      error instanceof Error ? error.message : "Não foi possível contactar a API.",
    );
  }

  if (response.status === 204) return undefined as T;
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const body = payload as ErroApi | null;
    const erro = body?.erro;
    if (response.status === 401) emitirNaoAutenticado();
    throw new ErroApiCliente(
      response.status,
      erro?.codigo ?? "ERRO_INTERNO",
      erro?.mensagem ?? "O pedido não foi concluído.",
      erro?.campos,
    );
  }
  return payload as T;
}

export function queryString<T extends object>(params: T) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params) as [string, unknown][]) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      if (value !== "") search.set(key, String(value));
    }
  }
  const result = search.toString();
  return result ? `?${result}` : "";
}

export { usaMocks };
