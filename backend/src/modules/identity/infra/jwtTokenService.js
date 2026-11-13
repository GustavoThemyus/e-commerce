import jwt from "jsonwebtoken";

const ALGORITHM = "HS256";
const EXPIRES_IN = "1h";

export function createTokenService(secret) {
  if (!secret) {
    throw new Error(
      "JWT_SECRET não definida. Gere uma com: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\" e coloque em backend/.env.",
    );
  }

  return {
    sign: (userId) =>
      jwt.sign({}, secret, {
        subject: String(userId),
        algorithm: ALGORITHM,
        expiresIn: EXPIRES_IN,
      }),

    // Devolve o id do usuário, ou null se o token for inválido ou estiver expirado
    verify(token) {
      try {
        const payload = jwt.verify(token, secret, { algorithms: [ALGORITHM] });
        const id = Number(payload.sub);
        return Number.isInteger(id) ? id : null;
      } catch {
        return null;
      }
    },
  };
}
