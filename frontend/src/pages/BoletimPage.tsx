import { Printer } from "lucide-react";
import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useAsyncData } from "../hooks/useAsyncData";
import { obterBoletim } from "../services/alunos";
import type { Boletim, Situacao } from "../types/api";

const situacoes: Record<Situacao, string> = {
  EM_CURSO: "Em curso",
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
};

function SituacaoTag({ situacao }: { situacao: Situacao }) {
  const estilo = situacao === "APROVADO"
    ? "bg-green-100 text-green-900"
    : situacao === "REPROVADO"
      ? "bg-red-100 text-red-900"
      : "bg-amber-100 text-amber-950";
  return <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${estilo}`}>{situacoes[situacao]}</span>;
}

function secaoFaltas(boletim: Boletim) {
  return (
    <section className="mt-8 break-inside-avoid" aria-labelledby="boletim-absences">
      <h2 className="text-xl font-bold" id="boletim-absences">Assiduidade</h2>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-slate-50 p-3"><p className="text-sm text-slate-600">Total</p><p className="text-2xl font-bold">{boletim.faltas.total}</p></div>
        <div className="rounded-lg bg-green-50 p-3"><p className="text-sm text-green-900">Justificadas</p><p className="text-2xl font-bold">{boletim.faltas.justificadas}</p></div>
        <div className="rounded-lg bg-amber-50 p-3"><p className="text-sm text-amber-950">Injustificadas</p><p className="text-2xl font-bold">{boletim.faltas.injustificadas}</p></div>
      </div>
      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[420px] text-left text-sm">
          <caption className="sr-only">Faltas por trimestre</caption>
          <thead className="bg-slate-100"><tr><th className="p-3" scope="col">Trimestre</th><th className="p-3" scope="col">Total</th><th className="p-3" scope="col">Justificadas</th><th className="p-3" scope="col">Injustificadas</th></tr></thead>
          <tbody className="divide-y divide-slate-200">
            {boletim.faltas.porTrimestre.map((item) => (
              <tr key={item.trimestre}><th className="p-3 font-semibold" scope="row">{item.trimestre}.º</th><td className="p-3">{item.total}</td><td className="p-3">{item.justificadas}</td><td className="p-3">{item.injustificadas}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ocorrenciasRecentes(boletim: Boletim) {
  if (boletim.ocorrenciasRecentes === null) return null;
  return (
    <section className="mt-8 break-inside-avoid" aria-labelledby="boletim-occurrences">
      <h2 className="text-xl font-bold" id="boletim-occurrences">Ocorrências recentes</h2>
      {boletim.ocorrenciasRecentes.length === 0 ? (
        <p className="mt-3 rounded-lg bg-slate-50 p-4 text-slate-600">Não há ocorrências recentes.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {boletim.ocorrenciasRecentes.map((item) => (
            <li className="break-inside-avoid rounded-lg border border-slate-200 p-4" key={item.id}>
              <div className="flex flex-wrap justify-between gap-2">
                <h3 className="font-bold">{item.tipo.replace(/_/g, " ")}</h3>
                <time dateTime={item.dataOcorrencia}>{new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium" }).format(new Date(`${item.dataOcorrencia}T00:00:00`))}</time>
              </div>
              <p className="mt-2 text-sm text-slate-700">{item.descricao}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function BoletimPage() {
  const { id = "" } = useParams();
  const { utilizador } = useAuth();
  const carregar = useCallback(async () => (await obterBoletim(id)).data, [id]);
  const { data: boletim, erro, carregando, recarregar } = useAsyncData(carregar);

  if (carregando) return <p className="p-6 text-slate-600" role="status">A preparar o boletim…</p>;
  if (erro) return (
    <section className="rounded-xl border border-red-200 bg-white p-5" role="alert">
      <h1 className="font-bold text-red-900">Não foi possível carregar o boletim</h1>
      <p className="mt-2 text-sm text-red-800">{erro}</p>
      <button className="no-print mt-4 min-h-11 rounded-lg bg-teal-800 px-4 font-semibold text-white" onClick={recarregar}>Tentar novamente</button>
    </section>
  );
  if (!boletim) return <p className="p-6 text-slate-600">Boletim sem dados.</p>;

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link className="inline-flex min-h-11 items-center font-semibold text-teal-900 underline" to={`/alunos/${id}`}>← Voltar à ficha</Link>
        <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 font-bold text-white" onClick={() => window.print()} type="button">
          <Printer aria-hidden="true" size={18} /> Imprimir boletim
        </button>
      </div>
      <article className="print-area rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <header className="border-b border-slate-200 pb-5">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-800">Cardeneta do Aluno</p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-950">Boletim escolar</h1>
              <p className="mt-1 text-slate-700">{boletim.aluno.nome}</p>
              <p className="mt-1 text-sm text-slate-600">Processo {boletim.aluno.numeroProcesso} · {boletim.aluno.classe}.ª classe · Turma {boletim.aluno.turma} · {boletim.anoLetivo}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-600">Estado do aluno</p>
              <SituacaoTag situacao={boletim.situacaoAluno} />
            </div>
          </div>
        </header>
        <section className="mt-6" aria-labelledby="boletim-grades">
          <h2 className="text-xl font-bold" id="boletim-grades">Resultados por disciplina</h2>
          {boletim.disciplinas.length === 0 ? (
            <p className="mt-3 rounded-lg bg-slate-50 p-4 text-slate-600">Não existem disciplinas no boletim.</p>
          ) : (
            <div className="mt-3 space-y-4">
              {boletim.disciplinas.map((disciplina) => (
                <section className="break-inside-avoid rounded-lg border border-slate-200 p-3 sm:p-4" key={disciplina.disciplinaId} aria-label={disciplina.disciplinaNome}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold">{disciplina.disciplinaNome}</h3>
                    <SituacaoTag situacao={disciplina.situacao} />
                  </div>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[460px] text-center text-sm">
                      <caption className="sr-only">Notas trimestrais de {disciplina.disciplinaNome}</caption>
                      <thead className="bg-slate-100"><tr><th className="p-2 text-left" scope="col">Trimestre</th><th className="p-2" scope="col">MAC</th><th className="p-2" scope="col">NPP</th><th className="p-2" scope="col">NPT</th><th className="p-2" scope="col">MT</th></tr></thead>
                      <tbody className="divide-y divide-slate-200">
                        {disciplina.trimestres.map((item) => (
                          <tr key={item.trimestre}>
                            <th className="p-2 text-left font-semibold" scope="row">{item.trimestre}.º</th>
                            <td className="p-2">{item.mac ?? "—"}</td><td className="p-2">{item.npp ?? "—"}</td><td className="p-2">{item.npt ?? "—"}</td><td className="p-2 font-semibold">{item.mt ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-sm text-slate-700">MFD: <strong>{disciplina.mfd ?? "—"}</strong></p>
                </section>
              ))}
            </div>
          )}
        </section>
        {secaoFaltas(boletim)}
        {utilizador?.papel === "COORDENADOR" && ocorrenciasRecentes(boletim)}
        <footer className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
          Documento gerado a partir dos registos da Cardeneta do Aluno.
        </footer>
      </article>
    </div>
  );
}
