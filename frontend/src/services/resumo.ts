import type { Resposta, Resumo } from "../types/api";
import { pedidoApi } from "./api-client";

export const obterResumo = () => pedidoApi<Resposta<Resumo>>("/resumo");
