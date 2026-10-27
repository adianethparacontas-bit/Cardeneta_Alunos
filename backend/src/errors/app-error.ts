import { CodigosErro, type CodigoErro } from './codigos.js';

/** Mapa campo -> mensagem, tal como o contrato define em `erro.campos`. */
export type CamposDeErro = Record<string, string>;

export class AppError extends Error {
  readonly status: number;
  readonly codigo: CodigoErro;
  readonly campos?: CamposDeErro;

  constructor(status: number, codigo: CodigoErro, mensagem: string, campos?: CamposDeErro) {
    super(mensagem);
    this.name = 'AppError';
    this.status = status;
    this.codigo = codigo;
    this.campos = campos;
  }
}

/** 400 - o corpo/query do pedido nao passou a validacao. */
export function erroValidacao(campos: CamposDeErro, mensagem = 'Dados invalidos.'): AppError {
  return new AppError(400, CodigosErro.VALIDACAO_INVALIDA, mensagem, campos);
}

/** 401 - nao ha sessao valida. */
export function erroNaoAutenticado(mensagem = 'Sessao em falta ou invalida.'): AppError {
  return new AppError(401, CodigosErro.NAO_AUTENTICADO, mensagem);
}

/** 401 - a sessao existe mas as credenciais enviadas no login nao batem certo. */
export function erroCredenciaisInvalidas(
  mensagem = 'Email ou palavra-passe invalidos.',
): AppError {
  return new AppError(401, CodigosErro.CREDENCIAIS_INVALIDAS, mensagem);
}

/** 403 - esta autenticado mas nao tem permissao para a operacao. */
export function erroSemPermissao(mensagem = 'Nao tem permissao para esta operacao.'): AppError {
  return new AppError(403, CodigosErro.SEM_PERMISSAO, mensagem);
}

/** 404 - o recurso pedido nao existe. */
export function erroNaoEncontrado(mensagem = 'Recurso nao encontrado.'): AppError {
  return new AppError(404, CodigosErro.NAO_ENCONTRADO, mensagem);
}

/** 409 - conflito de duplicado (aluno ou falta repetida). */
export function erroDuplicado(codigo: CodigoErro, mensagem: string, campos?: CamposDeErro): AppError {
  return new AppError(409, codigo, mensagem, campos);
}

/** 422 - o pedido esta bem formado mas viola uma regra de negocio. */
export function erroRegraNegocio(
  codigo: CodigoErro,
  mensagem: string,
  campos?: CamposDeErro,
): AppError {
  return new AppError(422, codigo, mensagem, campos);
}
