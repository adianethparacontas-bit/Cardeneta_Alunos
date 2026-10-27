import { env } from '../config/env.js';

let diretorioAtual = env.DATA_DIR;

export function obterDiretorioDados(): string {
  return diretorioAtual;
}

export function definirDiretorioDados(diretorio: string): void {
  diretorioAtual = diretorio;
}
