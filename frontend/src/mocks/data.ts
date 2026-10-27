import type {
  Aluno,
  Disciplina,
  Falta,
  Nota,
  Ocorrencia,
  Utilizador,
} from "../types/api";

const agora = new Date().toISOString();
const classes = [7, 8, 9, 10, 11, 12, 13];
const nomes = [
  "Ana Kiala", "Bento Miguel", "Cecilia Domingos", "Dario Manuel",
  "Elsa Joaquim", "Fernando Paulo", "Graça António", "Hugo Mateus",
  "Inês Manuel", "João Pedro", "Lina Sebastião", "Mário Afonso",
];

export const utilizadores: Utilizador[] = [
  { id: "u-coord-1", nome: "Coordenadora Amélia", email: "coord1@cardeneta.test", papel: "COORDENADOR", disciplinaIds: [] },
  { id: "u-coord-2", nome: "Coordenador António", email: "coord2@cardeneta.test", papel: "COORDENADOR", disciplinaIds: [] },
  { id: "u-prof-1", nome: "Professor Carlos", email: "prof1@cardeneta.test", papel: "PROFESSOR", disciplinaIds: ["d-port", "d-hist"] },
  { id: "u-prof-2", nome: "Professora Isabel", email: "prof2@cardeneta.test", papel: "PROFESSOR", disciplinaIds: ["d-mat", "d-fis"] },
  { id: "u-prof-3", nome: "Professor Luís", email: "prof3@cardeneta.test", papel: "PROFESSOR", disciplinaIds: ["d-bio", "d-port"] },
];

export const disciplinas: Disciplina[] = [
  { id: "d-port", nome: "Língua Portuguesa", codigo: "POR" },
  { id: "d-mat", nome: "Matemática", codigo: "MAT" },
  { id: "d-hist", nome: "História", codigo: "HIS" },
  { id: "d-fis", nome: "Física", codigo: "FIS" },
  { id: "d-bio", nome: "Biologia", codigo: "BIO" },
];

export const alunos: Aluno[] = nomes.map((nome, index) => ({
  id: `a-${String(index + 1).padStart(3, "0")}`,
  numeroProcesso: `2026${String(index + 1).padStart(4, "0")}`,
  nome,
  classe: classes[index % classes.length]!,
  turma: index % 2 === 0 ? "A" : "B",
  turno: index % 3 === 0 ? "MANHA" : index % 3 === 1 ? "TARDE" : "NOITE",
  anoLetivo: "2026/2027",
  numeroEmergencia: `+2449230000${String(index + 1).padStart(2, "0")}`,
  numeroEncarregado: `+2449231000${String(index + 1).padStart(2, "0")}`,
  nomeEncarregado: index % 4 === 0 ? null : `Encarregado de ${nome.split(" ")[0]}`,
  dataNascimento: `200${index % 7 + 7}-0${index % 8 + 1}-15`,
  estado: index === 11 ? "TRANSFERIDO" : "ATIVO",
  criadoEm: agora,
}));

export const ocorrencias: Ocorrencia[] = [
  {
    id: "o-001", alunoId: "a-001", alunoNome: alunos[0]!.nome, tipo: "ATRASO",
    gravidade: "LEVE", descricao: "Chegada após o início da aula.", dataOcorrencia: "2026-09-10",
    local: "Sala 4", acaoTomada: "Conversa com o aluno.", encarregadoInformado: false,
    registadaPor: { id: utilizadores[0]!.id, nome: utilizadores[0]!.nome }, criadoEm: agora,
  },
  {
    id: "o-002", alunoId: "a-001", alunoNome: alunos[0]!.nome, tipo: "ELOGIO",
    gravidade: null, descricao: "Ajudou um colega durante a atividade.", dataOcorrencia: "2026-09-18",
    local: "Biblioteca", acaoTomada: null, encarregadoInformado: true,
    registadaPor: { id: utilizadores[0]!.id, nome: utilizadores[0]!.nome }, criadoEm: agora,
  },
  {
    id: "o-003", alunoId: "a-003", alunoNome: alunos[2]!.nome, tipo: "INDISCIPLINA",
    gravidade: "MODERADA", descricao: "Interrompeu repetidamente a aula.", dataOcorrencia: "2026-09-21",
    local: "Sala 2", acaoTomada: "Contacto com o encarregado.", encarregadoInformado: true,
    registadaPor: { id: utilizadores[1]!.id, nome: utilizadores[1]!.nome }, criadoEm: agora,
  },
];

export const faltas: Falta[] = [
  {
    id: "f-001", alunoId: "a-001", data: "2026-09-12", justificada: true,
    motivo: "Consulta médica", disciplinaId: "d-port", disciplinaNome: "Língua Portuguesa",
    registadaPor: { id: utilizadores[2]!.id, nome: utilizadores[2]!.nome }, criadoEm: agora,
  },
  {
    id: "f-002", alunoId: "a-002", data: "2026-09-14", justificada: false,
    motivo: null, disciplinaId: "d-mat", disciplinaNome: "Matemática",
    registadaPor: { id: utilizadores[3]!.id, nome: utilizadores[3]!.nome }, criadoEm: agora,
  },
];

export const notas: Nota[] = alunos.flatMap((aluno, alunoIndex) =>
  disciplinas.slice(0, 3).map((disciplina, disciplinaIndex) => {
    const mac = (alunoIndex * 3 + disciplinaIndex) % 18 + 2;
    const npp = (alunoIndex * 2 + disciplinaIndex + 5) % 18 + 2;
    const npt = (alunoIndex + disciplinaIndex * 4 + 8) % 18 + 2;
    return {
      alunoId: aluno.id,
      disciplinaId: disciplina.id,
      disciplinaNome: disciplina.nome,
      trimestre: 1 as const,
      anoLetivo: aluno.anoLetivo,
      mac,
      npp,
      npt,
      mt: Math.round((mac + npp + npt) / 3),
      atualizadoEm: agora,
    };
  }),
);

export const palavraPasseDemonstracao = "demo123";
