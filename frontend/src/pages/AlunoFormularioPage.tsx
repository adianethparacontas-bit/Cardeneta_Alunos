import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { ErroApiCliente } from "../services/api-client";
import { atualizarAluno, criarAluno, mudarEstadoAluno, obterAluno } from "../services/alunos";
import type { Aluno, EstadoAluno, NovoAluno, Turno } from "../types/api";

type CamposAluno = {
  nome: string;
  classe: string;
  turma: string;
  turno: Turno | "";
  anoLetivo: string;
  numeroEmergencia: string;
  numeroEncarregado: string;
  nomeEncarregado: string;
  dataNascimento: string;
};

const camposVazios: CamposAluno = {
  nome: "",
  classe: "",
  turma: "",
  turno: "",
  anoLetivo: "2026/2027",
  numeroEmergencia: "",
  numeroEncarregado: "",
  nomeEncarregado: "",
  dataNascimento: "",
};

const estadoOptions: { valor: EstadoAluno; rotulo: string }[] = [
  { valor: "ATIVO", rotulo: "Ativo" },
  { valor: "TRANSFERIDO", rotulo: "Transferido" },
  { valor: "DESISTENTE", rotulo: "Desistente" },
  { valor: "CONCLUIDO", rotulo: "Concluído" },
];

export function AlunoFormularioPage() {
  const { id } = useParams();
  const navegar = useNavigate();
  const editar = Boolean(id);
  const [campos, setCampos] = useState<CamposAluno>(camposVazios);
  const [estado, setEstado] = useState<EstadoAluno>("ATIVO");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState("");
  const [aGuardar, setAGuardar] = useState(false);
  const carregar = useCallback(async () => (id ? (await obterAluno(id)).data : null), [id]);
  const { data: aluno, erro: erroCarregamento, carregando, recarregar } = useAsyncData(carregar);

  useEffect(() => {
    if (!aluno) return;
    setCampos({
      nome: aluno.nome,
      classe: String(aluno.classe),
      turma: aluno.turma,
      turno: aluno.turno,
      anoLetivo: aluno.anoLetivo,
      numeroEmergencia: aluno.numeroEmergencia,
      numeroEncarregado: aluno.numeroEncarregado,
      nomeEncarregado: aluno.nomeEncarregado ?? "",
      dataNascimento: aluno.dataNascimento ?? "",
    });
    setEstado(aluno.estado);
  }, [aluno]);

  function atualizarCampo<K extends keyof CamposAluno>(campo: K, valor: CamposAluno[K]) {
    setCampos((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: "" }));
  }

  async function submeter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAGuardar(true);
    setErros({});
    setErroGeral("");
    const body: NovoAluno = {
      nome: campos.nome.trim(),
      classe: Number(campos.classe),
      turma: campos.turma.trim(),
      turno: campos.turno as Turno,
      anoLetivo: campos.anoLetivo.trim(),
      numeroEmergencia: campos.numeroEmergencia.trim(),
      numeroEncarregado: campos.numeroEncarregado.trim(),
      ...(campos.nomeEncarregado.trim() ? { nomeEncarregado: campos.nomeEncarregado.trim() } : {}),
      ...(campos.dataNascimento ? { dataNascimento: campos.dataNascimento } : {}),
    };
    try {
      let resultado: Aluno;
      if (id) {
        resultado = (await atualizarAluno(id, body)).data;
        if (estado !== resultado.estado) resultado = (await mudarEstadoAluno(id, estado)).data;
      } else {
        resultado = (await criarAluno(body)).data;
      }
      navegar(`/alunos/${resultado.id}`, { replace: true });
    } catch (error) {
      if (error instanceof ErroApiCliente) {
        setErros(error.campos ?? {});
        setErroGeral(error.message);
      } else {
        setErroGeral(error instanceof Error ? error.message : "Não foi possível guardar o aluno.");
      }
    } finally {
      setAGuardar(false);
    }
  }

  if (carregando) return <p className="p-6 text-slate-600" role="status">A carregar o formulário…</p>;
  if (erroCarregamento) return (
    <section className="rounded-xl border border-red-200 bg-white p-5" role="alert">
      <h1 className="font-bold text-red-900">Não foi possível carregar o aluno</h1>
      <p className="mt-2 text-sm text-red-800">{erroCarregamento}</p>
      <button className="mt-3 min-h-11 rounded-lg bg-teal-800 px-4 font-semibold text-white" onClick={recarregar}>Tentar novamente</button>
    </section>
  );
  if (editar && !aluno) return <p className="p-6 text-slate-600">Aluno não encontrado.</p>;

  const erroCampo = (campo: keyof CamposAluno) => erros[campo] ? (
    <p className="mt-1 text-sm font-medium text-red-800" id={`${campo}-erro`}>{erros[campo]}</p>
  ) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link className="inline-flex min-h-11 items-center font-semibold text-teal-900 underline" to={id ? `/alunos/${id}` : "/alunos"}>← Voltar</Link>
      <header>
        <p className="text-sm font-semibold text-teal-800">Gestão de alunos</p>
        <h1 className="mt-1 text-2xl font-bold">{editar ? "Editar aluno" : "Adicionar aluno"}</h1>
      </header>
      <form className="space-y-5 rounded-xl border border-slate-200 bg-white p-5" onSubmit={submeter}>
        {erroGeral && <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-900" role="alert">{erroGeral}</p>}
        <div>
          <label className="block text-sm font-semibold" htmlFor="nome">Nome completo</label>
          <input aria-describedby={erros.nome ? "nome-erro" : undefined} className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="nome" onChange={(event) => atualizarCampo("nome", event.target.value)} required value={campos.nome} />
          {erroCampo("nome")}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold" htmlFor="classe">Classe</label>
            <select aria-describedby={erros.classe ? "classe-erro" : undefined} className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="classe" onChange={(event) => atualizarCampo("classe", event.target.value)} required value={campos.classe}>
              <option value="">Selecione</option>{Array.from({ length: 13 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}.ª classe</option>)}
            </select>
            {erroCampo("classe")}
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="turma">Turma</label>
            <input aria-describedby={erros.turma ? "turma-erro" : undefined} className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="turma" onChange={(event) => atualizarCampo("turma", event.target.value)} required value={campos.turma} />
            {erroCampo("turma")}
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="turno">Turno</label>
            <select aria-describedby={erros.turno ? "turno-erro" : undefined} className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="turno" onChange={(event) => atualizarCampo("turno", event.target.value as Turno | "")} required value={campos.turno}>
              <option value="">Selecione</option><option value="MANHA">Manhã</option><option value="TARDE">Tarde</option><option value="NOITE">Noite</option>
            </select>
            {erroCampo("turno")}
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="anoLetivo">Ano letivo</label>
            <input aria-describedby={erros.anoLetivo ? "anoLetivo-erro" : undefined} className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="anoLetivo" onChange={(event) => atualizarCampo("anoLetivo", event.target.value)} required value={campos.anoLetivo} />
            {erroCampo("anoLetivo")}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold" htmlFor="numeroEmergencia">Telefone de emergência</label>
            <input aria-describedby={erros.numeroEmergencia ? "numeroEmergencia-erro" : undefined} className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="numeroEmergencia" inputMode="tel" placeholder="923456789" required value={campos.numeroEmergencia} onChange={(event) => atualizarCampo("numeroEmergencia", event.target.value)} />
            {erroCampo("numeroEmergencia")}
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="numeroEncarregado">Telefone do encarregado</label>
            <input aria-describedby={erros.numeroEncarregado ? "numeroEncarregado-erro" : undefined} className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="numeroEncarregado" inputMode="tel" placeholder="923456789" required value={campos.numeroEncarregado} onChange={(event) => atualizarCampo("numeroEncarregado", event.target.value)} />
            {erroCampo("numeroEncarregado")}
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="nomeEncarregado">Nome do encarregado (opcional)</label>
            <input aria-describedby={erros.nomeEncarregado ? "nomeEncarregado-erro" : undefined} className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="nomeEncarregado" value={campos.nomeEncarregado} onChange={(event) => atualizarCampo("nomeEncarregado", event.target.value)} />
            {erroCampo("nomeEncarregado")}
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="dataNascimento">Data de nascimento (opcional)</label>
            <input aria-describedby={erros.dataNascimento ? "dataNascimento-erro" : undefined} className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="dataNascimento" type="date" value={campos.dataNascimento} onChange={(event) => atualizarCampo("dataNascimento", event.target.value)} />
            {erroCampo("dataNascimento")}
          </div>
        </div>
        {editar && (
          <div>
            <label className="block text-sm font-semibold" htmlFor="estado">Estado do aluno</label>
            <select className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3" id="estado" value={estado} onChange={(event) => setEstado(event.target.value as EstadoAluno)}>
              {estadoOptions.map((option) => <option key={option.valor} value={option.valor}>{option.rotulo}</option>)}
            </select>
          </div>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 px-4 font-semibold" to={id ? `/alunos/${id}` : "/alunos"}>Cancelar</Link>
          <button className="min-h-12 rounded-lg bg-teal-800 px-5 font-bold text-white disabled:opacity-70" disabled={aGuardar} type="submit">{aGuardar ? "A guardar…" : "Guardar aluno"}</button>
        </div>
      </form>
    </div>
  );
}
