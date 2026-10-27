import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import { CodigosErro } from '../errors/codigos.js';

interface OpcoesLimitador {
  /** Tamanho da janela, em minutos. */
  janelaMinutos: number;
  /** Numero maximo de pedidos (falhados, se ignorarSucesso) por janela. */
  maximo: number;
  /** Se true, so contam os pedidos que terminam em erro. */
  ignorarSucesso?: boolean;
}

/**
 * Limitador de tentativas no formato de erro do contrato: 429
 * DEMASIADAS_TENTATIVAS. Usado no login e, em producao, como rede de seguranca
 * geral. E criado um novo por aplicacao, para os testes ficarem isolados.
 */
export function criarLimitadorDeTentativas({
  janelaMinutos,
  maximo,
  ignorarSucesso = false,
}: OpcoesLimitador): RateLimitRequestHandler {
  return rateLimit({
    windowMs: janelaMinutos * 60 * 1000,
    limit: maximo,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: ignorarSucesso,
    handler: (_req, res) => {
      res.status(429).json({
        erro: {
          codigo: CodigosErro.DEMASIADAS_TENTATIVAS,
          mensagem: 'Demasiadas tentativas. Tente novamente mais tarde.',
        },
      });
    },
  });
}
