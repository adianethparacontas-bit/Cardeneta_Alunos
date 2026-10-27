import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { listarOcorrencias } from "../services/ocorrencias";
import type { Ocorrencia, TipoOcorrencia } from "../types/api";

const tipoNome: Record<TipoOcorrencia, string> = {
  ATRASO: "Atraso",
  INDISCIPLINA: "Indisciplina",
  COMPORTAMENTO_INAPROPRIADO: "Comportamento inapropriado",
  AGRESSAO: "Agressão",
  DANOS_MATERIAIS: "Danos materiais",
  ELOGIO: "Elogio",
  OUTRA: "Outra",
};

function dataHoje() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatarData(data: string) {
  return new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium" }).format(new Date(`${data}T00:00:00`));
}

export function OcorrenciasPage() {
  const [alunoId, setAlunoId] = useState("");
  const [tipo, setTipo] = useState("");
  const [gravidade, setGravidade] = useState("");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [filtros, setFiltros] = useState({ pagina: 1, limite: 10 });
  const carregar = useCallback(
    () => listarOcorrencias({ ...filtros, alunoId: alunoId || undefined, tipo: tipo || undefined, gravidade: gravidade || undefined, de: de || undefined, ate: ate || undefined }),
    [alunoId, ate, de, filtros, gravidade, tipo],
  );
  const { data, erro, carregando, recarregar } = useAsyncData(carregar);

  function pesquisar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFiltros({ pagina: 1, limite: 10 });
  }

  function mudarPagina(next: number) {
    setFiltros((anterior) => ({ ...anterior, pagina: next }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold text-teal-800">Registos disciplinares</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Ocorrências</h1>
      </header>
      <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={pesquisar}>
        <div>
          <label className="block text-sm font-semibold" htmlFor="filtro-aluno">ID do aluno</label>
          <input className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="filtro-aluno" value={alunoId} onChange={(event) => setAlunoId(event.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold" htmlFor="filtro-tipo">Tipo</label>
          <select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="filtro-tipo" value={tipo} onChange={(event) => setTipo(event.target.value)}>
            <option value="">Todos</option>{Object.entries(tipoNome).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold" htmlFor="filtro-gravidade">Gravidade</label>
          <select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="filtro-gravidade" value={gravidade} onChange={(event) => setGravidade(event.target.value)}>
            <option value="">Todas</option><option value="LEVE">Leve</option><option value="MODERADA">Moderada</option><option value="GRAVE">Grave</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold" htmlFor="ocorrencia-de">Desde</label>
          <input className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="ocorrencia-de" type="date" max={ate || dataHoje()} value={de} onChange={(event) => setDe(event.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold" htmlFor="ocorrencia-ate">Até</label>
          <input className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="ocorrencia-ate" type="date" min={de || undefined} max={dataHoje()} value={ate} onChange={(event) => setAte(event.target.value)} />
        </div>
        <button className="min-h-12 rounded-lg bg-teal-800 px-4 font-bold text-white sm:col-span-2 lg:col-span-3" type="submit">Pesquisar ocorrências</button>
      </form>

      {carregando && <p className="rounded-xl bg-white p-5 text-slate-600" role="status">A carregar ocorrências…</p>}
      {erro && (
        <section className="rounded-xl border border-red-200 bg-white p-5" role="alert">
          <h2 className="font-bold text-red-900">Não foi possível carregar as ocorrências</h2>
          <p className="mt-2 text-sm text-red-800">{erro}</p>
          <button className="mt-3 min-h-11 rounded-lg bg-teal-800 px-4 font-semibold text-white" onClick={recarregar}>Tentar novamente</button>
        </section>
      )}
      {!carregando && !erro && data && (
        <>
          {data.data.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">Não encontrámos ocorrências com estes filtros.</p> : (
            <ul className="space-y-3">
              {data.data.map((item: Ocorrencia) => (
                <li className="rounded-xl border border-slate-200 bg-white p-4" key={item.id}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link className="font-bold text-teal-900 underline" to={`/alunos/${item.alunoId}`}>{item.alunoNome}</Link>
                      <h2 className="mt-1 font-semibold">{tipoNome[item.tipo]}</h2>
                    </div>
                    <time className="text-sm text-slate-600" dateTime={item.dataOcorrencia}>{formatarData(item.dataOcorrencia)}</time>
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{item.descricao}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                    {item.gravidade && <span>Gravidade: {item.gravidade}</span>}
                    {item.local && <span>Local: {item.local}</span>}
                    <span>Registada por {item.registadaPor.nome}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between gap-3 rounded-xl bg-white p-3">
            <p aria-live="polite" className="text-sm text-slate-600">Página {data.meta.pagina} · {data.meta.total} ocorrências</p>
            <div className="flex gap-2">
              <button className="min-h-11 rounded-lg border border-slate-300 px-3 font-semibold disabled:opacity-50" disabled={data.meta.pagina <= 1} onClick={() => mudarPagina(data.meta.pagina - 1)}>Anterior</button>
              <button className="min-h-11 rounded-lg border border-slate-300 px-3 font-semibold disabled:opacity-50" disabled={data.meta.pagina * data.meta.limite >= data.meta.total} onClick={() => mudarPagina(data.meta.pagina + 1)}>Seguinte</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
