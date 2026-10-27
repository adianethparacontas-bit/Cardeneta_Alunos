import { AlertTriangle, ArrowRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useCallback } from "react";
import { useAsyncData } from "../hooks/useAsyncData";
import { obterResumo } from "../services/resumo";
import { useAuth } from "../auth/AuthContext";

export function PainelPage() {
  const { utilizador } = useAuth();
  const carregar = useCallback(async () => {
    if (utilizador?.papel !== "COORDENADOR") return null;
    return (await obterResumo()).data;
  }, [utilizador?.papel]);
  const { data, erro, carregando, recarregar } = useAsyncData(carregar);

  if (carregando) return <p className="p-6 text-slate-600" role="status">A carregar o painel…</p>;
  if (erro) return (
    <section className="rounded-xl border border-red-200 bg-white p-5" role="alert">
      <h1 className="font-bold text-red-900">Não foi possível carregar o painel</h1>
      <p className="mt-2 text-sm text-red-800">{erro}</p>
      <button className="mt-4 min-h-11 rounded-lg bg-teal-800 px-4 font-semibold text-white" onClick={recarregar}>Tentar novamente</button>
    </section>
  );
  if (utilizador?.papel === "PROFESSOR") {
    return (
      <section className="space-y-4">
        <header>
          <p className="text-sm font-semibold text-teal-800">Área do professor</p>
          <h1 className="mt-1 text-2xl font-bold">Bom trabalho, {utilizador.nome}</h1>
        </header>
        <p className="rounded-xl border border-slate-200 bg-white p-5 text-slate-700">
          Consulte os seus alunos ou registe notas nas disciplinas que leciona.
        </p>
        <Link className="inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-4 font-bold text-white" to="/alunos">Ver alunos</Link>
      </section>
    );
  }
  if (!data) return <p className="p-6">Sem dados disponíveis.</p>;

  return (
    <div className="space-y-7">
      <header>
        <p className="text-sm font-semibold text-teal-800">Bem-vindo, {utilizador?.nome}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Visão geral</h1>
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl bg-teal-900 p-5 text-white">
          <Users aria-hidden="true" size={22} />
          <p className="mt-4 text-sm text-teal-100">Alunos ativos</p>
          <p className="mt-1 text-4xl font-bold">{data.totalAlunosAtivos}</p>
          <Link className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold underline" to="/alunos">Ver alunos <ArrowRight size={17} /></Link>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="font-semibold text-slate-800">Turmas ativas</p>
          <p className="mt-2 text-4xl font-bold text-slate-950">{data.porTurma.length}</p>
          <p className="mt-1 text-sm text-slate-500">Distribuídas por classe e turno</p>
        </article>
      </section>
      {utilizador?.papel === "COORDENADOR" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="risk-title">
            <h2 className="text-lg font-bold" id="risk-title">Alunos que precisam de atenção</h2>
            {data.emRisco.length === 0 ? (
              <p className="mt-3 rounded-xl bg-white p-4 text-slate-600">Não há alunos sinalizados neste momento.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {data.emRisco.map((entry) => (
                  <li className="rounded-xl border border-amber-200 bg-amber-50 p-4" key={entry.aluno.id}>
                    <Link className="font-semibold text-slate-900 underline" to={`/alunos/${entry.aluno.id}`}>{entry.aluno.nome}</Link>
                    <p className="mt-1 flex items-start gap-2 text-sm text-slate-700"><AlertTriangle aria-hidden="true" size={16} />{entry.motivos.join(", ")}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section aria-labelledby="occurrence-title">
            <h2 className="text-lg font-bold" id="occurrence-title">Mais ocorrências</h2>
            {data.maisOcorrencias.length === 0 ? (
              <p className="mt-3 rounded-xl bg-white p-4 text-slate-600">Ainda não há ocorrências registadas.</p>
            ) : (
              <ol className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                {data.maisOcorrencias.map((entry) => (
                  <li className="flex items-center justify-between gap-3 p-4" key={entry.aluno.id}>
                    <Link className="font-semibold text-teal-900 underline" to={`/alunos/${entry.aluno.id}`}>{entry.aluno.nome}</Link>
                    <span className="text-sm text-slate-600">{entry.totalOcorrencias} ocorr.</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
      <section aria-labelledby="classes-title">
        <h2 className="text-lg font-bold" id="classes-title">Alunos por turma</h2>
        {data.porTurma.length === 0 ? <p className="mt-3 text-slate-600">Não existem turmas para mostrar.</p> : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.porTurma.map((turma) => (
              <li className="rounded-xl border border-slate-200 bg-white p-4" key={`${turma.classe}-${turma.turma}-${turma.turno}`}>
                <p className="font-bold">{turma.classe}.ª classe · Turma {turma.turma}</p>
                <p className="mt-1 text-sm text-slate-600">{turma.turno} · {turma.total} alunos</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
