import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useAsyncData } from "../hooks/useAsyncData";
import { listarDisciplinas } from "../services/catalogos";
import { ErroApiCliente } from "../services/api-client";
import { listarLancamento, guardarNota } from "../services/notas";
import type { LinhaLancamento } from "../services/notas";
import type { Disciplina, LancamentoNota, Nota, Trimestre } from "../types/api";

type Componente = "mac" | "npp" | "npt";
type RascunhoNota = { mac: number | null; npp: number | null; npt: number | null; motivo: string };

const componentes: { id: Componente; nome: string }[] = [
  { id: "mac", nome: "MAC" },
  { id: "npp", nome: "NPP" },
  { id: "npt", nome: "NPT" },
];

function rascunhoInicial(linha: LinhaLancamento): RascunhoNota {
  return {
    mac: linha.nota?.mac ?? null,
    npp: linha.nota?.npp ?? null,
    npt: linha.nota?.npt ?? null,
    motivo: "",
  };
}

function valorNota(valor: number | null) {
  return valor === null ? "" : String(valor);
}

export function NotasPage() {
  const { utilizador } = useAuth();
  const [classe, setClasse] = useState("7");
  const [turma, setTurma] = useState("A");
  const [trimestre, setTrimestre] = useState<Trimestre>(1);
  const [disciplinaId, setDisciplinaId] = useState("");
  const [rascunhos, setRascunhos] = useState<Record<string, RascunhoNota>>({});
  const [notasSalvas, setNotasSalvas] = useState<Record<string, Nota>>({});
  const [errosLinha, setErrosLinha] = useState<Record<string, string>>({});
  const [sucessoLinha, setSucessoLinha] = useState<Record<string, string>>({});
  const [aGuardar, setAGuardar] = useState<Record<string, boolean>>({});

  const carregarDisciplinas = useCallback(async () => (await listarDisciplinas()).data, []);
  const { data: disciplinas, erro: erroDisciplinas, carregando: carregandoDisciplinas, recarregar: recarregarDisciplinas } = useAsyncData(carregarDisciplinas);
  const minhasDisciplinas = useMemo(
    () => disciplinas?.filter((item) => utilizador?.papel === "COORDENADOR" || utilizador?.disciplinaIds.includes(item.id)) ?? [],
    [disciplinas, utilizador],
  );

  useEffect(() => {
    if (!disciplinaId && minhasDisciplinas.length) setDisciplinaId(minhasDisciplinas[0]!.id);
  }, [disciplinaId, minhasDisciplinas]);

  const carregarLancamento = useCallback(async () => {
    if (!disciplinaId || !classe || !turma) return [];
    return (await listarLancamento(Number(classe), turma, disciplinaId, trimestre)).data;
  }, [classe, disciplinaId, trimestre, turma]);
  const { data: linhas, erro, carregando, recarregar } = useAsyncData(carregarLancamento);

  useEffect(() => {
    if (!linhas) return;
    setRascunhos(Object.fromEntries(linhas.map((linha) => [linha.aluno.id, rascunhoInicial(linha)])));
    setNotasSalvas({});
    setErrosLinha({});
  }, [linhas]);

  function obterRascunho(linha: LinhaLancamento) {
    return rascunhos[linha.aluno.id] ?? rascunhoInicial(linha);
  }

  function alterarComponente(linha: LinhaLancamento, campo: Componente, valor: string) {
    const numero = valor === "" ? null : Number(valor);
    setRascunhos((anterior) => ({
      ...anterior,
      [linha.aluno.id]: { ...obterRascunho(linha), [campo]: numero },
    }));
    setErrosLinha((anterior) => ({ ...anterior, [linha.aluno.id]: "" }));
    setSucessoLinha((anterior) => ({ ...anterior, [linha.aluno.id]: "" }));
  }

  function alterouNotaExistente(linha: LinhaLancamento, rascunho: RascunhoNota) {
    const notaAtual = notasSalvas[linha.aluno.id] ?? linha.nota;
    if (!notaAtual) return false;
    return componentes.some(({ id }) =>
      notaAtual[id] !== null &&
      notaAtual[id] !== undefined &&
      notaAtual[id] !== rascunho[id],
    );
  }

  async function guardar(linha: LinhaLancamento) {
    const rascunho = obterRascunho(linha);
    const mudouNotaExistente = alterouNotaExistente(linha, rascunho);
    if (mudouNotaExistente && !rascunho.motivo.trim()) {
      setErrosLinha((anterior) => ({ ...anterior, [linha.aluno.id]: "Indique o motivo para corrigir valores já lançados." }));
      return;
    }

    setAGuardar((anterior) => ({ ...anterior, [linha.aluno.id]: true }));
    setErrosLinha((anterior) => ({ ...anterior, [linha.aluno.id]: "" }));
    setSucessoLinha((anterior) => ({ ...anterior, [linha.aluno.id]: "" }));
    const payload: LancamentoNota = {
      mac: rascunho.mac,
      npp: rascunho.npp,
      npt: rascunho.npt,
      ...(mudouNotaExistente ? { motivo: rascunho.motivo.trim() } : {}),
    };
    try {
      const { data: nota } = await guardarNota(linha.aluno.id, disciplinaId, trimestre, payload);
      setNotasSalvas((anterior) => ({ ...anterior, [linha.aluno.id]: nota }));
      setSucessoLinha((anterior) => ({ ...anterior, [linha.aluno.id]: "Nota guardada." }));
    } catch (error) {
      if (error instanceof ErroApiCliente) {
        setErrosLinha((anterior) => ({
          ...anterior,
          [linha.aluno.id]: error.campos ? Object.values(error.campos).join(" ") : error.message,
        }));
      } else {
        setErrosLinha((anterior) => ({
          ...anterior,
          [linha.aluno.id]: error instanceof Error ? error.message : "Não foi possível guardar a nota.",
        }));
      }
    } finally {
      setAGuardar((anterior) => ({ ...anterior, [linha.aluno.id]: false }));
    }
  }

  const disciplinaSelecionada: Disciplina | undefined = minhasDisciplinas.find((item) => item.id === disciplinaId);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold text-teal-800">Avaliação</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Lançamento de notas</h1>
      </header>
      {carregandoDisciplinas && <p className="rounded-xl bg-white p-4 text-slate-600" role="status">A carregar disciplinas…</p>}
      {erroDisciplinas && (
        <section className="rounded-xl border border-red-200 bg-white p-5" role="alert">
          <h2 className="font-bold text-red-900">Não foi possível carregar as disciplinas</h2>
          <p className="mt-2 text-sm text-red-800">{erroDisciplinas}</p>
          <button className="mt-3 min-h-11 rounded-lg bg-teal-800 px-4 font-semibold text-white" onClick={recarregarDisciplinas}>Tentar novamente</button>
        </section>
      )}
      {!carregandoDisciplinas && !erroDisciplinas && minhasDisciplinas.length === 0 && (
        <p className="rounded-xl bg-white p-5 text-slate-700">Não existem disciplinas disponíveis para o seu perfil.</p>
      )}
      {!carregandoDisciplinas && !erroDisciplinas && minhasDisciplinas.length > 0 && (
        <>
          <section aria-label="Critérios de lançamento" className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-semibold" htmlFor="classe-lancamento">Classe</label>
              <select className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="classe-lancamento" value={classe} onChange={(event) => setClasse(event.target.value)}>
                {Array.from({ length: 13 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}.ª classe</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold" htmlFor="turma-lancamento">Turma</label>
              <select className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="turma-lancamento" value={turma} onChange={(event) => setTurma(event.target.value)}>
                <option value="A">A</option><option value="B">B</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold" htmlFor="disciplina-lancamento">Disciplina</label>
              <select className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="disciplina-lancamento" value={disciplinaId} onChange={(event) => setDisciplinaId(event.target.value)}>
                {minhasDisciplinas.map((disciplina) => <option key={disciplina.id} value={disciplina.id}>{disciplina.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold" htmlFor="trimestre">Trimestre</label>
              <select className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="trimestre" value={trimestre} onChange={(event) => setTrimestre(Number(event.target.value) as Trimestre)}>
                <option value={1}>1.º trimestre</option><option value={2}>2.º trimestre</option><option value={3}>3.º trimestre</option>
              </select>
            </div>
          </section>
          {carregando && <p className="rounded-xl bg-white p-5 text-slate-600" role="status">A carregar alunos da turma…</p>}
          {erro && (
            <section className="rounded-xl border border-red-200 bg-white p-5" role="alert">
              <h2 className="font-bold text-red-900">Não foi possível carregar a turma</h2>
              <p className="mt-2 text-sm text-red-800">{erro}</p>
              <button className="mt-3 min-h-11 rounded-lg bg-teal-800 px-4 font-semibold text-white" onClick={recarregar}>Tentar novamente</button>
            </section>
          )}
          {!carregando && !erro && linhas && linhas.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">Não encontrámos alunos nesta turma.</p>
          )}
          {!carregando && !erro && linhas && linhas.length > 0 && (
            <section aria-label="Notas da turma" className="space-y-3">
              <p className="text-sm text-slate-600">{disciplinaSelecionada?.nome} · {trimestre}.º trimestre · {classe}.ª classe, turma {turma}</p>
              {linhas.map((linha) => {
                const rascunho = obterRascunho(linha);
                const mudouNotaExistente = alterouNotaExistente(linha, rascunho);
                const valoresCompletos = [rascunho.mac, rascunho.npp, rascunho.npt].every((valor) => valor !== null);
                const mt = valoresCompletos
                  ? Math.round(((rascunho.mac ?? 0) + (rascunho.npp ?? 0) + (rascunho.npt ?? 0)) / 3)
                  : null;
                return (
                  <article className="rounded-xl border border-slate-200 bg-white p-4" key={linha.aluno.id}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="font-bold">{linha.aluno.nome}</h2>
                        <p className="text-sm text-slate-600">Processo {linha.aluno.numeroProcesso}</p>
                      </div>
                      <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-bold text-teal-950" aria-live="polite">
                        MT: {mt ?? "—"}
                      </p>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {componentes.map(({ id: campo, nome }) => (
                        <div key={campo}>
                          <label className="block text-xs font-bold text-slate-600" htmlFor={`${campo}-${linha.aluno.id}`}>{nome}</label>
                          <input
                            aria-label={`${nome} - ${linha.aluno.nome}`}
                            className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3 text-center"
                            id={`${campo}-${linha.aluno.id}`}
                            inputMode="numeric"
                            max={20}
                            min={0}
                            onChange={(event) => alterarComponente(linha, campo, event.target.value)}
                            type="number"
                            value={valorNota(rascunho[campo])}
                          />
                        </div>
                      ))}
                    </div>
                    {mudouNotaExistente && (
                      <div className="mt-4">
                        <label className="block text-sm font-semibold" htmlFor={`motivo-${linha.aluno.id}`}>Motivo da correção — {linha.aluno.nome}</label>
                        <textarea
                          className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 p-3"
                          id={`motivo-${linha.aluno.id}`}
                          required
                          value={rascunho.motivo}
                          onChange={(event) => setRascunhos((anterior) => ({
                            ...anterior,
                            [linha.aluno.id]: { ...obterRascunho(linha), motivo: event.target.value },
                          }))}
                        />
                      </div>
                    )}
                    {errosLinha[linha.aluno.id] && <p className="mt-3 text-sm font-medium text-red-800" role="alert">{errosLinha[linha.aluno.id]}</p>}
                    {sucessoLinha[linha.aluno.id] && <p className="mt-3 text-sm font-semibold text-green-800" role="status">{sucessoLinha[linha.aluno.id]}</p>}
                    <button
                      className="mt-4 min-h-12 w-full rounded-lg bg-teal-800 px-4 font-bold text-white disabled:opacity-70 sm:w-auto"
                      disabled={aGuardar[linha.aluno.id]}
                      onClick={() => void guardar(linha)}
                      type="button"
                    >
                      {aGuardar[linha.aluno.id] ? "A guardar…" : `Guardar nota ${linha.aluno.nome}`}
                    </button>
                  </article>
                );
              })}
            </section>
          )}
        </>
      )}
    </div>
  );
}
