import { z } from 'zod';
import { esquemaPaginacao } from '../../utils/paginacao.js';
import { enumeracao } from '../../validacao/enumeracao.js';
import { esquemaDataIso } from '../../validacao/esquemas-comuns.js';
import { EstadosAluno, Turnos } from './tipos.js';

const textoObrigatorio = (mensagem: string) =>
  z.string({ required_error: mensagem }).trim().min(1, mensagem);

const esquemaAnoLetivo = z
  .string({ required_error: 'O ano letivo e obrigatorio.' })
  .regex(/^\d{4}\/\d{4}$/, 'Use o formato AAAA/AAAA (ex.: 2026/2027).');

const esquemaClasse = z.coerce
  .number({
    required_error: 'A classe e obrigatoria.',
    invalid_type_error: 'A classe tem de ser um numero.',
  })
  .int('A classe tem de ser um numero inteiro.')
  .min(1, 'A classe vai de 1 a 13.')
  .max(13, 'A classe vai de 1 a 13.');

/** A turma pode chegar como "A"/"1" ou 1; guardamos sempre texto. */
const esquemaTurma = z
  .union([z.string(), z.number()], { errorMap: () => ({ message: 'A turma e obrigatoria.' }) })
  .transform((valor) => String(valor).trim())
  .pipe(z.string().min(1, 'A turma e obrigatoria.'));

export const esquemaCriarAluno = z.object({
  nome: textoObrigatorio('O nome e obrigatorio.'),
  classe: esquemaClasse,
  turma: esquemaTurma,
  turno: enumeracao(Turnos, 'Turno invalido.'),
  anoLetivo: esquemaAnoLetivo,
  numeroEmergencia: textoObrigatorio('O numero de emergencia e obrigatorio.'),
  numeroEncarregado: textoObrigatorio('O numero do encarregado e obrigatorio.'),
  nomeEncarregado: textoObrigatorio('O nome do encarregado nao pode ficar vazio.').nullish(),
  dataNascimento: esquemaDataIso.nullish(),
});

/** Na atualizacao os campos sao os mesmos, mas todos opcionais. */
export const esquemaAtualizarAluno = esquemaCriarAluno.partial();

export const esquemaAtualizarEstadoAluno = z.object({
  estado: enumeracao(EstadosAluno, 'Estado invalido.'),
});

/** Filtros basicos da lista (os avancados chegam no passo 09). */
export const esquemaFiltrosAlunos = esquemaPaginacao.extend({
  q: z.string().trim().min(1, 'A pesquisa nao pode ficar vazia.').optional(),
  classe: esquemaClasse.optional(),
  turma: z.string().trim().min(1, 'A turma nao pode ficar vazia.').optional(),
  turno: enumeracao(Turnos, 'Turno invalido.').optional(),
  estado: enumeracao(EstadosAluno, 'Estado invalido.').optional(),
  anoLetivo: esquemaAnoLetivo.optional(),
});
