import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import { erroNaoEncontrado, erroValidacao } from '../../errors/app-error.js';
import { validar } from '../../validacao/validar.js';
import { gerarHashDeSenha } from '../auth/senhas.js';
import { Papeis, paraUtilizadorPublico } from '../auth/tipos.js';
import {
  atualizarUtilizador,
  inserirUtilizador,
  listarUtilizadores,
  procurarUtilizadorPorEmail,
  procurarUtilizadorPorId,
} from '../auth/utilizadores.repositorio.js';
import { listarDisciplinas } from '../disciplinas/disciplinas.repositorio.js';
import { esquemaAtualizarDisciplinas, esquemaCriarProfessor } from './professores.esquemas.js';

/** Confirma que todos os ids de disciplina existem; se algum nao, da 400. */
async function validarDisciplinaIds(disciplinaIds: string[]): Promise<void> {
  const disciplinas = await listarDisciplinas();
  const conhecidos = new Set(disciplinas.map((disciplina) => disciplina.id));
  const desconhecidos = disciplinaIds.filter((id) => !conhecidos.has(id));

  if (desconhecidos.length > 0) {
    throw erroValidacao({ disciplinaIds: 'Uma ou mais disciplinas nao existem.' });
  }
}

export const listar: RequestHandler = async (_req, res, next) => {
  try {
    const utilizadores = await listarUtilizadores();
    const professores = utilizadores
      .filter((utilizador) => utilizador.papel === Papeis.PROFESSOR)
      .map(paraUtilizadorPublico);

    res.json({ data: professores });
  } catch (erro) {
    next(erro);
  }
};

export const criar: RequestHandler = async (req, res, next) => {
  try {
    const dados = validar(esquemaCriarProfessor, req.body);

    await validarDisciplinaIds(dados.disciplinaIds);

    const jaExiste = await procurarUtilizadorPorEmail(dados.email);

    if (jaExiste) {
      // O contrato nao tem codigo de 409 para professores; usamos 400 com o campo.
      throw erroValidacao({ email: 'Ja existe um utilizador com este email.' });
    }

    const utilizador = await inserirUtilizador({
      id: randomUUID(),
      nome: dados.nome,
      email: dados.email,
      papel: Papeis.PROFESSOR,
      disciplinaIds: dados.disciplinaIds,
      senhaHash: await gerarHashDeSenha(dados.palavraPasse),
      criadoEm: new Date().toISOString(),
    });

    if (!utilizador) {
      throw erroValidacao({ email: 'Ja existe um utilizador com este email.' });
    }

    res.status(201).json({ data: paraUtilizadorPublico(utilizador) });
  } catch (erro) {
    next(erro);
  }
};

export const atualizarDisciplinas: RequestHandler = async (req, res, next) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const { disciplinaIds } = validar(esquemaAtualizarDisciplinas, req.body);

    const professor = await procurarUtilizadorPorId(id);

    if (!professor || professor.papel !== Papeis.PROFESSOR) {
      throw erroNaoEncontrado('Professor nao encontrado.');
    }

    await validarDisciplinaIds(disciplinaIds);

    const atualizado = await atualizarUtilizador({ ...professor, disciplinaIds });

    if (!atualizado) {
      throw erroNaoEncontrado('Professor nao encontrado.');
    }

    res.json({ data: paraUtilizadorPublico(atualizado) });
  } catch (erro) {
    next(erro);
  }
};
