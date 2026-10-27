import { Search, UserRound } from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useAsyncData } from "../hooks/useAsyncData";
import { listarAlunos } from "../services/alunos";
import type {
  AlunoResumo,
  EstadoAluno,
  FiltrosAlunos,
  Gravidade,
  Situacao,
  TipoOcorrencia,
  Trimestre,
  Turno,
} from "../types/api";

const estados: Record<EstadoAluno, string> = {
  ATIVO: "Ativo", TRANSFERIDO: "Transferido", DESISTENTE: "Desistente", CONCLUIDO: "Concluído",
};
const tiposOcorrencia: Record<TipoOcorrencia, string> = {
  ATRASO: "Atraso",
  INDISCIPLINA: "Indisciplina",
  COMPORTAMENTO_INAPROPRIADO: "Comportamento inapropriado",
  AGRESSAO: "Agressão",
  DANOS_MATERIAIS: "Danos materiais",
  ELOGIO: "Elogio",
  OUTRA: "Outra",
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

export function AlunosPage({ avancada = false }: { avancada?: boolean }) {
  const { utilizador } = useAuth();
  const [pesquisa, setPesquisa] = useState("");
  const [classe, setClasse] = useState("");
  const [turma, setTurma] = useState("");
  const [turno, setTurno] = useState("");
  const [estado, setEstado] = useState("");
  const [tipoOcorrencia, setTipoOcorrencia] = useState("");
  const [gravidade, setGravidade] = useState("");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [minOcorrencias, setMinOcorrencias] = useState("");
  const [situacao, setSituacao] = useState("");
  const [trimestre, setTrimestre] = useState("");
  const [negativasMin, setNegativasMin] = useState("");
  const [minFaltas, setMinFaltas] = useState("");
  const [faltasJustificadas, setFaltasJustificadas] = useState("");
  const [ordenar, setOrdenar] = useState<FiltrosAlunos["ordenar"]>("nome");
  const [direcao, setDirecao] = useState<FiltrosAlunos["direcao"]>("asc");
  const [filtros, setFiltros] = useState<FiltrosAlunos>({ pagina: 1, limite: 10 });
  const carregar = useCallback(() => listarAlunos(filtros), [filtros]);
  const { data, erro, carregando, recarregar } = useAsyncData(carregar);

  function pesquisar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFiltros({
      q: pesquisa.trim() || undefined,
      classe: classe ? Number(classe) : undefined,
      turma: turma || undefined,
      turno: (turno || undefined) as Turno | undefined,
      estado: (estado || undefined) as EstadoAluno | undefined,
      tipoOcorrencia: (tipoOcorrencia || undefined) as TipoOcorrencia | undefined,
      gravidade: (gravidade || undefined) as Gravidade | undefined,
      de: de || undefined,
      ate: ate || undefined,
      minOcorrencias: minOcorrencias ? Number(minOcorrencias) : undefined,
      situacao: (situacao || undefined) as Situacao | undefined,
      trimestre: trimestre ? Number(trimestre) as Trimestre : undefined,
      negativasMin: negativasMin ? Number(negativasMin) : undefined,
      minFaltas: minFaltas ? Number(minFaltas) : undefined,
      faltasJustificadas: faltasJustificadas === "" ? undefined : faltasJustificadas === "true",
      ordenar,
      direcao,
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
          <h1 className="mt-1 text-2xl font-bold">{avancada ? "Pesquisa avançada de alunos" : "Alunos"}</h1>
        </div>
        {utilizador?.papel === "COORDENADOR" && <Link className="inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-4 font-bold text-white" to="/alunos/novo">Adicionar aluno</Link>}
      </header>
      <form className="space-y-3 rounded-xl border border-slate-200 bg-white p-4" onSubmit={pesquisar}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
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
            <label className="block text-sm font-semibold" htmlFor="turno">Turno</label>
            <select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="turno" onChange={(event) => setTurno(event.target.value)} value={turno}>
              <option value="">Todos</option><option value="MANHA">Manhã</option><option value="TARDE">Tarde</option><option value="NOITE">Noite</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="estado">Estado</label>
            <select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="estado" onChange={(event) => setEstado(event.target.value)} value={estado}>
              <option value="">Todos</option>{Object.entries(estados).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
        </div>
        <details className="rounded-lg border border-slate-200" open={avancada}>
          <summary className="min-h-12 cursor-pointer px-3 py-3 font-semibold text-slate-800">Filtros avançados</summary>
          <div className="grid gap-3 border-t border-slate-200 p-3 sm:grid-cols-2 lg:grid-cols-4">
            {utilizador?.papel === "COORDENADOR" && (
              <>
                <div>
                  <label className="block text-sm font-semibold" htmlFor="tipoOcorrencia">Tipo de ocorrência</label>
                  <select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="tipoOcorrencia" value={tipoOcorrencia} onChange={(event) => setTipoOcorrencia(event.target.value)}>
                    <option value="">Todos</option>{Object.entries(tiposOcorrencia).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold" htmlFor="gravidade">Gravidade</label>
                  <select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="gravidade" value={gravidade} onChange={(event) => setGravidade(event.target.value)}>
                    <option value="">Todas</option><option value="LEVE">Leve</option><option value="MODERADA">Moderada</option><option value="GRAVE">Grave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold" htmlFor="de">Ocorrências desde</label>
                  <input className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="de" type="date" value={de} onChange={(event) => setDe(event.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold" htmlFor="ate">Ocorrências até</label>
                  <input className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="ate" type="date" value={ate} onChange={(event) => setAte(event.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold" htmlFor="minOcorrencias">Mínimo de ocorrências</label>
                  <input className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="minOcorrencias" min={1} type="number" value={minOcorrencias} onChange={(event) => setMinOcorrencias(event.target.value)} />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-semibold" htmlFor="situacao">Situação escolar</label>
              <select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="situacao" value={situacao} onChange={(event) => setSituacao(event.target.value)}>
                <option value="">Todas</option><option value="EM_CURSO">Em curso</option><option value="APROVADO">Aprovado</option><option value="REPROVADO">Reprovado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold" htmlFor="trimestre-filtro">Trimestre</label>
              <select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="trimestre-filtro" value={trimestre} onChange={(event) => setTrimestre(event.target.value)}>
                <option value="">Todos</option><option value="1">1.º</option><option value="2">2.º</option><option value="3">3.º</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold" htmlFor="negativasMin">Mínimo de notas negativas</label>
              <input className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="negativasMin" min={1} type="number" value={negativasMin} onChange={(event) => setNegativasMin(event.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold" htmlFor="minFaltas">Mínimo de faltas</label>
              <input className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="minFaltas" min={1} type="number" value={minFaltas} onChange={(event) => setMinFaltas(event.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold" htmlFor="faltasJustificadas">Justificação de faltas</label>
              <select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="faltasJustificadas" value={faltasJustificadas} onChange={(event) => setFaltasJustificadas(event.target.value)}>
                <option value="">Todas</option><option value="true">Com justificadas</option><option value="false">Com injustificadas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold" htmlFor="ordenar">Ordenar por</label>
              <select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="ordenar" value={ordenar} onChange={(event) => setOrdenar(event.target.value as FiltrosAlunos["ordenar"])}>
                <option value="nome">Nome</option><option value="ocorrencias">Ocorrências</option><option value="ultimaOcorrencia">Última ocorrência</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold" htmlFor="direcao">Direção</label>
              <select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="direcao" value={direcao} onChange={(event) => setDirecao(event.target.value as FiltrosAlunos["direcao"])}>
                <option value="asc">Ascendente</option><option value="desc">Descendente</option>
              </select>
            </div>
          </div>
        </details>
        <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 font-bold text-white" type="submit">
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
