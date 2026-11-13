import bcrypt from "bcrypt";

const COST = 12;

export function createPasswordHasher() {
  return {
    hash: (password) => bcrypt.hash(password, COST),
    compare: (password, hash) => bcrypt.compare(password, hash),
  };
}
