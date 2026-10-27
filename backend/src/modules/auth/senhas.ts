import bcrypt from 'bcryptjs';

/**
 * Rondas do bcrypt. 10 e o valor de referencia da biblioteca e mantem os
 * testes rapidos; o hash nunca e reversivel, so comparado.
 */
const RONDAS = 10;

export function gerarHashDeSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, RONDAS);
}

export function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}
