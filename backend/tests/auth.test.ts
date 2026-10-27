import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { criarApp } from '../src/app.js';
import { env } from '../src/config/env.js';
import { tratadorDeErros } from '../src/errors/error-handler.js';
import { exigirAutenticacao, exigirPapel } from '../src/middlewares/autenticacao.js';
import { Papeis } from '../src/modules/auth/tipos.js';
import { limparDiretorio, usarDiretorioTemporario } from './ajuda/dados-temporarios.js';
import { criarUtilizadorDeTeste, SENHA_DE_TESTE, sessaoDeTeste } from './ajuda/autenticacao.js';

let diretorio: string;
let app: Express;

beforeEach(async () => {
  // Cada teste arranca com uma pasta de dados nova e uma aplicacao nova, para
  // os utilizadores e os contadores do limitador nao se misturarem.
  diretorio = await usarDiretorioTemporario();
  app = criarApp();
});

afterEach(async () => {
  await limparDiretorio(diretorio);
});

describe('POST /api/v1/auth/login', () => {
  it('entra com credenciais validas e devolve o utilizador sem a senha', async () => {
    const coordenador = await criarUtilizadorDeTeste({
      email: 'coord@teste.pt',
      papel: Papeis.COORDENADOR,
      nome: 'Coordenadora de Teste',
    });

    const resposta = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'coord@teste.pt', palavraPasse: SENHA_DE_TESTE });

    expect(resposta.status).toBe(200);
    expect(resposta.body.data).toEqual({
      id: coordenador.id,
      nome: 'Coordenadora de Teste',
      email: 'coord@teste.pt',
      papel: 'COORDENADOR',
      disciplinaIds: [],
    });
    expect(resposta.body.data.senhaHash).toBeUndefined();
    expect(resposta.body.data.criadoEm).toBeUndefined();

    const cookies = resposta.headers['set-cookie'] as unknown as string[];
    const cookieSessao = cookies.find((cookie) => cookie.startsWith('cardeneta_sessao='));

    expect(cookieSessao).toBeDefined();
    expect(cookieSessao).toContain('HttpOnly');
    expect(cookieSessao).toContain('SameSite=Lax');
  });

  it('aceita o email com maiusculas e espacos a volta', async () => {
    await criarUtilizadorDeTeste({ email: 'coord@teste.pt', papel: Papeis.COORDENADOR });

    const resposta = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: '  COORD@Teste.PT  ', palavraPasse: SENHA_DE_TESTE });

    expect(resposta.status).toBe(200);
    expect(resposta.body.data.email).toBe('coord@teste.pt');
  });

  it('rejeita palavra-passe errada com 401 CREDENCIAIS_INVALIDAS', async () => {
    await criarUtilizadorDeTeste({ email: 'coord@teste.pt', papel: Papeis.COORDENADOR });

    const resposta = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'coord@teste.pt', palavraPasse: 'senha-errada-123' });

    expect(resposta.status).toBe(401);
    expect(resposta.body.erro.codigo).toBe('CREDENCIAIS_INVALIDAS');
  });

  it('rejeita um email desconhecido com o mesmo 401', async () => {
    const resposta = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ninguem@teste.pt', palavraPasse: SENHA_DE_TESTE });

    expect(resposta.status).toBe(401);
    expect(resposta.body.erro.codigo).toBe('CREDENCIAIS_INVALIDAS');
  });

  it('rejeita um corpo invalido com 400 VALIDACAO_INVALIDA e campos', async () => {
    const resposta = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nao-e-email', palavraPasse: '' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.codigo).toBe('VALIDACAO_INVALIDA');
    expect(typeof resposta.body.erro.campos).toBe('object');
    expect(resposta.body.erro.campos.email).toBeDefined();
    expect(resposta.body.erro.campos.palavraPasse).toBeDefined();
  });

  it('bloqueia com 429 DEMASIADAS_TENTATIVAS depois de demasiadas falhas', async () => {
    for (let tentativa = 0; tentativa < env.LOGIN_MAX_TENTATIVAS; tentativa += 1) {
      const falha = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'ninguem@teste.pt', palavraPasse: 'senha-errada-123' });

      expect(falha.status).toBe(401);
    }

    const bloqueado = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ninguem@teste.pt', palavraPasse: 'senha-errada-123' });

    expect(bloqueado.status).toBe(429);
    expect(bloqueado.body.erro.codigo).toBe('DEMASIADAS_TENTATIVAS');
  });
});

describe('GET /api/v1/auth/me', () => {
  it('devolve 401 NAO_AUTENTICADO sem sessao', async () => {
    const resposta = await request(app).get('/api/v1/auth/me');

    expect(resposta.status).toBe(401);
    expect(resposta.body.erro.codigo).toBe('NAO_AUTENTICADO');
  });

  it('devolve 401 NAO_AUTENTICADO com um cookie invalido', async () => {
    const resposta = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', ['cardeneta_sessao=nao-e-um-token-valido']);

    expect(resposta.status).toBe(401);
    expect(resposta.body.erro.codigo).toBe('NAO_AUTENTICADO');
  });

  it('devolve o utilizador autenticado quando ha sessao', async () => {
    await criarUtilizadorDeTeste({
      email: 'prof@teste.pt',
      papel: Papeis.PROFESSOR,
      nome: 'Professor de Teste',
      disciplinaIds: ['disc-1'],
    });

    const cookies = await sessaoDeTeste(app, 'prof@teste.pt');
    const resposta = await request(app).get('/api/v1/auth/me').set('Cookie', cookies);

    expect(resposta.status).toBe(200);
    expect(resposta.body.data).toMatchObject({
      nome: 'Professor de Teste',
      email: 'prof@teste.pt',
      papel: 'PROFESSOR',
      disciplinaIds: ['disc-1'],
    });
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('devolve 204 e limpa o cookie de sessao', async () => {
    await criarUtilizadorDeTeste({ email: 'coord@teste.pt', papel: Papeis.COORDENADOR });

    const cookies = await sessaoDeTeste(app, 'coord@teste.pt');

    const saida = await request(app).post('/api/v1/auth/logout').set('Cookie', cookies);

    expect(saida.status).toBe(204);
    expect(saida.text).toBe('');

    // A sessao e um token sem estado no servidor: terminar a sessao e mandar o
    // browser apagar o cookie, por isso verificamos o Set-Cookie de limpeza.
    const cookiesDeSaida = saida.headers['set-cookie'] as unknown as string[];
    const cookieLimpo = cookiesDeSaida.find((cookie) => cookie.startsWith('cardeneta_sessao='));

    expect(cookieLimpo).toBeDefined();
    expect(cookieLimpo).toContain('cardeneta_sessao=;');
  });

  it('devolve 401 quando nao ha sessao', async () => {
    const resposta = await request(app).post('/api/v1/auth/logout');

    expect(resposta.status).toBe(401);
    expect(resposta.body.erro.codigo).toBe('NAO_AUTENTICADO');
  });
});

describe('exigirPapel', () => {
  function criarAppSoCoordenador(): Express {
    const appTeste = express();
    appTeste.use(express.json());
    appTeste.use(cookieParser());
    appTeste.get(
      '/so-coordenador',
      exigirAutenticacao,
      exigirPapel(Papeis.COORDENADOR),
      (req, res) => {
        res.json({ data: { papel: req.utilizador?.papel } });
      },
    );
    appTeste.use(tratadorDeErros);

    return appTeste;
  }

  it('deixa passar um coordenador', async () => {
    await criarUtilizadorDeTeste({ email: 'coord@teste.pt', papel: Papeis.COORDENADOR });

    const cookies = await sessaoDeTeste(app, 'coord@teste.pt');
    const resposta = await request(criarAppSoCoordenador())
      .get('/so-coordenador')
      .set('Cookie', cookies);

    expect(resposta.status).toBe(200);
    expect(resposta.body.data.papel).toBe('COORDENADOR');
  });

  it('devolve 403 SEM_PERMISSAO a um professor', async () => {
    await criarUtilizadorDeTeste({ email: 'prof@teste.pt', papel: Papeis.PROFESSOR });

    const cookies = await sessaoDeTeste(app, 'prof@teste.pt');
    const resposta = await request(criarAppSoCoordenador())
      .get('/so-coordenador')
      .set('Cookie', cookies);

    expect(resposta.status).toBe(403);
    expect(resposta.body.erro.codigo).toBe('SEM_PERMISSAO');
  });
});
