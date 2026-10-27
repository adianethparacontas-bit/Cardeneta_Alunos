import type { Request, RequestHandler } from 'express';
import { z } from 'zod';
import { erroNaoEncontrado, erroRegraNegocio } from '../../errors/app-error.js';
import { CodigosErro } from '../../errors/codigos.js';
import { utilizadorAtual } from '../../middlewares/autenticacao.js';
import { paginar } from '../../utils/paginacao.js';
import { parametroDoCaminho } from '../../utils/pedido.js';
import { hojeIso } from '../../utils/datas.js';
import { validar } from '../../validacao/validar.js';
import { procurarAlunoPorId } from '../alunos/alunos.repositorio.js';
import { EstadosAluno } from '../alunos/tipos.js';
import { esquemaCriarOcorrencia, esquemaFiltrosOcorrencias } from './ocorrencias.esquemas.js';
import {
  inserirOcorrencia,
  listarOcorrencias,
  ocorrenciasDoAluno,
} from './ocorrencias.repositorio.js';
import { TiposOcorrencia, type Ocorrencia } from './tipos.js';

type FiltrosOcorrencias = z.infer<typeof esquemaFiltrosOcorrencias>;

function idDoAluno(req: Request): string {
  return parametroDoCaminho(req, 'id');
}

export const criarOcorrencia: RequestHandler = async (req, res, next) => {
  try {
    const utilizador = utilizadorAtual(req);
    const alunoId = idDoAluno(req);
    const dados = validar(esquemaCriarOcorrencia, req.body);

    const aluno = await procurarAlunoPorId(alunoId);

    if (!aluno) {
      throw erroNaoEncontrado('Aluno nao encontrado.');
    }

    if (aluno.estado !== EstadosAluno.ATIVO) {
      throw erroRegraNegocio(
        CodigosErro.ALUNO_NAO_ATIVO,
        'So se registam ocorrencias de alunos ativos.',
        { estado: 'O aluno nao esta ativo.' },
      );
    }

    const gravidade = dados.gravidade ?? null;

    if (dados.tipo === TiposOcorrencia.ELOGIO && gravidade) {
      throw erroRegraNegocio(CodigosErro.ELOGIO_SEM_GRAVIDADE, 'Um elogio nao tem gravidade.', {
        gravidade: 'Nao se aplica a um elogio.',
      });
    }

    if (dados.tipo !== TiposOcorrencia.ELOGIO && !gravidade) {
      throw erroRegraNegocio(
        CodigosErro.GRAVIDADE_OBRIGATORIA,
        'Indique a gravidade da ocorrencia.',
        { gravidade: 'A gravidade e obrigatoria.' },
      );
    }

    if (dados.dataOcorrencia > hojeIso()) {
      throw erroRegraNegocio(
        CodigosErro.DATA_FUTURA,
        'A data da ocorrencia nao pode ser no futuro.',
        { dataOcorrencia: 'Nao pode ser uma data futura.' },
      );
    }

    const ocorrencia = await inserirOcorrencia({
      alunoId: aluno.id,
      alunoNome: aluno.nome,
      tipo: dados.tipo,
      gravidade,
      descricao: dados.descricao,
      dataOcorrencia: dados.dataOcorrencia,
      local: dados.local ?? null,
      acaoTomada: dados.acaoTomada ?? null,
      encarregadoInformado: dados.encarregadoInformado,
      registadaPor: { id: utilizador.id, nome: utilizador.nome },
    });

    res.status(201).json({ data: ocorrencia });
  } catch (erro) {
    next(erro);
  }
};

export const listarDoAluno: RequestHandler = async (req, res, next) => {
  try {
    const aluno = await procurarAlunoPorId(idDoAluno(req));

    if (!aluno) {
      throw erroNaoEncontrado('Aluno nao encontrado.');
    }

    const ocorrencias = await ocorrenciasDoAluno(aluno.id);

    res.json({ data: ocorrencias });
  } catch (erro) {
    next(erro);
  }
};

export const listar: RequestHandler = async (req, res, next) => {
  try {
    const filtros = validar(esquemaFiltrosOcorrencias, req.query);

    const todas = await listarOcorrencias();
    const filtradas = todas.filter((ocorrencia) => correspondeAosFiltros(ocorrencia, filtros));

    const { itens, meta } = paginar(filtradas, {
      pagina: filtros.pagina,
      limite: filtros.limite,
    });

    res.json({ data: itens, meta });
  } catch (erro) {
    next(erro);
  }
};

function correspondeAosFiltros(
  ocorrencia: Ocorrencia,
  filtros: FiltrosOcorrencias,
): boolean {
  if (filtros.alunoId && ocorrencia.alunoId !== filtros.alunoId) {
    return false;
  }

  if (filtros.tipo && ocorrencia.tipo !== filtros.tipo) {
    return false;
  }

  if (filtros.gravidade && ocorrencia.gravidade !== filtros.gravidade) {
    return false;
  }

  if (filtros.de && ocorrencia.dataOcorrencia < filtros.de) {
    return false;
  }

  if (filtros.ate && ocorrencia.dataOcorrencia > filtros.ate) {
    return false;
  }

  if (filtros.coordenadorId && ocorrencia.registadaPor.id !== filtros.coordenadorId) {
    return false;
  }

  return true;
}
