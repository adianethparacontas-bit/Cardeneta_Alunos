import type { Express } from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { criarApp } from '../src/app.js';
import { Papeis } from '../src/modules/auth/tipos.js';
import { limparDiretorio, usarDiretorioTemporario } from './ajuda/dados-temporarios.js';
import { criarUtilizadorDeTeste, sessaoDeTeste } from './ajuda/autenticacao.js';

let diretorio: string;
let app: Express;
let cookiesCoordenador: string[];
let cookiesProfessor: string[];

function alunoValido(extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    nome: 'Ana Maria Silva',
    classe: 7,
    turma: 'A',
    turno: 'MANHA',
    anoLetivo: '2026/2027',
    numeroEmergencia: '923456789',
    numeroEncarregado: '+244911222333',
    nomeEncarregado: 'Joao Silva',
    dataNascimento: '2013-05-10',
    ...extra,
  };
}

beforeEach(async () => {
  diretorio = await usarDiretorioTemporario();
  app = criarApp();

  await criarUtilizadorDeTeste({ email: 'coord@teste.pt', papel: Papeis.COORDENADOR });
  await criarUtilizadorDeTeste({ email: 'prof@teste.pt', papel: Papeis.PROFESSOR });

  cookiesCoordenador = await sessaoDeTeste(app, 'coord@teste.pt');
  cookiesProfessor = await sessaoDeTeste(app, 'prof@teste.pt');
});

afterEach(async () => {
  await limparDiretorio(diretorio);
});

describe('POST /api/v1/alunos', () => {
  it('cria um aluno com numero de processo gerado, estado ATIVO e telefones normalizados', async () => {
    const resposta = await request(app)
      .post('/api/v1/alunos')
      .set('Cookie', cookiesCoordenador)
      .send(alunoValido());

    expect(resposta.status).toBe(201);
    expect(resposta.body.data.numeroProcesso).toBe('2026-0001');
    expect(resposta.body.data.estado).toBe('ATIVO');
    expect(resposta.body.data.numeroEmergencia).toBe('+244923456789');
    expect(resposta.body.data.numeroEncarregado).toBe('+244911222333');
    expect(resposta.body.data.id).toBeTypeOf('string');
    expect(resposta.body.data.criadoEm).toBeTypeOf('string');
  });

  it('incrementa o numero de processo por ano letivo', async () => {
    await request(app).post('/api/v1/alunos').set('Cookie', cookiesCoordenador).send(alunoValido());
    const segundo = await request(app)
      .post('/api/v1/alunos')
      .set('Cookie', cookiesCoordenador)
      .send(alunoValido({ nome: 'Bruno Costa', turma: 'B' }));

    expect(segundo.status).toBe(201);
    expect(segundo.body.data.numeroProcesso).toBe('2026-0002');
  });

  it('rejeita um duplicado com 409 ALUNO_DUPLICADO', async () => {
    await request(app).post('/api/v1/alunos').set('Cookie', cookiesCoordenador).send(alunoValido());

    const repetido = await request(app)
      .post('/api/v1/alunos')
      .set('Cookie', cookiesCoordenador)
      .send(alunoValido({ nome: 'ana maria silva' }));

    expect(repetido.status).toBe(409);
    expect(repetido.body.erro.codigo).toBe('ALUNO_DUPLICADO');
  });

  it('rejeita telefones invalidos com 400 e o campo certo', async () => {
    const resposta = await request(app)
      .post('/api/v1/alunos')
      .set('Cookie', cookiesCoordenador)
      .send(alunoValido({ numeroEmergencia: '123' }));

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.codigo).toBe('VALIDACAO_INVALIDA');
    expect(resposta.body.erro.campos.numeroEmergencia).toBeDefined();
  });

  it('rejeita um corpo invalido com 400 e os campos em falta', async () => {
    const resposta = await request(app)
      .post('/api/v1/alunos')
      .set('Cookie', cookiesCoordenador)
      .send({ nome: '' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.codigo).toBe('VALIDACAO_INVALIDA');
    expect(resposta.body.erro.campos.nome).toBeDefined();
    expect(resposta.body.erro.campos.classe).toBeDefined();
    expect(resposta.body.erro.campos.turno).toBeDefined();
  });

  it('devolve 403 a um professor', async () => {
    const resposta = await request(app)
      .post('/api/v1/alunos')
      .set('Cookie', cookiesProfessor)
      .send(alunoValido());

    expect(resposta.status).toBe(403);
    expect(resposta.body.erro.codigo).toBe('SEM_PERMISSAO');
  });

  it('devolve 401 sem sessao', async () => {
    const resposta = await request(app).post('/api/v1/alunos').send(alunoValido());

    expect(resposta.status).toBe(401);
    expect(resposta.body.erro.codigo).toBe('NAO_AUTENTICADO');
  });
});

describe('GET /api/v1/alunos', () => {
  async function semear(): Promise<void> {
    const alunos = [
      alunoValido({ nome: 'Ana Maria Silva', classe: 7, turma: 'A', turno: 'MANHA' }),
      alunoValido({ nome: 'Bruno Costa', classe: 7, turma: 'B', turno: 'TARDE' }),
      alunoValido({ nome: 'Carla Dias', classe: 8, turma: 'A', turno: 'MANHA' }),
    ];

    for (const aluno of alunos) {
      await request(app).post('/api/v1/alunos').set('Cookie', cookiesCoordenador).send(aluno);
    }
  }

  it('devolve a lista paginada com meta', async () => {
    await semear();

    const resposta = await request(app)
      .get('/api/v1/alunos?pagina=1&limite=2')
      .set('Cookie', cookiesCoordenador);

    expect(resposta.status).toBe(200);
    expect(resposta.body.data).toHaveLength(2);
    expect(resposta.body.data[0].nome).toBe('Ana Maria Silva');
    expect(resposta.body.meta).toEqual({ pagina: 1, limite: 2, total: 3 });
  });

  it('filtra por classe, turma, turno e estado', async () => {
    await semear();

    const porClasse = await request(app)
      .get('/api/v1/alunos?classe=7')
      .set('Cookie', cookiesCoordenador);
    expect(porClasse.body.meta.total).toBe(2);

    const porTurma = await request(app)
      .get('/api/v1/alunos?classe=7&turma=B')
      .set('Cookie', cookiesCoordenador);
    expect(porTurma.body.meta.total).toBe(1);
    expect(porTurma.body.data[0].nome).toBe('Bruno Costa');

    const porTurno = await request(app)
      .get('/api/v1/alunos?turno=MANHA')
      .set('Cookie', cookiesCoordenador);
    expect(porTurno.body.meta.total).toBe(2);

    const porEstado = await request(app)
      .get('/api/v1/alunos?estado=TRANSFERIDO')
      .set('Cookie', cookiesCoordenador);
    expect(porEstado.body.meta.total).toBe(0);
  });

  it('procura por nome ignorando acentos e maiusculas', async () => {
    await semear();

    const resposta = await request(app)
      .get('/api/v1/alunos?q=ANA')
      .set('Cookie', cookiesCoordenador);

    expect(resposta.body.meta.total).toBe(1);
    expect(resposta.body.data[0].nome).toBe('Ana Maria Silva');
  });

  it('mostra os contadores de ocorrencias ao coordenador e esconde-os ao professor', async () => {
    await semear();

    const doCoordenador = await request(app)
      .get('/api/v1/alunos')
      .set('Cookie', cookiesCoordenador);
    expect(doCoordenador.body.data[0].totalOcorrencias).toBe(0);
    expect(doCoordenador.body.data[0].ultimaOcorrenciaEm).toBeNull();

    const doProfessor = await request(app).get('/api/v1/alunos').set('Cookie', cookiesProfessor);
    expect(doProfessor.status).toBe(200);
    expect(doProfessor.body.data[0].totalOcorrencias).toBeNull();
    expect(doProfessor.body.data[0].ultimaOcorrenciaEm).toBeNull();
  });

  it('devolve 401 sem sessao', async () => {
    const resposta = await request(app).get('/api/v1/alunos');

    expect(resposta.status).toBe(401);
    expect(resposta.body.erro.codigo).toBe('NAO_AUTENTICADO');
  });
});

describe('GET /api/v1/alunos/:id', () => {
  it('devolve o aluno pedido', async () => {
    const criado = await request(app)
      .post('/api/v1/alunos')
      .set('Cookie', cookiesCoordenador)
      .send(alunoValido());

    const resposta = await request(app)
      .get(`/api/v1/alunos/${criado.body.data.id}`)
      .set('Cookie', cookiesProfessor);

    expect(resposta.status).toBe(200);
    expect(resposta.body.data.numeroProcesso).toBe('2026-0001');
  });

  it('devolve 404 quando o aluno nao existe', async () => {
    const resposta = await request(app)
      .get('/api/v1/alunos/nao-existe')
      .set('Cookie', cookiesCoordenador);

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.codigo).toBe('NAO_ENCONTRADO');
  });
});

describe('PATCH /api/v1/alunos/:id', () => {
  async function criarUm(): Promise<string> {
    const criado = await request(app)
      .post('/api/v1/alunos')
      .set('Cookie', cookiesCoordenador)
      .send(alunoValido());

    return criado.body.data.id as string;
  }

  it('atualiza campos e normaliza os telefones, sem mexer no numero de processo', async () => {
    const id = await criarUm();

    const resposta = await request(app)
      .patch(`/api/v1/alunos/${id}`)
      .set('Cookie', cookiesCoordenador)
      .send({ nome: 'Ana Maria Silva Santos', numeroEncarregado: '911222333' });

    expect(resposta.status).toBe(200);
    expect(resposta.body.data.nome).toBe('Ana Maria Silva Santos');
    expect(resposta.body.data.numeroEncarregado).toBe('+244911222333');
    expect(resposta.body.data.numeroProcesso).toBe('2026-0001');
  });

  it('devolve 404 quando o aluno nao existe', async () => {
    const resposta = await request(app)
      .patch('/api/v1/alunos/nao-existe')
      .set('Cookie', cookiesCoordenador)
      .send({ nome: 'Nova Pessoa' });

    expect(resposta.status).toBe(404);
  });

  it('devolve 403 a um professor', async () => {
    const id = await criarUm();

    const resposta = await request(app)
      .patch(`/api/v1/alunos/${id}`)
      .set('Cookie', cookiesProfessor)
      .send({ nome: 'Nao Pode' });

    expect(resposta.status).toBe(403);
  });
});

describe('PATCH /api/v1/alunos/:id/estado', () => {
  it('muda o estado do aluno', async () => {
    const criado = await request(app)
      .post('/api/v1/alunos')
      .set('Cookie', cookiesCoordenador)
      .send(alunoValido());

    const resposta = await request(app)
      .patch(`/api/v1/alunos/${criado.body.data.id}/estado`)
      .set('Cookie', cookiesCoordenador)
      .send({ estado: 'TRANSFERIDO' });

    expect(resposta.status).toBe(200);
    expect(resposta.body.data.estado).toBe('TRANSFERIDO');
  });

  it('rejeita um estado invalido com 400', async () => {
    const criado = await request(app)
      .post('/api/v1/alunos')
      .set('Cookie', cookiesCoordenador)
      .send(alunoValido());

    const resposta = await request(app)
      .patch(`/api/v1/alunos/${criado.body.data.id}/estado`)
      .set('Cookie', cookiesCoordenador)
      .send({ estado: 'EXPULSO' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.codigo).toBe('VALIDACAO_INVALIDA');
  });
});
