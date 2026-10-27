import { CodigosErro, type CodigoErro } from './codigos.js';

export interface CampoInvalido {
  campo: string;
  mensagem: string;
}

export class AppError extends Error {
  readonly status: number;
  readonly codigo: CodigoErro;
  readonly campos?: CampoInvalido[];

  constructor(status: number, codigo: CodigoErro, mensagem: string, campos?: CampoInvalido[]) {
    super(mensagem);
    this.name = 'AppError';
    this.status = status;
    this.codigo = codigo;
    this.campos = campos;
  }
}

export function erroValidacao(campos: CampoInvalido[], mensagem = 'Dados invalidos.'): AppError {
  return new AppError(422, CodigosErro.VALIDACAO_INVALIDA, mensagem, campos);
}

export function erroNaoEncontrado(mensagem = 'Recurso nao encontrado.'): AppError {
  return new AppError(404, CodigosErro.NAO_ENCONTRADO, mensagem);
}
