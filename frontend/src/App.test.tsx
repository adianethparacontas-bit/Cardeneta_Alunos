import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider } from "./auth/AuthContext";
import App from "./App";
import { reiniciarMocks } from "./mocks/api";

describe("aplicacao", () => {
  beforeEach(() => reiniciarMocks());

  it("apresenta o login e o modo demonstração", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /iniciar sessão/i })).toBeInTheDocument();
    expect(screen.getByText(/modo demonstração \(dados falsos\)/i)).toBeInTheDocument();
  });

  it("inicia sessão e abre o painel", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "coord1@cardeneta.test");
    await user.type(screen.getByLabelText("Palavra-passe"), "demo123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("heading", { name: "Visão geral" })).toBeInTheDocument();
  });

  it("mostra o erro de credenciais inválidas", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "coord1@cardeneta.test");
    await user.type(screen.getByLabelText("Palavra-passe"), "errada");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/incorretos/i);
  });

  it("filtra a lista de alunos por classe", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "coord1@cardeneta.test");
    await user.type(screen.getByLabelText("Palavra-passe"), "demo123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    await user.click((await screen.findAllByRole("link", { name: "Alunos" }))[0]!);
    await user.selectOptions(screen.getByLabelText("Classe"), "8");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));

    const alunoLink = await screen.findByRole("link", { name: "Bento Miguel" });
    expect(alunoLink).toBeInTheDocument();
    const cartao = alunoLink.closest("article");
    expect(cartao).not.toBeNull();
    expect(within(cartao as HTMLElement).getByRole("link", { name: "Encarregado" })).toHaveAttribute(
      "href",
      "tel:+244923100002",
    );
  });

  it("apresenta os separadores do aluno e detalhes das ocorrências", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "coord1@cardeneta.test");
    await user.type(screen.getByLabelText("Palavra-passe"), "demo123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    await user.click((await screen.findAllByRole("link", { name: "Alunos" }))[0]!);
    await user.click(await screen.findByRole("link", { name: "Ana Kiala" }));

    expect(await screen.findByRole("heading", { name: "Dados do aluno" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Ocorrências" })).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Ocorrências" }));
    expect(await screen.findByText(/chegada após o início da aula/i)).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Notas" }));
    expect(screen.getByText("Língua Portuguesa")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Faltas" }));
    expect(await screen.findByText("Consulta médica")).toBeInTheDocument();
  });
});
