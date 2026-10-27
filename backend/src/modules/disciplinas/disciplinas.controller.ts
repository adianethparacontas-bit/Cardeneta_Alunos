import type { RequestHandler } from 'express';
import { erroValidacao } from '../../errors/app-error.js';
import { validar } from '../../validacao/validar.js';
import { esquemaCriarDisciplina } from './disciplinas.esquemas.js';
import { inserirDisciplina, listarDisciplinas } from './disciplinas.repositorio.js';

export const listar: RequestHandler = async (_req, res, next) => {
  try {
    res.json({ data: await listarDisciplinas() });
  } catch (erro) {
    next(erro);
  }
};

export const criar: RequestHandler = async (req, res, next) => {
  try {
    const dados = validar(esquemaCriarDisciplina, req.body);
    const disciplina = await inserirDisciplina(dados);

    if (!disciplina) {
      // O contrato nao tem codigo de 409 para disciplinas, por isso ficamos no
      // 400 VALIDACAO_INVALIDA com o campo.
      throw erroValidacao({ codigo: 'Ja existe uma disciplina com este codigo.' });
    }

    res.status(201).json({ data: disciplina });
  } catch (erro) {
    next(erro);
  }
};
