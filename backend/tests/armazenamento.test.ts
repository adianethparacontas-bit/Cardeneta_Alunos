import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { comColecao, escreverColecao, lerColecao } from '../src/storage/armazenamento-json.js';
import { definirDiretorioDados, obterDiretorioDados } from '../src/storage/diretorio-dados.js';
import { ErroArmazenamento } from '../src/storage/erro-armazenamento.js';
import { limparDiretorio, usarDiretorioTemporario } from './ajuda/dados-temporarios.js';

let diretorio: string;

beforeAll(async () => {
  diretorio = await usarDiretorioTemporario();
});

afterAll(async () => {
  await limparDiretorio(diretorio);
});

describe('armazenamento json', () => {
  it('grava e volta a ler a mesma colecao', async () => {
    await escreverColecao('alunos', [{ id: 'a1', nome: 'Ana' }]);

    const alunos = await lerColecao<Array<{ id: string; nome: string }>>('alunos', []);

    expect(alunos).toEqual([{ id: 'a1', nome: 'Ana' }]);
  });

  it('devolve o valor por defeito quando o ficheiro nao existe', async () => {
    const valor = await lerColecao('nunca-criado', []);

    expect(valor).toEqual([]);
  });

  it('lanca erro quando o ficheiro esta corrompido', async () => {
    await writeFile(join(diretorio, 'estragado.json'), '{ isto nao e json', 'utf8');

    await expect(lerColecao('estragado', [])).rejects.toBeInstanceOf(ErroArmazenamento);
  });

  it('cria a pasta de dados se ela nao existir', async () => {
    const original = obterDiretorioDados();
    definirDiretorioDados(join(diretorio, 'sub-pasta', 'mais-fundo'));

    try {
      await escreverColecao('novo', [{ ok: true }]);

      const lido = await lerColecao('novo', []);
      expect(lido).toEqual([{ ok: true }]);
    } finally {
      definirDiretorioDados(original);
    }
  });

  it('nao deixa ficheiros temporarios para tras', async () => {
    await escreverColecao('limpo', [1, 2, 3]);

    const ficheiros = await readdir(obterDiretorioDados());
    const temporarios = ficheiros.filter((ficheiro) => ficheiro.includes('.tmp-'));

    expect(temporarios).toEqual([]);
  });

  it('nao perde atualizacoes quando chegam pedidos ao mesmo tempo', async () => {
    await escreverColecao('contador', { valor: 0 });

    await Promise.all(
      Array.from({ length: 20 }, () =>
        comColecao<{ valor: number }, null>('contador', { valor: 0 }, (atual) => ({
          dados: { valor: atual.valor + 1 },
          resultado: null,
        })),
      ),
    );

    const final = await lerColecao('contador', { valor: 0 });

    expect(final.valor).toBe(20);
  });
});
