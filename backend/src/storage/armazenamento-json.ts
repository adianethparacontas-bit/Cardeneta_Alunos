import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { obterDiretorioDados } from './diretorio-dados.js';
import { ErroArmazenamento } from './erro-armazenamento.js';

/**
 * Fila de escrita por ficheiro. Garante que dois pedidos simultaneos sobre a
 * mesma colecao nao se estragam: cada operacao espera pela anterior.
 */
const filas = new Map<string, Promise<unknown>>();

function comFila<T>(chave: string, tarefa: () => Promise<T>): Promise<T> {
  const anterior = filas.get(chave) ?? Promise.resolve();
  const proxima = anterior.then(tarefa, tarefa);

  filas.set(
    chave,
    proxima.then(
      () => undefined,
      () => undefined,
    ),
  );

  return proxima;
}

function caminhoDaColecao(nome: string): string {
  return join(obterDiretorioDados(), `${nome}.json`);
}

/**
 * Escrita atomica: escreve num ficheiro temporario e so depois renomeia.
 * Assim nunca existe um ficheiro a meio.
 */
async function gravarFicheiro<T>(caminho: string, dados: T): Promise<void> {
  await mkdir(dirname(caminho), { recursive: true });

  const temporario = `${caminho}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await writeFile(temporario, JSON.stringify(dados, null, 2), 'utf8');
  await rename(temporario, caminho);
}

export async function lerColecao<T>(nome: string, padrao: T): Promise<T> {
  const caminho = caminhoDaColecao(nome);

  let conteudo: string;

  try {
    conteudo = await readFile(caminho, 'utf8');
  } catch (erro) {
    if ((erro as NodeJS.ErrnoException).code === 'ENOENT') {
      return padrao;
    }

    throw new ErroArmazenamento(`Falha ao ler ${nome}.json`, erro);
  }

  try {
    return JSON.parse(conteudo) as T;
  } catch (erro) {
    throw new ErroArmazenamento(`Ficheiro de dados corrompido: ${nome}.json`, erro);
  }
}

export async function escreverColecao<T>(nome: string, dados: T): Promise<void> {
  const caminho = caminhoDaColecao(nome);

  await comFila(caminho, () => gravarFicheiro(caminho, dados));
}

/**
 * Le, deixa alterar e grava, tudo dentro da mesma fila. E o que usamos sempre
 * que precisamos de ler-modificar-escrever, para nao perdermos atualizacoes
 * quando chegam dois pedidos ao mesmo tempo.
 */
export async function comColecao<T, R>(
  nome: string,
  padrao: T,
  operacao: (atual: T) => Promise<{ dados: T; resultado: R }> | { dados: T; resultado: R },
): Promise<R> {
  const caminho = caminhoDaColecao(nome);

  return comFila(caminho, async () => {
    const atual = await lerColecao(nome, padrao);
    const { dados, resultado } = await operacao(atual);
    await gravarFicheiro(caminho, dados);
    return resultado;
  });
}
