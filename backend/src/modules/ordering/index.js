import { createOrderRepository } from "./infra/OrderRepository.js";
import { createResendEmailGateway } from "./infra/ResendEmailGateway.js";
import { makeCheckout } from "./application/checkout.js";
import { makeListOrders } from "./application/listOrders.js";
import { createCheckoutController } from "./infra/checkoutController.js";
import { createCheckoutRoutes } from "./infra/checkoutRoutes.js";

export function createOrderingModule({ pool, auth, productCatalog, clearCart }) {
  const orderRepository = createOrderRepository(pool);

  const controller = createCheckoutController({
    checkout: makeCheckout({
      orderRepository,
      productCatalog,
      emailGateway: createResendEmailGateway(),
      clearCart,
    }),
    listOrders: makeListOrders({ orderRepository }),
  });

  return { router: createCheckoutRoutes(controller, auth) };
}
