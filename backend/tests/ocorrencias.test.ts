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

function ocorrenciaValida(extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    tipo: 'INDISCIPLINA',
    gravidade: 'MODERADA',
    descricao: 'Perturbou a aula de matematica.',
    dataOcorrencia: '2026-10-05',
    local: 'Sala 12',
    acaoTomada: 'Advertencia verbal.',
    encarregadoInformado: false,
    ...extra,
  };
}

async function criarAluno(extra: Record<string, unknown> = {}): Promise<string> {
  const resposta = await request(app)
    .post('/api/v1/alunos')
    .set('Cookie', cookiesCoordenador)
    .send({
      nome: 'Ana Maria Silva',
      classe: 7,
      turma: 'A',
      turno: 'MANHA',
      anoLetivo: '2026/2027',
      numeroEmergencia: '923456789',
      numeroEncarregado: '911222333',
      ...extra,
    });

  return resposta.body.data.id as string;
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

describe('POST /api/v1/alunos/:id/ocorrencias', () => {
  it('regista uma ocorrencia com quem a registou e o nome do aluno', async () => {
    const alunoId = await criarAluno();

    const resposta = await request(app)
      .post(`/api/v1/alunos/${alunoId}/ocorrencias`)
      .set('Cookie', cookiesCoordenador)
      .send(ocorrenciaValida());

    expect(resposta.status).toBe(201);
    expect(resposta.body.data.alunoId).toBe(alunoId);
    expect(resposta.body.data.alunoNome).toBe('Ana Maria Silva');
    expect(resposta.body.data.tipo).toBe('INDISCIPLINA');
    expect(resposta.body.data.gravidade).toBe('MODERADA');
    expect(resposta.body.data.registadaPor.nome).toBe('Utilizador de Teste');
    expect(resposta.body.data.id).toBeTypeOf('string');
  });

  it('exige gravidade para ocorrencias que nao sejam elogio', async () => {
    const alunoId = await criarAluno();

    const resposta = await request(app)
      .post(`/api/v1/alunos/${alunoId}/ocorrencias`)
      .set('Cookie', cookiesCoordenador)
      .send(ocorrenciaValida({ gravidade: undefined }));

    expect(resposta.status).toBe(422);
    expect(resposta.body.erro.codigo).toBe('GRAVIDADE_OBRIGATORIA');
  });

  it('recusa um elogio com gravidade', async () => {
    const alunoId = await criarAluno();

    const resposta = await request(app)
      .post(`/api/v1/alunos/${alunoId}/ocorrencias`)
      .set('Cookie', cookiesCoordenador)
      .send(ocorrenciaValida({ tipo: 'ELOGIO', gravidade: 'LEVE' }));

    expect(resposta.status).toBe(422);
    expect(resposta.body.erro.codigo).toBe('ELOGIO_SEM_GRAVIDADE');
  });

  it('aceita um elogio sem gravidade', async () => {
    const alunoId = await criarAluno();

    const resposta = await request(app)
      .post(`/api/v1/alunos/${alunoId}/ocorrencias`)
      .set('Cookie', cookiesCoordenador)
      .send(ocorrenciaValida({ tipo: 'ELOGIO', gravidade: undefined }));

    expect(resposta.status).toBe(201);
    expect(resposta.body.data.gravidade).toBeNull();
  });

  it('recusa uma data no futuro', async () => {
    const alunoId = await criarAluno();

    const resposta = await request(app)
      .post(`/api/v1/alunos/${alunoId}/ocorrencias`)
      .set('Cookie', cookiesCoordenador)
      .send(ocorrenciaValida({ dataOcorrencia: '2099-01-01' }));

    expect(resposta.status).toBe(422);
    expect(resposta.body.erro.codigo).toBe('DATA_FUTURA');
  });

  it('recusa registar ocorrencias de um aluno que nao esta ativo', async () => {
    const alunoId = await criarAluno();
    await request(app)
      .patch(`/api/v1/alunos/${alunoId}/estado`)
      .set('Cookie', cookiesCoordenador)
      .send({ estado: 'TRANSFERIDO' });

    const resposta = await request(app)
      .post(`/api/v1/alunos/${alunoId}/ocorrencias`)
      .set('Cookie', cookiesCoordenador)
      .send(ocorrenciaValida());

    expect(resposta.status).toBe(422);
    expect(resposta.body.erro.codigo).toBe('ALUNO_NAO_ATIVO');
  });

  it('devolve 404 quando o aluno nao existe', async () => {
    const resposta = await request(app)
      .post('/api/v1/alunos/nao-existe/ocorrencias')
      .set('Cookie', cookiesCoordenador)
      .send(ocorrenciaValida());

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.codigo).toBe('NAO_ENCONTRADO');
  });

  it('rejeita um corpo invalido com 400 e os campos', async () => {
    const alunoId = await criarAluno();

    const resposta = await request(app)
      .post(`/api/v1/alunos/${alunoId}/ocorrencias`)
      .set('Cookie', cookiesCoordenador)
      .send({ tipo: 'NAO_EXISTE', descricao: '', dataOcorrencia: '2026-13-01' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.codigo).toBe('VALIDACAO_INVALIDA');
    expect(resposta.body.erro.campos.tipo).toBeDefined();
    expect(resposta.body.erro.campos.descricao).toBeDefined();
    expect(resposta.body.erro.campos.dataOcorrencia).toBeDefined();
  });

  it('devolve 403 a um professor', async () => {
    const alunoId = await criarAluno();

    const resposta = await request(app)
      .post(`/api/v1/alunos/${alunoId}/ocorrencias`)
      .set('Cookie', cookiesProfessor)
      .send(ocorrenciaValida());

    expect(resposta.status).toBe(403);
    expect(resposta.body.erro.codigo).toBe('SEM_PERMISSAO');
  });

  it('devolve 401 sem sessao', async () => {
    const resposta = await request(app)
      .post('/api/v1/alunos/qualquer/ocorrencias')
      .send(ocorrenciaValida());

    expect(resposta.status).toBe(401);
    expect(resposta.body.erro.codigo).toBe('NAO_AUTENTICADO');
  });
});

describe('GET /api/v1/alunos/:id/ocorrencias', () => {
  it('devolve as ocorrencias do aluno, mais recentes primeiro', async () => {
    const alunoId = await criarAluno();

    await request(app)
      .post(`/api/v1/alunos/${alunoId}/ocorrencias`)
      .set('Cookie', cookiesCoordenador)
      .send(ocorrenciaValida({ dataOcorrencia: '2026-09-01' }));
    await request(app)
      .post(`/api/v1/alunos/${alunoId}/ocorrencias`)
      .set('Cookie', cookiesCoordenador)
      .send(ocorrenciaValida({ dataOcorrencia: '2026-10-01' }));

    const resposta = await request(app)
      .get(`/api/v1/alunos/${alunoId}/ocorrencias`)
      .set('Cookie', cookiesCoordenador);

    expect(resposta.status).toBe(200);
    expect(resposta.body.data).toHaveLength(2);
    expect(resposta.body.data[0].dataOcorrencia).toBe('2026-10-01');
  });

  it('devolve 403 a um professor', async () => {
    const alunoId = await criarAluno();

    const resposta = await request(app)
      .get(`/api/v1/alunos/${alunoId}/ocorrencias`)
      .set('Cookie', cookiesProfessor);

    expect(resposta.status).toBe(403);
  });
});

describe('GET /api/v1/ocorrencias', () => {
  async function semear(): Promise<string> {
    const anaId = await criarAluno();
    const brunoId = await criarAluno({ nome: 'Bruno Costa', turma: 'B' });

    await request(app)
      .post(`/api/v1/alunos/${anaId}/ocorrencias`)
      .set('Cookie', cookiesCoordenador)
      .send(ocorrenciaValida({ tipo: 'INDISCIPLINA', gravidade: 'GRAVE', dataOcorrencia: '2026-09-10' }));
    await request(app)
      .post(`/api/v1/alunos/${brunoId}/ocorrencias`)
      .set('Cookie', cookiesCoordenador)
      .send(ocorrenciaValida({ tipo: 'ELOGIO', gravidade: undefined, dataOcorrencia: '2026-10-10' }));

    return anaId;
  }

  it('lista todas as ocorrencias com paginacao e meta', async () => {
    await semear();

    const resposta = await request(app)
      .get('/api/v1/ocorrencias?pagina=1&limite=10')
      .set('Cookie', cookiesCoordenador);

    expect(resposta.status).toBe(200);
    expect(resposta.body.data).toHaveLength(2);
    expect(resposta.body.meta).toEqual({ pagina: 1, limite: 10, total: 2 });
  });

  it('filtra por aluno, tipo, gravidade e intervalo de datas', async () => {
    const anaId = await semear();

    const porAluno = await request(app)
      .get(`/api/v1/ocorrencias?alunoId=${anaId}`)
      .set('Cookie', cookiesCoordenador);
    expect(porAluno.body.meta.total).toBe(1);

    const porTipo = await request(app)
      .get('/api/v1/ocorrencias?tipo=ELOGIO')
      .set('Cookie', cookiesCoordenador);
    expect(porTipo.body.meta.total).toBe(1);

    const porGravidade = await request(app)
      .get('/api/v1/ocorrencias?gravidade=GRAVE')
      .set('Cookie', cookiesCoordenador);
    expect(porGravidade.body.meta.total).toBe(1);

    const porDatas = await request(app)
      .get('/api/v1/ocorrencias?de=2026-10-01&ate=2026-10-31')
      .set('Cookie', cookiesCoordenador);
    expect(porDatas.body.meta.total).toBe(1);
  });

  it('devolve 403 a um professor', async () => {
    const resposta = await request(app)
      .get('/api/v1/ocorrencias')
      .set('Cookie', cookiesProfessor);

    expect(resposta.status).toBe(403);
    expect(resposta.body.erro.codigo).toBe('SEM_PERMISSAO');
  });
});
