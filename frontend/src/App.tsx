import { Link, Route, Routes } from "react-router-dom";

function Inicio() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
        Cardeneta do Aluno
      </p>
      <h1 className="mt-3 text-3xl font-bold text-slate-950">
        Acompanhar cada percurso.
      </h1>
      <p className="mt-3 text-slate-600">
        Acesso simples e seguro a alunos, notas, faltas e ocorrencias.
      </p>
      <Link
        className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-teal-800 px-5 font-semibold text-white hover:bg-teal-900"
        to="/login"
      >
        Entrar na plataforma
      </Link>
    </main>
  );
}

function Login() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold text-slate-950">Entrar</h1>
      <p className="mt-3 text-slate-600">
        A autenticacao sera ligada ao contrato da API.
      </p>
      <Link className="mt-6 inline-block min-h-12 text-teal-800 underline" to="/">
        Voltar ao inicio
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Inicio />} />
    </Routes>
  );
}
