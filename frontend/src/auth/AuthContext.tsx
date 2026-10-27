import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { ErroApiCliente } from "../services/api-client";
import { autenticar, obterSessao, terminarSessao } from "../services/auth";
import type { Utilizador } from "../types/api";

interface EstadoAutenticacao {
  utilizador: Utilizador | null;
  carregando: boolean;
  erroSessao: string | null;
  entrar: (email: string, palavraPasse: string) => Promise<void>;
  sair: () => Promise<void>;
}

const ContextoAutenticacao = createContext<EstadoAutenticacao | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [utilizador, setUtilizador] = useState<Utilizador | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroSessao, setErroSessao] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    const invalidarSessao = () => setUtilizador(null);
    window.addEventListener("api:nao-autenticado", invalidarSessao);
    obterSessao()
      .then(({ data }) => {
        if (ativo) setUtilizador(data);
      })
      .catch((error: unknown) => {
        if (error instanceof ErroApiCliente && error.status === 401) return;
        if (ativo) setErroSessao(error instanceof Error ? error.message : "Não foi possível carregar a sessão.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
      window.removeEventListener("api:nao-autenticado", invalidarSessao);
    };
  }, []);

  const entrar = useCallback(async (email: string, palavraPasse: string) => {
    const { data } = await autenticar(email, palavraPasse);
    setUtilizador(data);
    setErroSessao(null);
  }, []);

  const sair = useCallback(async () => {
    await terminarSessao();
    setUtilizador(null);
  }, []);

  const value = useMemo(
    () => ({ utilizador, carregando, erroSessao, entrar, sair }),
    [utilizador, carregando, erroSessao, entrar, sair],
  );
  return <ContextoAutenticacao.Provider value={value}>{children}</ContextoAutenticacao.Provider>;
}

export function useAuth() {
  const context = useContext(ContextoAutenticacao);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
