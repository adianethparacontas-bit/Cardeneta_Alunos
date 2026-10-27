import { randomUUID } from 'node:crypto';
import type { Express } from 'express';
import request from 'supertest';
import { gerarHashDeSenha } from '../../src/modules/auth/senhas.js';
import type { Papel, UtilizadorArmazenado } from '../../src/modules/auth/tipos.js';
import { inserirUtilizador } from '../../src/modules/auth/utilizadores.repositorio.js';

/** Palavra-passe propria dos testes (nunca a do seed nem a de producao). */
export const SENHA_DE_TESTE = 'palavra-passe-de-teste-123';

interface OpcoesUtilizadorDeTeste {
  email: string;
  papel: Papel;
  nome?: string;
  disciplinaIds?: string[];
  senha?: string;
}

/** Cria um utilizador no armazenamento temporario e devolve-o. */
export async function criarUtilizadorDeTeste(
  opcoes: OpcoesUtilizadorDeTeste,
): Promise<UtilizadorArmazenado> {
  const utilizador: UtilizadorArmazenado = {
    id: randomUUID(),
    nome: opcoes.nome ?? 'Utilizador de Teste',
    email: opcoes.email,
    papel: opcoes.papel,
    disciplinaIds: opcoes.disciplinaIds ?? [],
    senhaHash: await gerarHashDeSenha(opcoes.senha ?? SENHA_DE_TESTE),
    criadoEm: new Date().toISOString(),
  };

  await inserirUtilizador(utilizador);

  return utilizador;
}

/** Faz login e devolve os cookies da resposta, prontos para usar no .set(). */
export async function sessaoDeTeste(
  app: Express,
  email: string,
  senha = SENHA_DE_TESTE,
): Promise<string[]> {
  const resposta = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, palavraPasse: senha });

  if (resposta.status !== 200) {
    throw new Error(`Login de teste falhou com o estado ${resposta.status}.`);
  }

  const cookies = resposta.headers['set-cookie'] as string[] | undefined;

  if (!cookies || cookies.length === 0) {
    throw new Error('O login de teste nao devolveu cookie de sessao.');
  }

  return cookies;
}
