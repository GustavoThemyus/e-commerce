let cart = [];

export function getCart(req, res) {
  res.json(cart);
}

export function addToCart(req, res) {
  const { product, quantity } = req.body;

  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  res.status(201).json(cart);
}

export function updateCartItem(req, res) {
  const { id, quantity } = req.body;

  cart = cart.map((item) => (item.id === id ? { ...item, quantity } : item));

  res.json(cart);
}

export function removeFromCart(req, res) {
  const { id } = req.params;
  cart = cart.filter((item) => item.id !== Number(id));
  res.json(cart);
}

export function clearCart() {
  cart = [];
}
