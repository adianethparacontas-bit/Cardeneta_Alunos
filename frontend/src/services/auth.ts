import type { Resposta, Utilizador } from "../types/api";
import { pedidoApi } from "./api-client";

export const autenticar = (email: string, palavraPasse: string) =>
  pedidoApi<Resposta<Utilizador>>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, palavraPasse }),
  });

export const obterSessao = () => pedidoApi<Resposta<Utilizador>>("/auth/me");

export const terminarSessao = () => pedidoApi<void>("/auth/logout", { method: "POST" });
