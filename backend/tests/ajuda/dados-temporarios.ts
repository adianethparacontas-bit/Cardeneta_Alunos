import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { definirDiretorioDados } from '../../src/storage/diretorio-dados.js';

export async function usarDiretorioTemporario(): Promise<string> {
  const diretorio = await mkdtemp(join(tmpdir(), 'cardeneta-test-'));
  definirDiretorioDados(diretorio);
  return diretorio;
}

export async function limparDiretorio(diretorio: string): Promise<void> {
  await rm(diretorio, { recursive: true, force: true });
}
