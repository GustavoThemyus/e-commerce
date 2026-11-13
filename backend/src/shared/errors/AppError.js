// Erro esperado, com status HTTP: o errorHandler devolve a mensagem ao cliente
export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}
