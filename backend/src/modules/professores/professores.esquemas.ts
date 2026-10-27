import { z } from 'zod';

const esquemaDisciplinaIds = z
  .array(z.string().trim().min(1), {
    invalid_type_error: 'Indique a lista de disciplinas.',
  })
  .default([]);

export const esquemaCriarProfessor = z.object({
  nome: z
    .string({ required_error: 'O nome e obrigatorio.' })
    .trim()
    .min(1, 'O nome e obrigatorio.'),
  email: z
    .string({ required_error: 'O email e obrigatorio.' })
    .trim()
    .min(1, 'O email e obrigatorio.')
    .email('Email invalido.'),
  palavraPasse: z
    .string({ required_error: 'A palavra-passe e obrigatoria.' })
    .min(8, 'A palavra-passe tem de ter pelo menos 8 caracteres.'),
  disciplinaIds: esquemaDisciplinaIds,
});

export const esquemaAtualizarDisciplinas = z.object({
  disciplinaIds: z.array(z.string().trim().min(1), {
    required_error: 'Indique a lista de disciplinas.',
    invalid_type_error: 'Indique a lista de disciplinas.',
  }),
});
