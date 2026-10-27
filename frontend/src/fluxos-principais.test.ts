import { beforeEach, describe, expect, it } from "vitest";
import { reiniciarMocks } from "./mocks/api";
import { autenticar } from "./services/auth";
import { listarAlunos } from "./services/alunos";
import { criarOcorrencia } from "./services/ocorrencias";
import { guardarNota } from "./services/notas";

describe("fluxos principais contra os mocks da API", () => {
  beforeEach(() => reiniciarMocks());

  it("autentica e pesquisa alunos com filtros e paginação", async () => {
    const sessao = await autenticar("coord1@cardeneta.test", "demo123");
    const resultado = await listarAlunos({ q: "Ana", classe: 7, pagina: 1, limite: 10 });

    expect(sessao.data.papel).toBe("COORDENADOR");
    expect(resultado.data.map((aluno) => aluno.nome)).toEqual(["Ana Kiala"]);
    expect(resultado.meta).toMatchObject({ pagina: 1, limite: 10, total: 1 });
  });

  it("valida gravidade e regista uma ocorrência", async () => {
    await autenticar("coord1@cardeneta.test", "demo123");
    const dados = {
      tipo: "ATRASO" as const,
      descricao: "Chegada após o início da aula.",
      dataOcorrencia: "2026-09-25",
      encarregadoInformado: false,
    };

    await expect(criarOcorrencia("a-002", dados)).rejects.toMatchObject({
      status: 422,
      codigo: "GRAVIDADE_OBRIGATORIA",
      campos: { gravidade: expect.any(String) },
    });

    const resultado = await criarOcorrencia("a-002", { ...dados, gravidade: "LEVE" });
    expect(resultado.data).toMatchObject({ alunoId: "a-002", tipo: "ATRASO", gravidade: "LEVE" });
  });

  it("exige motivo e guarda a correção de uma nota", async () => {
    await autenticar("prof1@cardeneta.test", "demo123");
    await expect(guardarNota("a-001", "d-port", 1, { mac: 19 })).rejects.toMatchObject({
      status: 422,
      codigo: "MOTIVO_OBRIGATORIO",
      campos: { motivo: expect.any(String) },
    });

    const resultado = await guardarNota("a-001", "d-port", 1, {
      mac: 19,
      motivo: "Correção após revisão da avaliação.",
    });
    expect(resultado.data).toMatchObject({ mac: 19, mt: 12 });
  });
});
