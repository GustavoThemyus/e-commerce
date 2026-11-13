import { AppError } from "../../../shared/errors/AppError.js";

export function makeRegisterUser({ userRepository, passwordHasher }) {
  return async function registerUser({ email, password }) {
    const passwordHash = await passwordHasher.hash(password);
    const user = await userRepository.create({ email, passwordHash });

    if (!user) {
      throw new AppError(409, "Email already registered");
    }

    return user;
  };
}
