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

  it("cria um aluno com telefone normalizado", async () => {
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
    await user.click(await screen.findByRole("link", { name: "Adicionar aluno" }));
    await user.type(screen.getByLabelText("Nome completo"), "Yara Teste");
    await user.selectOptions(screen.getByLabelText("Classe"), "7");
    await user.type(screen.getByLabelText("Turma"), "Z");
    await user.selectOptions(screen.getByLabelText("Turno"), "MANHA");
    await user.type(screen.getByLabelText("Ano letivo"), "2026/2027");
    await user.type(screen.getByLabelText("Telefone de emergência"), "923456780");
    await user.type(screen.getByLabelText("Telefone do encarregado"), "+244923456781");
    await user.click(screen.getByRole("button", { name: "Guardar aluno" }));

    expect(await screen.findByRole("heading", { name: "Yara Teste" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+244923456781" })).toHaveAttribute("href", "tel:+244923456781");
  });

  it("regista um elogio sem apresentar o campo gravidade", async () => {
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
    await user.click(await screen.findByRole("link", { name: "Registar ocorrência" }));
    await user.selectOptions(screen.getByLabelText("Tipo de ocorrência"), "ELOGIO");
    expect(screen.queryByLabelText("Gravidade")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Descrição"), "Participou ativamente na aula.");
    await user.click(screen.getByRole("button", { name: "Registar ocorrência" }));

    expect(await screen.findByRole("heading", { name: "Ana Kiala" })).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Ocorrências" }));
    expect(await screen.findByText("Participou ativamente na aula.")).toBeInTheDocument();
  });

  it("permite ao professor registar uma falta na sua disciplina", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "prof1@cardeneta.test");
    await user.type(screen.getByLabelText("Palavra-passe"), "demo123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    await user.click((await screen.findAllByRole("link", { name: "Alunos" }))[0]!);
    await user.click(await screen.findByRole("link", { name: "Ana Kiala" }));
    expect(screen.queryByRole("tab", { name: "Ocorrências" })).not.toBeInTheDocument();
    await user.click(await screen.findByRole("link", { name: "Registar falta" }));
    await user.selectOptions(await screen.findByLabelText(/Disciplina/), "d-port");
    await user.click(screen.getByRole("button", { name: "Registar falta" }));

    expect(await screen.findByRole("heading", { name: "Ana Kiala" })).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Faltas" }));
    expect(await screen.findAllByText("Língua Portuguesa")).toHaveLength(2);
  });

  it("pede motivo ao professor ao corrigir uma nota lançada", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "prof1@cardeneta.test");
    await user.type(screen.getByLabelText("Palavra-passe"), "demo123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    await user.click((await screen.findAllByRole("link", { name: "Notas" }))[0]!);
    const mac = await screen.findByRole("spinbutton", { name: "MAC - Ana Kiala" });
    await user.clear(mac);
    await user.type(mac, "19");

    const motivo = screen.getByLabelText("Motivo da correção — Ana Kiala");
    expect(motivo).toBeRequired();
    await user.type(motivo, "Correção após revisão da avaliação.");
    await user.click(screen.getByRole("button", { name: "Guardar nota Ana Kiala" }));

    expect(await screen.findByText("Nota guardada.")).toBeInTheDocument();
    expect(screen.getByText("MT: 12")).toBeInTheDocument();
  });

  it("combina filtros de tipo, gravidade e datas de ocorrências", async () => {
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
    await user.click(screen.getByText("Filtros avançados"));
    await user.selectOptions(screen.getByLabelText("Tipo de ocorrência"), "ELOGIO");
    await user.selectOptions(screen.getByLabelText("Gravidade"), "LEVE");
    await user.type(screen.getByLabelText("Ocorrências desde"), "2026-09-01");
    await user.type(screen.getByLabelText("Ocorrências até"), "2026-09-30");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));

    expect(await screen.findByText("Não encontrámos alunos com estes filtros.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Bento Miguel" })).not.toBeInTheDocument();
  });

  it("mostra boletim imprimível ao coordenador com ocorrências recentes", async () => {
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
    await user.click(await screen.findByRole("link", { name: "Ver boletim" }));

    expect(await screen.findByRole("heading", { name: "Boletim escolar" })).toBeInTheDocument();
    expect(await screen.findByText("Ocorrências recentes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Imprimir boletim" })).toBeInTheDocument();
    expect(screen.getByText("Língua Portuguesa")).toBeInTheDocument();
  });

  it("omite ocorrências do boletim visto pelo professor", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "prof1@cardeneta.test");
    await user.type(screen.getByLabelText("Palavra-passe"), "demo123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    await user.click((await screen.findAllByRole("link", { name: "Alunos" }))[0]!);
    await user.click(await screen.findByRole("link", { name: "Ana Kiala" }));
    await user.click(await screen.findByRole("link", { name: "Ver boletim" }));

    expect(await screen.findByRole("heading", { name: "Boletim escolar" })).toBeInTheDocument();
    expect(screen.queryByText("Ocorrências recentes")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Imprimir boletim" })).toBeInTheDocument();
  });
});
