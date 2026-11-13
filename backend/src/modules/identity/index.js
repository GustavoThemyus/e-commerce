import { createUserRepository } from "./infra/UserRepository.js";
import { createPasswordHasher } from "./infra/bcryptPasswordHasher.js";
import { createTokenService } from "./infra/jwtTokenService.js";
import { createAuthMiddleware } from "./infra/authMiddleware.js";
import { makeRegisterUser } from "./application/registerUser.js";
import { makeLoginUser } from "./application/loginUser.js";
import { createAuthController } from "./infra/authController.js";
import { createAuthRoutes } from "./infra/authRoutes.js";

export function createIdentityModule({ pool, jwtSecret }) {
  const userRepository = createUserRepository(pool);
  const passwordHasher = createPasswordHasher();
  const tokenService = createTokenService(jwtSecret);

  const auth = createAuthMiddleware({ tokenService, userRepository });

  const controller = createAuthController({
    registerUser: makeRegisterUser({ userRepository, passwordHasher }),
    loginUser: makeLoginUser({ userRepository, passwordHasher, tokenService }),
  });

  return {
    router: createAuthRoutes({ controller, authenticate: auth.authenticate }),
    auth,
  };
}
