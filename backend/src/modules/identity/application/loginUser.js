import { AppError } from "../../../shared/errors/AppError.js";

export function makeLoginUser({ userRepository, passwordHasher, tokenService }) {
  // Hash descartável: sem ele, e-mail inexistente responderia mais rápido que senha errada
  // e deixaria descobrir quais e-mails têm conta
  const dummyHash = passwordHasher.hash("not-a-real-password");

  return async function loginUser({ email, password }) {
    const found = await userRepository.findByEmail(email);
    const matches = await passwordHasher.compare(
      password,
      found?.password_hash ?? (await dummyHash),
    );

    if (!found || !matches) {
      throw new AppError(401, "Invalid email or password");
    }

    const user = await userRepository.findWithPermissions(found.id);
    return { token: tokenService.sign(user.id), user };
  };
}
