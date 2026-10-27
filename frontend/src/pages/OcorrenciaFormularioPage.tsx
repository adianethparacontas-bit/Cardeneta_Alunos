import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ErroApiCliente } from "../services/api-client";
import { criarOcorrencia } from "../services/ocorrencias";
import type { Gravidade, TipoOcorrencia } from "../types/api";

const opcoesTipo: { valor: TipoOcorrencia; rotulo: string }[] = [
  { valor: "ATRASO", rotulo: "Atraso" },
  { valor: "INDISCIPLINA", rotulo: "Indisciplina" },
  { valor: "COMPORTAMENTO_INAPROPRIADO", rotulo: "Comportamento inapropriado" },
  { valor: "AGRESSAO", rotulo: "Agressão" },
  { valor: "DANOS_MATERIAIS", rotulo: "Danos materiais" },
  { valor: "ELOGIO", rotulo: "Elogio" },
  { valor: "OUTRA", rotulo: "Outra" },
];

function dataHoje() {
  const data = new Date();
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

export function OcorrenciaFormularioPage() {
  const { id = "" } = useParams();
  const navegar = useNavigate();
  const [tipo, setTipo] = useState<TipoOcorrencia>("ATRASO");
  const [gravidade, setGravidade] = useState<Gravidade | "">("");
  const [descricao, setDescricao] = useState("");
  const [dataOcorrencia, setDataOcorrencia] = useState(dataHoje());
  const [local, setLocal] = useState("");
  const [acaoTomada, setAcaoTomada] = useState("");
  const [encarregadoInformado, setEncarregadoInformado] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState("");
  const [aGuardar, setAGuardar] = useState(false);

  async function submeter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAGuardar(true);
    setErros({});
    setErroGeral("");
    try {
      await criarOcorrencia(id, {
        tipo,
        ...(tipo === "ELOGIO" ? {} : { gravidade: gravidade || undefined }),
        descricao: descricao.trim(),
        dataOcorrencia,
        ...(local.trim() ? { local: local.trim() } : {}),
        ...(acaoTomada.trim() ? { acaoTomada: acaoTomada.trim() } : {}),
        encarregadoInformado,
      });
      navegar(`/alunos/${id}`, { replace: true });
    } catch (error) {
      if (error instanceof ErroApiCliente) {
        setErros(error.campos ?? {});
        setErroGeral(error.message);
      } else {
        setErroGeral(error instanceof Error ? error.message : "Não foi possível registar a ocorrência.");
      }
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link className="inline-flex min-h-11 items-center font-semibold text-teal-900 underline" to={`/alunos/${id}`}>← Voltar à ficha</Link>
      <header>
        <p className="text-sm font-semibold text-teal-800">Registo disciplinar</p>
        <h1 className="mt-1 text-2xl font-bold">Registar ocorrência</h1>
      </header>
      <form className="space-y-5 rounded-xl border border-slate-200 bg-white p-5" onSubmit={submeter}>
        {erroGeral && <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-900" role="alert">{erroGeral}</p>}
        <div>
          <label className="block text-sm font-semibold" htmlFor="tipo">Tipo de ocorrência</label>
          <select aria-describedby={erros.tipo ? "tipo-erro" : undefined} className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="tipo" value={tipo} onChange={(event) => { setTipo(event.target.value as TipoOcorrencia); setGravidade(""); setErros((atual) => ({ ...atual, gravidade: "" })); }}>
            {opcoesTipo.map((option) => <option key={option.valor} value={option.valor}>{option.rotulo}</option>)}
          </select>
          {erros.tipo && <p className="mt-1 text-sm font-medium text-red-800" id="tipo-erro">{erros.tipo}</p>}
        </div>
        {tipo !== "ELOGIO" && (
          <div>
            <label className="block text-sm font-semibold" htmlFor="gravidade">Gravidade</label>
            <select aria-describedby={erros.gravidade ? "gravidade-erro" : undefined} className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="gravidade" required value={gravidade} onChange={(event) => { setGravidade(event.target.value as Gravidade | ""); setErros((atual) => ({ ...atual, gravidade: "" })); }}>
              <option value="">Selecione</option><option value="LEVE">Leve</option><option value="MODERADA">Moderada</option><option value="GRAVE">Grave</option>
            </select>
            {erros.gravidade && <p className="mt-1 text-sm font-medium text-red-800" id="gravidade-erro">{erros.gravidade}</p>}
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold" htmlFor="descricao">Descrição</label>
          <textarea aria-describedby={erros.descricao ? "descricao-erro" : undefined} className="mt-1 min-h-28 w-full rounded-lg border border-slate-300 p-3" id="descricao" required value={descricao} onChange={(event) => { setDescricao(event.target.value); setErros((atual) => ({ ...atual, descricao: "" })); }} />
          {erros.descricao && <p className="mt-1 text-sm font-medium text-red-800" id="descricao-erro">{erros.descricao}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold" htmlFor="dataOcorrencia">Data</label>
            <input aria-describedby={erros.dataOcorrencia ? "dataOcorrencia-erro" : undefined} className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="dataOcorrencia" max={dataHoje()} required type="date" value={dataOcorrencia} onChange={(event) => { setDataOcorrencia(event.target.value); setErros((atual) => ({ ...atual, dataOcorrencia: "" })); }} />
            {erros.dataOcorrencia && <p className="mt-1 text-sm font-medium text-red-800" id="dataOcorrencia-erro">{erros.dataOcorrencia}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="local">Local (opcional)</label>
            <input className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="local" value={local} onChange={(event) => setLocal(event.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold" htmlFor="acaoTomada">Ação tomada (opcional)</label>
          <textarea className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 p-3" id="acaoTomada" value={acaoTomada} onChange={(event) => setAcaoTomada(event.target.value)} />
        </div>
        <label className="flex min-h-12 items-center gap-3 text-sm font-semibold">
          <input checked={encarregadoInformado} className="size-5 accent-teal-800" onChange={(event) => setEncarregadoInformado(event.target.checked)} type="checkbox" />
          O encarregado foi informado
        </label>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 px-4 font-semibold" to={`/alunos/${id}`}>Cancelar</Link>
          <button className="min-h-12 rounded-lg bg-teal-800 px-5 font-bold text-white disabled:opacity-70" disabled={aGuardar} type="submit">{aGuardar ? "A guardar…" : "Registar ocorrência"}</button>
        </div>
      </form>
    </div>
  );
}
