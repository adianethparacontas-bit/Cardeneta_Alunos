import type { Request, RequestHandler } from 'express';
import { z } from 'zod';
import {
  erroDuplicado,
  erroNaoEncontrado,
} from '../../errors/app-error.js';
import { CodigosErro } from '../../errors/codigos.js';
import { utilizadorAtual } from '../../middlewares/autenticacao.js';
import { Papeis } from '../auth/tipos.js';
import { validar } from '../../validacao/validar.js';
import { paginar } from '../../utils/paginacao.js';
import { compararNomes, normalizarTexto } from '../../utils/texto.js';
import {
  atualizarAluno,
  atualizarEstadoAluno,
  contarOcorrenciasPorAluno,
  inserirAluno,
  listarAlunos,
  procurarAlunoPorId,
  type ContagemOcorrencias,
} from './alunos.repositorio.js';
import {
  esquemaAtualizarAluno,
  esquemaAtualizarEstadoAluno,
  esquemaCriarAluno,
  esquemaFiltrosAlunos,
} from './alunos.esquemas.js';
import { normalizarTelefone } from './telefones.js';
import type { Aluno, AlunoResumo } from './tipos.js';

type FiltrosAlunos = z.infer<typeof esquemaFiltrosAlunos>;

/** O id vem sempre no caminho; se faltar, devolvemos texto vazio e da 404. */
function idDoPedido(req: Request): string {
  const id = req.params.id;

  return typeof id === 'string' ? id : '';
}


/** Normaliza os telefones do corpo (se vierem) e deixa o resto como esta. */
function comTelefonesNormalizados<T extends Record<string, unknown>>(dados: T): T {
  const normalizados: Record<string, unknown> = { ...dados };

  if (typeof dados.numeroEmergencia === 'string') {
    normalizados.numeroEmergencia = normalizarTelefone('numeroEmergencia', dados.numeroEmergencia);
  }

  if (typeof dados.numeroEncarregado === 'string') {
    normalizados.numeroEncarregado = normalizarTelefone('numeroEncarregado', dados.numeroEncarregado);
  }

  return normalizados as T;
}

function aplicarFiltros(alunos: Aluno[], filtros: FiltrosAlunos): Aluno[] {
  const pesquisa = filtros.q ? normalizarTexto(filtros.q) : null;

  return alunos.filter((aluno) => {
    if (
      pesquisa &&
      !normalizarTexto(aluno.nome).includes(pesquisa) &&
      !normalizarTexto(aluno.numeroProcesso).includes(pesquisa)
    ) {
      return false;
    }

    if (filtros.classe !== undefined && aluno.classe !== filtros.classe) {
      return false;
    }

    if (filtros.turma && aluno.turma !== filtros.turma) {
      return false;
    }

    if (filtros.turno && aluno.turno !== filtros.turno) {
      return false;
    }

    if (filtros.estado && aluno.estado !== filtros.estado) {
      return false;
    }

    if (filtros.anoLetivo && aluno.anoLetivo !== filtros.anoLetivo) {
      return false;
    }

    return true;
  });
}

/** O professor nao ve os contadores de ocorrencias; o coordenador ve. */
function paraResumo(
  aluno: Aluno,
  contagens: Map<string, ContagemOcorrencias> | null,
): AlunoResumo {
  if (!contagens) {
    return { ...aluno, totalOcorrencias: null, ultimaOcorrenciaEm: null };
  }

  const contagem = contagens.get(aluno.id);

  return {
    ...aluno,
    totalOcorrencias: contagem?.total ?? 0,
    ultimaOcorrenciaEm: contagem?.ultima ?? null,
  };
}

export const criarAluno: RequestHandler = async (req, res, next) => {
  try {
    const dados = validar(esquemaCriarAluno, req.body);
    const normalizados = comTelefonesNormalizados(dados);

    const aluno = await inserirAluno({
      ...normalizados,
      nomeEncarregado: normalizados.nomeEncarregado ?? null,
      dataNascimento: normalizados.dataNascimento ?? null,
    });

    if (!aluno) {
      throw erroDuplicado(
        CodigosErro.ALUNO_DUPLICADO,
        'Ja existe um aluno com este nome na mesma turma e ano letivo.',
        { nome: 'Aluno duplicado.' },
      );
    }

    res.status(201).json({ data: aluno });
  } catch (erro) {
    next(erro);
  }
};

export const listar: RequestHandler = async (req, res, next) => {
  try {
    const utilizador = utilizadorAtual(req);
    const filtros = validar(esquemaFiltrosAlunos, req.query);

    const alunos = await listarAlunos();
    const filtrados = aplicarFiltros(alunos, filtros).sort((a, b) => compararNomes(a.nome, b.nome));

    const { itens, meta } = paginar(filtrados, {
      pagina: filtros.pagina,
      limite: filtros.limite,
    });

    const contagens =
      utilizador.papel === Papeis.COORDENADOR ? await contarOcorrenciasPorAluno() : null;

    res.json({ data: itens.map((aluno) => paraResumo(aluno, contagens)), meta });
  } catch (erro) {
    next(erro);
  }
};

export const obter: RequestHandler = async (req, res, next) => {
  try {
    const aluno = await procurarAlunoPorId(idDoPedido(req));

    if (!aluno) {
      throw erroNaoEncontrado('Aluno nao encontrado.');
    }

    res.json({ data: aluno });
  } catch (erro) {
    next(erro);
  }
};

export const atualizar: RequestHandler = async (req, res, next) => {
  try {
    const alteracoes = validar(esquemaAtualizarAluno, req.body);
    const normalizadas = comTelefonesNormalizados(alteracoes);

    const resultado = await atualizarAluno(idDoPedido(req), normalizadas);

    if (resultado.estado === 'nao-encontrado') {
      throw erroNaoEncontrado('Aluno nao encontrado.');
    }

    if (resultado.estado === 'duplicado') {
      throw erroDuplicado(
        CodigosErro.ALUNO_DUPLICADO,
        'Ja existe um aluno com este nome na mesma turma e ano letivo.',
        { nome: 'Aluno duplicado.' },
      );
    }

    res.json({ data: resultado.aluno });
  } catch (erro) {
    next(erro);
  }
};

export const atualizarEstado: RequestHandler = async (req, res, next) => {
  try {
    const { estado } = validar(esquemaAtualizarEstadoAluno, req.body);
    const aluno = await atualizarEstadoAluno(idDoPedido(req), estado);

    if (!aluno) {
      throw erroNaoEncontrado('Aluno nao encontrado.');
    }

    res.json({ data: aluno });
  } catch (erro) {
    next(erro);
  }
};
