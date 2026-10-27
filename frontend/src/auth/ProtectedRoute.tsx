import type { PropsWithChildren } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Papel } from "../types/api";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({ papeis }: { papeis?: Papel[] }) {
  const { utilizador, carregando } = useAuth();
  const location = useLocation();

  if (carregando) {
    return <p className="p-6 text-center text-slate-600" role="status">A verificar sessão…</p>;
  }
  if (!utilizador) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (papeis && !papeis.includes(utilizador.papel)) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-xl font-bold">Acesso não permitido</h1>
        <p className="mt-2 text-slate-600">O seu perfil não tem acesso a esta área.</p>
      </main>
    );
  }
  return <Outlet />;
}

export function ProtectedContent({ children, papeis }: PropsWithChildren<{ papeis?: Papel[] }>) {
  const { utilizador, carregando } = useAuth();
  if (carregando) return <p role="status">A verificar sessão…</p>;
  if (!utilizador) return <Navigate to="/login" replace />;
  if (papeis && !papeis.includes(utilizador.papel)) return <Navigate to="/" replace />;
  return children;
}
