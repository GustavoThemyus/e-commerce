import { AppError } from "../../../shared/errors/AppError.js";

export function createAuthMiddleware({ tokenService, userRepository }) {
  async function resolveUser(req) {
    const header = req.get("Authorization");
    if (!header) return null;

    const [scheme, token] = header.split(" ");
    const userId = scheme === "Bearer" && token ? tokenService.verify(token) : null;
    const user = userId ? await userRepository.findWithPermissions(userId) : null;

    if (!user) {
      throw new AppError(401, "Invalid or expired token");
    }
    return user;
  }

  return {
    // Exige login
    async authenticate(req, res, next) {
      const user = await resolveUser(req);
      if (!user) {
        throw new AppError(401, "Authentication required");
      }
      req.user = user;
      next();
    },

    // Login opcional (checkout como convidado). Token enviado e inválido continua sendo 401:
    // tratar como convidado esconderia um erro do cliente
    async optionalAuthenticate(req, res, next) {
      req.user = await resolveUser(req);
      next();
    },

    // Passa se o usuário tiver pelo menos uma das permissões. Use depois de authenticate.
    requirePermission(...permissions) {
      return (req, res, next) => {
        if (!req.user) {
          throw new AppError(401, "Authentication required");
        }
        if (!permissions.some((p) => req.user.permissions.includes(p))) {
          throw new AppError(403, "Forbidden");
        }
        next();
      };
    },
  };
}
