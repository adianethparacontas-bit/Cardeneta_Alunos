import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "./auth/AuthContext";
import App from "./App";

describe("aplicacao", () => {
  it("apresenta a entrada da plataforma", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /acompanhar cada percurso/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /entrar na plataforma/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
