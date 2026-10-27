export class ErroArmazenamento extends Error {
  readonly causa?: unknown;

  constructor(mensagem: string, causa?: unknown) {
    super(mensagem);
    this.name = 'ErroArmazenamento';
    this.causa = causa;
  }
}
