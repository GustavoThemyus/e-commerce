import { AppError } from "../../../shared/errors/AppError.js";
import { PERMISSIONS } from "../../../shared/permissions.js";

// A permissão define o alcance: ver todos os pedidos ou só os próprios
export function makeListOrders({ orderRepository }) {
  return async function listOrders({ user }) {
    if (user.permissions.includes(PERMISSIONS.ORDER_READ_ANY)) {
      return orderRepository.findAll();
    }

    if (user.permissions.includes(PERMISSIONS.ORDER_READ_OWN)) {
      return orderRepository.findByUserId(user.id);
    }

    throw new AppError(403, "Forbidden");
  };
}
