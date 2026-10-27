import { randomUUID } from 'node:crypto';
import { comColecao, lerColecao } from '../../storage/armazenamento-json.js';
import { normalizarNome } from '../../utils/texto.js';
import { gerarNumeroProcesso } from './numero-processo.js';
import { EstadosAluno, type Aluno, type Turno } from './tipos.js';

const COLECAO = 'alunos';
const VAZIO: Aluno[] = [];

/** Colecao de ocorrencias, lida em cru: so precisamos de contar por aluno. */
const COLECAO_OCORRENCIAS = 'ocorrencias';

interface OcorrenciaContavel {
  alunoId: string;
  dataOcorrencia: string;
}

export interface ContagemOcorrencias {
  total: number;
  ultima: string | null;
}

/** Os campos que se podem definir num aluno novo (sem id nem numero de processo). */
export interface DadosNovoAluno {
  nome: string;
  classe: number;
  turma: string;
  turno: Turno;
  anoLetivo: string;
  numeroEmergencia: string;
  numeroEncarregado: string;
  nomeEncarregado: string | null;
  dataNascimento: string | null;
}

export type AlteracoesAluno = Partial<DadosNovoAluno>;

export type ResultadoAtualizacaoAluno =
  | { estado: 'ok'; aluno: Aluno }
  | { estado: 'nao-encontrado' }
  | { estado: 'duplicado' };

export async function listarAlunos(): Promise<Aluno[]> {
  return lerColecao<Aluno[]>(COLECAO, VAZIO);
}

export async function procurarAlunoPorId(id: string): Promise<Aluno | null> {
  const alunos = await listarAlunos();

  return alunos.find((aluno) => aluno.id === id) ?? null;
}

/**
 * Um aluno e duplicado quando ja existe outro com o mesmo nome (ignorando
 * acentos e maiusculas) na mesma turma do mesmo ano letivo. E o caso tipico de
 * registar o mesmo aluno duas vezes.
 */
function duplicaOutroAluno(candidato: DadosNovoAluno, outro: Aluno): boolean {
  return (
    normalizarNome(candidato.nome) === normalizarNome(outro.nome) &&
    candidato.anoLetivo === outro.anoLetivo &&
    candidato.classe === outro.classe &&
    candidato.turma === outro.turma
  );
}

/**
 * Insere um aluno novo com numero de processo gerado (sequencial por ano
 * letivo) e estado inicial ATIVO. Devolve null se ja existir um duplicado.
 */
export async function inserirAluno(dados: DadosNovoAluno): Promise<Aluno | null> {
  return comColecao<Aluno[], Aluno | null>(COLECAO, VAZIO, (atual) => {
    const duplicado = atual.some((aluno) => duplicaOutroAluno(dados, aluno));

    if (duplicado) {
      return { dados: atual, resultado: null };
    }

    const aluno: Aluno = {
      id: randomUUID(),
      numeroProcesso: gerarNumeroProcesso(dados.anoLetivo, atual),
      ...dados,
      estado: EstadosAluno.ATIVO,
      criadoEm: new Date().toISOString(),
    };

    return { dados: [...atual, aluno], resultado: aluno };
  });
}

/** Aplica alteracoes a um aluno. O numero de processo nunca muda. */
export async function atualizarAluno(
  id: string,
  alteracoes: AlteracoesAluno,
): Promise<ResultadoAtualizacaoAluno> {
  return comColecao<Aluno[], ResultadoAtualizacaoAluno>(COLECAO, VAZIO, (atual) => {
    const indice = atual.findIndex((aluno) => aluno.id === id);

    if (indice === -1) {
      return { dados: atual, resultado: { estado: 'nao-encontrado' } };
    }

    const existente = atual[indice] as Aluno;
    const atualizado: Aluno = { ...existente, ...alteracoes };

    const duplicado = atual.some(
      (aluno, posicao) => posicao !== indice && duplicaOutroAluno(atualizado, aluno),
    );

    if (duplicado) {
      return { dados: atual, resultado: { estado: 'duplicado' } };
    }

    const proximo = [...atual];
    proximo[indice] = atualizado;

    return { dados: proximo, resultado: { estado: 'ok', aluno: atualizado } };
  });
}

/** Muda so o estado de um aluno (ATIVO, TRANSFERIDO, DESISTENTE, CONCLUIDO). */
export async function atualizarEstadoAluno(
  id: string,
  estado: Aluno['estado'],
): Promise<Aluno | null> {
  return comColecao<Aluno[], Aluno | null>(COLECAO, VAZIO, (atual) => {
    const indice = atual.findIndex((aluno) => aluno.id === id);

    if (indice === -1) {
      return { dados: atual, resultado: null };
    }

    const proximo = [...atual];
    proximo[indice] = { ...(atual[indice] as Aluno), estado };

    return { dados: proximo, resultado: proximo[indice] as Aluno };
  });
}

/**
 * Conta as ocorrencias por aluno, para o coordenador ver os contadores na
 * lista. Devolve um mapa alunoId -> { total, ultima }.
 */
export async function contarOcorrenciasPorAluno(): Promise<Map<string, ContagemOcorrencias>> {
  const ocorrencias = await lerColecao<OcorrenciaContavel[]>(COLECAO_OCORRENCIAS, []);
  const contagens = new Map<string, ContagemOcorrencias>();

  for (const ocorrencia of ocorrencias) {
    const contagem = contagens.get(ocorrencia.alunoId) ?? { total: 0, ultima: null };

    contagem.total += 1;

    if (!contagem.ultima || ocorrencia.dataOcorrencia > contagem.ultima) {
      contagem.ultima = ocorrencia.dataOcorrencia;
    }

    contagens.set(ocorrencia.alunoId, contagem);
  }

  return contagens;
}
