import { beforeEach, describe, expect, it } from "vitest";
import { reiniciarMocks } from "../mocks/api";
import { ErroApiCliente } from "./api-client";
import { autenticar, obterSessao } from "./auth";
import { listarAlunos } from "./alunos";

describe("servicos com API de demonstração", () => {
  beforeEach(() => reiniciarMocks());

  it("autentica com uma conta fictícia e devolve o utilizador do contrato", async () => {
    const { data } = await autenticar("coord1@cardeneta.test", "demo123");
    expect(data.papel).toBe("COORDENADOR");
    expect((await obterSessao()).data.id).toBe(data.id);
  });

  it("devolve erros estruturados para credenciais inválidas", async () => {
    await expect(autenticar("coord1@cardeneta.test", "incorreta")).rejects.toMatchObject({
      status: 401,
      codigo: "CREDENCIAIS_INVALIDAS",
    } satisfies Partial<ErroApiCliente>);
  });

  it("impede os filtros de ocorrências no perfil de professor", async () => {
    await autenticar("prof1@cardeneta.test", "demo123");
    await expect(listarAlunos({ tipoOcorrencia: "ATRASO" })).rejects.toMatchObject({
      status: 403,
      codigo: "SEM_PERMISSAO",
    });
  });
});
