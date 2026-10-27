import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { DemoBanner } from "./components/DemoBanner";
import { AppShell } from "./components/AppShell";
import { AlunosPage } from "./pages/AlunosPage";
import { AlunoPage } from "./pages/AlunoPage";
import { AlunoFormularioPage } from "./pages/AlunoFormularioPage";
import { FaltaFormularioPage } from "./pages/FaltaFormularioPage";
import { LoginPage } from "./pages/LoginPage";
import { OcorrenciaFormularioPage } from "./pages/OcorrenciaFormularioPage";
import { NotasPage } from "./pages/NotasPage";
import { PainelPage } from "./pages/PainelPage";

function UnauthorizedRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const redirect = () => navigate("/login", { replace: true });
    window.addEventListener("api:nao-autenticado", redirect);
    return () => window.removeEventListener("api:nao-autenticado", redirect);
  }, [navigate]);
  return null;
}

function Placeholder({ titulo }: { titulo: string }) {
  return <h1 className="text-2xl font-bold">{titulo}</h1>;
}

export default function App() {
  return (
    <>
      <DemoBanner />
      <UnauthorizedRedirect />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/painel" replace />} />
            <Route path="/painel" element={<PainelPage />} />
            <Route path="/alunos" element={<AlunosPage />} />
            <Route path="/alunos/:id/faltas/nova" element={<FaltaFormularioPage />} />
            <Route path="/alunos/:id" element={<AlunoPage />} />
            <Route path="/pesquisa" element={<Placeholder titulo="Pesquisa avançada" />} />
            <Route path="/notas" element={<NotasPage />} />
            <Route path="/boletim/:id" element={<Placeholder titulo="Boletim" />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute papeis={["COORDENADOR"]} />}>
          <Route element={<AppShell />}>
            <Route path="/ocorrencias" element={<Placeholder titulo="Ocorrências" />} />
            <Route path="/alunos/:id/editar" element={<AlunoFormularioPage />} />
            <Route path="/alunos/:id/ocorrencias/nova" element={<OcorrenciaFormularioPage />} />
            <Route path="/alunos/novo" element={<AlunoFormularioPage />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/painel" replace />} />
        <Route path="*" element={<Navigate to="/painel" replace />} />
      </Routes>
    </>
  );
}
