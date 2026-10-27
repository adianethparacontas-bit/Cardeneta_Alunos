import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ErroApiCliente } from "../services/api-client";

export function LoginPage() {
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [palavraPasse, setPalavraPasse] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState("");
  const [aEntrar, setAEntrar] = useState(false);

  async function submeter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErros({});
    setErroGeral("");
    setAEntrar(true);
    try {
      await entrar(email.trim(), palavraPasse);
      const state = location.state as { from?: string } | null;
      navigate(state?.from ?? "/painel", { replace: true });
    } catch (error) {
      if (error instanceof ErroApiCliente) {
        setErros(error.campos ?? {});
        setErroGeral(error.message);
      } else {
        setErroGeral(error instanceof Error ? error.message : "Não foi possível iniciar sessão.");
      }
    } finally {
      setAEntrar(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-40px)] max-w-md items-center px-5 py-10">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-800">Cardeneta do Aluno</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-950">Iniciar sessão</h1>
        <p className="mt-2 text-slate-600">Entre com a conta da escola.</p>
        <form className="mt-7 space-y-5" onSubmit={submeter}>
          <div>
            <label className="block text-sm font-semibold text-slate-800" htmlFor="email">Email</label>
            <input
              autoComplete="username"
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
              aria-describedby={erros.email ? "email-error" : undefined}
            />
            {erros.email && <p className="mt-1 text-sm font-medium text-red-800" id="email-error">{erros.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-800" htmlFor="palavraPasse">Palavra-passe</label>
            <input
              autoComplete="current-password"
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
              id="palavraPasse"
              onChange={(event) => setPalavraPasse(event.target.value)}
              required
              type="password"
              value={palavraPasse}
              aria-describedby={erros.palavraPasse ? "password-error" : undefined}
            />
            {erros.palavraPasse && <p className="mt-1 text-sm font-medium text-red-800" id="password-error">{erros.palavraPasse}</p>}
          </div>
          {erroGeral && (
            <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-900" role="alert">
              {erroGeral}
            </p>
          )}
          <button
            className="min-h-12 w-full rounded-lg bg-teal-800 px-4 font-bold text-white hover:bg-teal-900 disabled:cursor-wait disabled:opacity-70"
            disabled={aEntrar}
            type="submit"
          >
            {aEntrar ? "A validar…" : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
