import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useAsyncData } from "../hooks/useAsyncData";
import { ErroApiCliente } from "../services/api-client";
import { listarFaltas } from "../services/faltas";
import { mudarEstadoAluno, obterAluno } from "../services/alunos";
import { listarNotasAluno } from "../services/notas";
import { listarOcorrenciasAluno } from "../services/ocorrencias";
import type { Aluno, EstadoAluno, Falta, Nota, Ocorrencia } from "../types/api";

type Separador = "dados" | "ocorrencias" | "notas" | "faltas";

interface DadosAluno {
  aluno: Aluno;
  ocorrencias: Ocorrencia[] | null;
  notas: Nota[];
  faltas: Falta[];
}

const tipoOcorrencia: Record<Ocorrencia["tipo"], string> = {
  ATRASO: "Atraso",
  INDISCIPLINA: "Indisciplina",
  COMPORTAMENTO_INAPROPRIADO: "Comportamento inapropriado",
  AGRESSAO: "Agressão",
  DANOS_MATERIAIS: "Danos materiais",
  ELOGIO: "Elogio",
  OUTRA: "Outra",
};

const rotuloEstado: Record<Aluno["estado"], string> = {
  ATIVO: "Ativo",
  TRANSFERIDO: "Transferido",
  DESISTENTE: "Desistente",
  CONCLUIDO: "Concluído",
};

function formatarData(data: string) {
  return new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium" }).format(new Date(`${data}T00:00:00`));
}

function PainelSeparador({ dados, separador }: { dados: DadosAluno; separador: Separador }) {
  if (separador === "dados") {
    const aluno = dados.aluno;
    return (
      <section aria-labelledby="student-data-title" className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold" id="student-data-title">Dados do aluno</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><dt className="text-sm text-slate-500">Número de processo</dt><dd className="mt-1 font-semibold">{aluno.numeroProcesso}</dd></div>
          <div><dt className="text-sm text-slate-500">Estado</dt><dd className="mt-1 font-semibold">{rotuloEstado[aluno.estado]}</dd></div>
          <div><dt className="text-sm text-slate-500">Classe e turma</dt><dd className="mt-1 font-semibold">{aluno.classe}.ª classe · Turma {aluno.turma}</dd></div>
          <div><dt className="text-sm text-slate-500">Turno</dt><dd className="mt-1 font-semibold">{aluno.turno}</dd></div>
          <div><dt className="text-sm text-slate-500">Ano letivo</dt><dd className="mt-1 font-semibold">{aluno.anoLetivo}</dd></div>
          <div><dt className="text-sm text-slate-500">Data de nascimento</dt><dd className="mt-1 font-semibold">{aluno.dataNascimento ? formatarData(aluno.dataNascimento) : "Não indicada"}</dd></div>
          <div><dt className="text-sm text-slate-500">Encarregado</dt><dd className="mt-1 font-semibold">{aluno.nomeEncarregado ?? "Não indicado"}</dd></div>
          <div><dt className="text-sm text-slate-500">Contacto do encarregado</dt><dd className="mt-1"><a className="font-semibold text-teal-900 underline" href={`tel:${aluno.numeroEncarregado}`}>{aluno.numeroEncarregado}</a></dd></div>
          <div><dt className="text-sm text-slate-500">Contacto de emergência</dt><dd className="mt-1"><a className="font-semibold text-teal-900 underline" href={`tel:${aluno.numeroEmergencia}`}>{aluno.numeroEmergencia}</a></dd></div>
          <div><dt className="text-sm text-slate-500">Registado em</dt><dd className="mt-1 font-semibold">{new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium" }).format(new Date(aluno.criadoEm))}</dd></div>
        </dl>
      </section>
    );
  }

  if (separador === "ocorrencias") {
    const items = dados.ocorrencias ?? [];
    return (
      <section aria-labelledby="student-occurrences-title">
        <h2 className="sr-only" id="student-occurrences-title">Ocorrências do aluno</h2>
        {items.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">Este aluno ainda não tem ocorrências.</p> : (
          <ol className="space-y-3">
            {items.map((item) => (
              <li className="rounded-xl border border-slate-200 bg-white p-4" key={item.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-bold">{tipoOcorrencia[item.tipo]}</h3>
                  <time className="text-sm text-slate-600" dateTime={item.dataOcorrencia}>{formatarData(item.dataOcorrencia)}</time>
                </div>
                <p className="mt-2 text-sm text-slate-700">{item.descricao}</p>
                {item.gravidade && <p className="mt-2 text-sm text-slate-600">Gravidade: {item.gravidade}</p>}
                {item.local && <p className="mt-1 text-sm text-slate-600">Local: {item.local}</p>}
                {item.acaoTomada && <p className="mt-1 text-sm text-slate-600">Ação: {item.acaoTomada}</p>}
                <p className="mt-3 text-xs text-slate-500">Registada por {item.registadaPor.nome}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    );
  }

  if (separador === "notas") {
    return (
      <section aria-labelledby="student-grades-title">
        <h2 className="sr-only" id="student-grades-title">Notas do aluno</h2>
        {dados.notas.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">Ainda não há notas lançadas.</p> : (
          <ul className="space-y-3">
            {dados.notas.map((nota) => (
              <li className="rounded-xl border border-slate-200 bg-white p-4" key={`${nota.disciplinaId}-${nota.trimestre}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold">{nota.disciplinaNome}</h3>
                  <span className="text-sm text-slate-600">{nota.trimestre}.º trimestre</span>
                </div>
                <dl className="mt-3 grid grid-cols-4 gap-2 text-center">
                  {(["mac", "npp", "npt", "mt"] as const).map((field) => (
                    <div className="rounded-lg bg-slate-50 p-2" key={field}>
                      <dt className="text-xs uppercase text-slate-500">{field}</dt>
                      <dd className="mt-1 font-bold">{nota[field] ?? "—"}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return (
    <section aria-labelledby="student-absences-title">
      <h2 className="sr-only" id="student-absences-title">Faltas do aluno</h2>
      {dados.faltas.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">Ainda não há faltas registadas.</p> : (
        <ul className="space-y-3">
          {dados.faltas.map((falta) => (
            <li className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4" key={falta.id}>
              <div>
                <p className="font-bold">{formatarData(falta.data)}</p>
                <p className="mt-1 text-sm text-slate-600">{falta.disciplinaNome ?? "Sem disciplina associada"}</p>
                {falta.motivo && <p className="mt-1 text-sm text-slate-600">{falta.motivo}</p>}
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${falta.justificada ? "bg-green-100 text-green-900" : "bg-amber-100 text-amber-950"}`}>
                {falta.justificada ? "Justificada" : "Por justificar"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function AlunoPage() {
  const { id = "" } = useParams();
  const { utilizador } = useAuth();
  const [separador, setSeparador] = useState<Separador>("dados");
  const [estado, setEstado] = useState<EstadoAluno>("ATIVO");
  const [erroEstado, setErroEstado] = useState("");
  const [aGuardarEstado, setAGuardarEstado] = useState(false);
  const carregar = useCallback(async (): Promise<DadosAluno> => {
    const [aluno, notas, faltas, ocorrencias] = await Promise.all([
      obterAluno(id),
      listarNotasAluno(id),
      listarFaltas(id),
      utilizador?.papel === "COORDENADOR" ? listarOcorrenciasAluno(id) : Promise.resolve(null),
    ]);
    return {
      aluno: aluno.data,
      notas: notas.data,
      faltas: faltas.data,
      ocorrencias: ocorrencias?.data ?? null,
    };
  }, [id, utilizador?.papel]);
  const { data, erro, carregando, recarregar } = useAsyncData(carregar);
  useEffect(() => {
    if (data) setEstado(data.aluno.estado);
  }, [data]);

  async function guardarEstado(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAGuardarEstado(true);
    setErroEstado("");
    try {
      await mudarEstadoAluno(id, estado);
      recarregar();
    } catch (error) {
      setErroEstado(error instanceof ErroApiCliente ? error.message : error instanceof Error ? error.message : "Não foi possível alterar o estado.");
    } finally {
      setAGuardarEstado(false);
    }
  }
  const separadores: { id: Separador; nome: string; coordenador?: boolean }[] = [
    { id: "dados", nome: "Dados" },
    { id: "ocorrencias", nome: "Ocorrências", coordenador: true },
    { id: "notas", nome: "Notas" },
    { id: "faltas", nome: "Faltas" },
  ];

  return (
    <div className="space-y-5">
      <Link className="inline-flex min-h-11 items-center font-semibold text-teal-900 underline" to="/alunos">← Voltar aos alunos</Link>
      {carregando && <p className="rounded-xl bg-white p-5 text-slate-600" role="status">A carregar a ficha do aluno…</p>}
      {erro && (
        <section className="rounded-xl border border-red-200 bg-white p-5" role="alert">
          <h1 className="font-bold text-red-900">Não foi possível carregar o aluno</h1>
          <p className="mt-2 text-sm text-red-800">{erro}</p>
          <button className="mt-4 min-h-11 rounded-lg bg-teal-800 px-4 font-semibold text-white" onClick={recarregar}>Tentar novamente</button>
        </section>
      )}
      {!carregando && !erro && data && (
        <>
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-teal-800">Ficha do aluno</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">{data.aluno.nome}</h1>
              <p className="mt-1 text-slate-600">Processo {data.aluno.numeroProcesso}</p>
            </div>
            {utilizador?.papel === "COORDENADOR" && (
              <div className="flex flex-wrap gap-2">
                <Link className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-3 font-semibold text-slate-800" to={`/alunos/${id}/editar`}>Editar dados</Link>
                <Link className="inline-flex min-h-11 items-center rounded-lg bg-teal-800 px-3 font-semibold text-white" to={`/alunos/${id}/ocorrencias/nova`}>Registar ocorrência</Link>
                <Link className="inline-flex min-h-11 items-center rounded-lg border border-teal-800 px-3 font-semibold text-teal-900" to={`/alunos/${id}/faltas/nova`}>Registar falta</Link>
              </div>
            )}
            {utilizador?.papel === "PROFESSOR" && (
              <Link className="inline-flex min-h-11 items-center rounded-lg border border-teal-800 px-3 font-semibold text-teal-900" to={`/alunos/${id}/faltas/nova`}>Registar falta</Link>
            )}
          </header>
          <div aria-label="Secções da ficha do aluno" className="-mx-4 overflow-x-auto px-4">
            <div className="flex min-w-max gap-2 border-b border-slate-200">
              {separadores.filter((item) => !item.coordenador || utilizador?.papel === "COORDENADOR").map((item) => (
                <button
                  aria-current={separador === item.id ? "page" : undefined}
                  className={`min-h-12 border-b-2 px-4 font-semibold ${separador === item.id ? "border-teal-800 text-teal-900" : "border-transparent text-slate-600 hover:text-slate-900"}`}
                  key={item.id}
                  onClick={() => setSeparador(item.id)}
                  role="tab"
                  type="button"
                >
                  {item.nome}
                </button>
              ))}
            </div>
          </div>
          <div role="tabpanel">
            <PainelSeparador dados={data} separador={separador} />
          </div>
          {utilizador?.papel === "COORDENADOR" && separador === "dados" && (
            <form className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4" onSubmit={guardarEstado}>
              <div className="min-w-48 flex-1">
                <label className="block text-sm font-semibold" htmlFor="mudar-estado">Alterar estado</label>
                <select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" id="mudar-estado" value={estado} onChange={(event) => setEstado(event.target.value as EstadoAluno)}>
                  <option value="ATIVO">Ativo</option><option value="TRANSFERIDO">Transferido</option><option value="DESISTENTE">Desistente</option><option value="CONCLUIDO">Concluído</option>
                </select>
              </div>
              <button className="min-h-11 rounded-lg bg-slate-800 px-4 font-semibold text-white disabled:opacity-60" disabled={aGuardarEstado || estado === data.aluno.estado} type="submit">{aGuardarEstado ? "A guardar…" : "Atualizar estado"}</button>
              {erroEstado && <p className="w-full text-sm font-medium text-red-800" role="alert">{erroEstado}</p>}
            </form>
          )}
        </>
      )}
    </div>
  );
}
