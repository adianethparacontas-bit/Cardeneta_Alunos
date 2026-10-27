import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { criarApp } from '../src/app.js';

const app = criarApp();

describe('GET /api/v1/saude', () => {
  it('responde 200 com o estado ok', async () => {
    const resposta = await request(app).get('/api/v1/saude');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ data: { status: 'ok' } });
  });
});

describe('rota desconhecida', () => {
  it('responde 404 no formato de erro da API', async () => {
    const resposta = await request(app).get('/api/v1/nao-existe');

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.codigo).toBe('NAO_ENCONTRADO');
    expect(typeof resposta.body.erro.mensagem).toBe('string');
  });
});
