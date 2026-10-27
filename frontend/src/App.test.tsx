import { render, screen } from "@testing-library/react";
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

    expect(await screen.findByRole("heading", { name: "Painel inicial" })).toBeInTheDocument();
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
});
