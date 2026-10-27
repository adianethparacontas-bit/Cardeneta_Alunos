import { beforeEach, describe, expect, it } from "vitest";
import { reiniciarMocks } from "../mocks/api";
import { ErroApiCliente } from "./api-client";
import { criarAluno } from "./alunos";
import { autenticar, obterSessao } from "./auth";
import { criarFalta } from "./faltas";
import { criarOcorrencia } from "./ocorrencias";
import { guardarNota } from "./notas";
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

  it("devolve 403 ao professor que tenta registar uma ocorrência", async () => {
    await autenticar("prof1@cardeneta.test", "demo123");
    await expect(criarOcorrencia("a-001", {
      tipo: "ELOGIO",
      descricao: "Registo de demonstração.",
      dataOcorrencia: "2026-09-20",
      encarregadoInformado: false,
    })).rejects.toMatchObject({ status: 403, codigo: "SEM_PERMISSAO" });
  });

  it("devolve 422 e erro.campos quando falta gravidade numa ocorrência", async () => {
    await autenticar("coord1@cardeneta.test", "demo123");
    await expect(criarOcorrencia("a-001", {
      tipo: "ATRASO",
      descricao: "Registo de demonstração.",
      dataOcorrencia: "2026-09-20",
      encarregadoInformado: false,
    })).rejects.toMatchObject({
      status: 422,
      codigo: "GRAVIDADE_OBRIGATORIA",
      campos: { gravidade: expect.any(String) },
    });
  });

  it("devolve 422 e erro.campos ao corrigir nota sem motivo", async () => {
    await autenticar("coord1@cardeneta.test", "demo123");
    await expect(guardarNota("a-001", "d-port", 1, { mac: 1 })).rejects.toMatchObject({
      status: 422,
      codigo: "MOTIVO_OBRIGATORIO",
      campos: { motivo: expect.any(String) },
    });
  });

  it("devolve 409 para falta duplicada", async () => {
    await autenticar("coord1@cardeneta.test", "demo123");
    await expect(criarFalta("a-001", {
      data: "2026-09-12",
      justificada: true,
      disciplinaId: "d-port",
    })).rejects.toMatchObject({ status: 409, codigo: "FALTA_DUPLICADA" });
  });

  it("devolve 409 e erro.campos para aluno duplicado", async () => {
    await autenticar("coord1@cardeneta.test", "demo123");
    const aluno = {
      nome: "Ana Kiala",
      classe: 7,
      turma: "A",
      turno: "MANHA" as const,
      anoLetivo: "2026/2027",
      numeroEmergencia: "923456789",
      numeroEncarregado: "923456780",
    };
    await expect(criarAluno(aluno)).rejects.toMatchObject({
      status: 409,
      codigo: "ALUNO_DUPLICADO",
      campos: { nome: expect.any(String) },
    });
  });
});
