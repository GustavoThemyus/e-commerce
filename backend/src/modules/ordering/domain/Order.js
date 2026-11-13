import { AppError } from "../../../shared/errors/AppError.js";

export const CHECKOUT_REQUIRED_MESSAGE =
  "Customer email and cart items are required.";

export class Order {
  constructor({ customerEmail, userId, items }) {
    this.customerEmail = customerEmail;
    this.userId = userId;
    this.items = items;
  }

  // `items` já vêm com título e preço lidos do catálogo, nunca os do cliente
  static create({ customerEmail, userId = null, items }) {
    if (!customerEmail || !items || items.length === 0) {
      throw new AppError(400, CHECKOUT_REQUIRED_MESSAGE);
    }

    return new Order({ customerEmail, userId, items });
  }

  // Mesmo produto em linhas diferentes soma a quantidade (uma linha por produto no banco)
  get quantityByProduct() {
    const quantities = new Map();
    for (const item of this.items) {
      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity,
      );
    }
    return quantities;
  }

  // Soma em centavos para não acumular erro de ponto flutuante (109.95 * 3)
  get total() {
    const cents = this.items.reduce(
      (sum, item) => sum + Math.round(Number(item.price) * 100) * item.quantity,
      0,
    );
    return cents / 100;
  }
}
