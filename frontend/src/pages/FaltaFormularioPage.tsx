import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useAsyncData } from "../hooks/useAsyncData";
import { listarDisciplinas } from "../services/catalogos";
import { ErroApiCliente } from "../services/api-client";
import { criarFalta } from "../services/faltas";
import type { Disciplina } from "../types/api";

function dataHoje() {
  const data = new Date();
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

export function FaltaFormularioPage() {
  const { id = "" } = useParams();
  const navegar = useNavigate();
  const { utilizador } = useAuth();
  const [data, setData] = useState(dataHoje());
  const [justificada, setJustificada] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState("");
  const [aGuardar, setAGuardar] = useState(false);
  const carregarDisciplinas = useCallback(async () => (await listarDisciplinas()).data, []);
  const { data: disciplinas, erro: erroDisciplinas, carregando, recarregar } = useAsyncData(carregarDisciplinas);
  const minhasDisciplinas = disciplinas?.filter((item) =>
    utilizador?.papel === "COORDENADOR" || utilizador?.disciplinaIds.includes(item.id),
  ) ?? [];

  async function submeter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAGuardar(true);
    setErros({});
    setErroGeral("");
    try {
      await criarFalta(id, {
        data,
        justificada,
        ...(motivo.trim() ? { motivo: motivo.trim() } : {}),
        ...(disciplinaId ? { disciplinaId } : {}),
      });
      navegar(`/alunos/${id}`, { replace: true });
    } catch (error) {
      if (error instanceof ErroApiCliente) {
        setErros(error.campos ?? {});
        setErroGeral(error.message);
      } else {
        setErroGeral(error instanceof Error ? error.message : "Não foi possível registar a falta.");
      }
    } finally {
      setAGuardar(false);
    }
  }

  if (carregando) return <p className="p-6 text-slate-600" role="status">A carregar disciplinas…</p>;
  if (erroDisciplinas) return (
    <section className="rounded-xl border border-red-200 bg-white p-5" role="alert">
      <h1 className="font-bold text-red-900">Não foi possível carregar as disciplinas</h1>
      <p className="mt-2 text-sm text-red-800">{erroDisciplinas}</p>
      <button className="mt-3 min-h-11 rounded-lg bg-teal-800 px-4 font-semibold text-white" onClick={recarregar}>Tentar novamente</button>
    </section>
  );

  function erroCampo(campo: string) {
    return erros[campo] ? <p className="mt-1 text-sm font-medium text-red-800" id={`${campo}-erro`}>{erros[campo]}</p> : null;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link className="inline-flex min-h-11 items-center font-semibold text-teal-900 underline" to={`/alunos/${id}`}>← Voltar à ficha</Link>
      <header>
        <p className="text-sm font-semibold text-teal-800">Registo de assiduidade</p>
        <h1 className="mt-1 text-2xl font-bold">Registar falta</h1>
      </header>
      <form className="space-y-5 rounded-xl border border-slate-200 bg-white p-5" onSubmit={submeter}>
        {erroGeral && <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-900" role="alert">{erroGeral}</p>}
        <div>
          <label className="block text-sm font-semibold" htmlFor="data">Data da falta</label>
          <input aria-describedby={erros.data ? "data-erro" : undefined} className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="data" max={dataHoje()} required type="date" value={data} onChange={(event) => { setData(event.target.value); setErros((atual) => ({ ...atual, data: "" })); }} />
          {erroCampo("data")}
        </div>
        <div>
          <label className="block text-sm font-semibold" htmlFor="disciplinaId">Disciplina {utilizador?.papel === "COORDENADOR" ? "(opcional)" : ""}</label>
          <select aria-describedby={erros.disciplinaId ? "disciplinaId-erro" : undefined} className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="disciplinaId" required={utilizador?.papel === "PROFESSOR"} value={disciplinaId} onChange={(event) => { setDisciplinaId(event.target.value); setErros((atual) => ({ ...atual, disciplinaId: "" })); }}>
            {utilizador?.papel === "COORDENADOR" && <option value="">Sem disciplina</option>}
            {minhasDisciplinas.map((disciplina: Disciplina) => <option key={disciplina.id} value={disciplina.id}>{disciplina.nome}</option>)}
          </select>
          {utilizador?.papel === "PROFESSOR" && minhasDisciplinas.length === 0 && <p className="mt-1 text-sm text-amber-900">Não tem disciplinas associadas; não é possível registar a falta.</p>}
          {erroCampo("disciplinaId")}
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Justificação</legend>
          <label className="flex min-h-11 items-center gap-3"><input checked={!justificada} className="size-5 accent-teal-800" name="justificacao" onChange={() => setJustificada(false)} type="radio" /> Por justificar</label>
          <label className="flex min-h-11 items-center gap-3"><input checked={justificada} className="size-5 accent-teal-800" name="justificacao" onChange={() => setJustificada(true)} type="radio" /> Justificada</label>
        </fieldset>
        <div>
          <label className="block text-sm font-semibold" htmlFor="motivo">Motivo (opcional)</label>
          <textarea className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 p-3" id="motivo" value={motivo} onChange={(event) => setMotivo(event.target.value)} />
          {erroCampo("motivo")}
        </div>
        {erroCampo("justificada")}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 px-4 font-semibold" to={`/alunos/${id}`}>Cancelar</Link>
          <button className="min-h-12 rounded-lg bg-teal-800 px-5 font-bold text-white disabled:opacity-70" disabled={aGuardar || (utilizador?.papel === "PROFESSOR" && minhasDisciplinas.length === 0)} type="submit">{aGuardar ? "A guardar…" : "Registar falta"}</button>
        </div>
      </form>
    </div>
  );
}
