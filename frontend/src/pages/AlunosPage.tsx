import { Search, UserRound } from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useAsyncData } from "../hooks/useAsyncData";
import { listarAlunos } from "../services/alunos";
import type { AlunoResumo, EstadoAluno, FiltrosAlunos } from "../types/api";

const estados: Record<EstadoAluno, string> = {
  ATIVO: "Ativo", TRANSFERIDO: "Transferido", DESISTENTE: "Desistente", CONCLUIDO: "Concluído",
};

function CartaoAluno({ aluno }: { aluno: AlunoResumo }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-teal-50 p-2 text-teal-900"><UserRound aria-hidden="true" size={20} /></div>
        <div className="min-w-0 flex-1">
          <Link className="font-bold text-slate-950 underline decoration-slate-300 underline-offset-2" to={`/alunos/${aluno.id}`}>{aluno.nome}</Link>
          <p className="mt-1 text-sm text-slate-600">Processo {aluno.numeroProcesso}</p>
          <p className="mt-1 text-sm text-slate-600">{aluno.classe}.ª classe · Turma {aluno.turma} · {aluno.turno}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{estados[aluno.estado]}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-sm">
        <a className="min-h-11 inline-flex items-center font-semibold text-teal-900 underline" href={`tel:${aluno.numeroEncarregado}`}>Encarregado</a>
        <a className="min-h-11 inline-flex items-center font-semibold text-teal-900 underline" href={`tel:${aluno.numeroEmergencia}`}>Emergência</a>
        {aluno.totalOcorrencias !== null && <span className="inline-flex min-h-11 items-center text-slate-600">{aluno.totalOcorrencias} ocorrências</span>}
      </div>
    </article>
  );
}

export function AlunosPage() {
  const { utilizador } = useAuth();
  const [pesquisa, setPesquisa] = useState("");
  const [classe, setClasse] = useState("");
  const [turma, setTurma] = useState("");
  const [estado, setEstado] = useState("");
  const [filtros, setFiltros] = useState<FiltrosAlunos>({ pagina: 1, limite: 10 });
  const carregar = useCallback(() => listarAlunos(filtros), [filtros]);
  const { data, erro, carregando, recarregar } = useAsyncData(carregar);

  function pesquisar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFiltros({
      q: pesquisa.trim() || undefined,
      classe: classe ? Number(classe) : undefined,
      turma: turma || undefined,
      estado: (estado || undefined) as EstadoAluno | undefined,
      pagina: 1,
      limite: 10,
    });
  }

  function mudarPagina(pagina: number) {
    setFiltros((anterior) => ({ ...anterior, pagina }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal-800">Gestão escolar</p>
          <h1 className="mt-1 text-2xl font-bold">Alunos</h1>
        </div>
        {utilizador?.papel === "COORDENADOR" && <Link className="inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-4 font-bold text-white" to="/alunos/novo">Adicionar aluno</Link>}
      </header>
      <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5" onSubmit={pesquisar}>
        <div className="sm:col-span-2 lg:col-span-2">
          <label className="block text-sm font-semibold" htmlFor="aluno-search">Nome ou número de processo</label>
          <input className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="aluno-search" onChange={(event) => setPesquisa(event.target.value)} value={pesquisa} />
        </div>
        <div>
          <label className="block text-sm font-semibold" htmlFor="classe">Classe</label>
          <select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="classe" onChange={(event) => setClasse(event.target.value)} value={classe}>
            <option value="">Todas</option>
            {Array.from({ length: 13 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}.ª</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold" htmlFor="turma">Turma</label>
          <select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="turma" onChange={(event) => setTurma(event.target.value)} value={turma}>
            <option value="">Todas</option><option value="A">A</option><option value="B">B</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold" htmlFor="estado">Estado</label>
          <select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="estado" onChange={(event) => setEstado(event.target.value)} value={estado}>
            <option value="">Todos</option>{Object.entries(estados).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 font-bold text-white sm:col-span-2 lg:col-span-5" type="submit">
          <Search aria-hidden="true" size={18} /> Pesquisar
        </button>
      </form>

      {carregando && <p className="rounded-xl bg-white p-5 text-slate-600" role="status">A carregar alunos…</p>}
      {erro && (
        <section className="rounded-xl border border-red-200 bg-white p-5" role="alert">
          <p className="font-semibold text-red-900">Não foi possível carregar os alunos.</p>
          <p className="mt-1 text-sm text-red-800">{erro}</p>
          <button className="mt-3 min-h-11 rounded-lg bg-teal-800 px-4 font-semibold text-white" onClick={recarregar}>Tentar novamente</button>
        </section>
      )}
      {!carregando && !erro && data && (
        <>
          {data.data.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">Não encontrámos alunos com estes filtros.</p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {data.data.map((aluno) => <li key={aluno.id}><CartaoAluno aluno={aluno} /></li>)}
            </ul>
          )}
          <div className="flex items-center justify-between gap-3 rounded-xl bg-white p-3">
            <p aria-live="polite" className="text-sm text-slate-600">
              Página {data.meta.pagina} · {data.meta.total} alunos
            </p>
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
