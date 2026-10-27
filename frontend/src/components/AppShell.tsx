import { BookOpenCheck, ClipboardList, Home, LogOut, Search, Users } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function AppShell() {
  const { utilizador, sair } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: "/painel", label: "Início", Icon: Home, papeis: ["COORDENADOR", "PROFESSOR"] },
    { to: "/alunos", label: "Alunos", Icon: Users, papeis: ["COORDENADOR", "PROFESSOR"] },
    { to: "/pesquisa", label: "Pesquisa", Icon: Search, papeis: ["COORDENADOR", "PROFESSOR"] },
    { to: "/notas", label: "Notas", Icon: BookOpenCheck, papeis: ["COORDENADOR", "PROFESSOR"] },
    { to: "/ocorrencias", label: "Ocorrências", Icon: ClipboardList, papeis: ["COORDENADOR"] },
  ].filter((link) => utilizador && link.papeis.includes(utilizador.papel));

  async function terminarSessao() {
    try {
      await sair();
      navigate("/login", { replace: true });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Não foi possível terminar a sessão.");
    }
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4">
          <NavLink className="font-bold tracking-tight text-teal-900" to="/painel">Cardeneta</NavLink>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">{utilizador?.nome}</span>
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              onClick={terminarSessao}
              type="button"
            >
              <LogOut aria-hidden="true" size={18} />
              <span className="sr-only sm:not-sr-only">Sair</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:static md:border-0"
      >
        <ul className="mx-auto flex min-h-16 max-w-3xl items-stretch justify-around md:hidden">
          {links.slice(0, 4).map(({ to, label, Icon }) => (
            <li className="flex flex-1" key={to}>
              <NavLink
                className={({ isActive }) =>
                  `flex min-h-14 flex-1 flex-col items-center justify-center gap-1 px-1 text-xs font-medium ${
                    isActive ? "text-teal-800" : "text-slate-500"
                  }`
                }
                to={to}
              >
                <Icon aria-hidden="true" size={20} />
                {label}
              </NavLink>
            </li>
          ))}
          {utilizador?.papel === "COORDENADOR" && (
            <li className="flex flex-1">
              <NavLink
                className={({ isActive }) =>
                  `flex min-h-14 flex-1 flex-col items-center justify-center gap-1 px-1 text-xs font-medium ${
                    isActive ? "text-teal-800" : "text-slate-500"
                  }`
                }
                to="/ocorrencias"
              >
                <ClipboardList aria-hidden="true" size={20} />
                Ocorrências
              </NavLink>
            </li>
          )}
        </ul>
        <ul className="mx-auto hidden max-w-6xl gap-2 px-4 md:flex">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100" to={to}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
