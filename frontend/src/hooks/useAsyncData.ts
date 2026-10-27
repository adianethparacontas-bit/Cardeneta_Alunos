import { useCallback, useEffect, useState } from "react";

export function useAsyncData<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro("");
    load()
      .then((result) => {
        if (ativo) setData(result);
      })
      .catch((error: unknown) => {
        if (ativo) setErro(error instanceof Error ? error.message : "Não foi possível carregar os dados.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [load, versao]);

  const recarregar = useCallback(() => setVersao((value) => value + 1), []);
  return { data, erro, carregando, recarregar };
}
