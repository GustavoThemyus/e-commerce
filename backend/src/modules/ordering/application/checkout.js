import { AppError } from "../../../shared/errors/AppError.js";
import { Order, CHECKOUT_REQUIRED_MESSAGE } from "../domain/Order.js";

// Limite de sanidade por item; também evita estourar o NUMERIC(10, 2) do total
const MAX_QUANTITY = 1000;

export function makeCheckout({
  orderRepository,
  productCatalog,
  emailGateway,
  clearCart,
}) {
  return async function checkout({ customerEmail, items, user }) {
    // Logado: vale o e-mail da conta, não o enviado no corpo
    const email = user?.email ?? customerEmail;

    if (!email || !Array.isArray(items) || items.length === 0) {
      throw new AppError(400, CHECKOUT_REQUIRED_MESSAGE);
    }

    // O frontend manda `productId`; `id` também é aceito
    const requested = items.map((item) => ({
      productId: Number(item?.productId ?? item?.id),
      quantity: Number(item?.quantity),
    }));

    for (const { productId, quantity } of requested) {
      if (!Number.isInteger(productId) || productId < 1) {
        throw new AppError(400, "Invalid product in cart");
      }
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
        throw new AppError(400, "Invalid item quantity");
      }
    }

    // Título e preço vêm do banco: o cliente não decide quanto paga
    const products = await productCatalog.findByIds([
      ...new Set(requested.map((r) => r.productId)),
    ]);
    const byId = new Map(products.map((p) => [p.id, p]));

    const lines = requested.map(({ productId, quantity }) => {
      const product = byId.get(productId);
      if (!product) {
        throw new AppError(400, `Product ${productId} not found`);
      }
      return {
        productId,
        title: product.title,
        price: product.price,
        quantity,
        subtotal: Math.round(product.price * 100 * quantity) / 100,
      };
    });

    const order = Order.create({
      customerEmail: email,
      userId: user?.id ?? null,
      items: lines,
    });

    // 1) Always register the sale (this is the core of checkout)
    await orderRepository.save(order);

    // 2) Try to send email, but do not fail the purchase if it can't be sent
    let emailSent = true;
    try {
      await emailGateway.sendPurchaseConfirmation(order);
    } catch (err) {
      emailSent = false;
      console.error("Email send failed:", err);
    }

    // 3) Clear cart after successful purchase
    clearCart();

    return { total: order.total, emailSent };
  };
}
