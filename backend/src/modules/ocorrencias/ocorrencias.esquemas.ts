import { z } from 'zod';
import { esquemaPaginacao } from '../../utils/paginacao.js';
import { enumeracao } from '../../validacao/enumeracao.js';
import { esquemaDataIso } from '../../validacao/esquemas-comuns.js';
import { Gravidades, TiposOcorrencia } from './tipos.js';

const textoSemEspacos = (mensagem: string) => z.string().trim().min(1, mensagem);

export const esquemaCriarOcorrencia = z.object({
  tipo: enumeracao(TiposOcorrencia, 'Tipo de ocorrencia invalido.'),
  gravidade: enumeracao(Gravidades, 'Gravidade invalida.').nullish(),
  descricao: z
    .string({ required_error: 'A descricao e obrigatoria.' })
    .trim()
    .min(1, 'A descricao e obrigatoria.'),
  dataOcorrencia: esquemaDataIso,
  local: textoSemEspacos('O local nao pode ficar vazio.').nullish(),
  acaoTomada: textoSemEspacos('A acao tomada nao pode ficar vazia.').nullish(),
  encarregadoInformado: z.boolean({
    required_error: 'Indique se o encarregado foi informado.',
    invalid_type_error: 'Indique se o encarregado foi informado (true ou false).',
  }),
});

export const esquemaFiltrosOcorrencias = esquemaPaginacao.extend({
  alunoId: z.string().trim().min(1).optional(),
  tipo: enumeracao(TiposOcorrencia, 'Tipo de ocorrencia invalido.').optional(),
  gravidade: enumeracao(Gravidades, 'Gravidade invalida.').optional(),
  de: esquemaDataIso.optional(),
  ate: esquemaDataIso.optional(),
  coordenadorId: z.string().trim().min(1).optional(),
});
