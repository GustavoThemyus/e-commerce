import { Cart } from "./domain/Cart.js";
import { createCartService } from "./application/cartService.js";
import { createCartController } from "./infra/cartController.js";
import { createCartRoutes } from "./infra/cartRoutes.js";

export function createCartModule() {
  const cartService = createCartService({ cart: new Cart() });
  const controller = createCartController({ cartService });

  return { router: createCartRoutes(controller), cartService };
}
